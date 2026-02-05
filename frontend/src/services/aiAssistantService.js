// frontend/src/services/aiAssistantService.js
import axios from 'axios';

// URL del servicio de IA en Python
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

const aiService = axios.create({
  baseURL: AI_SERVICE_URL,
});

/**
 * Enviar mensaje al asistente IA
 * @param {string} message - Mensaje del usuario
 * @param {string} context - Contexto (página actual, datos del usuario, etc.)
 * @param {array} conversationHistory - Historial de conversación para contexto
 * @returns {Promise<Object>} Respuesta del asistente IA
 */
export const sendMessageToAI = async (message, context = {}, conversationHistory = []) => {
  try {
    const response = await aiService.post('/api/chat', {
      message,
      context: {
        userId: localStorage.getItem('userId'),
        currentPage: context.page || 'unknown',
        userRole: context.role || 'user',
        ...context,
      },
      conversation_history: conversationHistory,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message to AI service:', error);
    throw new Error(
      error.response?.data?.message ||
      'Error al conectar con el asistente IA. Por favor, intenta de nuevo.'
    );
  }
};

/**
 * Obtener sugerencias de IA basadas en el contexto
 * @param {Object} context - Contexto de la página
 * @returns {Promise<Object>} Sugerencias del asistente
 */
export const getAISuggestions = async (context = {}) => {
  try {
    const response = await aiService.post('/api/suggestions', {
      context: {
        userId: localStorage.getItem('userId'),
        currentPage: context.page || 'unknown',
        ...context,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return null;
  }
};

/**
 * Analizar contenido de curso y generar resumen
 * @param {Object} courseContent - Contenido del curso
 * @returns {Promise<Object>} Resumen y análisis
 */
export const analyzeCourseMaterial = async (courseContent) => {
  try {
    const response = await aiService.post('/api/analyze-course', {
      content: courseContent,
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing course material:', error);
    throw new Error('Error al analizar el contenido del curso');
  }
};

/**
 * Generar explicaciones personalizadas
 * @param {string} topic - Tema a explicar
 * @param {string} level - Nivel de comprensión (beginner, intermediate, advanced)
 * @returns {Promise<Object>} Explicación personalizada
 */
export const getExplanation = async (topic, level = 'intermediate') => {
  try {
    const response = await aiService.post('/api/explain', {
      topic,
      level,
      userId: localStorage.getItem('userId'),
    });
    return response.data;
  } catch (error) {
    console.error('Error getting explanation:', error);
    throw new Error('Error al generar explicación');
  }
};

/**
 * Verificar disponibilidad del servicio de IA
 * @returns {Promise<boolean>}
 */
export const checkAIServiceHealth = async () => {
  try {
    const response = await aiService.get('/health');
    return response.status === 200;
  } catch (error) {
    console.warn('AI service health check failed:', error);
    return false;
  }
};

export default aiService;
