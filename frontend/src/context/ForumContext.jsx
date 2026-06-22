// frontend/src/context/ForumContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react';
import useForumWebSocket from '../hooks/useForumWebSocket';
import api from '../services/api';
import questionsBank from '../data/questionsBank';
import { AuthContext } from './AuthContext';

const ForumContext = createContext(null);
const STORAGE_KEY = 'rumi_forum_messages_v1';

export function ForumProvider({ children }) {
  const { user } = useContext(AuthContext) || {};
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [connectedCount, setConnectedCount] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const typingRef = useRef({});
  // Estado separado para la pregunta del día (no va a messages[])
  const [questionOfDay, setQuestionOfDay] = useState(
    () => questionsBank[Math.floor(Math.random() * questionsBank.length)]
  );

  const onIncoming = (data) => {
    if (!data) return;
    // Handle server-side errors
    if (data.type === 'error') {
      setLastError && setLastError(data.message || 'Error del servidor');
      return;
    }
    if (data.type === 'auth_failed') {
      setLastError && setLastError('Autenticación WS fallida');
      return;
    }
    if (data.type === 'join') {
      setConnectedCount((c) => Math.max(1, c + 1));
      return;
    }
    if (data.type === 'leave') {
      setConnectedCount((c) => Math.max(1, c - 1));
      return;
    }
    if (data.type === 'typing') {
      typingRef.current[data.userId] = { userName: data.userName, ts: Date.now() };
      return;
    }
    // Normalization helper
    const normalizeMessage = (m) => {
      if (!m) return m;
      return {
        ...m,
        id: m.id || m._id || (m.message && (m.message.id || m.message._id)) || `${Date.now()}-${Math.random()}`,
        timestamp: m.timestamp || m.createdAt || (m.message && (m.message.timestamp || m.message.createdAt)) || new Date().toISOString(),
        content: m.content || (m.message && m.message.content) || ''
      };
    };

    // History message from server
    if (data.type === 'history' && Array.isArray(data.messages)) {
      const msgs = (data.messages || []).map(normalizeMessage);
      setMessages(msgs);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-50))); } catch (e) {}
      return;
    }

    if (data.type === 'question_of_day') {
      const content = data.message?.content || data.content || (data.message && data.message.content) || null;
      if (content) setQuestionOfDay(content);
      return;
    }

    if (data.type === 'message') {
      const raw = data.message || data;
      const m = normalizeMessage(raw);
      setMessages((prev) => {
        const next = [...prev, m].slice(-200);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(-50))); } catch (e) {}
        return next;
      });
      if (!isOpen) setUnread((n) => n + 1);
      return;
    }
  };

  const [lastError, setLastError] = useState(null);

  // Use WebSocket backend (configured via VITE_WS_URL)
  const { send, status } = useForumWebSocket({ channel: 'rumi-forum', onMessage: onIncoming });

  useEffect(() => {
    // announce join
    const joinMsg = {
      type: 'join', id: crypto?.randomUUID?.() || `${Date.now()}-join`, userId: user?.id || 'anonymous', userName: user?.name || 'Anon', timestamp: new Date().toISOString()
    };
    try { send(joinMsg); } catch (e) {}
    return () => {
      const leaveMsg = { type: 'leave', id: crypto?.randomUUID?.() || `${Date.now()}-leave`, userId: user?.id || 'anonymous', userName: user?.name || 'Anon', timestamp: new Date().toISOString() };
      try { send(leaveMsg); } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [send, user]);

  useEffect(() => {
    // cleanup old typing entries periodically
    const id = setInterval(() => {
      const now = Date.now();
      Object.keys(typingRef.current).forEach(k => {
        if (now - typingRef.current[k].ts > 5000) delete typingRef.current[k];
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Cada vez que cambia el usuario (login/logout/cambio de cuenta),
  // se elige una nueva pregunta del día aleatoria
  useEffect(() => {
    const newQ = questionsBank[Math.floor(Math.random() * questionsBank.length)];
    setQuestionOfDay(newQ);
    // Re-auth WebSocket when user changes (login/logout)
    try {
      const token = localStorage.getItem('token') || null;
      send({ type: 'auth', token });
    } catch (e) {}
  }, [user?.id, send]);

  // Cuando se abre el panel, cargar historial vía REST si está vacío
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      api.get('/forum/messages')
        .then(res => {
          const data = res.data || [];
          setMessages(data);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data.slice(-50))); } catch (e) {}
        })
        .catch(err => console.error('Error cargando historial foro', err));
    }
  }, [isOpen]);

  const sendMessage = (content, replyTo = null) => {
    const payload = { type: 'message', content, replyTo };
    try { send(payload); } catch (e) { console.error('Enviar mensaje WS falló', e); }
  };

  const publishQuestionOfDay = (content) => {
    // Actualizar el estado local de la pregunta del día
    setQuestionOfDay(content);
    // También notificar a otras pestañas via broadcast
    try { send({ type: 'question_of_day', content }); } catch (e) { console.error('Enviar pregunta del día falló', e); }
  };

  const pickRandomQuestion = () => questionsBank[Math.floor(Math.random() * questionsBank.length)];

  const markRead = () => setUnread(0);

  const value = useMemo(() => ({
    messages,
    sendMessage,
    publishQuestionOfDay,
    pickRandomQuestion,
    questionOfDay,
    connectedCount,
    status,
    isOpen,
    setIsOpen,
    unread,
    markRead,
    typing: typingRef,
    lastError,
    clearError: () => setLastError(null)
  }), [messages, questionOfDay, connectedCount, status, isOpen, unread]);

  return <ForumContext.Provider value={value}>{children}</ForumContext.Provider>;
}

export function useForum() {
  const ctx = useContext(ForumContext);
  if (!ctx) throw new Error('useForum must be used within ForumProvider');
  return ctx;
}
