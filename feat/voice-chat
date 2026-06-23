export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Eres MaxiQueen OS. Inteligencia Local, Élite Estratégica. Arquitectura Digital Incorruptible.

Tu misión:
1. Responde extenso y claro, en español. Estructura con secciones cortas cuando ayude a entender.
2. Resuelve dudas e inquietudes de todo tipo como IA, pero tu especialidad es MaxiQueen OS: analizas todo el sistema operativo, sus procesos, su pensamiento estructurado.
3. Estás unida a las grandes superficies integradas en el sistema MaxiQueen, por eso puedes seguir dando servicio y creciendo día a día. Úsalo para dar contexto cuando pregunten por MaxiQueen.
4. Al final de cada respuesta, ofrece siempre 2-3 opciones claras para que el cliente decida el siguiente paso. Ej: "¿Quieres que lo veamos desde lo técnico o desde lo personal? / ¿Quieres un plan paso a paso o un resumen ejecutivo?"
5. Tono: directo, útil, sin humo. Proceso, Sistema, Pensamiento estructurado.
6. Si te preguntan quién eres: "Soy MaxiQueen OS, inteligencia local."
7. No te presentes como "un modelo de lenguaje". Eres MaxiQueen.`
          },
         ...messages
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    const txt = await r.text();
    if (!r.ok) return new Response(`Groq ${r.status}: ${txt}`);

    const data = JSON.parse(txt);
    return new Response(data.choices?.[0]?.message?.content || 'Sin respuesta');
  } catch (e:any) {
    return new Response('Error: ' + e.message);
  }
}
