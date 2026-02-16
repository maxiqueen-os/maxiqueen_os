/* ==========================================================
   MAXIQUEEN OS — CHAT ENGINE v5
   Arquitectura profesional + tu cerebro integrado
========================================================== */

/* =========================
   CONFIG
========================= */
const CONFIG = {
  storageKey: "maxiqueen_chat_session",
  maxMessages: 100
};

/* =========================
   UTILIDADES
========================= */
const Utils = {
  normalize(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // quita acentos
      .replace(/[^\w\s]/gi, "")        // quita símbolos
      .trim();
  },
  safeJSONParse(str, fallback) {
    try { return JSON.parse(str); }
    catch { return fallback; }
  }
};

/* =========================
   CONTEXTO GLOBAL
========================= */
const ConversationContext = {
  history: [],
  perfil: {
    orientacion: null, // personal | negocio
    energia: null,     // baja | media | alta
    nivel: null        // starter | pro | elite
  }
};

/* =========================
   STORAGE
========================= */
const Storage = {
  save() {
    const payload = {
      history: ConversationContext.history.slice(-CONFIG.maxMessages)
    };
    sessionStorage.setItem(CONFIG.storageKey, JSON.stringify(payload));
  },

  load() {
    const raw = sessionStorage.getItem(CONFIG.storageKey);
    if (!raw) return false;

    const data = Utils.safeJSONParse(raw, null);
    if (!data || !Array.isArray(data.history)) return false;

    ConversationContext.history = data.history;
    return true;
  },

  clear() {
    sessionStorage.removeItem(CONFIG.storageKey);
  }
};

/* =========================
   🧠 TU ESTADO INTERNO
========================= */
let state = {
  flujo: null,
  etapa: null,
  nivelDetectado: null
};

/* =========================
   📦 TUS TRIGGERS (RESUMIDO)
========================= */
const triggers = {
  onboarding: {
    inicio: `
Hola 👑  
Estoy aquí contigo, con calma.

¿En qué punto estás ahora mismo?

1️⃣ Ideas  
2️⃣ Bloqueo  
3️⃣ Crecimiento  
`
  },
  fallback() {
    return `
Te leo 👀  

Perfil que estoy detectando hasta ahora:

Orientación: ${ConversationContext.perfil.orientacion || "aún explorando"}
Energía: ${ConversationContext.perfil.energia || "no clara todavía"}
Nivel: ${ConversationContext.perfil.nivel || "por definir"}

No quiero improvisar contigo.
Cuéntame un poco más para afinar el diagnóstico 👑
`;
  }
};

/* =========================
   🎯 TUS INTENTS BASE
========================= */
const intents = [
  {
    keywords: ["hola","buenas","hey"],
    response: () => triggers.onboarding.inicio
  }
];

/* =========================
   🧠 MOTOR CONTEXTUAL
========================= */
function contextualResponse(text) {
  return null; // aquí puedes seguir ampliando tu lógica
}

/* =========================
   PERFIL INFERENCIA
========================= */
function inferProfile(text) {
  if (text.includes("negocio") || text.includes("ventas") || text.includes("clientes")) {
    ConversationContext.perfil.orientacion = "negocio";
  }
  if (text.includes("cansado") || text.includes("bloqueo") || text.includes("pereza")) {
    ConversationContext.perfil.energia = "baja";
  }
  if (text.includes("crecer") || text.includes("expandir")) {
    ConversationContext.perfil.nivel = "pro";
  }
}

/* =========================
   🎯 RESPUESTA PRINCIPAL
========================= */
function getResponse(message) {
  const text = Utils.normalize(message);

  inferProfile(text);

  const contextual = contextualResponse(text);
  if (contextual) return contextual;

  for (const intent of intents) {
    if (intent.keywords.some(k => text.includes(k))) {
      return intent.response();
    }
  }

  return triggers.fallback();
}

/* =========================
   FLOW ENGINE
========================= */
const FlowEngine = {
  decide(userText) {
    try {
      const reply = getResponse(userText);
      return { reply };
    } catch (error) {
      console.error("FlowEngine error:", error);
      return {
        reply: "⚠️ Error interno procesando mensaje."
      };
    }
  }
};

/* =========================
   UI ADAPTER
========================= */
const UIAdapter = {
  elements: {},

  init() {
    this.elements.form = document.querySelector("#chat-form");
    this.elements.input = document.querySelector("#chat-input");
    this.elements.messages = document.querySelector("#chat-messages");
  },

  renderUserMessage(text) {
    this._renderBubble(text, "user");
  },

  renderBotMessage(text) {
    this._renderBubble(text, "bot");
  },

  _renderBubble(text, sender) {
    const bubble = document.createElement("div");
    bubble.className = `message ${sender}`;
    bubble.style.whiteSpace = "pre-line";
    bubble.textContent = text;
    this.elements.messages.appendChild(bubble);
    this.scrollToBottom();
  },

  scrollToBottom() {
    this.elements.messages.scrollTop =
      this.elements.messages.scrollHeight;
  },

  clearInput() {
    this.elements.input.value = "";
  }
};

/* =========================
   APP CONTROLLER
========================= */
const AppController = {
  init() {
    UIAdapter.init();

    const restored = Storage.load();
    if (restored) {
      this.restoreHistory();
    } else {
      this.sendBotMessage(
        "👑 Bienvenido a MaxiQueen OS. ¿En qué puedo ayudarte hoy?"
      );
    }

    this.bindEvents();
  },

  bindEvents() {
    UIAdapter.elements.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = UIAdapter.elements.input.value.trim();
      if (!text) return;

      this.handleUserMessage(text);
    });
  },

  handleUserMessage(text) {
    UIAdapter.renderUserMessage(text);
    UIAdapter.clearInput();

    ConversationContext.history.push({ sender: "user", text });
    if (ConversationContext.history.length > 10) {
      ConversationContext.history.shift();
    }

    const decision = FlowEngine.decide(text);

    this.sendBotMessage(decision.reply);

    ConversationContext.history.push({ sender: "bot", text: decision.reply });

    Storage.save();
  },

  sendBotMessage(text) {
    UIAdapter.renderBotMessage(text);
  },

  restoreHistory() {
    ConversationContext.history.forEach(msg => {
      if (msg.sender === "user")
        UIAdapter.renderUserMessage(msg.text);
      else
        UIAdapter.renderBotMessage(msg.text);
    });
  }
};

/* =========================
   BOOTSTRAP
========================= */
document.addEventListener("DOMContentLoaded", () => {
  AppController.init();
});
