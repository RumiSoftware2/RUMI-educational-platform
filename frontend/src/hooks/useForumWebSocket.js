// frontend/src/hooks/useForumWebSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';

// Hook que soporta dos modos:
// - broadcast: usa BroadcastChannel para comunicación entre pestañas
// - websocket: usa URL wss:// para comunicación real-time

export default function useForumWebSocket({ channel = 'rumi-forum', wsUrl = null, onMessage } = {}) {
  const bcRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectRef = useRef(0);
  const pingRef = useRef(null);
  const [status, setStatus] = useState('closed');

  const send = useCallback((payload) => {
    const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(raw);
      return;
    }
    if (bcRef.current) {
      bcRef.current.postMessage(raw);
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

    if (!wsUrl || wsUrl === 'broadcast') {
      // BroadcastChannel mode (demo, works between tabs)
      try {
        bcRef.current = new BroadcastChannel(channel);
        bcRef.current.onmessage = (ev) => {
          try {
            const data = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
            onMessage?.(data);
          } catch (e) {
            // ignore
            onMessage?.(ev.data);
          }
        };
        setStatus('connected');
      } catch (e) {
        console.warn('BroadcastChannel not available, falling back to in-memory.', e);
        setStatus('failed');
      }

      return () => {
        isUnmount = true;
        if (bcRef.current) bcRef.current.close();
      };
    }

    // WebSocket mode
    const connect = () => {
      if (isUnmount) return;
      setStatus('connecting');
      try {
        wsRef.current = new WebSocket(wsUrl);
        wsRef.current.onopen = () => {
          reconnectRef.current = 0;
          setStatus('connected');
          // start ping
          pingRef.current = setInterval(() => {
            try { wsRef.current?.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })); } catch (e) {}
          }, 20000);
        };
        wsRef.current.onmessage = (ev) => {
          try {
            const data = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
            onMessage?.(data);
          } catch (e) {
            onMessage?.(ev.data);
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
  }, [channel, wsUrl, onMessage]);

  return { send, close, status };
}
