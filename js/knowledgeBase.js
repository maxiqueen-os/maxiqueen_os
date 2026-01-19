let knowledgeBase = [];

// 1. Cargar knowledge.json
fetch("data/knowledge.json")
  .then(response => response.json())
  .then(data => {
    knowledgeBase = data.faq;
    addBotMessage(
      "Hola. Soy el asistente de MaxiQueen OS. ¿En qué puedo ayudarte?"
    );
  })
  .catch(error => {
    console.error("Error cargando knowledge:", error);
    addBotMessage(
      "El sistema está cargando. Intenta nuevamente en unos segundos."
    );
  });

// 2. Enviar mensaje
document.getElementById("send-btn").addEventListener("click", sendMessage);
document
  .getElementById("user-input")
  .addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });

function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  addUserMessage(text);
  input.value = "";

  const response = findResponse(text);
  setTimeout(() => addBotMessage(response), 500);
}

// 3. Buscar respuesta en knowledge.json
function findResponse(text) {
  const lowerText = text.toLowerCase();

  for (const item of knowledgeBase) {
    if (lowerText.includes(item.keyword)) {
      return item.response;
    }
  }

  return "Puedo ayudarte a entender qué es MaxiQueen OS, planes, precios o cómo aplicar.";
}

// 4. Render mensajes
function addUserMessage(text) {
  const box = document.getElementById("chat-box");
  box.innerHTML += `<div class="user">🧑 ${text}</div>`;
  box.scrollTop = box.scrollHeight;
}

function addBotMessage(text) {
  const box = document.getElementById("chat-box");
  box.innerHTML += `<div class="bot">🤖 ${text}</div>`;
  box.scrollTop = box.scrollHeight;
}
