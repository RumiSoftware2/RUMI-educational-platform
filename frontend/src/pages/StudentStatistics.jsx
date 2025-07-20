import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function StudentStatistics() {
  // id = courseId, studentId = id del estudiante
  const { id: courseId, studentId } = useParams();
  const { user } = useContext(AuthContext);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chat, setChat] = useState([]); // Mensajes de feedback/chat
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Obtener progreso y chat reales del backend
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Progreso individual
        const progressRes = await api.get(`/progress/course/${courseId}/student/${studentId}`);
        setProgress(progressRes.data);
        // Chat/feedback
        const chatRes = await api.get(`/feedback/course/${courseId}/student/${studentId}`);
        setChat(chatRes.data);
      } catch (err) {
        setError('Error al cargar estadísticas o chat');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId, studentId]);

  // Enviar mensaje real al backend
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const res = await api.post(`/feedback/course/${courseId}/student/${studentId}`, { text: newMessage });
      setChat(res.data); // Actualiza el chat con la respuesta del backend
      setNewMessage('');
    } catch (err) {
      setError('Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-4">Cargando estadísticas...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Estadísticas del Estudiante</h2>
      {/* Progreso y resultados */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Progreso y Resultados</h3>
        {/* Mostrar progreso real */}
        {progress ? (
          <pre className="bg-gray-100 rounded p-2 text-sm">{JSON.stringify(progress, null, 2)}</pre>
        ) : (
          <div className="text-gray-400">No hay progreso registrado.</div>
        )}
      </div>
      {/* Chat/Feedback */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Feedback y Chat</h3>
        <div className="bg-gray-50 rounded p-3 mb-2 max-h-60 overflow-y-auto border">
          {chat.length === 0 ? (
            <div className="text-gray-400 text-center">No hay mensajes aún.</div>
          ) : (
            chat.map((msg, idx) => (
              <div key={idx} className={`mb-2 ${msg.sender === user.role ? 'text-right' : 'text-left'}`}>
                <span className="font-bold text-blue-700">{msg.sender === 'docente' ? 'Docente' : 'Estudiante'}:</span> {msg.text}
                <div className="text-xs text-gray-400">{msg.date ? new Date(msg.date).toLocaleString() : ''}</div>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className="flex-1 border rounded p-2"
            placeholder="Escribe un mensaje..."
            disabled={sending}
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={sending}>
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      </div>
    </div>
  );
} 