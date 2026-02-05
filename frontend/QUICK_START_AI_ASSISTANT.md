# 🚀 Guía Rápida - Asistente IA RUMI

## ⚡ Inicio Rápido

### 1. Configurar Frontend (React)

Ya está hecho ✅ - Los siguientes archivos fueron creados:

```
frontend/
├── src/
│   ├── components/
│   │   ├── AIAssistant.jsx           ← Componente principal
│   │   └── AIAssistantExample.jsx    ← Ejemplos de uso
│   ├── context/
│   │   └── AIAssistantContext.jsx    ← Gestión de estado
│   └── services/
│       └── aiAssistantService.js     ← Cliente de API
└── App.jsx                           ← Ya actualizado ✅
```

### 2. Configurar Variables de Entorno

Crea/edita `.env` en `frontend/`:

```env
VITE_API_URL=http://localhost:5000
VITE_AI_SERVICE_URL=http://localhost:8000
```

### 3. Crear Servicio de IA en Python

#### Opción A: FastAPI (Recomendado)

```bash
# Crear carpeta para el servicio
mkdir ai-service
cd ai-service

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install fastapi uvicorn pydantic python-multipart
pip install openai  # Si usas OpenAI

# Copiar el archivo de ejemplo
cp ../frontend/PYTHON_AI_SERVICE_EXAMPLE.py ai_service.py

# Ejecutar
python ai_service.py
```

El servicio estará en: `http://localhost:8000`

#### Opción B: Flask

```python
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return {"status": "ok"}

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    # Tu lógica aquí
    return {"response": "Respuesta del IA"}

if __name__ == '__main__':
    app.run(debug=True, port=8000)
```

### 4. Implementar Endpoints Python

Tu servicio debe responder a:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Verificar disponibilidad |
| POST | `/api/chat` | Enviar mensajes |
| POST | `/api/suggestions` | Obtener sugerencias |
| POST | `/api/analyze-course` | Analizar cursos |
| POST | `/api/explain` | Generar explicaciones |

### 5. Probar la Integración

```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Backend Python
cd ai-service
python ai_service.py
```

Abre: `http://localhost:5173`

El botón flotante del asistente debe aparecer en esquina inferior derecha 💬

## 🔄 Flujo de Datos

```
Usuario escribe mensaje
        ↓
AIAssistant.jsx captura el evento
        ↓
addMessage() agrega el mensaje a contexto
        ↓
sendMessageToAI() envía a Python
        ↓
Backend Python procesa y responde
        ↓
La respuesta se agrega al contexto
        ↓
Component re-renderiza con nueva respuesta
```

## 💻 Ejemplos de Uso en Componentes

### Ejemplo 1: Botón para Abrir Asistente

```jsx
import { useAIAssistant } from '../context/AIAssistantContext';

export default function MiComponente() {
  const { openAssistant } = useAIAssistant();
  
  return (
    <button onClick={openAssistant}>
      Preguntar al asistente
    </button>
  );
}
```

### Ejemplo 2: Enviar Pregunta Automática

```jsx
import { useAIChat } from '../components/AIAssistantExample';

export default function ComponenteCurso() {
  const { sendQuestion, isLoading } = useAIChat();
  
  return (
    <button 
      onClick={() => sendQuestion('¿Cuál es el siguiente tema?')}
      disabled={isLoading}
    >
      {isLoading ? 'Esperando...' : 'Obtener tema siguiente'}
    </button>
  );
}
```

### Ejemplo 3: Ver Estado del Chat

```jsx
import { useAIAssistant } from '../context/AIAssistantContext';

export default function StatusIndicator() {
  const { isOpen, messages, isServiceAvailable } = useAIAssistant();
  
  return (
    <div>
      <p>Chat abierto: {isOpen ? 'Sí' : 'No'}</p>
      <p>Mensajes: {messages.length}</p>
      <p>Servicio: {isServiceAvailable ? '🟢' : '🔴'}</p>
    </div>
  );
}
```

