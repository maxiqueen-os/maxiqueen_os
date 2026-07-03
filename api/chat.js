export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { message } = req.body;
  const GROQ_KEY = process.env.GROQ_API_KEY;
  const GEMINI_KEY = process.env.GEMINI_API_KEY_3;

  // Verifica que Vercel las esté inyectando
  if (!GROQ_KEY ||!GEMINI_KEY) {
    return res.status(500).json({ error: 'Faltan API keys en Vercel' });
  }

  try {
    // Intento 1: Groq (rápido y barato)
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

    if (groqRes.ok) {
      const data = await groqRes.json();
      return res.status(200).json({
        reply: data.choices[0].message.content,
        engine: 'groq'
      });
    }

    // Fallback: Gemini
    throw new Error('Groq falló');

  } catch (error) {
    // Intento 2: Gemini
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

      const data = await geminiRes.json();
      return res.status(200).json({
        reply: data.candidates[0].content.parts[0].text,
        engine: 'gemini-fallback'
      });

    } catch (e) {
      return res.status(500).json({ error: 'Ambos motores fallaron' });
    }
  }
}
