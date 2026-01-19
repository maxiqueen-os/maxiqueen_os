function maxiQueenResponder(pregunta) {
  const texto = pregunta.toLowerCase();

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
