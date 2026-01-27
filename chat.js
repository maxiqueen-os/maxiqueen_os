// ===== MEMORIA DE SESIÓN =====
let sessionMemory = JSON.parse(sessionStorage.getItem("mq_memory")) || {
  stage: "neutral",
  interestScore: 0,
  lastIntent: null,
  askedPrice: false,
  escalated: false
};

let state = {
  stage: "nuevo",
  interest: null,
  need: null,
  plan: null,
  steps: 0,
  discountShown: false,
  resourcesShown: false,
  ctaShown: false,
  ...JSON.parse(sessionStorage.getItem("mq_state") || "{}")
};

let silentMode = false;

// ===== DOM =====
const input = document.getElementById("userInput");
const log = document.getElementById("chatLog");

const LINKS = { descuento40: "https://hotmart.com/tu-oferta-40" };

// ===== UTILIDADES =====
function humanDelay() { return Math.floor(Math.random() * 700) + 400; }
function saveState() {
  sessionStorage.setItem("mq_state", JSON.stringify(state));
  sessionStorage.setItem("mq_memory", JSON.stringify(sessionMemory));
}
function getResources() {
  return `
⬇️ **Recursos MaxiQueen OS**
💻 Afiliados  
🛒 Hotmart Marketplace  
💳 Oferta 40% descuento  
📂 Comunidad Hotmart  

📱 Redes:
TikTok | Instagram | Facebook | YouTube | WhatsApp
`;
}

// ===== INTENCIÓN =====
function detectIntent(text) {
  text = text.toLowerCase();

  // Prioridad: Plan > Precio > General > Silencio
  if (["starter","pro","elite"].some(p => text.includes(p))) return text;
  if (text.includes("precio") || text.includes("plan")) return "precio";
  if (text.includes("solo mirando")) return "silencio";
  if (text.includes("idea")) return "idea";
  if (text.includes("negocio")) return "negocio";
  if (text.includes("contenido")) return "contenido";
  if (text.includes("ordenar")) return "ordenar";
  if (text.includes("escalar")) return "escalar";
  if (text.includes("whatsapp")) return "whatsapp";
  if (["si","sí"].includes(text)) return "confirmar";
  return "general";
}

function updateMemory(intent) {
  sessionMemory.lastIntent = intent;
  if (["precio","planes","ventas"].includes(intent)) {
    sessionMemory.interestScore += 2;
    sessionMemory.askedPrice = true;
  }
  if (sessionMemory.interestScore >= 4 && sessionMemory.stage !== "humano") {
    sessionMemory.stage = "lead";
  }
  if (intent === "acompañamiento humano") {
    sessionMemory.stage = "humano";
    sessionMemory.escalated = true;
  }
}

// ===== CLASIFICACIÓN LEAD =====
function classifyLead() {
  if (sessionMemory.stage === "humano") return "humano";
  if (sessionMemory.interestScore >= 4) return "lead caliente";
  return "curioso";
}

// ===== EXTRAS CENTRALIZADOS =====
function appendExtras() {
  let extraText = "";

  if (classifyLead() === "lead caliente" && !state.discountShown) {
    extraText += `\n\n💳 **Oferta activa 40%**\n${LINKS.descuento40}`;
    state.discountShown = true;
  }

  if (state.stage === "listo" && !state.resourcesShown) {
    extraText += getResources();
    state.resourcesShown = true;
  }

  if (classifyLead() === "lead caliente" && !sessionMemory.escalated && state.stage === "listo") {
    extraText += `\n\nSi lo prefieres, podemos verlo paso a paso con un acompañamiento humano 👑`;
  }

  if (state.stage === "listo" && !state.ctaShown) {
    extraText += "\n👉 ¿Continuamos por WhatsApp?";
    state.ctaShown = true;
  }

  saveState();
  return extraText;
}

// ===== RESPUESTAS =====
function getReply(intent) {
  switch(intent) {
    case "silencio":
      silentMode = true;
      return "Bienvenido al backend mental de MaxiQueen OS 👑. Aquí estaré si decides avanzar.";
    case "general":
      return classifyLead() === "curioso"
        ? "Cuéntame un poco más. Primero entendemos, luego decidimos."
        : "Vamos directo al punto. El orden correcto ahorra dinero.";
    case "idea":
    case "negocio":
    case "contenido":
      state.interest = intent;
      saveState();
      return "Perfecto. ¿Qué necesitas ahora: ordenar o escalar?";
    case "ordenar":
      state.need = "ordenar"; state.plan = "starter"; state.stage="listo"; saveState();
      return "Bien. Empezar por orden evita perder dinero. El plan Starter es el punto de entrada correcto." + appendExtras();
    case "escalar":
      state.need = "escalar"; state.plan = "pro"; state.stage="listo"; saveState();
      return "Escalar sin estructura rompe negocios. El sistema Pro es el camino lógico." + appendExtras();
    case "starter":
    case "pro":
    case "elite":
      state.plan = intent; state.stage="listo"; saveState();
      return `Excelente. El plan ${intent.toUpperCase()} encaja con lo que estás buscando.` + appendExtras();
    case "precio":
      return !sessionMemory.askedPrice
        ? "Tenemos planes Starter, Pro y Elite. Antes dime algo clave: ¿quieres ordenar o escalar?"
        : "Ya vimos precios. Ahora toca decidir: Starter para ordenar o Pro para escalar.";
    case "whatsapp":
    case "confirmar":
      if (state.stage === "listo") { openWhatsApp(); return "Perfecto. Te llevo a WhatsApp 👑"; }
      return "Antes de continuar, necesito entender mejor tu caso.";
  }
}

// ===== CTA WHATSAPP =====
function openWhatsApp() {
  const msg = `Hola MaxiQueen OS. Tengo un ${state.interest||"proyecto"} y quiero info del plan ${state.plan||"adecuado"}.`;
  window.open("https://wa.me/573016625921?text="+encodeURIComponent(msg), "_blank");
}

// ===== CHAT =====
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  // Reactivar chat si escriben algo diferente a silencio
  if(text.toLowerCase() !== "solo mirando") silentMode = false;

  if (silentMode) return;

  state.steps++; saveState();

  const intent = detectIntent(text);
  updateMemory(intent);

  const response = getReply(intent);

  log.innerHTML += `<div><strong>Tú:</strong> ${text}</div>`;
  setTimeout(() => {
    log.innerHTML += `<div><strong>MaxiQueen OS:</strong> ${response}</div>`;
    log.scrollTop = log.scrollHeight;
  }, humanDelay());

  // Guardar métricas
  const metrics = JSON.parse(localStorage.getItem("mq_metrics")||"[]");
  metrics.push({ text, intent, lead: classifyLead(), stage: state.stage, time: new Date().toISOString() });
  localStorage.setItem("mq_metrics", JSON.stringify(metrics));

  input.value = "";
}

// ENTER
input.addEventListener("keypress", e => { if (e.key==="Enter") sendMessage(); });
