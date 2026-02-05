# 🏗️ Arquitectura - Asistente IA RUMI

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                      APLICACIÓN RUMI                             │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  App.jsx (Root)                                             │ │
│  │  ├─ GoogleOAuthProvider                                     │ │
│  │  ├─ LanguageProvider                                        │ │
│  │  ├─ AIAssistantProvider ← Nuevo                             │ │
│  │  │  ├─ BrowserRouter                                        │ │
│  │  │  ├─ ScrollToTop                                          │ │
│  │  │  ├─ AppLayout                                            │ │
│  │  │  │  └─ Routes (todas las páginas)                        │ │
│  │  │  └─ AIAssistant ← Nuevo                                  │ │
│  │  └─ / (cierra todos)                                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Arquitectura del Asistente IA

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           AIAssistant Component                      │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │  Botón Flotante (FAB)                        │    │  │
│  │  │  ├─ Click abre/cierra chat                   │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │  Ventana de Chat                             │    │  │
│  │  │  ├─ Header con estado                        │    │  │
│  │  │  ├─ Área de mensajes (historial)             │    │  │
│  │  │  ├─ Input para escribir                      │    │  │
│  │  │  └─ Botón enviar                             │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      AIAssistantContext (State Management)          │  │
│  │  ├─ isOpen                                           │  │
│  │  ├─ messages[]                                       │  │
│  │  ├─ isLoading                                        │  │
│  │  ├─ isServiceAvailable                              │  │
│  │  └─ Funciones (openAssistant, addMessage, etc.)     │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    aiAssistantService.js (API Client)               │  │
│  │  ├─ sendMessageToAI()                               │  │
│  │  ├─ getAISuggestions()                              │  │
│  │  ├─ analyzeCourseMaterial()                         │  │
│  │  ├─ getExplanation()                                │  │
│  │  └─ checkAIServiceHealth()                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  HTTP REQUEST (axios)                                       │
│  POST http://localhost:8000/api/chat                        │
│  {                                                          │
│    "message": "...",                                        │
│    "context": {...},                                        │
│    "conversation_history": [...]                            │
│  }                                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         ↓↑
         ║  HTTP (CORS habilitado)
         ║
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Python - FastAPI)                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         FastAPI Application                         │  │
│  │  ├─ CORS Middleware                                 │  │
│  │  └─ Routes:                                          │  │
│  │     ├─ GET  /health                                 │  │
│  │     ├─ POST /api/chat              ← Principal      │  │
│  │     ├─ POST /api/suggestions                        │  │
│  │     ├─ POST /api/analyze-course                     │  │
│  │     └─ POST /api/explain                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Lógica de Procesamiento                      │  │
│  │  ├─ Recibir mensaje                                 │  │
│  │  ├─ Procesar contexto                               │  │
│  │  ├─ Mantener historial                              │  │
│  │  └─ Generar respuesta                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Modelo de IA (Elige uno)                     │  │
│  │  ├─ OpenAI GPT-4                                     │  │
│  │  ├─ HuggingFace Transformers                        │  │
│  │  ├─ Anthropic Claude                                │  │
│  │  ├─ LLaMA Local                                      │  │
│  │  └─ Otro modelo de tu elección                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  HTTP RESPONSE                                              │
│  200 OK                                                     │
│  {                                                          │
│    "response": "Respuesta del IA",                          │
│    "message": "Respuesta del IA"                            │
│  }                                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         ↑
         ║ Vuelve al frontend
         ║ Se agrega a contexto
         ║ Component re-renderiza
         ↓
     Usuario ve respuesta
```

## Flujo de Datos - Secuencia

```
   Usuario          AIAssistant      Context          Service        Backend
      │                 │               │                │              │
      │ Click FAB       │               │                │              │
      ├────────────────>│               │                │              │
      │                 │ openAssistant()                │              │
      │                 │────────────────────>│          │              │
      │                 │              state.isOpen=true │              │
      │                 │<──────────────────────┤        │              │
      │                 │ (se muestra chat)     │        │              │
      │                 │               │                │              │
      │ Escribe mensaje │               │                │              │
      │                 │               │                │              │
      │ Presiona enviar │               │                │              │
      ├────────────────>│               │                │              │
      │                 │ addMessage(msg, 'user')         │              │
      │                 │────────────────────>│          │              │
      │                 │              messages.push()   │              │
      │                 │<──────────────────────┤        │              │
      │                 │ (renderiza mensaje)  │        │              │
      │                 │               │                │              │
      │                 │ sendMessageToAI(msg) │        │              │
      │                 │───────────────────────────────>│              │
      │                 │               │                │ HTTP POST   │
      │                 │               │                │  /api/chat  │
      │                 │               │                ├────────────>│
      │                 │               │                │              │ Procesar
      │                 │               │                │              │ Con IA
      │                 │               │                │              │ Generar
      │                 │               │                │              │ respuesta
      │                 │               │                │              │
      │                 │               │                │<─────────────┤
      │                 │               │                │ HTTP 200 OK │
      │                 │ response.data │<───────────────┤ {response}  │
      │                 │───────────────┤                │              │
      │                 │               │                │              │
      │                 │ addMessage(response, 'bot')    │              │
      │                 │────────────────────>│          │              │
      │                 │              messages.push()   │              │
      │                 │<──────────────────────┤        │              │
      │                 │ (renderiza respuesta)│        │              │
      │                 │               │                │              │
      │ Ve respuesta    │<──────────────┤                │              │
      │<────────────────┤               │                │              │
      │                 │               │                │              │
