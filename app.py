from fastapi import FastAPI, UploadFile, File, Query
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import pytesseract
import io
import asyncio
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Persistencia volátil en memoria
MEMORIA = {}
LOGS_SISTEMA = []

def registrar_log(modulo: str, mensaje: str):
    timestamp = datetime.now().strftime("%H:%M:%S")
    LOGS_SISTEMA.append(f"[{timestamp}] [{modulo.upper()}] {mensaje}")
    if len(LOGS_SISTEMA) > 100:  # Mantener últimos 100 logs
        LOGS_SISTEMA.pop(0)

class Message(BaseModel):
    message: str
    session_id: str = "default"

@app.get("/", response_class=HTMLResponse)
def home():
    registrar_log("sistema", "Interfaz frontend cargada desde el raíz.")
    with open("index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/api/status")
def status():
    return JSONResponse(content={
        "server": "OPERATIVO",
        "database": "OK",
        "ocr": "TESSERACT_OK",
        "memoria_usuarios": len(MEMORIA),
        "total_logs": len(LOGS_SISTEMA)
    })

@app.get("/api/admin/logs")
def get_logs():
    # Endpoint para el panel oculto
    return JSONResponse(content={"logs": LOGS_SISTEMA})

@app.post("/api/chat")
async def chat_stream(data: Message):
    sid = data.session_id
    user_text = data.message.strip()
    
    registrar_log("chat", f"Mensaje recibido de {sid}: '{user_text[:30]}...'")

    if sid not in MEMORIA:
        MEMORIA[sid] = {"historial": [], "ultimo_ocr": ""}

    MEMORIA[sid]["historial"].append({"rol": "user", "texto": user_text})

    # Lógica de procesamiento de respuestas
    if "hola" in user_text.lower():
        reply = "👑 Servidor Central MaxiQueen OS v3 activo. Sistema de streaming de datos y logs optimizado. ¿Qué comando ejecutamos hoy?"
    elif "que dije" in user_text.lower() or "resumen" in user_text.lower():
        ultimos = MEMORIA[sid]["historial"][-4:]
        reply = "📜 Historial de sesión activo:\n" + "\n".join([f"🔹 {m['rol']}: {m['texto']}" for m in ultimos])
    elif "imagen" in user_text.lower() or "ocr" in user_text.lower():
        if MEMORIA[sid]["ultimo_ocr"]:
            reply = f"📷 Último texto extraído por OCR:\n\n{MEMORIA[sid]['ultimo_ocr']}"
        else:
            reply = "❌ No hay registros de OCR en esta sesión todavía. Sube una imagen primero usando el botón 📷."
    else:
        reply = f"📡 Consola Operativa procesando comando externo de forma asíncrona: '{user_text}'"

    MEMORIA[sid]["historial"].append({"rol": "bot", "texto": reply})
    registrar_log("ia_engine", f"Generando respuesta por streaming de tokens para {sid}.")

    # Generador asíncrono para el efecto Streaming
    async def generar_tokens():
        palabras = reply.split(" ")
        for i, palabra in enumerate(palabras):
            yield palabra + (" " if i < len(palabras) - 1 else "")
            await asyncio.sleep(0.04) # Simula velocidad de procesamiento de tokens

    return StreamingResponse(generar_tokens(), media_type="text/plain")

@app.post("/api/ocr")
async def ocr_image(file: UploadFile = File(...), session_id: str = "default"):
    registrar_log("ocr", f"Petición de escaneo de imagen entrante para sesión {session_id}.")
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # OCR optimizado en español
        texto = pytesseract.image_to_string(image, lang='spa').strip()

        if session_id not in MEMORIA:
            MEMORIA[session_id] = {"historial": [], "ultimo_ocr": ""}

        MEMORIA[session_id]["ultimo_ocr"] = texto

        if not texto:
            registrar_log("ocr", "Escaneo completado. Resultado vacío u opaco.")
            return JSONResponse(content={"response": "⚠️ No se detectó texto legible en la imagen cargada."})

        registrar_log("ocr", f"Escaneo exitoso. Caracteres extraídos: {len(texto)}.")
        return JSONResponse(content={
            "response": f"✅ **Texto extraído por el núcleo OCR:**\n\n{texto}",
            "texto_raw": texto
        })

    except Exception as e:
        registrar_log("error", f"Fallo crítico en módulo OCR: {str(e)}")
        return JSONResponse(content={"response": f"❌ Error crítico en motor OCR: {str(e)}"}, status_code=500)