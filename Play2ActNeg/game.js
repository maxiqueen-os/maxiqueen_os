// Variables del simulador de negocio
let money = 0;
let level = 1;
let contentMultiplier = 1;
let autoActive = false;

// Variables del Bot Lector
let botEnabled = false;

// Referencias del DOM
const moneyEl = document.getElementById("money");
const levelEl = document.getElementById("level");
const logEl = document.getElementById("log");
const botAvatar = document.getElementById("botAvatar");
const toggleBtn = document.getElementById("toggleAudioBtn");

// ==========================================
// 1. SISTEMA DEL BOT LECTOR DE AUDIO (TTS)
// ==========================================

function toggleAudio() {
    botEnabled = !botEnabled;
    if (botEnabled) {
        toggleBtn.textContent = "Voz Activada 🔊";
        toggleBtn.style.color = "#0ff";
        registrarLog("Sistema de voz MaxiQueen conectado.");
    } else {
        toggleBtn.textContent = "Activar Voz 🔇";
        toggleBtn.style.color = "#fff";
        speechSynthesis.cancel(); // Detiene cualquier audio en curso
    }
}

function leerTexto(texto) {
    if (!botEnabled) return;

    // Cancela el audio anterior para que no se pisen las voces
    speechSynthesis.cancel();

    // Configura la voz
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "es-ES"; // Idioma español
    utterance.rate = 1.1; // Velocidad un poco más rápida/futurista
    utterance.pitch = 1.0; 

    // Al empezar a hablar: Mueve el robot
    utterance.onstart = () => {
        botAvatar.classList.add("bot-hablando");
    };

    // Al terminar de hablar: Detiene el robot
    utterance.onend = () => {
        botAvatar.classList.remove("bot-hablando");
    };

    // Reproduce la voz
    speechSynthesis.speak(utterance);
}

// Imprime en pantalla y manda a leer al bot
function registrarLog(mensaje) {
    logEl.textContent = mensaje;
    leerTexto(mensaje); // <--- Aquí es donde el texto de la pantalla se vuelve audio
}

// ==========================================
// 2. LÓGICA DEL JUEGO EMPRESARIAL
// ==========================================

function crearContenido() {
    contentMultiplier += 1;
    registrarLog(`Contenido creado. Multiplicador de ventas subió a x${contentMultiplier}`);
}

function vender() {
    let ganancia = 10 * contentMultiplier;
    money += ganancia;
    actualizarUI();
    registrarLog(`¡Excelente cierre! Has vendido productos por $${ganancia}`);
    verificarNivel();
}

function automatizar() {
    if (autoActive) {
        registrarLog("El sistema de ventas ya está automatizado.");
        return;
    }

    if (money >= 50) {
        money -= 50;
        autoActive = true;
        actualizarUI();
        registrarLog("Automatización iniciada. Generando ingresos en piloto automático.");
        
        setInterval(() => {
            money += (5 * contentMultiplier);
            actualizarUI();
            verificarNivel();
        }, 3000);
    } else {
        registrarLog("Saldo insuficiente. Necesitas $50 para automatizar tu embudo.");
    }
}

function verificarNivel() {
    let nivelObjetivo = Math.floor(money / 200) + 1;
    if (nivelObjetivo > level) {
        level = nivelObjetivo;
        actualizarUI();
        registrarLog(`¡Subiste de nivel! Tu negocio ahora es nivel ${level}`);
    }
}

function actualizarUI() {
    moneyEl.textContent = money;
    levelEl.textContent = level;
}

function finalizar() {
    registrarLog("Iniciando integración en la nube...");
    setTimeout(() => {
        alert("Ecosistema modular activado. Listo para la transición real.");
    }, 2500);
}