```

## Componentes y Sus Responsabilidades

```
AIAssistant.jsx
├─ Renderizar interfaz del chat
├─ Manejar eventos del usuario
├─ Mostrar/ocultar ventana
├─ Validar inputs
└─ Mostrar errores

AIAssistantContext.jsx
├─ Mantener estado global
│  ├─ isOpen
│  ├─ messages
│  ├─ isLoading
│  └─ isServiceAvailable
├─ Proporcionar funciones
│  ├─ openAssistant/closeAssistant
│  ├─ addMessage
│  └─ clearMessages
└─ Provider para la app

aiAssistantService.js
├─ Crear cliente axios
├─ Manejar requests HTTP
├─ Procesar responses
├─ Manejar errores
└─ Funciones específicas
   ├─ sendMessageToAI()
   ├─ getAISuggestions()
   ├─ analyzeCourseMaterial()
   ├─ getExplanation()
   └─ checkAIServiceHealth()
```

## Flujo de Estado (State Management)

```
AIAssistantContext
│
├─ isOpen: false (usuario cierra)
│   └─> true (usuario abre)
│
├─ messages: []
│   └─> [{id, type: 'user', content, timestamp}, ...]
│   └─> [{id, type: 'bot', content, timestamp}, ...]
│
├─ isLoading: false
│   └─> true (esperando respuesta)
│   └─> false (respuesta recibida)
│
├─ hasError: false
│   └─> true (error en request)
│   └─> false (error resuelto)
│
└─ isServiceAvailable: true
    └─> false (servicio Python no responde)
    └─> true (servicio disponible)
```

## Ciclo de Vida del Chat

```
1. MOUNT
   ├─ Componente AIAssistant se renderiza
   ├─ Context proporciona estado inicial
   └─ Service listo para requests

2. IDLE
   ├─ Chat cerrado
   ├─ Botón FAB visible
   └─ Esperando interacción del usuario

3. OPEN
   ├─ Usuario hace click en FAB
   ├─ Chat se abre
   └─ Foco en input de texto

4. MESSAGE SENT
   ├─ Usuario escribe y envía
   ├─ addMessage() guarda en contexto
   ├─ Component re-renderiza
   └─ Service envía HTTP request

5. WAITING
   ├─ isLoading = true
   ├─ Input deshabilitado
   ├─ Mostrar "escribiendo..."
   └─ Spinner animado

6. RESPONSE RECEIVED
   ├─ Backend responde
   ├─ addMessage() agrega respuesta
   ├─ isLoading = false
   ├─ Component re-renderiza
   └─ Auto-scroll a mensaje nuevo

7. ERROR
   ├─ Si falla request
   ├─ Mostrar mensaje de error
   ├─ isLoading = false
   └─ Usuario puede reintentar

8. CLOSE
   ├─ Usuario cierra chat
   ├─ Chat minimiza
   ├─ Botón FAB visible
   └─ Mensajes permanecen en contexto
```

## Datos Fluyendo

```
USUARIO ESCRIBE
│
└─> { message: "¿Cómo aprendo mejor?" }
    │
    ├─> AIAssistant.jsx captura evento
    ├─> Valida que no esté vacío
    ├─> addMessage() al contexto
    │   └─> messages = [...messages, {type:'user', content:'...'}]
    │
    └─> sendMessageToAI()
        │
        └─> HTTP POST /api/chat
            {
              "message": "¿Cómo aprendo mejor?",
              "context": {
                "userId": "user-123",
                "currentPage": "/courses/5",
                "userRole": "estudiante"
              },
              "conversation_history": [
                {"role": "user", "content": "..."},
                {"role": "assistant", "content": "..."}
              ]
            }
            │
            └─> Backend procesa
                │
                ├─> Recibe mensaje y contexto
                ├─> Accede al modelo de IA
                ├─> Genera respuesta personalizada
                └─> Retorna:
                    {
                      "response": "Para aprender mejor...",
                      "message": "Para aprender mejor..."
                    }
                    │
                    └─> Frontend recibe
                        │
                        └─> addMessage() respuesta
                            └─> messages = [...messages, {type:'bot', content:'...'}]
                               │
                               └─> Component re-renderiza
                                   │
                                   └─> Usuario ve respuesta
```

## Variables de Entorno

```
Frontend (.env)
│
├─ VITE_API_URL=http://localhost:5000
│  └─ Para endpoints de la app
│
└─ VITE_AI_SERVICE_URL=http://localhost:8000  ← Nuevo
   └─ Para servicio de IA

Backend Python (.env)
│
├─ AI_MODEL=gpt-4  (o tu modelo)
├─ AI_API_KEY=xxxxx
├─ CORS_ORIGINS=http://localhost:5173
├─ LOG_LEVEL=INFO
└─ DATABASE_URL=postgresql://...  (opcional)
```

## Integración de Otros Componentes

```
Cualquier Página/Componente
│
├─ import { useAIAssistant } from '../context/AIAssistantContext'
│
└─ const { openAssistant, sendQuestion } = useAIAssistant()
   │
   └─ <button onClick={openAssistant}>
        Necesito ayuda
      </button>
```

---

**Creado:** Febrero 5, 2026  
**Tipo:** Documento de Arquitectura  
**Estado:** Completo
