import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function StudentStatistics() {
  // id = courseId, studentId = id del estudiante
  const { id: courseId, studentId, lessonOrder } = useParams();
  const { user } = useContext(AuthContext);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chat, setChat] = useState([]); // Mensajes de feedback/chat
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [currentLessonOrder, setCurrentLessonOrder] = useState(null); // Para enviar la lección si se desea
  const navigate = useNavigate();

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
      const res = await api.post(`/feedback/course/${courseId}/student/${studentId}`, {
        text: newMessage,
        lessonOrder: currentLessonOrder // Puede ser null si no se selecciona
      });
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
      <div className="mb-4">
        <button className="text-blue-600 underline" onClick={() => navigate(-1)}>
          ← Volver a las lecciones
        </button>
      </div>
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
                <div className="text-xs text-gray-400">
                  {msg.date ? new Date(msg.date).toLocaleString() : ''}
                  {msg.lessonOrder !== null && msg.lessonOrder !== undefined && (
                    <span> | Lección: {msg.lessonOrder}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        {/* Selector de lección opcional para el mensaje */}
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className="flex-1 border rounded p-2"
            placeholder="Escribe un mensaje..."
            disabled={sending}
          />
          <select
            className="border rounded p-2 text-sm"
            value={currentLessonOrder || ''}
            onChange={e => setCurrentLessonOrder(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Lección...</option>
            {progress && progress.completedLessons && progress.completedLessons.length > 0 &&
              progress.completedLessons.map((order, idx) => (
                <option key={idx} value={order}>Lección {order}</option>
              ))
            }
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={sending}>
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      </div>
    </div>
  );
} 