export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { message } = req.body;
  const GROQ_KEY = process.env.GROQ_API_KEY?.trim();
  const GEMINI_KEY = process.env.GEMINI_API_KEY_3?.trim();

  // Log para ver en Vercel > Logs
  console.log('[MAXIBOT] Keys presentes:', {
    groq:!!GROQ_KEY,
    gemini:!!GEMINI_KEY,
    groq_len: GROQ_KEY?.length || 0
  });

  if (!GROQ_KEY ||!GEMINI_KEY) {
    return res.status(500).json({
      error: 'Faltan API keys en Vercel',
      debug: { groq:!!GROQ_KEY, gemini:!!GEMINI_KEY }
    });
  }

  try {
    // Intento 1: Groq
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'Eres MaxiBot, la inteligencia central de MaxiQueen OS. Responde en español, directo y útil.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const groqData = await groqRes.json();

    if (!groqRes.ok) {
      console.error('[GROQ ERROR]', groqRes.status, groqData);
      throw new Error(`Groq: ${groqData.error?.message || groqRes.status}`);
    }

    return res.status(200).json({
      reply: groqData.choices[0].message.content,
      engine: 'groq'
    });

  } catch (groqError) {
    console.error('[FALLBACK A GEMINI]', groqError.message);

    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Eres MaxiBot de MaxiQueen OS. Usuario: ${message}` }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
          })
        }
      );

      const geminiData = await geminiRes.json();

      if (!geminiRes.ok) {
        console.error('[GEMINI ERROR]', geminiData);
        throw new Error(`Gemini: ${geminiData.error?.message || 'Error desconocido'}`);
      }

      return res.status(200).json({
        reply: geminiData.candidates[0].content.parts[0].text,
        engine: 'gemini-fallback'
      });

    } catch (geminiError) {
      console.error('[AMBOS FALLARON]', { groq: groqError.message, gemini: geminiError.message });
      return res.status(500).json({
        error: 'Ambos motores fallaron',
        debug: {
          groq_error: groqError.message,
          gemini_error: geminiError.message
        }
      });
    }
  }
}
