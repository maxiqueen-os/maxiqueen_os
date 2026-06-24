const express = require('express');
const cors = require('cors');
const path = require('path');
const Datastore = require('nedb-promises');

// Inicializar la base de datos local (se guarda en la carpeta 'data' del contenedor)
const db = {};
db.usuarios = Datastore.create({ filename: path.join(__dirname, 'data', 'usuarios.db'), autoload: true });
db.documentos = Datastore.create({ filename: path.join(__dirname, 'data', 'documentos.db'), autoload: true });
db.chat_logs = Datastore.create({ filename: path.join(__dirname, 'data', 'chat_logs.db'), autoload: true });

const app = express();
const PORT = process.env.PORT || 7860;

// Configuración de CORS total para evitar bloqueos con Vercel
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Variable global para el motor de IA local
let pipelineIA = null;

// Inicialización asíncrona del modelo de IA local (Totalmente Gratis y sin Llaves)
async function initLocalIA() {
    try {
        console.log("⏳ Cargando modelo de IA local en memoria (Transformers.js)...");
        // Cargamos un modelo optimizado para procesamiento de texto nativo
        const { pipeline } = await import('@xenova/transformers');
        pipelineIA = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log("e00000000000000000000000000000000000000000000000000000000🟢 IA Local cargada correctamente. ¡Sistema listo e independiente!");
    } catch (error) {
        console.error("❌ Error al cargar el modelo de IA local:", error.message);
    }
}
initLocalIA();

// Ruta base para comprobar que el contenedor responda en la web (PUESTA ANTES DEL MANEJO DE RUTAS)
app.get('/', (req, res) => {
    res.json({
        status: "online",
        message: "MaxiQueen OS v2 API corriendo de forma 100% Local y Autónoma",
        version: "2.0.0",
        port: PORT,
        database: "NeDB Local Activa",
        iaLocalReady: pipelineIA !== null
    });
});

// Health check endpoint (Obligatorio para Hugging Face)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString()
    });
});

// 🔥 RUTA CENTRALIZADA PARA EL CHAT DE LA IA (100% LOCAL)
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
        }

        if (!pipelineIA) {
            return res.status(503).json({ error: 'El servicio de IA local aún se está inicializando en el servidor.' });
        }

        // Procesamiento analítico del texto dentro de la CPU de Hugging Face
        const output = await pipelineIA(message, { pooling: 'mean', normalize: true });
        const embedding = Array.from(output.data).slice(0, 5); // Muestra de vectores generados

        // Simulación de respuesta lógica estructurada del sistema operativo local
        const reply = `[MaxiQueen AI Local] Procesé tu solicitud de forma interna. Longitud del mensaje: ${message.length} caracteres. Análisis vectorial completado exitosamente sin APIs de terceros.`;

        // Guarda el registro automáticamente en la base de datos local integrada
        await db.chat_logs.insert({
            prompt: message,
            response: reply,
            vectorsSample: embedding,
            timestamp: new Date()
        });

        res.json({ 
            success: true, 
            response: reply,
            info: "Procesado localmente en Hugging Face Spaces."
        });

    } catch (err) {
        console.error('❌ Error en el endpoint /api/chat local:', err);
        res.status(500).json({ error: 'Error interno procesando la solicitud de IA local.', details: err.message });
    }
});

// Endpoint para guardar cualquier tipo de datos localmente
app.post('/api/save', async (req, res) => {
    try {
        const { collection, data } = req.body;
        if (!collection || !data) {
            return res.status(400).json({ error: "Faltan parámetros 'collection' o 'data'" });
        }
        if (!db[collection]) {
            db[collection] = Datastore.create({ filename: path.join(__dirname, 'data', `${collection}.db`), autoload: true });
        }
        const documentInserted = await db[collection].insert({
            ...data,
            createdAt: new Date()
        });
        res.json({ success: true, message: "Datos guardados localmente en NeDB", doc: documentInserted });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para consultar datos locales
app.get('/api/get/:collection', async (req, res) => {
    try {
        const { collection } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        if (!db[collection]) {
            return res.status(404).json({ error: "Colección local no encontrada" });
        }
        const docs = await db[collection].find({}).sort({ timestamp: -1 }).limit(limit);
        res.json({ success: true, collection, count: docs.length, data: docs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manejo universal de rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada en el ecosistema local',
        path: req.path,
        method: req.method
    });
});

// Inicializar Servidor en la interfaz global expuesta
app.listen(PORT, '0.0.0.0', () => {
    console.log(`==================================================`);
    console.log(`🚀 Servidor Autónomo de MaxiQueen activo en puerto: ${PORT}`);
    console.log(`==================================================`);
});