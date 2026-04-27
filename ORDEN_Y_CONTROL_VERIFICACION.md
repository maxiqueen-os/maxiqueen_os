# ✅ Orden y Control: verificación de cambios en MaxiQueen OS

Esta guía responde a la pregunta: **“¿dónde verifico que todo quedó OK?”**

---

## 1) Punto de control principal (Git)

Siempre revisa estos 4 comandos, en este orden:

```bash
git status --short
git log --oneline -n 5
git diff -- README.md docs/MANUAL_MAXIQUEEN_OS.md docs/ORDEN_Y_CONTROL_VERIFICACION.md
git diff --check
```

Qué valida cada uno:
- `git status --short`: qué archivos cambiaron.
- `git log --oneline -n 5`: últimos commits (historial de control).
- `git diff -- ...`: detalle exacto de cada cambio.
- `git diff --check`: errores de formato (espacios finales, etc.).

---

## 2) Cómo mirar cambios “en vivo” mientras trabajas

Usa este mini ciclo cada vez que edites algo:

```bash
git status --short
git diff -- <archivo>
```

Ejemplo real para docs:

```bash
git diff -- README.md
git diff -- docs/ORDEN_Y_CONTROL_VERIFICACION.md
```

Cuando quieras ver cambios ya preparados para commit:

```bash
git add README.md
git diff --staged
```

Así controlas 3 niveles:
1. Cambios sin stage (`git diff`).
2. Cambios staged (`git diff --staged`).
3. Historial final (`git log --oneline`).

---

## 3) Tu comando `git apply --3way`: cuándo usarlo

El bloque que pegaste:

```bash
(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
...
EOF
)
```

Sirve para aplicar un patch de texto al repo.

Qué hace cada parte:
- `git rev-parse --show-toplevel`: te mueve a la raíz real del repo.
- `git apply --3way`: intenta aplicar el cambio incluso si el archivo ya cambió, haciendo merge de 3 vías.
- `<<'EOF' ... EOF`: inyecta el parche en línea.

Recomendación de seguridad antes de usarlo:

```bash
git status --short
git apply --check <(cat <<'EOF'
...patch...
EOF
)
```

Luego sí lo aplicas. Esto evita romper trabajo previo.

---

## 4) Punto de control documental (README + docs)

Revisa que la navegación esté limpia:
- `README.md` (portada rápida)
- `docs/MANUAL_MAXIQUEEN_OS.md` (contenido estratégico largo)
- `GUIA_VERSIONES.md` (orden técnico de versiones)

Regla de oro:
- README = visión y mapa.
- Docs = detalle operativo.

---

## 5) Punto de control visual (frontend)

Como este repo es HTML estático, valida en navegador:
1. Abrir `index.html`.
2. Confirmar que los enlaces principales funcionan.
3. Confirmar tema dark/light.
4. Confirmar que no hay errores en consola (F12).

---

## 6) Revisión de tus snippets (qué sí hacer)

## A) Snippet JS de estado/intents

✅ **Sí conviene usarlo**, pero con dos ajustes críticos:

1. Hay un bloque en `contextualResponse` con llaves desbalanceadas y retorno fuera de lugar.
2. Hay chequeos repetidos (`bloqueo` aparece en dos rutas) que pueden pisarse.

Recomendación:
- Primero estabiliza sintaxis.
- Luego separa por funciones: `handleFlujo1`, `handleFlujo2`, `handleFlujo3`.
- Mantén `state` global mínimo, como ya lo planteaste.

## B) Snippet HTTP (`register/login/me`)

✅ **Sí, úsalo tal cual** en un archivo `requests.http`.

Te permite verificar backend en secuencia:
1. `POST /users/register`
2. `POST /users/login`
3. `GET /users/me` con token

## C) Snippet Python `search_knowledge`

✅ Base correcta, con dos mejoras recomendadas:
- Manejo de errores por JSON inválido.
- Devolver coincidencia más relevante (no solo la primera).

## D) Snippet JSON de metadata

✅ Correcto para iniciar base de conocimiento.

Guárdalo, por ejemplo, en:
- `IA/knowledge_base/site_info.json`

## E) `main.py` FastAPI

⚠️ Punto crítico: ruta absoluta de Windows.

Actualmente:
```python
FRONTEND_DIR = Path("C:/MAXIQUEEN_OS/01_BRAND_PUBLIC")
```

Mejor (portable):
```python
FRONTEND_DIR = Path(__file__).resolve().parent / "static"
```

Así funciona en local, contenedor y deploy sin depender de `C:/...`.

---

## 7) Flujo sugerido “orden y control” por cada cambio

1. Cambias 1 bloque.
2. Guardas.
3. Corres `git status --short`.
4. Corres `git diff --check`.
5. Pruebas visual/API.
6. Commit pequeño con mensaje claro.

Formato sugerido de commit:
- `docs: ...`
- `feat: ...`
- `fix: ...`

---

## 8) Regla práctica para ti

Si una mejora no cumple esto, no se mergea:
- Se entiende rápido.
- Se puede verificar rápido.
- Se puede revertir rápido.

Ese es el estándar real de **orden y control**.
