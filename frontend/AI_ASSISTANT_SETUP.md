# Configuración del Servicio de IA

## Variables de Entorno (.env)

Agrega las siguientes variables a tu archivo `.env` en el frontend:

```env
# URL del servicio de IA (Python backend)
VITE_AI_SERVICE_URL=http://localhost:8000

# O si está en producción:
# VITE_AI_SERVICE_URL=https://your-ai-service.com
```

## Configuración del Backend de IA

El servicio de IA espera los siguientes endpoints:

### 1. POST `/api/chat` - Enviar mensaje al asistente
**Request:**
```json
{
  "message": "¿Cómo puedo mejorar en matemáticas?",
  "context": {
    "userId": "user-123",
    "currentPage": "/courses/5",
    "userRole": "estudiante"
  },
  "conversation_history": [
    {"role": "user", "content": "Hola"},
    {"role": "assistant", "content": "¡Hola! ¿Cómo estás?"}
  ]
}
```

**Response:**
```json
{
  "response": "Puedo ayudarte con...",
  "message": "Puedo ayudarte con..."
}
```

### 2. POST `/api/suggestions` - Obtener sugerencias
**Request:**
```json
{
  "context": {
    "userId": "user-123",
    "currentPage": "/courses/5"
  }
}
```

**Response:**
```json
{
  "suggestions": ["Sugerencia 1", "Sugerencia 2"]
}
```

### 3. POST `/api/analyze-course` - Analizar contenido del curso
**Request:**
```json
{
  "content": {
    "title": "Introducción a Python",
    "lessons": [...]
  }
}
```

**Response:**
```json
{
  "summary": "Resumen del curso",
  "keyPoints": ["Punto 1", "Punto 2"]
}
```

### 4. POST `/api/explain` - Generar explicaciones
**Request:**
```json
{
  "topic": "Funciones en Python",
  "level": "beginner",
  "userId": "user-123"
}
```

**Response:**
```json
{
  "explanation": "Las funciones son..."
}
```

### 5. GET `/health` - Verificar disponibilidad del servicio
**Response:**
```json
{
  "status": "ok"
}
```

## Integración con Python Backend

Tu servicio de IA en Python debe:

1. **Escuchar en `http://localhost:8000`** (o el puerto configurado)
2. **Implementar CORS** para aceptar requests desde el frontend
3. **Manejar excepciones** y retornar mensajes de error claros
4. **Mantener conversaciones** usando el historial enviado
5. **Contextualizar respuestas** basadas en la página actual y rol del usuario

### Ejemplo de respuesta de error:
```json
{
  "message": "Error al procesar la solicitud",
  "error": "invalid_input"
}
```

## Hook `useAIAssistant()`

Para usar el asistente en cualquier componente:

```jsx
import { useAIAssistant } from '../context/AIAssistantContext';

function MiComponente() {
  const {
    isOpen,          // boolean - si el chat está abierto
    messages,        // array - mensajes del chat
    isLoading,       // boolean - si está esperando respuesta
    toggleAssistant, // function - abrir/cerrar
    openAssistant,   // function - abrir
    closeAssistant,  // function - cerrar
    addMessage,      // function - agregar mensaje
    clearMessages,   // function - limpiar conversación
  } = useAIAssistant();

  return (
    <button onClick={openAssistant}>
      Abrir asistente
    </button>
  );
}
```

## Funciones del servicio `aiAssistantService.js`

### `sendMessageToAI(message, context, conversationHistory)`
Envía un mensaje al asistente IA.

```jsx
import { sendMessageToAI } from '../services/aiAssistantService';

const response = await sendMessageToAI(
  '¿Cómo aprendo mejor?',
  { page: '/courses/5', role: 'estudiante' },
  conversationHistory
);
```

### `getAISuggestions(context)`
Obtiene sugerencias contextuales del IA.

```jsx
import { getAISuggestions } from '../services/aiAssistantService';

const suggestions = await getAISuggestions({
  page: '/courses/5'
});
```

### `analyzeCourseMaterial(courseContent)`
Analiza contenido de un curso.

```jsx
import { analyzeCourseMaterial } from '../services/aiAssistantService';

const analysis = await analyzeCourseMaterial(courseData);
```

### `getExplanation(topic, level)`
Genera explicaciones personalizadas.

```jsx
import { getExplanation } from '../services/aiAssistantService';

const explanation = await getExplanation('Álgebra lineal', 'intermediate');
```

### `checkAIServiceHealth()`
Verifica si el servicio está disponible.

```jsx
import { checkAIServiceHealth } from '../services/aiAssistantService';

const isHealthy = await checkAIServiceHealth();
```

## Características del componente AIAssistant

✅ Interfaz moderna y responsiva
✅ Botón flotante (FAB) en la esquina inferior derecha
✅ Chat conversacional con historial
✅ Indicador de carga mientras se procesa
✅ Manejo de errores con mensajes claros
✅ Verificación de disponibilidad del servicio
✅ Scroll automático a nuevos mensajes
✅ Timestamp en cada mensaje
✅ Soporte para Shift+Enter para líneas nuevas
✅ Deshabilitación de inputs cuando no hay servicio

## Próximos pasos

1. Implementar el servicio de IA en Python
2. Configurar las variables de entorno
3. Probar la conexión entre frontend y backend
4. Ajustar estilos según tu tema de diseño
5. Integrar análisis adicionales (sugerencias, análisis de cursos, etc.)
