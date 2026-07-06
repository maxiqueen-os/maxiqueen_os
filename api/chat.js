import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  // Configuración de Cabeceras CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  // 1. DESESTRUCTURACIÓN UNIFICADA (Elimina duplicados y SyntaxErrors)
  const {
    message,
    session_id: clientSession,
    files = [],
    image_base64,
    document_text,
    file_type,
    file_name,
    filename,
    systemPrompt,
    history = [] // Captura el historial nativo enviado desde tu frontend
  } = req.body || {};

  // 2. NORMALIZACIÓN ESTRICTA DE ENTRADAS
  const file = files[0] || {};
  const finalFileName = file.name || file_name || filename || null;
  const finalFileType = file.mimeType || file_type || 'image/jpeg';
  const finalImageBase64 = file.base64Data || image_base64 || null;
  
  const session_id = clientSession || randomUUID();
  const userMsg = (message || 'Analiza este archivo').toString().substring(0, 2000);

  // Carga de Credenciales del Entorno
  const GROQ_KEY = process.env.GROQ_API_KEY;
  const GEMINI_KEY = process.env.GEMINI_API_KEY_3 || process.env.GEMINI_API_KEY;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Persistencia en base de datos Supabase
  const guardar = async (contenido, role, tipo = 'chat') => {
    try {
      if (!SUPABASE_URL || !SUPABASE_KEY) return;
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
    } catch (e) { 
      console.error('Error de registro en Supabase:', e.message); 
    }
  };

  // Clasificación del tipo de entrada para auditoría
  const tipoEntrada = finalImageBase64 ? 'vision' : document_text ? 'doc' : 'chat';
  const userContent = finalFileName ? `${userMsg} [Archivo: ${finalFileName}]` : userMsg;
  await guardar(userContent, 'user', tipoEntrada);

  let reply = '', engine = '', groqErr = null, geminiErr = null;

  // 3. PROCESAMIENTO ESTRATÉGICO DE MODELOS IA

  // Bloque A: GEMINI MULTIMODAL (Procesa Imágenes y PDFs nativamente)
  if (finalImageBase64 && GEMINI_KEY) {
    try {
      // Estructuramos los contenidos incluyendo el historial si existe
      const formattedContents = [];
      
      // Mapeamos el historial al formato nativo estructurado de Gemini
      if (Array.isArray(history) && history.length > 0) {
        history.forEach(h => {
          formattedContents.push({
            role: h.role === 'assistant' ? 'model' : h.role,
            parts: h.parts || [{ text: h.text }]
          });
        });
      }

      // Preparamos el bloque de datos del archivo actual
      const currentParts = [{ text: userMsg }];
      currentParts.push({
        inlineData: {
          mimeType: finalFileType,
          data: finalImageBase64
        }
      });

      // Añadimos el turno actual del usuario al payload
      formattedContents.push({ role: 'user', parts: currentParts });

      const defaultSystemInstruction = systemPrompt || "Eres el asistente del MAPA MAXIQUEEN OS v0.8. Conoces los 14 módulos completos con sus pitches, capacidades, clientes ideales y monetización. Responde en español, directo y técnico.";

      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: formattedContents,
          systemInstruction: { parts: [{ text: defaultSystemInstruction }] }
        })
      });

      const j = await r.json();
      if (r.ok && j.candidates?.[0]?.content?.parts?.[0]?.text) {
        reply = j.candidates[0].content.parts[0].text;
        engine = 'gemini-multimodal';
      } else {
        geminiErr = j.error?.message || 'Respuesta vacía o formato desconocido de Gemini';
      }
    } catch (e) { 
      geminiErr = e.message; 
      console.error('Fallo en Gemini Multimodal:', e); 
    }
  }

  // Bloque B: GROQ PARA TEXTO EXTRAÍDO DE DOCUMENTOS (Si se provee texto pre-procesado)
  if (!reply && document_text && GROQ_KEY) {
    try {
      const groqMessages = [
        { role: 'system', content: systemPrompt || 'Eres MaxiBot de MQ NEXUS. Responde en español, directo y estratégico.' }
      ];

      // Sincronizar el historial al formato de Groq
      if (Array.isArray(history)) {
        history.forEach(h => {
          const role = h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user';
          const text = h.parts?.[0]?.text || h.text || '';
          if (text) groqMessages.push({ role, content: text });
        });
      }

      groqMessages.push({ 
        role: 'user', 
        content: `${userMsg}\n\nDOCUMENTO ADJUNTO [${finalFileName}]:\n${document_text.substring(0, 8000)}` 
      });

      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: groqMessages,
          max_tokens: 1000,
          temperature: 0.5
        })
      });
      const j = await r.json();
      if (r.ok && j.choices?.[0]?.message?.content) {
        reply = j.choices[0].message.content;
        engine = 'groq-doc';
      } else { 
        groqErr = j.error?.message; 
      }
    } catch (e) { 
      groqErr = e.message; 
    }
  }

  // Bloque C: FALLBACK DE VISIÓN CON GROQ (Solo si es imagen y Gemini falló)
  if (!reply && finalImageBase64 && finalFileType.startsWith('image/') && GROQ_KEY) {
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.2-11b-vision-preview',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: userMsg },
              { type: 'image_url', image_url: { url: `data:${finalFileType};base64,${finalImageBase64}` } }
            ]
          }],
          max_tokens: 800
        })
      });
      const j = await r.json();
      if (r.ok && j.choices?.[0]?.message?.content) {
        reply = j.choices[0].message.content;
        engine = 'groq-vision';
      } else { 
        groqErr = j.error?.message; 
      }
    } catch (e) { 
      groqErr = e.message; 
    }
  }

  // Bloque D: GROQ CONTEXTO CHAT REGULAR (Solo Texto Alternativo)
  if (!reply && !finalImageBase64 && !document_text && GROQ_KEY) {
    try {
      const groqMessages = [
        { role: 'system', content: systemPrompt || 'Eres MaxiBot de MQ NEXUS. Responde en español, directo y estratégico.' }
      ];

      if (Array.isArray(history)) {
        history.forEach(h => {
          const role = h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user';
          const text = h.parts?.[0]?.text || h.text || '';
          if (text) groqMessages.push({ role, content: text });
        });
      }

      groqMessages.push({ role: 'user', content: userMsg });

      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: groqMessages,
          max_tokens: 800,
          temperature: 0.7
        })
      });
      const j = await r.json();
      if (r.ok && j.choices?.[0]?.message?.content) {
        reply = j.choices[0].message.content;
        engine = 'groq-pure-text';
      } else { 
        groqErr = j.error?.message; 
      }
    } catch (e) { 
      groqErr = e.message; 
      console.error('Error en canal Groq texto:', e); 
    }
  }

  // Bloque E: FALLBACK FINAL DE CHAT COMPLETO CON GEMINI (Texto Puro)
  if (!reply && GEMINI_KEY && !finalImageBase64) {
    try {
      const formattedContents = [];
      if (Array.isArray(history)) {
        history.forEach(h => {
          formattedContents.push({
            role: h.role === 'assistant' ? 'model' : h.role,
            parts: h.parts || [{ text: h.text }]
          });
        });
      }
      formattedContents.push({ role: 'user', parts: [{ text: userMsg }] });

      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: formattedContents })
      });
      const j = await r.json();
      if (r.ok) {
        reply = j.candidates?.[0]?.content?.parts?.[0]?.text || '';
        engine = 'gemini-pure-text';
      } else { 
        geminiErr = j.error?.message; 
      }
    } catch (e) { 
      geminiErr = e.message; 
    }
  }

  // Manejo de Error en caso de falla de orquestación de LLMs
  if (!reply) {
    console.error('🚨 QUIEBRE DE OPERACIÓN EN CASM IA:', { groqErr, geminiErr });
    return res.status(500).json({
      error: 'Fallo integral en respuesta de IA',
      detalle_groq: groqErr,
      detalle_gemini: geminiErr,
      diagnostico_keys: { groq_disponible: !!GROQ_KEY, gemini_disponible: !!GEMINI_KEY }
    });
  }

  // Registro final en persistencia y retorno de respuesta limpia de éxito
  await guardar(reply, 'assistant', tipoEntrada);
  return res.status(200).json({ reply, engine, session_id, tipo: tipoEntrada });
}
