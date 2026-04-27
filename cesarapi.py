# archivo: cesarapi.py
from fastapi import FastAPI
import uvicorn

# Aquí defines tu API con tu nombre
app = FastAPI(title="CesarAPI", description="Servidor propio de Cesar", version="1.0")

# Ruta de ejemplo
@app.get("/")
def home():
    return {"mensaje": "Bienvenido a CesarAPI 🚀"}

@app.get("/saludo/{nombre}")
def saludo(nombre: str):
    return {"mensaje": f"Hola {nombre}, estás conectado a CesarAPI"}

# Punto de entrada
if __name__ == "__main__":
    uvicorn.run("cesarapi:app", host="0.0.0.0", port=8000, reload=True)