(function () {
  const chatLog = document.getElementById('chatLog');
  const input = document.getElementById('userInput');

  if (!chatLog || !input) return;

  const triggers = {
    precio: 'MaxiQueen OS tiene planes Starter, Pro y OS Completo. No vendemos herramientas, vendemos sistema.',
    contacto: 'Puedes aplicar por WhatsApp. El proceso es humano y con filtro.',
    comunidad: 'La Comunidad MAXIQUEEN es un proceso estructurado, no motivación.',
    ayuda: 'Vamos paso a paso. Primero orden, luego ejecución.'
  };

  const phrases = [
    'MaxiQueen OS: Orden antes de automatizar.',
    'MaxiQueen OS: El sistema piensa contigo.',
    'MaxiQueen OS: No improvisamos.',
    'MaxiQueen OS: Esto es un proceso real.'
  ];

  window.sendMessage = function () {
    const text = input.value.trim();
    if (!text) return;

    const userMsg = document.createElement('div');
    userMsg.textContent = 'Tú: ' + text;
    chatLog.appendChild(userMsg);

    input.value = '';

    let response = phrases[Math.floor(Math.random() * phrases.length)];
    const lower = text.toLowerCase();

    for (const key in triggers) {
      if (lower.includes(key)) {
        response = triggers[key];
        break;
      }
    }

    const botMsg = document.createElement('div');
    botMsg.textContent = 'MaxiQueen OS: ' + response;
    chatLog.appendChild(botMsg);

    chatLog.scrollTop = chatLog.scrollHeight;
  };
})();
