import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method!== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { message, session_id: clientSession, image_base64, document_text, file_type, file_name } = req.body || {};
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
          contenido: contenido.substring(0, 4000),
          session_id,
          role,
          message_type: tipo
        })
      });
    } catch {}
  };

  const tipoEntrada = image_base64? 'vision' : document_text? 'doc' : 'chat';
  const userContent = file_name? `${userMsg} [${file_name}]` : userMsg;
  await guardar(userContent, 'user', tipoEntrada);

  let reply = '', engine = '', groqErr = null;

  if ((image_base64 || document_text) && GEMINI_KEY) {
    try {
      const parts = [{ text: userMsg || 'Analiza este archivo' }];
      if (image_base64) {
        parts.push({ inline_data: { mime_type: file_type || 'image/jpeg', data: image_base64 } });
      }
      if (document_text) parts.push({ text: `\n\nDOCUMENTO:\n${document_text.substring(0,8000)}` });

      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] })
      });
      const j = await r.json();
      if (r.ok && j.candidates?.[0]?.content?.parts?.[0]?.text) {
        reply = j.candidates[0].content.parts[0].text;
        engine = 'gemini-vision';
      } else {
        groqErr = j.error?.message || 'Error Gemini';
      }
    } catch (e) { groqErr = e.message; }
  }

  if (!reply &&!image_base64 &&!document_text) {
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
    } catch (e) { groqErr = e.message; }
  }

  if (!reply && GEMINI_KEY &&!image_base64) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: userMsg }] })
      });
      const j = await r.json();
      if (r.ok) { reply = j.candidates?.[0]?.content?.parts?.[0]?.text; engine = 'gemini'; }
    } catch {}
  }

  if (!reply) return res.status(500).json({ error: 'Fallo', detalle_groq: groqErr });

  await guardar(reply, 'assistant', tipoEntrada);
  return res.status(200).json({ reply, engine, session_id, tipo: tipoEntrada });
}
