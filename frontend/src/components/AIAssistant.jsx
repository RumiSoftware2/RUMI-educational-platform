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
      {/* Botón flotante - ZEUS ASSISTANT */}
      <button
        onClick={toggleAssistant}
        className={`fixed bottom-8 right-8 z-40 rounded-full transition-all duration-300 group ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        title="Asistente Zeus"
      >
        {/* Efecto de brillo de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
        
        {/* Botón principal grande */}
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-2xl hover:shadow-purple-500/50 group-hover:scale-110 transition-transform duration-300 border-2 border-white/30 hover:border-white/60">
          {/* Icono con animación */}
          <div className="flex flex-col items-center justify-center gap-1">
            <svg
              className="w-10 h-10 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-xs font-bold text-white">ZEUS</span>
          </div>
          
          {/* Anillo animado exterior */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white border-r-white opacity-70 animate-spin" style={{animationDuration: '3s'}}></div>
        </div>

        {/* Etiqueta flotante */}
        <div className="absolute -left-2 top-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg border border-purple-400 animate-pulse">
          ⚡ ASISTENTE ZEUS
        </div>
      </button>

      {/* Ventana del chat */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 z-50 w-96 h-[32rem] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border-2 border-purple-300 animate-in fade-in slide-in-from-bottom-3">
          {/* Header - ZEUS BRANDING */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white px-6 py-4 flex items-center justify-between relative overflow-hidden">
            {/* Efecto de fondo animado */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 animate-pulse"></div>
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/50 animate-bounce">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">⚡ ZEUS</h3>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full border border-white/30">IA</span>
                </div>
                <p className="text-xs text-purple-100">
                  {isServiceAvailable ? '🟢 En línea' : '🔴 Sin conexión'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleAssistant}
              className="hover:bg-white/20 rounded-lg p-2 transition-colors relative z-10"
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-lg shadow-sm ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-none border border-purple-400'
                      : 'bg-white text-gray-800 border border-purple-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.type === 'user'
                        ? 'text-purple-100'
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
          <div className="border-t-2 border-purple-200 p-4 bg-gradient-to-r from-gray-50 to-white">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isServiceAvailable
                    ? "Pregunta a Zeus ⚡..."
                    : "Servicio no disponible"
                }
                disabled={isLoading || !isServiceAvailable}
                className="flex-1 rounded-lg border-2 border-purple-300 px-4 py-2 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm font-medium"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim() || !isServiceAvailable}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg px-4 py-2 transition-all duration-200 flex items-center gap-2 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-purple-500/50 border border-purple-400"
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