## 🤖 Opciones para el Modelo de IA

### 1. OpenAI GPT-4 (Mejor calidad)

```python
import openai

openai.api_key = "tu-api-key"

response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "Eres un tutor educativo"},
        {"role": "user", "content": message}
    ]
)
```

### 2. HuggingFace Transformers (Gratuito, Local)

```python
from transformers import pipeline

generator = pipeline("text-generation", 
                     model="gpt2")

response = generator(message, max_length=100)
```

### 3. LLaMA Local (Mejor privacidad)

```python
from llama_cpp import Llama

llm = Llama(model_path="./models/llama-7b.gguf")
response = llm(message)
```

### 4. Anthropic Claude

```python
import anthropic

client = anthropic.Anthropic(api_key="tu-api-key")

message = client.messages.create(
    model="claude-3-opus-20240229",
    messages=[{"role": "user", "content": message}]
)
```

## 📋 Checklist de Implementación

- [ ] Frontend deployado y funcionando
- [ ] Variables de entorno configuradas
- [ ] Servicio Python creado
- [ ] Endpoint `/health` implementado
- [ ] Endpoint `/api/chat` implementado
- [ ] CORS configurado correctamente
- [ ] Modelo de IA seleccionado e integrado
- [ ] Pruebas de comunicación exitosas
- [ ] Manejo de errores implementado
- [ ] Contexto académico agregado
- [ ] Rate limiting implementado (opcional)
- [ ] Base de datos de conversaciones (opcional)

## 🔍 Debugging

### Ver errores en frontend
```javascript
// En la consola del navegador
console.log('Mensajes:', localStorage)
```

### Ver errores en Python
```python
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
logger.debug("Información de debug")
```

### Probar endpoint manualmente

```bash
# Terminal
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hola",
    "context": {"userId": "test"},
    "conversation_history": []
  }'
```

## 🎨 Personalización

### Cambiar colores del asistente

En `AIAssistant.jsx`, busca las clases Tailwind:
```jsx
bg-blue-600  // Cambiar a tu color primario
from-blue-500 to-blue-600  // Gradient
```

### Cambiar mensaje inicial

En `AIAssistantContext.jsx`:
```jsx
const [messages, setMessages] = useState([
  {
    id: 1,
    type: 'bot',
    content: '¡Hola! Soy tu asistente. ¿En qué te puedo ayudar?', // ← Aquí
    timestamp: new Date(),
  },
]);
```

## 📱 Responsive

El componente es completamente responsive:
- En móvil: Se adapta al ancho de pantalla
- En tablet: Botón flotante visible
- En desktop: Tamaño óptimo para productividad

## 🔐 Seguridad

Consideraciones importantes:

1. **Validar inputs en backend**
   ```python
   if len(message) > 5000:
       raise ValueError("Mensaje muy largo")
   ```

2. **Rate limiting**
   ```python
   from slowapi import Limiter
   limiter = Limiter(key_func=get_remote_address)
   ```

3. **Autenticación**
   ```python
   from fastapi_jwt_extended import JWTBearer
   security = JWTBearer()
   ```

4. **Sanitización**
   ```python
   from bleach import clean
   message = clean(message)
   ```

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs del backend Python
2. Abre DevTools en el navegador (F12)
3. Verifica que `VITE_AI_SERVICE_URL` está correcto
4. Asegúrate que ambos servicios están corriendo
5. Prueba el endpoint `/health` directamente

## 📚 Próximos Pasos Avanzados

- [ ] Agregar análisis de sentimientos
- [ ] Guardar conversaciones en BD
- [ ] Generar resúmenes automáticos
- [ ] Crear recomendaciones personalizadas
- [ ] Implementar búsqueda semántica
- [ ] Agregar transcripción de voz
- [ ] Multi-idiomas
- [ ] Integración con webhooks

---

**Última actualización:** Febrero 2026  
**Estado:** Listo para implementación ✅
