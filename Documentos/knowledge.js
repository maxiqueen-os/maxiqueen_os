/js/knowledge.js
window.KNOWLEDGE = {
  loaded: false,
  data: [],

  async load() {
    if (this.loaded) return;

    try {
      const res = await fetch('data/knowledge.json');
      const json = await res.json();
      this.data = json.faq || [];
      this.loaded = true;
    } catch (e) {
      console.error('Knowledge load error:', e);
    }
  },

  findAnswer(text) {
    const lower = text.toLowerCase();
    for (const item of this.data) {
      if (lower.includes(item.keyword)) {
        return item.response;
      }
    }
    return null;
  }
};

function maxiQueenResponder(pregunta) {
  const texto = pregunta.toLowerCase();

  // Primero busca en la base JSON
  const respuestaJSON = KNOWLEDGE.findAnswer(texto);
  if (respuestaJSON) return respuestaJSON;

  // Luego respuestas predefinidas
  if (texto.includes('qué es') || texto.includes('maxiqueen')) {
    return knowledgeBase.identidad.definicion;
  }
  if (texto.includes('filosofía') || texto.includes('filosofia')) {
    return knowledgeBase.identidad.filosofia;
  }
  if (texto.includes('mantra')) {
    return knowledgeBase.identidad.mantra;
  }
  if (texto.includes('qué vendes') || texto.includes('servicio')) {
    return knowledgeBase.propuestaValor.resumen;
  }

  return 'MaxiQueen OS analiza tu pregunta. Reformúlala desde una decisión o problema real.';
}
