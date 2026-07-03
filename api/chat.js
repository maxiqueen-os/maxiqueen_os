export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { message } = req.body || {};
  const GROQ_KEY = process.env.GROQ_API_KEY?.trim();
  const GEMINI_KEY = process.env.GEMINI_API_KEY_3?.trim();

  // Verificación inmediata
  if (!GROQ_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY no está en Vercel' });
  }
  if (!GEMINI_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY_3 no está en Vercel' });
  }

  try {
    // 1. GROQ
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'Eres MaxiBot, la inteligencia central de MaxiQueen OS.' },
          { role: 'user', content: message }
        ]
      })
    });

    const groqData = await groqRes.json();

    if (groqRes.ok && groqData.choices?.[0]) {
      return res.status(200).json({
        reply: groqData.choices[0].message.content,
        engine: 'groq'
      });
    }

    // Si Groq falla, no tires error genérico, pasa a Gemini
    console.log('Groq falló:', groqData.error?.message);

  } catch (err) {
    console.log('Error Groq:', err.message);
  }

  // 2. GEMINI (fallback)
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      }
    );

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      return res.status(500).json({
        error: 'Ambos motores fallaron',
        detalle_groq: 'Revisa logs',
        detalle_gemini: geminiData.error?.message
      });
    }

    return res.status(200).json({
      reply: geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Respuesta vacía',
      engine: 'gemini'
    });

  } catch (e) {
    return res.status(500).json({
      error: 'Error crítico en ambos motores',
      detalle: e.message
    });
  }
}
