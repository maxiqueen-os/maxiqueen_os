export default async function handler(req, res) {
  // CORS por si acaso
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method!== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { message } = req.body || {};

  const GROQ_KEY = process.env.GROQ_API_KEY?.trim();
  const GEMINI_KEY = process.env.GEMINI_API_KEY_3?.trim();

  // ESTO es lo que necesitas ver en Vercel Logs
  console.log('[MAXIBOT] Iniciando', {
    tieneGroq:!!GROQ_KEY,
    tieneGemini:!!GEMINI_KEY,
    mensaje: message?.substring(0,20)
  });

  if (!GROQ_KEY) {
    console.error('[ERROR] GROQ_API_KEY no encontrada');
    return res.status(500).json({ error: 'GROQ_API_KEY no configurada en Vercel' });
  }
  if (!GEMINI_KEY) {
    console.error('[ERROR] GEMINI_API_KEY_3 no encontrada');
    return res.status(500).json({ error: 'GEMINI_API_KEY_3 no configurada en Vercel' });
  }

  // INTENTO 1: GROQ
  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'Eres MaxiBot, inteligencia central de MaxiQueen OS. Responde en español, directo.' },
          { role: 'user', content: message || 'hola' }
        ],
        max_tokens: 500
      })
    });

    const groqData = await groqRes.json();

    if (!groqRes.ok) {
      console.error('[GROQ FALLÓ]', groqRes.status, groqData);
      throw new Error(`Groq ${groqRes.status}: ${groqData.error?.message}`);
    }

    return res.status(200).json({
      reply: groqData.choices[0].message.content,
      engine: 'groq'
    });

  } catch (groqError) {
    console.warn('[FALLBACK] Groq falló, intentando Gemini:', groqError.message);

    // INTENTO 2: GEMINI
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: message || 'hola' }] }]
          })
        }
      );

      const geminiData = await geminiRes.json();

      if (!geminiRes.ok) {
        console.error('[GEMINI FALLÓ]', geminiRes.status, geminiData);
        throw new Error(`Gemini ${geminiRes.status}: ${geminiData.error?.message}`);
      }

      return res.status(200).json({
        reply: geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta',
        engine: 'gemini'
      });

    } catch (geminiError) {
      console.error('[CRÍTICO] Ambos fallaron', {
        groq: groqError.message,
        gemini: geminiError.message
      });

      return res.status(500).json({
        error: 'Ambos motores fallaron',
        detalle: {
          groq: groqError.message,
          gemini: geminiError.message
        }
      });
    }
  }
}
