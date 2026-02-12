/* ============================================================
   MAXIQUEEN OS — CHAT ENGINE v3
   Arquitectura limpia, determinista y mantenible
   ============================================================ */

/* =======================
   CONFIG
======================= */

const CONFIG = {
  storageKey: "maxiqueen_chat_session",
  maxMessages: 100,
  defaultStage: "welcome",
  botName: "MaxiQueen",
};

/* =======================
   UTILITIES
======================= */

const Utils = {
  normalize(text) {
    return text.toLowerCase().trim();
  },
  safeJSONParse(str, fallback) {
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  },
};

/* =======================
   CONVERSATION CONTEXT
   (Single source of truth)
======================= */

const ConversationContext = {
  stage: CONFIG.defaultStage,
  intent: null,
  flags: {},
  history: [],

  reset() {
    this.stage = CONFIG.defaultStage;
    this.intent = null;
    this.flags = {};
    this.history = [];
    Storage.clear();
  },
};

/* =======================
   STORAGE (Persistence only)
======================= */

const Storage = {
  save() {
    const payload = {
      stage: ConversationContext.stage,
      intent: ConversationContext.intent,
      flags: ConversationContext.flags,
      history: ConversationContext.history.slice(-CONFIG.maxMessages),
    };
    sessionStorage.setItem(CONFIG.storageKey, JSON.stringify(payload));
  },

  load() {
    const raw = sessionStorage.getItem(CONFIG.storageKey);
    if (!raw) return false;

    const data = Utils.safeJSONParse(raw, null);
    if (!data || !data.stage || !Array.isArray(data.history)) return false;

    ConversationContext.stage = data.stage;
    ConversationContext.intent = data.intent;
    ConversationContext.flags = data.flags || {};
    ConversationContext.history = data.history || [];
    return true;
  },

  clear() {
    sessionStorage.removeItem(CONFIG.storageKey);
  },
};

/* =======================
   INTENT ENGINE
======================= */

const IntentEngine = {
  detect(text) {
    const input = Utils.normalize(text);

    if (!input) return "empty";

    if (input.includes("precio") || input.includes("coste") || input.includes("plan"))
      return "pricing";

    if (input.includes("hola") || input.includes("buenas"))
      return "greeting";

    if (input.includes("ayuda") || input.includes("soporte"))
      return "help";

    if (input.includes("demo") || input.includes("probar"))
      return "demo";

    if (input.includes("contacto") || input.includes("hablar") || input.includes("whatsapp"))
      return "contact";

    if (input.includes("reset") || input.includes("reiniciar"))
      return "reset";

    return "unknown";
  },
};

/* =======================
   FLOW ENGINE
   (State transitions + decisions)
======================= */

const FlowEngine = {
  decide(intent, ctx) {
    switch (intent) {
      case "greeting":
        return this.onGreeting(ctx);

      case "pricing":
        return this.onPricing(ctx);

      case "help":
        return this.onHelp(ctx);

      case "demo":
        return this.onDemo(ctx);

      case "contact":
        return this.onContact(ctx);

      case "reset":
        return this.onReset(ctx);

      case "empty":
        return {
          reply: "Escribe algo y con gusto te ayudo 😊",
        };

      case "unknown":
      default:
        return this.onUnknown(ctx);
    }
  },

  /* ===== Handlers ===== */

  onGreeting(ctx) {
    if (ctx.stage === "welcome") {
      ctx.stage = "intro";
      return {
        reply:
          "Hola 👑 Soy MaxiQueen. Puedo ayudarte a conocer el sistema, ver planes o probar una demo. ¿Qué te gustaría hacer?",
      };
    }

    return {
      reply: "Hola de nuevo 👋 ¿En qué te ayudo ahora?",
    };
  },

  onPricing(ctx) {
    ctx.stage = "pricing";
    ctx.flags.interestedInPricing = true;

    return {
      reply:
        "Estos son los planes actuales:\n\n🔹 Starter — Ideal para comenzar\n🔹 Pro — Para proyectos avanzados\n🔹 Enterprise — Soluciones a medida\n\n¿Quieres que te recomiende uno?",
    };
  },

  onHelp(ctx) {
    ctx.stage = "help";

    return {
      reply:
        "Puedo ayudarte con:\n\n✅ Conocer MaxiQueen OS\n✅ Ver planes\n✅ Solicitar demo\n✅ Contactar soporte\n\n¿Qué necesitas?",
    };
  },

  onDemo(ctx) {
    ctx.stage = "demo";

    return {
      reply:
        "Perfecto 🚀 Puedo mostrarte cómo funciona MaxiQueen OS en acción.\n\n¿Quieres una demo guiada o prefieres explorar por tu cuenta?",
    };
  },

  onContact(ctx) {
    ctx.stage = "contact";

    return {
      reply:
        "Puedes contactarnos directamente por WhatsApp aquí:\n\n👉 https://wa.me/XXXXXXXXXXX\n\n¿Quieres que te ayude con algo más mientras tanto?",
      action: "open-link",
      payload: "https://wa.me/XXXXXXXXXXX",
    };
  },

  onReset(ctx) {
    ctx.reset();
    return {
      reply: "🔄 Conversación reiniciada. ¿En qué te ayudo ahora?",
    };
  },

  onUnknown(ctx) {
    return {
      reply:
        "No estoy seguro de haber entendido 🤔\n\nPuedes preguntarme por precios, pedir una demo o escribir 'ayuda'.",
    };
  },
};

/* =======================
   RESPONSE ENGINE
======================= */

const ResponseEngine = {
  generate(decision) {
    return {
      text: decision.reply,
      action: decision.action || null,
      payload: decision.payload || null,
    };
  },
};

/* =======================
   UI ADAPTER (DOM only)
======================= */

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
    bubble.textContent = text;
    this.elements.messages.appendChild(bubble);
    this.scrollToBottom();
  },

  scrollToBottom() {
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
  },

  clearInput() {
    this.elements.input.value = "";
  },
};

/* =======================
   APP CONTROLLER
   (Single orchestrator)
======================= */

const AppController = {
  init() {
    UIAdapter.init();

    const restored = Storage.load();
    if (restored) {
      this.restoreHistory();
    } else {
      this.sendBotMessage(
        "👑 Bienvenido a MaxiQueen OS. Soy tu asistente. ¿En qué puedo ayudarte hoy?"
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

    ConversationContext.history.push({
      sender: "user",
      text,
      timestamp: Date.now(),
    });

    const intent = IntentEngine.detect(text);
    ConversationContext.intent = intent;

    let decision;
    try {
      decision = FlowEngine.decide(intent, ConversationContext);
    } catch (err) {
      console.error("Flow error:", err);
      decision = {
        reply:
          "⚠️ Ocurrió un error interno. Intenta nuevamente o escribe 'reset'.",
      };
    }

    const response = ResponseEngine.generate(decision);

    this.sendBotMessage(response.text);

    ConversationContext.history.push({
      sender: "bot",
      text: response.text,
      timestamp: Date.now(),
    });

    Storage.save();

    if (response.action === "open-link" && response.payload) {
      window.open(response.payload, "_blank");
    }
  },

  sendBotMessage(text) {
    UIAdapter.renderBotMessage(text);
  },

  restoreHistory() {
    ConversationContext.history.forEach((msg) => {
      if (msg.sender === "user") UIAdapter.renderUserMessage(msg.text);
      else UIAdapter.renderBotMessage(msg.text);
    });
  },
};

/* =======================
   BOOTSTRAP
======================= */

document.addEventListener("DOMContentLoaded", () => {
  AppController.init();
});
