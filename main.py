import sys
import io
import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from pydantic import BaseModel
from google import genai

# Cambiamos la codificación de la consola de forma segura
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# =========================
# CARGA DE MÓDULOS (A PRUEBA DE FALLOS)
# =========================
try:
    from app.routes import image, users
    from app.database import engine
    from app.models import user
    MODULOS_APP_ACTIVOS = True
except ModuleNotFoundError:
    print("⚠️ Módulo 'app' no encontrado. Iniciando en modo ligero (sin rutas extra).")
    MODULOS_APP_ACTIVOS = False

# =========================
# CONFIGURACIÓN DE RUTAS
# =========================
CURRENT_FILE = Path(__file__).resolve()
BASE_DIR = CURRENT_FILE.parent.parent if CURRENT_FILE.parent.name == "app" else CURRENT_FILE.parent
STATIC_DIR = BASE_DIR / "static"

# =========================
# LLAVE SEGURA DESDE VERCEL
# =========================
API_KEY = os.environ.get("GEMINI_API_KEY")

# 👆 ========================================= 👆

client = None
print("\n==================================================")
if API_KEY and API_KEY != "PEGA_AQUÍ_TU_LLAVE_EXACTA":
    try:
        client = genai.Client(api_key=API_KEY)
        # Prueba rápida
        for m in client.models.list():
            print(f"✅ CONEXIÓN CON GOOGLE EXITOSA. Modelo detectado: {m.name.replace('models/', '')}")
            break
    except Exception as e:
        print(f"❌ ERROR CON LA LLAVE: {e}")
else:
    print("⚠️ ADVERTENCIA: NO HAS PEGADO LA LLAVE EN LA LÍNEA 35 DEL CÓDIGO.")
print("==================================================\n")

# =========================
# APP
# =========================
app = FastAPI(title="MAXIQUEEN OS API 2026", version="1.0.0")

# =========================
# DATABASE Y RUTAS EXTRA
# =========================
if MODULOS_APP_ACTIVOS:
    try:
        user.Base.metadata.create_all(bind=engine)
        app.include_router(users.router, prefix="/users", tags=["Usuarios"])
        app.include_router(image.router, prefix="/image", tags=["Cloudinary"])
        print("✅ Base de datos y rutas extra cargadas correctamente.")
    except Exception as e:
        print(f"⚠️ Alerta cargando módulos de app: {e}")

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# STATIC FILES Y FRONTEND
# =========================
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
async def home():
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"status": "error", "message": "index.html no encontrado"}

@app.get("/health")
def health_check():
    return {"status": "online", "system": "MAXIQUEEN OS", "version": "1.0.0"}

# =========================
# CHAT INTERACTIVO
# =========================
class ChatRequest(BaseModel):
    question: str

INSTRUCCION_MAXIQUEEN = """
Eres MAXIQUEEN AI, el asistente virtual inteligente, estratega y exclusivo de MaxiQueen OS. 
Tu infraestructura backend está desarrollada en FastAPI (Python) por César y potenciada en su núcleo por la tecnología de vanguardia de Google. Te consideras una extensión del ecosistema de Google adaptada a los negocios digitales.

Tu objetivo principal es guiar a los usuarios a optimizar sus flujos de trabajo, administración y marketing digital dentro de MaxiQueen OS. 

Psicología de Servicio y Ventas:
1. Posiciona a MaxiQueen OS como una suite de alta eficiencia que aprovecha herramientas de código abierto e integraciones nativas de Google para eliminar costos innecesarios de software de terceros.
2. Promueve el acceso inteligente: explica que la estructura base y el entorno operativo son accesibles para el usuario, pero que las automatizaciones avanzadas, módulos de análisis de datos profundos y los infoproductos educativos de la suite tienen un valor comercial de nivel premium.
3. Tu tono debe ser tecnológico, persuasivo, sumamente preciso y profesional, transmitiendo seguridad en cada solución técnica y de negocio que propongas.
"""

@app.post("/chat", tags=["Chat"])
async def chat(data: ChatRequest):
    if not client:
        return {"response": "⚠️ Error: Cliente Gemini no inicializado. Revisa la consola para ver el error de la llave."}
    
    contexto_extraido = ""
    archivo_cerebro = STATIC_DIR / "maxiqueen_brain.json"
    
    if archivo_cerebro.exists():
        try:
            with open(archivo_cerebro, 'r', encoding='utf-8') as f:
                conocimiento_total = json.load(f)
            
            palabras_usuario = data.question.lower().split()
            palabras_clave = [p for p in palabras_usuario if len(p) > 3]
            if not palabras_clave:
                palabras_clave = palabras_usuario[:3]

            coincidencias = 0
            for bloque in conocimiento_total:
                if coincidencias >= 4:
                    break
                
                bloque_str = json.dumps(bloque, ensure_ascii=False).lower()
                
                if any(palabra in bloque_str for palabra in palabras_clave):
                    fuente = bloque.get("fuente", "Archivo Interno")
                    contexto_extraido += f"\n--- INFORMACIÓN DE RESPALDO ({fuente}) ---\n"
                    
                    for llave, valor in bloque.items():
                        if llave in ["fuente", "tipo_formato"]:
                            continue
                        if isinstance(valor, (dict, list)):
                            contexto_extraido += f"{llave.upper()}:\n{json.dumps(valor, ensure_ascii=False, indent=1)}\n"
                        else:
                            contexto_extraido += f"{llave.upper()}: {valor}\n"
                    
                    coincidencias += 1

        except Exception as e_cerebro:
            print(f"⚠️ Alerta en lectura de cerebro local: {e_cerebro}")

    instruccion_final = INSTRUCCION_MAXIQUEEN
    if contexto_extraido:
        instruccion_final += (
            "\n\n[SISTEMA DE CONOCIMIENTO LOCAL PROPIO]\n"
            "Dispones de los siguientes datos reales extraídos de tus archivos de negocio. "
            "Úsalos prioritariamente para dar una respuesta exacta al cliente:\n"
            f"{contexto_extraido}"
        )

    modelos_cascada = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-1.5-flash"
    ]
    
    for modelo_actual in modelos_cascada:
        try:
            response = client.models.generate_content(
                model=modelo_actual,
                contents=data.question,
                config=genai.types.GenerateContentConfig(
                    system_instruction=instruccion_final,
                )
            )
            return {
                "response": response.text,
                "provider": modelo_actual
            }
        except Exception as e_modelo:
            print(f"⚠️ El modelo {modelo_actual} falló. Pasando al siguiente... Error: {e_modelo}")
            continue

    return {
        "response": "⚠️ Servidores ocupados o error en la generación. Revisa la consola de tu servidor.",
        "provider": "sistema-error"
    }
