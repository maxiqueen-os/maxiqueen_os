# MaxiQueen OS · AI Engine (Módulo Inicial)

Backend inicial en FastAPI para un sistema de **toma de decisiones estratégicas**.

## Objetivo
Recibir el problema del usuario y responder como estratega con:
- análisis estratégico
- recomendación
- consecuencia esperada

## Estructura del proyecto

```text
backend_fastapi/
├─ app/
│  ├─ api/
│  │  └─ v1/
│  │     ├─ endpoints/
│  │     │  └─ decision.py
│  │     └─ router.py
│  ├─ core/
│  │  └─ config.py
│  ├─ schemas/
│  │  └─ decision.py
│  ├─ services/
│  │  ├─ decision_service.py
│  │  ├─ ai/
│  │  │  ├─ base.py
│  │  │  ├─ factory.py
│  │  │  └─ openai_provider.py
│  │  └─ modules/
│  │     └─ decision_module.py
│  └─ main.py
├─ .env.example
└─ requirements.txt
```

> La carpeta `services/modules` está preparada para escalar a múltiples módulos de negocio.

## Configuración

```bash
cp .env.example .env
```

Configura tu clave en `.env`:

```env
OPENAI_API_KEY=tu_clave
```

## Ejecutar

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Endpoint principal

### `POST /decision`

Request:

```json
{
  "problem": "Tengo poco presupuesto y necesito aumentar ventas en 30 días sin contratar más personal"
}
```

Response:

```json
{
  "analysis": "...",
  "recommendation": "...",
  "consequence": "..."
}
```
