// frontend/src/components/AIAssistant.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAIAssistant } from '../context/AIAssistantContext';
import { sendMessageToAI, checkAIServiceHealth } from '../services/aiAssistantService';

export default function AIAssistant() {
  const {
    isOpen,
    messages,
    isLoading,
    hasError,
    isServiceAvailable,
    toggleAssistant,
    addMessage,
    setIsLoading,
    setHasError,
    setIsServiceAvailable,
  } = useAIAssistant();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Desplazarse al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Verificar disponibilidad del servicio
  useEffect(() => {
    const checkService = async () => {
      try {
        const isHealthy = await checkAIServiceHealth();
        setIsServiceAvailable(isHealthy);
      } catch (error) {
        console.warn('AI service not available:', error);
        setIsServiceAvailable(false);
      }
    };

    if (isOpen) {
      checkService();
    }
  }, [isOpen, setIsServiceAvailable]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading || !isServiceAvailable) {
      return;
    }

    // Agregar mensaje del usuario
    addMessage(inputValue, 'user');
    setInputValue('');
    setIsLoading(true);
    setHasError(false);

    try {
      // Preparar historial para contexto
      const conversationHistory = messages.map((msg) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      // Obtener contexto de la página actual
      const pageContext = {
        page: window.location.pathname,
        role: localStorage.getItem('userRole') || 'user',
      };

      // Enviar mensaje al servicio de IA
      const response = await sendMessageToAI(
        inputValue,
        pageContext,
        conversationHistory
      );

      // Agregar respuesta del bot
      addMessage(response.response || response.message, 'bot');
    } catch (error) {
      console.error('Error:', error);
      setHasError(true);
      addMessage(
        error.message ||
        'Disculpa, tuve un problema procesando tu mensaje. Por favor, intenta de nuevo.',
        'bot'
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={toggleAssistant}
        className={`fixed bottom-6 right-6 z-40 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } ${isServiceAvailable ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'}`}
        title="Asistente IA"
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow">
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5a4 4 0 100-8 4 4 0 000 8z"
            />
          </svg>
        </div>
      </button>

      {/* Ventana del chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[32rem] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-in fade-in slide-in-from-bottom-3">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Asistente IA</h3>
                <p className="text-xs text-blue-100">
                  {isServiceAvailable ? 'En línea' : 'Sin conexión'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleAssistant}
              className="hover:bg-white/10 rounded-lg p-2 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.type === 'user'
                        ? 'text-blue-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 rounded-lg rounded-bl-none px-4 py-2">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {hasError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                <p className="font-semibold">Error en la conexión</p>
                <p>Por favor, intenta de nuevo más tarde</p>
              </div>
            )}

            {!isServiceAvailable && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-700 text-sm">
                <p className="font-semibold">Servicio no disponible</p>
                <p>El asistente IA no está disponible en este momento</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isServiceAvailable
                    ? "Escribe tu pregunta..."
                    : "Servicio no disponible"
                }
                disabled={isLoading || !isServiceAvailable}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim() || !isServiceAvailable}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg px-4 py-2 transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
