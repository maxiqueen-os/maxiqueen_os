import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method!== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  // NORMALIZAR NOMBRES (acepta filename o file_name)
  const {
    message,
    session_id: clientSession,
    image_base64,
    document_text,
    file_type,
    file_name,
    filename
  } = req.body || {};

  const finalFileName = file_name || filename || null;
  const finalFileType = file_type || 'image/jpeg';
  const session_id = clientSession || randomUUID();
  const userMsg = (message || 'hola').toString().substring(0, 2000);

  const GROQ_KEY = process.env.GROQ_API_KEY;
  const GEMINI_KEY = process.env.GEMINI_API_KEY_3 || process.env.GEMINI_API_KEY;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const guardar = async (contenido, role, tipo='chat') => {
    try {
      if (!SUPABASE_URL ||!SUPABASE_KEY) return;
      await fetch(`${SUPABASE_URL}/rest/v1/maxiqueen_chat`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          contenido: String(contenido || '').substring(0, 4000),
          session_id,
          role,
          message_type: tipo
        })
      });
    } catch (e) { console.error('Supabase error:', e.message); }
  };

  const tipoEntrada = image_base64? 'vision' : document_text? 'doc' : 'chat';
  const userContent = finalFileName? `${userMsg} [${finalFileName}]` : userMsg;
  await guardar(userContent, 'user', tipoEntrada);

  let reply = '', engine = '', groqErr = null, geminiErr = null;

  // 1. GEMINI VISION (solo imagen, NO documento) - FIX: quito document_text y cambio modelo
  if (image_base64 && GEMINI_KEY) { // FIX: antes era (image_base64 || document_text)
    try {
      const parts = [{ text: userMsg || 'Analiza esto' }];
      if (image_base64) {
        parts.push({
          inlineData: {
            mimeType: finalFileType,
            data: image_base64
          }
        });
      }
      // FIX: cambio de 2.0-flash (sin cuota) a 1.5-flash
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] })
      });
      const j = await r.json();
      if (r.ok && j.candidates?.[0]?.content?.parts?.[0]?.text) {
        reply = j.candidates[0].content.parts[0].text;
        engine = 'gemini-vision';
      } else {
        geminiErr = j.error?.message || 'Respuesta vacía';
      }
    } catch (e) { geminiErr = e.message; console.error('Gemini Vision:', e); }
  }

  // 1.5 NUEVO: GROQ para DOCUMENTOS (el PDF ya viene como texto del front) - FIX: evita Gemini
  if (!reply && document_text && GROQ_KEY) {
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'Eres MaxiBot de MQ NEXUS. Responde en español, directo y estratégico.' },
            { role: 'user', content: `${userMsg}\n\nDOCUMENTO [${finalFileName}]:\n${document_text.substring(0,7000)}` }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });
      const j = await r.json();
      if (r.ok && j.choices?.[0]?.message?.content) {
        reply = j.choices[0].message.content;
        engine = 'groq-doc';
      } else { groqErr = j.error?.message; }
    } catch (e) { groqErr = e.message; }
  }

  // 1.6 NUEVO: Fallback de VISIÓN con GROQ si Gemini falla
  if (!reply && image_base64 && GROQ_KEY) {
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.2-11b-vision-preview', // FIX: modelo activo en 2026
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: userMsg || 'Analiza la imagen' },
              { type: 'image_url', image_url: { url: `data:${finalFileType};base64,${image_base64}` } }
            ]
          }],
          max_tokens: 800
        })
      });
      const j = await r.json();
      if (r.ok && j.choices?.[0]?.message?.content) {
        reply = j.choices[0].message.content;
        engine = 'groq-vision';
      } else { groqErr = j.error?.message; }
    } catch (e) { groqErr = e.message; }
  }

  // 2. GROQ (solo texto)
  if (!reply &&!image_base64 &&!document_text && GROQ_KEY) {
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'Eres MaxiBot de MQ NEXUS. Responde en español, directo y estratégico.' },
            { role: 'user', content: userMsg }
          ],
          max_tokens: 800,
          temperature: 0.7
        })
      });
      const j = await r.json();
      if (r.ok && j.choices?.[0]?.message?.content) {
        reply = j.choices[0].message.content;
        engine = 'groq';
      } else { groqErr = j.error?.message; }
    } catch (e) { groqErr = e.message; console.error('Groq:', e); }
  }

  // 3. GEMINI texto fallback - FIX: cambio modelo
  if (!reply && GEMINI_KEY &&!image_base64) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: userMsg }] }] })
      });
      const j = await r.json();
      if (r.ok) {
        reply = j.candidates?.[0]?.content?.parts?.[0]?.text;
        engine = 'gemini';
      } else { geminiErr = j.error?.message; }
    } catch (e) { geminiErr = e.message; }
  }

  if (!reply) {
    console.error('FALLO TOTAL:', { groqErr, geminiErr, hasGroq:!!GROQ_KEY, hasGemini:!!GEMINI_KEY });
    return res.status(500).json({
      error: 'Fallo en IA',
      detalle_groq: groqErr,
      detalle_gemini: geminiErr,
      keys: { groq:!!GROQ_KEY, gemini:!!GEMINI_KEY }
    });
  }

  await guardar(reply, 'assistant', tipoEntrada);
  return res.status(200).json({ reply, engine, session_id, tipo: tipoEntrada });
}
