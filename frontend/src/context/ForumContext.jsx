// frontend/src/context/ForumContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react';
import useForumWebSocket from '../hooks/useForumWebSocket';
import questionsBank from '../data/questionsBank';
import { useContext } from 'react';
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

  const onIncoming = (data) => {
    if (!data) return;
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
    // message or question_of_day
    setMessages((prev) => {
      const next = [...prev, data].slice(-200);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(-50))); } catch (e) {}
      return next;
    });
    if (!isOpen) setUnread((n) => n + 1);
  };

  // Use BroadcastChannel mode by default for demo. To switch to real WS, set wsUrl env or pass in options later.
  const { send, status } = useForumWebSocket({ channel: 'rumi-forum', wsUrl: 'broadcast', onMessage: onIncoming });

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

  const sendMessage = (content, replyTo = null) => {
    const msg = {
      type: 'message', id: crypto?.randomUUID?.() || `${Date.now()}`, userId: user?.id || `anon-${Math.floor(Math.random()*10000)}`, userName: user?.name || 'Anónimo', userRole: user?.role || 'anónimo', content, timestamp: new Date().toISOString(), replyTo, reactions: {}
    };
    try { send(msg); } catch (e) {
      // locally add if send fails
      onIncoming(msg);
    }
  };

  const publishQuestionOfDay = (content) => {
    const msg = {
      type: 'question_of_day', id: crypto?.randomUUID?.() || `${Date.now()}-qod`, userId: user?.id || 'system', userName: user?.name || 'Admin', userRole: user?.role || 'admin', content, timestamp: new Date().toISOString()
    };
    send(msg);
  };

  const pickRandomQuestion = () => questionsBank[Math.floor(Math.random() * questionsBank.length)];

  const markRead = () => setUnread(0);

  const value = useMemo(() => ({
    messages,
    sendMessage,
    publishQuestionOfDay,
    pickRandomQuestion,
    connectedCount,
    status,
    isOpen,
    setIsOpen,
    unread,
    markRead,
    typing: typingRef
  }), [messages, connectedCount, status, isOpen, unread]);

  return <ForumContext.Provider value={value}>{children}</ForumContext.Provider>;
}

export function useForum() {
  const ctx = useContext(ForumContext);
  if (!ctx) throw new Error('useForum must be used within ForumProvider');
  return ctx;
}
