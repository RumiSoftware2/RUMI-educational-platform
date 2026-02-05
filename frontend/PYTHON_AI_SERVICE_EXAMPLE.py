"""
===========================================
EJEMPLO DE SERVICIO DE IA EN PYTHON
===========================================

Este es un ejemplo básico de cómo estructurar tu servicio de IA
que se comunicará con el frontend React.

Requisitos:
- pip install fastapi uvicorn pydantic python-multipart

Para ejecutar:
python ai_service.py
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="RUMI IA Service")

# Configurar CORS para el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Agrega tu URL de producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# MODELOS DE DATOS
# ==========================================

class Message(BaseModel):
    role: str  # "user" o "assistant"
    content: str

class ChatContext(BaseModel):
    userId: Optional[str] = None
    currentPage: Optional[str] = None
    userRole: Optional[str] = None
    topic: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    context: ChatContext
    conversation_history: List[Message] = []

class SuggestionsRequest(BaseModel):
    context: ChatContext

class AnalyzeRequest(BaseModel):
    content: dict

class ExplainRequest(BaseModel):
    topic: str
    level: str = "intermediate"
    userId: Optional[str] = None

# ==========================================
# RUTAS
# ==========================================

@app.get("/health")
async def health_check():
    """Verificar si el servicio está disponible"""
    return {"status": "ok", "service": "RUMI IA Assistant"}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Endpoint principal para chatear con el asistente IA
    
    Recibe:
    - message: pregunta del usuario
    - context: contexto (página, rol, user id)
    - conversation_history: historial de mensajes
    
    Retorna:
    - response: respuesta del asistente
    """
    try:
        # Tu lógica de IA aquí
        response = generate_response(
            message=request.message,
            context=request.context,
            history=request.conversation_history
        )
        
        return {
            "response": response,
            "message": response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/suggestions")
async def get_suggestions(request: SuggestionsRequest):
    """
    Obtener sugerencias contextuales basadas en la página actual
    """
    try:
        suggestions = generate_suggestions(
            page=request.context.currentPage,
            role=request.context.userRole
        )
        
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-course")
async def analyze_course(request: AnalyzeRequest):
    """
    Analizar contenido de un curso y generar resumen
    """
    try:
        analysis = analyze_course_content(request.content)
        
        return {
            "summary": analysis["summary"],
            "keyPoints": analysis.get("key_points", []),
            "recommendations": analysis.get("recommendations", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/explain")
async def explain_topic(request: ExplainRequest):
    """
    Generar explicaciones personalizadas para un tema
    """
    try:
        explanation = generate_explanation(
            topic=request.topic,
            level=request.level
        )
        
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# FUNCIONES DE LÓGICA
# ==========================================

def generate_response(message: str, context: ChatContext, history: List[Message]) -> str:
    """
    Generar respuesta usando tu modelo de IA
    
    Aquí puedes:
    - Usar OpenAI API
    - Usar HuggingFace
    - Usar un modelo local (LLaMA, etc.)
    - Usar tu propio modelo entrenado
    """
    
    # Ejemplo básico (reemplaza con tu lógica real)
    context_str = f"Usuario: {context.userId}, Página: {context.currentPage}, Rol: {context.userRole}"
    
    # TODO: Implementar tu lógica de IA aquí
    # Ejemplo con OpenAI:
    # import openai
    # response = openai.ChatCompletion.create(
    #     model="gpt-4",
    #     messages=[
    #         {"role": m.role, "content": m.content} for m in history
    #     ] + [{"role": "user", "content": message}],
    #     system_prompt=f"Eres un asistente educativo. {context_str}"
    # )
    # return response.choices[0].message.content
    
    return f"Respuesta a: {message}. Contexto: {context_str}"

def generate_suggestions(page: str, role: str) -> List[str]:
    """
    Generar sugerencias basadas en la página actual
    """
    suggestions_map = {
        "/courses": [
            "Explora los cursos recomendados para tu nivel",
            "Prueba los juegos educativos para aprender jugando",
            "Revisa tu progreso en los cursos actuales"
        ],
        "/my-courses": [
            "Continúa con el siguiente tema del curso",
            "Completa los quizzes pendientes",
            "Revisa tu desempeño general"
        ],
        "/games": [
            "Juega Blackjack para practicar matemáticas",
            "Resuelve Sudoku para entrenar tu lógica",
            "Compite con otros estudiantes"
        ]
    }
    
    return suggestions_map.get(page, ["¿Cómo puedo ayudarte hoy?"])

def analyze_course_content(content: dict) -> dict:
    """
    Analizar el contenido de un curso
    """
    # TODO: Implementar análisis real
    return {
        "summary": "Este es un resumen del curso...",
        "key_points": [
            "Punto 1",
            "Punto 2",
            "Punto 3"
        ],
        "recommendations": [
            "Recomendación 1",
            "Recomendación 2"
        ]
    }

def generate_explanation(topic: str, level: str) -> str:
    """
    Generar explicación personalizada para un tema
    """
    # TODO: Implementar generación de explicaciones
    level_text = {
        "beginner": "para principiantes",
        "intermediate": "en nivel intermedio",
        "advanced": "en nivel avanzado"
    }.get(level, "")
    
    return f"Explicación de {topic} {level_text}..."

# ==========================================
# EJECUTAR SERVIDOR
# ==========================================

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True  # Desactiva en producción
    )

"""
===========================================
NOTAS IMPORTANTES
===========================================

1. CORS: Asegúrate de permitir tu dominio de frontend

2. AUTENTICACIÓN: Considera agregar autenticación JWT:
   from fastapi_jwt_extended import JWTManager
   
3. CACHING: Cachea respuestas comunes:
   from functools import lru_cache
   
4. LOGGING: Agrega logging para debugging:
   import logging
   logger = logging.getLogger(__name__)
   
5. VALIDACIÓN: Valida inputs robustamente

6. RATE LIMITING: Protege tu API:
   from slowapi import Limiter
   
7. MODELOS DE IA: Opciones recomendadas:
   - OpenAI API (GPT-4)
   - HuggingFace (transformers)
   - LLaMA local
   - Claude API
   - Gemini API

8. BASE DE DATOS: Guarda conversaciones:
   from sqlalchemy import create_engine
   
9. TESTING: Prueba tus endpoints:
   pytest
   
10. DEPLOYMENT: Usa:
    - Docker
    - Railway
    - Render
    - Vercel (serverless)
    - AWS Lambda
"""
