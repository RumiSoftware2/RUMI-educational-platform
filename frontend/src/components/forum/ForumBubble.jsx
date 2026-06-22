// frontend/src/components/forum/ForumBubble.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useForum } from '../../context/ForumContext';

export default function ForumBubble() {
  const { unread, setIsOpen } = useForum();
  const location = useLocation();

  const enterpriseRoutes = [
    '/enterprise-rumi',
    '/enterprise'
  ];
  if (enterpriseRoutes.some(r => location.pathname.startsWith(r))) return null;

  return (
    <motion.button
      aria-label="Foro Comunitario RUMI"
      onClick={() => setIsOpen(true)}
      initial={{ scale: 0 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 9999,
        background: 'linear-gradient(135deg,#7C3AED,#4F46E5)',
        color: '#fff',
        border: 'none',
        width: 64,
        height: 64,
        borderRadius: '50%',
        boxShadow: '0 8px 20px rgba(79,70,229,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
    >
      <div style={{ position: 'relative' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" fill="white"/></svg>
        {unread > 0 && (
          <motion.span
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: '#EF4444',
              color: '#fff',
              width: 20,
              height: 20,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700
            }}
            animate={{ scale: [1, 1.3, 1] }}
          >{unread}</motion.span>
        )}
      </div>
    </motion.button>
  );
}
