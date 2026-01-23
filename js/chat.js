(function () {
  const chatLog = document.getElementById('chatLog');
  const input = document.getElementById('userInput');
const STATE_KEY = 'maxiqueen_session';

let ctaState = {
  shown: false,
  meaningfulInputs: 0
};

function isMeaningfulInput(text) {
  return text.length > 3 && !['hola', 'ok', 'si', 'no', 'gracias'].includes(text);
}

function getSmartWhatsAppLink() {
  let message = "Hola MAXIQUEEN OS. Vengo desde la página.";

  if (userState?.interest) {
    message += ` Tengo un ${userState.interest}.`;
  }

  if (userState?.lastPlan) {
    message += ` Me interesa el PLAN ${userState.lastPlan.toUpperCase()}.`;
  }

  message += " Quiero ordenar y avanzar con el sistema.";

  return "https://wa.me/573016625921?text=" + encodeURIComponent(message);
}

let sessionState = {
  visited: false,
  lastIntent: null,
  lastBotMessage: null
};

function loadState() {
  const saved = sessionStorage.getItem(STATE_KEY);
  if (saved) sessionState = JSON.parse(saved);
}

function saveState() {
  sessionStorage.setItem(STATE_KEY, JSON.stringify(sessionState));
}


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
    if (!text) return;if (isMeaningfulInput(text)) {
  ctaState.meaningfulInputs++;
}

if (
  !ctaState.shown &&
  ctaState.meaningfulInputs >= 3 &&
  ['precio','plan','whatsapp','ayuda','empezar'].some(k => text.toLowerCase().includes(k))
) {
  ctaState.shown = true;

  const ctaMsg = document.createElement('div');
  ctaMsg.className = 'bot-msg';
  ctaMsg.innerHTML = `
    👑 Veo intención real.<br>
    <a href="${getSmartWhatsAppLink()}" target="_blank" style="text-decoration:underline;">
      Continuar por WhatsApp
    </a>
  `;
  chatLog.appendChild(ctaMsg);
}

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

// memoria de último mensaje del bot
sessionState.lastBotMessage = response;
saveState();