// frontend/src/components/forum/ForumPanel.jsx
import React, { useContext, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useForum } from '../../context/ForumContext';
import { AuthContext } from '../../context/AuthContext';
import QuestionOfDayModal from './QuestionOfDayModal';

function MessageRow({ m }) {
  const bgByRole = {
    admin: '#4C1D95',
    docente: '#1E3A5F',
    estudiante: '#064E3B',
    'anónimo': '#374151',
    anonymous: '#374151'
  };
  const bg = bgByRole[m.userRole] || '#374151';
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <strong style={{ color: '#fff', background: bg, padding: '4px 8px', borderRadius: 6 }}>{m.userName}</strong>
        <small style={{ color: '#6b7280' }}>{new Date(m.timestamp).toLocaleTimeString()}</small>
      </div>
      <div style={{ marginTop: 6, background: '#0f172a', color: '#fff', padding: 10, borderRadius: 8 }}>{m.content}</div>
    </div>
  );
}

export default function ForumPanel() {
  const { messages, isOpen, setIsOpen, sendMessage, connectedCount, markRead, questionOfDay } = useForum();
  const { user } = useContext(AuthContext);
  const [text, setText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      markRead();
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 50);
    }
  }, [isOpen, messages, markRead]);

  if (!isOpen) return null;

  // La pregunta del día proviene del contexto (estado separado)
  const latestQ = questionOfDay;

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText('');
  };

  return (
    <motion.div
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      transition={{ type: 'spring' }}
      style={{ position: 'fixed', right: 0, top: 0, height: '100%', width: 420, background: '#0f172a', color: '#fff', zIndex: 12000, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700 }}>🟣 Foro Comunitario RUMI</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>{connectedCount} conectados</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {user?.role === 'admin' && <button className='btn' onClick={() => setShowModal(true)}>Pregunta del Día</button>}
          <button className='btn' onClick={() => setIsOpen(false)}>×</button>
        </div>
      </div>

      <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ background: '#FDE68A', color: '#000', padding: 10, borderRadius: 6 }}>💬 {latestQ || 'Pregunta del Día no publicada'}</div>
      </div>

      <div ref={listRef} style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {messages.map(m => (
          <MessageRow key={m.id} m={m} />
        ))}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ marginBottom: 8 }}><small>Escribes como: <strong>{user?.name || 'Anónimo'}</strong></small></div>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={3} style={{ width: '100%', borderRadius: 8 }} placeholder='Escribe tu mensaje...' />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button className='btn btn-primary' onClick={handleSend}>Enviar ➤</button>
        </div>
      </div>

      {showModal && <QuestionOfDayModal onClose={() => setShowModal(false)} />}
    </motion.div>
  );
}
