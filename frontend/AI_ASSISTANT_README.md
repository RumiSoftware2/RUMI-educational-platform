# 🤖 Asistente IA - RUMI

## Descripción General

Se ha integrado un **Asistente IA completo** en el frontend de RUMI. Este es un componente flotante que aparece en todas las páginas de la aplicación y permite a los estudiantes interactuar con un asistente inteligente para recibir ayuda educativa.

## 📦 Archivos Creados

### Frontend (React)

1. **`src/components/AIAssistant.jsx`** - Componente principal
   - Interfaz de chat conversacional
   - Botón flotante (FAB)
   - Manejo de estado y errores
   - Indicadores de carga

2. **`src/context/AIAssistantContext.jsx`** - Context API
   - Gestión de estado global del asistente
   - Hook personalizado `useAIAssistant()`
   - Provider para envoltura de la aplicación

3. **`src/services/aiAssistantService.js`** - Cliente de API
   - Funciones para comunicarse con el backend Python
   - `sendMessageToAI()` - Enviar mensajes
   - `getAISuggestions()` - Obtener sugerencias
   - `analyzeCourseMaterial()` - Analizar cursos
   - `getExplanation()` - Generar explicaciones
   - `checkAIServiceHealth()` - Verificar disponibilidad

4. **`src/components/AIAssistantExample.jsx`** - Ejemplos de uso
   - Componentes de ejemplo
   - Hook personalizado `useAIChat()`
   - Patrones de integración

## 🔧 Configuración

### Variables de Entorno

Agrega a tu archivo `.env`:

```env
# URL del servicio de IA en Python
VITE_AI_SERVICE_URL=http://localhost:8000

# Para producción:
# VITE_AI_SERVICE_URL=https://tu-servicio-ia.com
```

### Actualización de App.jsx

El archivo `App.jsx` ya ha sido actualizado con:

```jsx
import { AIAssistantProvider } from './context/AIAssistantContext';
import AIAssistant from './components/AIAssistant';

// En el JSX:
<GoogleOAuthProvider>
  <LanguageProvider>
    <AIAssistantProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppLayout>
          <Routes>{/* ... */}</Routes>
        </AppLayout>
        <AIAssistant /> {/* ← Componente flotante */}
      </BrowserRouter>
    </AIAssistantProvider>
  </LanguageProvider>
</GoogleOAuthProvider>
```

## 🎨 Características

✅ **Interfaz moderna y responsiva**
- Diseño limpio con Tailwind CSS
- Botón flotante en esquina inferior derecha
- Animaciones suaves

✅ **Chat conversacional**
- Historial de mensajes
- Timestamps en cada mensaje
- Indicador de "escribiendo"

✅ **Gestión de errores**
- Detección de servicio no disponible
- Mensajes de error claros
- Recuperación de fallos

✅ **Optimización de UX**
- Scroll automático a mensajes nuevos
- Deshabilitación de inputs cuando necesario
- Soporte para Shift+Enter

## 📡 Integración con Backend Python

El servicio de IA en Python debe implementar estos endpoints:

### 1. POST `/api/chat`
Endpoint principal para enviar mensajes

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
    {"role": "assistant", "content": "¡Hola!"}
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

### 2. POST `/api/suggestions`
Obtiene sugerencias contextuales

### 3. POST `/api/analyze-course`
Analiza contenido de cursos

### 4. POST `/api/explain`
Genera explicaciones personalizadas

### 5. GET `/health`
Verificar disponibilidad del servicio

Ver archivo `PYTHON_AI_SERVICE_EXAMPLE.py` para ejemplo completo.

## 🚀 Uso en Componentes

### Hook useAIAssistant()

```jsx
import { useAIAssistant } from '../context/AIAssistantContext';

function MiComponente() {
  const {
    isOpen,           // ¿Está abierto el chat?
    messages,         // Array de mensajes
    isLoading,        // ¿Esperando respuesta?
    openAssistant,    // Abrir chat
    closeAssistant,   // Cerrar chat
    addMessage,       // Agregar mensaje
  } = useAIAssistant();

  return (
    <button onClick={openAssistant}>
      Necesito ayuda
    </button>
  );
}
```

### Enviar mensajes programáticamente

```jsx
import { sendMessageToAI } from '../services/aiAssistantService';
import { useAIAssistant } from '../context/AIAssistantContext';

function ComponenteCurso() {
  const { openAssistant, addMessage } = useAIAssistant();

  const handlePedirAyuda = async () => {
    openAssistant();
    addMessage('¿Cómo entiendo mejor este tema?', 'user');
    
    const response = await sendMessageToAI(
      '¿Cómo entiendo mejor este tema?',
      { page: '/courses/5' }
    );
    
    addMessage(response.response, 'bot');
  };

  return <button onClick={handlePedirAyuda}>Pedir ayuda</button>;
}
```

### Hook personalizado useAIChat()

```jsx
import { useAIChat } from '../components/AIAssistantExample';

function MiPagina() {
  const { sendQuestion, isLoading } = useAIChat();

  return (
    <button
      onClick={() => sendQuestion('¿Cuál es el tema?')}
      disabled={isLoading}
    >
      Preguntar
    </button>
  );
}
```

## 📊 Estructura del Contexto

```
AIAssistantContext
├── isOpen: boolean
├── messages: Message[]
├── isLoading: boolean
├── hasError: boolean
├── isServiceAvailable: boolean
├── toggleAssistant(): void
├── openAssistant(): void
├── closeAssistant(): void
├── addMessage(content, type): void
├── clearMessages(): void
├── setIsLoading(): void
└── setHasError(): void
```

## 🎯 Próximos Pasos

1. **Implementar el servicio de IA en Python**
   - Crear endpoints según especificación
   - Integrar modelo de IA (OpenAI, HuggingFace, etc.)
   - Implementar contexto y memoria de conversación

2. **Configurar variables de entorno**
   - VITE_AI_SERVICE_URL
   - API keys si es necesario

3. **Probar la conexión**
   - Verificar CORS
   - Probar endpoints
   - Validar flujo de mensajes

4. **Personalizar la interfaz**
   - Ajustar colores según branding
   - Modificar mensajes iniciales
   - Agregar más características

5. **Integrar con datos de usuario**
   - Enviar información del curso
   - Contexto académico
   - Historial de interacciones

## 🐛 Troubleshooting

### El botón del asistente no aparece
- Verifica que `<AIAssistant />` está en App.jsx
- Verifica que `<AIAssistantProvider>` envuelve la app

### El chat no envía mensajes
- Revisa la consola para errores
- Verifica VITE_AI_SERVICE_URL
- Asegúrate que el servicio Python está ejecutándose

### Servicio no disponible
- Verifica que el backend Python está en línea
- Revisa configuración de CORS
- Prueba el endpoint `/health`

## 📚 Recursos Adicionales

- `AI_ASSISTANT_SETUP.md` - Guía de configuración detallada
- `PYTHON_AI_SERVICE_EXAMPLE.py` - Ejemplo de backend Python
- `AIAssistantExample.jsx` - Ejemplos de uso en componentes

## 💡 Tips

- El asistente se puede usar en **cualquier página** del proyecto
- Los mensajes se guardan en el contexto (no persisten en actualización)
- El servicio verifica disponibilidad automáticamente
- La interfaz es **completamente accesible** y responsiva

## 🔐 Notas de Seguridad

- El token del usuario se envía en el header Authorization
- El contexto incluye userRole para personalización
- Asegúrate de validar en backend
- Implementa rate limiting en el servicio Python

---

**Creado:** Febrero 2026  
**Versión:** 1.0  
**Estado:** Listo para integración con servicio Python
