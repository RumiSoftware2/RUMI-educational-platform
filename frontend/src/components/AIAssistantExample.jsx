// frontend/src/components/AIAssistantExample.jsx
// Este archivo es solo para referencia de cómo usar el asistente IA en tus componentes

import React from 'react';
import { useAIAssistant } from '../context/AIAssistantContext';
import { sendMessageToAI, getAISuggestions } from '../services/aiAssistantService';

/**
 * Ejemplo 1: Botón para abrir el asistente
 */
export function ExampleOpenButton() {
  const { openAssistant } = useAIAssistant();

  return (
    <button
      onClick={openAssistant}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      ¿Necesitas ayuda? 💬
    </button>
  );
}

/**
 * Ejemplo 2: Componente que muestra sugerencias del IA
 */
export function SuggestionsPanel() {
  const [suggestions, setSuggestions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const loadSuggestions = async () => {
      setLoading(true);
      try {
        const result = await getAISuggestions({
          page: window.location.pathname,
        });
        if (result?.suggestions) {
          setSuggestions(result.suggestions);
        }
      } catch (error) {
        console.error('Error loading suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, []);

  if (loading) return <div>Cargando sugerencias...</div>;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-semibold text-blue-900 mb-3">
        💡 Sugerencias del asistente IA
      </h3>
      <ul className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <p className="text-sm text-gray-700">{suggestion}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Ejemplo 3: Componente que envía un mensaje automático al asistente
 */
export function ExampleAutoMessage() {
  const { addMessage, setIsLoading, openAssistant } = useAIAssistant();

  const handleAskQuestion = async (question) => {
    openAssistant();
    addMessage(question, 'user');
    setIsLoading(true);

    try {
      const response = await sendMessageToAI(question, {
        page: window.location.pathname,
        role: localStorage.getItem('userRole'),
      });

      addMessage(response.response || response.message, 'bot');
    } catch (error) {
      addMessage('Disculpa, tuve un problema. Por favor intenta de nuevo.', 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={() =>
        handleAskQuestion(
          '¿Cuál es el mejor método de estudio para este tema?'
        )
      }
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      Pedir consejo de estudio
    </button>
  );
}

/**
 * Ejemplo 4: Mostrar el estado del chat
 */
export function ChatStatusIndicator() {
  const { isOpen, messages, isLoading, isServiceAvailable } = useAIAssistant();

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow p-4 max-w-xs">
      <div className="space-y-2 text-sm">
        <p>
          <span className="font-semibold">Estado:</span>{' '}
          {isOpen ? '✅ Abierto' : '❌ Cerrado'}
        </p>
        <p>
          <span className="font-semibold">Servicio:</span>{' '}
          {isServiceAvailable ? '🟢 En línea' : '🔴 Sin conexión'}
        </p>
        <p>
          <span className="font-semibold">Mensajes:</span> {messages.length}
        </p>
        <p>
          <span className="font-semibold">Cargando:</span>{' '}
          {isLoading ? 'Sí' : 'No'}
        </p>
      </div>
    </div>
  );
}

/**
 * Ejemplo 5: Integración en un componente de curso
 */
export function CourseWithAISupport({ course }) {
  const { openAssistant, addMessage, setIsLoading } = useAIAssistant();
  const { analyzeCourseMaterial } = require('../services/aiAssistantService');

  const handleAnalyzeCourse = async () => {
    openAssistant();
    addMessage(
      `Analiza el contenido del curso: "${course.title}"`,
      'user'
    );
    setIsLoading(true);

    try {
      const analysis = await analyzeCourseMaterial({
        title: course.title,
        description: course.description,
        lessons: course.lessons,
      });

      addMessage(
        `Aquí está mi análisis del curso:\n\n${analysis.summary}`,
        'bot'
      );
    } catch (error) {
      addMessage('Error al analizar el curso', 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{course.title}</h2>
      <p className="text-gray-600 mb-4">{course.description}</p>
      <button
        onClick={handleAnalyzeCourse}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        Analizar con IA 🤖
      </button>
    </div>
  );
}

/**
 * Ejemplo 6: Hook personalizado para integración fácil
 */
export function useAIChat() {
  const context = useAIAssistant();

  const sendQuestion = React.useCallback(
    async (question, additionalContext = {}) => {
      context.openAssistant();
      context.addMessage(question, 'user');
      context.setIsLoading(true);

      try {
        const response = await sendMessageToAI(question, {
          page: window.location.pathname,
          role: localStorage.getItem('userRole'),
          ...additionalContext,
        });

        context.addMessage(response.response || response.message, 'bot');
        return response;
      } catch (error) {
        context.addMessage(
          error.message ||
          'Ocurrió un error procesando tu pregunta',
          'bot'
        );
        throw error;
      } finally {
        context.setIsLoading(false);
      }
    },
    [context]
  );

  return {
    ...context,
    sendQuestion,
  };
}

// ============================================
// CÓMO USAR EN TUS COMPONENTES
// ============================================

/**
 * Ejemplo de uso en un componente funcional:
 * 
 * import { ExampleOpenButton } from '../components/AIAssistantExample';
 * 
 * function MiPagina() {
 *   return (
 *     <div>
 *       <h1>Mi Página</h1>
 *       <ExampleOpenButton />
 *     </div>
 *   );
 * }
 */

/**
 * Ejemplo usando el hook personalizado:
 * 
 * import { useAIChat } from '../components/AIAssistantExample';
 * 
 * function PaginaCurso() {
 *   const { sendQuestion, isLoading } = useAIChat();
 * 
 *   const handleGetHelp = async () => {
 *     await sendQuestion('¿Cómo entiendo mejor este tema?', {
 *       topic: 'Matemáticas',
 *       difficulty: 'intermediate'
 *     });
 *   };
 * 
 *   return (
 *     <button onClick={handleGetHelp} disabled={isLoading}>
 *       {isLoading ? 'Esperando respuesta...' : 'Obtener ayuda'}
 *     </button>
 *   );
 * }
 */
