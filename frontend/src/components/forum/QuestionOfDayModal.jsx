// frontend/src/components/forum/QuestionOfDayModal.jsx
import React, { useState } from 'react';
import questionsBank from '../../data/questionsBank';
import { useForum } from '../../context/ForumContext';

export default function QuestionOfDayModal({ onClose }) {
  const { publishQuestionOfDay, pickRandomQuestion } = useForum();
  const [text, setText] = useState('');

  const handleRandom = () => setText(pickRandomQuestion());
  const handlePublish = () => {
    if (!text) return;
    publishQuestionOfDay(text);
    setText('');
    onClose?.();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12000 }}>
      <div style={{ width: 520, background: '#fff', borderRadius: 8, padding: 16 }}>
        <h3>Publicar Pregunta del Día</h3>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder='Escribe la pregunta...' rows={4} style={{ width: '100%', marginTop: 8 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
          <button onClick={handleRandom} className='btn'>Aleatoria</button>
          <button onClick={handlePublish} className='btn btn-primary'>Publicar</button>
          <button onClick={onClose} className='btn'>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
