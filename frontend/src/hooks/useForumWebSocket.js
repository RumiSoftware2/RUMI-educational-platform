// frontend/src/hooks/useForumWebSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';

// Hook que soporta dos modos:
// - broadcast: usa BroadcastChannel para comunicación entre pestañas
// - websocket: usa URL wss:// para comunicación real-time

export default function useForumWebSocket({ channel = 'rumi-forum', wsUrl = null, onMessage } = {}) {
  const wsRef = useRef(null);
  const reconnectRef = useRef(0);
  const pingRef = useRef(null);
  const [status, setStatus] = useState('closed');
  // Guardamos onMessage en un ref para estabilidad y evitamos re-suscribir el useEffect
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  const send = useCallback((payload) => {
    const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(raw);
    }
  }, []);

  const close = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (bcRef.current) {
      bcRef.current.close();
      bcRef.current = null;
    }
    setStatus('closed');
  }, []);

  useEffect(() => {
    let isUnmount = false;
    // Resolve WS URL: try explicit env, then derive from VITE_API_URL, then localhost fallback
    function resolveWsUrl() {
      if (wsUrl) return wsUrl;
      if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
      const api = import.meta.env.VITE_API_URL;
      try {
        if (api) {
          const u = new URL(api);
          u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
          u.pathname = '/ws/forum';
          u.search = '';
          return u.toString();
        }
      } catch (e) {
        // ignore
      }
      if (window.location.hostname === 'localhost') return 'ws://localhost:3000/ws/forum';
      return undefined;
    }
    const connect = () => {
      if (isUnmount) return;
      setStatus('connecting');
      try {
        const resolvedUrl = resolveWsUrl();
        if (!resolvedUrl) {
          console.error('No WS URL configured — set VITE_WS_URL or VITE_API_URL');
          setStatus('failed');
          return;
        }
        wsRef.current = new WebSocket(resolvedUrl);
        wsRef.current.onopen = () => {
          reconnectRef.current = 0;
          setStatus('connected');
          // send auth token as first message
          try {
            const token = localStorage.getItem('token');
            wsRef.current.send(JSON.stringify({ type: 'auth', token: token || null }));
          } catch (e) {}
          // start ping
          pingRef.current = setInterval(() => {
            try { wsRef.current?.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })); } catch (e) {}
          }, 20000);
        };
        wsRef.current.onmessage = (ev) => {
          try {
            const data = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
            onMessageRef.current?.(data);
          } catch (e) {
            onMessageRef.current?.(ev.data);
          }
        };
        wsRef.current.onclose = () => {
          setStatus('closed');
          if (pingRef.current) clearInterval(pingRef.current);
          // reconnect
          const t = Math.min(30000, 1000 * (2 ** reconnectRef.current));
          reconnectRef.current = reconnectRef.current + 1;
          setTimeout(connect, t + Math.random() * 1000);
        };
        wsRef.current.onerror = (err) => {
          console.warn('WS error', err);
          setStatus('error');
        };
      } catch (e) {
        console.error('WS connect failed', e);
        setStatus('failed');
      }
    };

    connect();

    return () => {
      isUnmount = true;
      if (pingRef.current) clearInterval(pingRef.current);
      try { wsRef.current?.close(); } catch (e) {}
    };
  }, [channel, wsUrl]);

  return { send, close, status };
}
