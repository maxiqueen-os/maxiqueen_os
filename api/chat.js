export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method!== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { message } = req.body || {};
  const GROQ_KEY = process.env.GROQ_API_KEY?.trim();
  const GEMINI_KEY = process.env.GEMINI_API_KEY_3?.trim();

  if (!GROQ_KEY ||!GEMINI_KEY) {
    return res.status(500).json({ error: 'Faltan API keys en Vercel' });
  }

  let groqError = null;

  // INTENTO 1: GROQ
  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Eres MaxiBot, inteligencia central de MaxiQueen OS. Responde en español, directo.' },
          { role: 'user', content: message || 'hola' }
        ],
        max_tokens: 500
      })
    });
    const groqData = await groqRes.json();
    if (groqRes.ok && groqData.choices?.[0]) {
      return res.status(200).json({ reply: groqData.choices[0].message.content, engine: 'groq' });
    }
    groqError = groqData.error?.message || `Groq ${groqRes.status}`;
  } catch (e) { groqError = e.message; }

  // INTENTO 2: GEMINI (modelo actualizado)
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
    if (!geminiRes.ok) {
      return res.status(500).json({
        error: 'Ambos motores fallaron',
        detalle_groq: groqError,
        detalle_gemini: geminiData.error?.message
      });
    }
    return res.status(200).json({
      reply: geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta',
      engine: 'gemini'
    });
  } catch (e) {
    return res.status(500).json({ error: 'Error crítico', detalle_groq: groqError, detalle_gemini: e.message });
  }
}
