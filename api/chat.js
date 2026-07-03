import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method!== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { message, session_id: clientSession } = req.body || {};
  const session_id = clientSession || randomUUID(); // cliente único

  const GROQ_KEY = process.env.GROQ_API_KEY?.trim();
  const GEMINI_KEY = process.env.GEMINI_API_KEY_3?.trim();
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!GROQ_KEY ||!GEMINI_KEY) {
    return res.status(500).json({ error: 'Faltan API keys en Vercel' });
  }

  // Función para guardar en tu tabla existente
  const guardarMensaje = async (contenido, role) => {
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
          contenido: contenido.substring(0, 2000),
          session_id,
          role,
          message_type: 'chat',
          created_at: new Date().toISOString()
        })
      });
    } catch (e) {}
  };

  // Guarda lo que dijo el usuario
  await guardarMensaje(message || 'hola', 'user');

  let groqError = null;
  let reply = '';
  let engine = '';

  // INTENTO 1: GROQ
  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Eres MaxiBot, inteligencia central de MaxiQueen OS. Responde en español, directo, estratégico. No inventes redes sociales.' },
          { role: 'user', content: message || 'hola' }
        ],
        max_tokens: 500
      })
    });
    const groqData = await groqRes.json();
    if (groqRes.ok && groqData.choices?.[0]) {
      reply = groqData.choices[0].message.content;
      engine = 'groq';
    } else {
      groqError = groqData.error?.message || `Groq ${groqRes.status}`;
    }
  } catch (e) { groqError = e.message; }

  // INTENTO 2: GEMINI
  if (!reply) {
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: message || 'hola' }] }] })
        }
      );
      const geminiData = await geminiRes.json();
      if (geminiRes.ok) {
        reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta';
        engine = 'gemini';
      } else {
        return res.status(500).json({ error: 'Ambos fallaron', detalle_groq: groqError, detalle_gemini: geminiData.error?.message });
      }
    } catch (e) {
      return res.status(500).json({ error: 'Error crítico', detalle_groq: groqError, detalle_gemini: e.message });
    }
  }

  // Guarda la respuesta del bot
  await guardarMensaje(reply, 'assistant');

  return res.status(200).json({ reply, engine, session_id });
}
