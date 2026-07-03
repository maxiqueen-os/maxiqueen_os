import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method!== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { message, session_id: clientSession } = req.body || {};
  const session_id = clientSession || randomUUID();
  const userMsg = (message || 'hola').toString().substring(0, 2000);

  const GROQ_KEY = process.env.GROQ_API_KEY;
  const GEMINI_KEY = process.env.GEMINI_API_KEY_3 || process.env.GEMINI_API_KEY;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Guarda en Supabase
  const guardar = async (contenido, role) => {
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
          contenido,
          session_id,
          role,
          message_type: 'chat'
        })
      });
    } catch {}
  };

  await guardar(userMsg, 'user');

  let reply = '', engine = '', groqErr = null;

  // 1. GROQ (modelo vivo 2026)
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Eres MaxiBot de MaxiQueen OS. Responde en español, directo y estratégico.' },
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
    } else {
      groqErr = j.error?.message || `Error ${r.status}`;
    }
  } catch (e) { groqErr = e.message; }

  // 2. GEMINI (fallback)
  if (!reply && GEMINI_KEY) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMsg }] }]
        })
      });
      const j = await r.json();
      if (r.ok && j.candidates?.[0]?.content?.parts?.[0]?.text) {
        reply = j.candidates[0].content.parts[0].text;
        engine = 'gemini';
      }
    } catch {}
  }

  if (!reply) {
    return res.status(500).json({
      error: 'Ambos motores fallaron',
      detalle_groq: groqErr,
      detalle_gemini: 'Verifica GEMINI_API_KEY_3 en Vercel'
    });
  }

  await guardar(reply, 'assistant');
  return res.status(200).json({ reply, engine, session_id });
}
