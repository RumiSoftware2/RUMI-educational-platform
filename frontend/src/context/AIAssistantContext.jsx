// frontend/src/context/AIAssistantContext.jsx
import React, { createContext, useState, useCallback } from 'react';

export const AIAssistantContext = createContext();

export function AIAssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '¡Hola! Soy tu asistente IA. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isServiceAvailable, setIsServiceAvailable] = useState(true);

  const toggleAssistant = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const openAssistant = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  const addMessage = useCallback((content, type = 'user') => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: '¡Hola! Soy tu asistente IA. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  const value = {
    isOpen,
    messages,
    isLoading,
    hasError,
    isServiceAvailable,
    toggleAssistant,
    openAssistant,
    closeAssistant,
    addMessage,
    clearMessages,
    setIsLoading,
    setHasError,
    setIsServiceAvailable,
    setMessages,
  };

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = React.useContext(AIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant must be used within AIAssistantProvider');
  }
  return context;
}
