# ⚡ INICIO RÁPIDO (5 MINUTOS)

## Lo que pasó ✅

Se creó un **asistente IA completo** en el frontend. Cuando hagas click en el botón flotante en la esquina inferior derecha, se abre un chat donde los usuarios pueden hablar con un asistente inteligente.

## Lo que necesitas hacer ⏳

Crear un servicio Python que responda a los mensajes.

## Paso 1: Setup Python (5 minutos)

```bash
# Abre terminal en la carpeta del proyecto
cd RUMI

# Crear carpeta para el servicio
mkdir ai-service
cd ai-service

# Crear entorno virtual
python -m venv venv

# Activar
# En Windows:
venv\Scripts\activate
# En Mac/Linux:
source venv/bin/activate

# Instalar dependencias
pip install fastapi uvicorn pydantic
```

## Paso 2: Crear archivo `ai_service.py` (10 líneas mínimo)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Permitir requests desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Verificar que el servicio está activo
@app.get("/health")
async def health():
    return {"status": "ok"}

# Endpoint principal - aquí recibes los mensajes
@app.post("/api/chat")
async def chat(request: dict):
    message = request.get("message", "")
    
    # Aquí va tu lógica de IA
    # Por ahora, solo devuelve el mensaje
    response = f"Recibí tu mensaje: {message}"
    
    return {"response": response, "message": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Paso 3: Ejecutar (2 minutos)

```bash
# Terminal 1: Ejecutar frontend
cd ../frontend
npm run dev
# Verás: http://localhost:5173

# Terminal 2: Ejecutar backend Python
cd ../ai-service
python ai_service.py
# Verás: Uvicorn running on http://0.0.0.0:8000
```

## Paso 4: Probar (2 minutos)

1. Abre http://localhost:5173
2. Busca el botón azul 💬 en la esquina inferior derecha
3. Haz click
4. Escribe: "Hola"
5. Presiona Enter
6. ¡Deberías ver la respuesta!

## ¿Funciona? ✅

Si ves tu respuesta en el chat → ¡Perfecto! 🎉

El frontend está conectado con el backend.

## Próximos pasos

### Para respuestas inteligentes

Necesitas un modelo de IA. Elige uno:

**Opción 1: OpenAI (Mejor calidad, costo $)**
```bash
pip install openai
```
```python
import openai
openai.api_key = "tu-api-key-aqui"

@app.post("/api/chat")
async def chat(request: dict):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Eres un tutor educativo"},
            {"role": "user", "content": request["message"]}
        ]
    )
    return {"response": response["choices"][0]["message"]["content"]}
```

**Opción 2: HuggingFace (Gratuito, local)**
```bash
pip install transformers torch
```
```python
from transformers import pipeline

generator = pipeline("text-generation", model="gpt2")

@app.post("/api/chat")
async def chat(request: dict):
    result = generator(request["message"], max_length=100)
    return {"response": result[0]["generated_text"]}
```

**Opción 3: Google Gemini (Alternativa)**
```bash
pip install google-generativeai
```

## Archivos importantes

```
📁 frontend/
  ├─ src/components/AIAssistant.jsx        (componente principal)
  ├─ src/context/AIAssistantContext.jsx    (estado global)
  └─ src/services/aiAssistantService.js    (cliente HTTP)

📄 RUMI/
  ├─ ASISTENTE_IA_RESUMEN_VISUAL.md        (explicación visual)
  ├─ QUICK_START_AI_ASSISTANT.md           (guía detallada)
  ├─ PYTHON_AI_SERVICE_EXAMPLE.py          (código ejemplo)
  └─ INDICE_ASISTENTE_IA.md                (índice de documentos)
```

## Variables de entorno

Crear `frontend/.env`:
```env
VITE_AI_SERVICE_URL=http://localhost:8000
```

## Troubleshooting en 30 segundos

**P: ¿Botón no aparece?**
R: Abre DevTools (F12) → Console → ¿Errores? Revisa que App.jsx está actualizado

**P: ¿Servicio no disponible?**
R: Verifica que Python está corriendo: `python ai_service.py`

**P: ¿CORS error?**
R: Copia el código de CORS arriba (CORSMiddleware)

**P: ¿Respuestas lentas?**
R: Usa HuggingFace (local) en vez de OpenAI (depende internet)

## ¿Más ayuda?

- Documentación completa: `INDICE_ASISTENTE_IA.md`
- Código ejemplo: `PYTHON_AI_SERVICE_EXAMPLE.py`
- Checklist: `CHECKLIST_ASISTENTE_IA.md`

---

**¡Eso es todo! Ahora tienes un asistente IA funcional en 20 minutos. 🚀**
