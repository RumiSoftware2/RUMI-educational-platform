import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import logo3 from '../assets/logo3zeus.png';
// Hook para poblar info real de estudiante y docente si no está en courseInfo
import { useRef } from 'react';

const COLORS = ['#00C49F', '#FF8042'];

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
  const [courseInfo, setCourseInfo] = useState(null); // Para saber total de lecciones
  const [studentInfo, setStudentInfo] = useState(null);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const fetchedStudent = useRef(false);
  const fetchedTeacher = useRef(false);
  const navigate = useNavigate();

  // Obtener progreso, info de curso y chat reales del backend
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Progreso individual
        const progressRes = await api.get(`/progress/course/${courseId}/student/${studentId}`);
        setProgress(progressRes.data);
        // Info de curso (para total de lecciones)
        const courseRes = await api.get(`/courses/${courseId}`);
        setCourseInfo(courseRes.data);
        // Chat/feedback
        const chatRes = await api.get(`/feedback/course/${courseId}/student/${studentId}`);
        setChat(chatRes.data.messages);
        setStudentInfo(chatRes.data.student);
        setTeacherInfo(chatRes.data.teacher);
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

  // Preparar datos para gráficos
  let totalLessons = courseInfo?.lessons?.length || 0;
  let completedLessons = progress?.completedLessons?.length || 0;
  let percentComplete = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  let pieData = [
    { name: 'Completadas', value: completedLessons },
    { name: 'Pendientes', value: Math.max(totalLessons - completedLessons, 0) }
  ];
  // Quiz scores por lección
  let quizBarData = [];
  if (progress?.quizScores && courseInfo?.lessons) {
    quizBarData = courseInfo.lessons.map((lesson, idx) => {
      // Buscar score por quizId o por lesson-#
      let score = null;
      if (lesson.quiz && progress.quizScores[lesson.quiz]) {
        score = progress.quizScores[lesson.quiz];
      } else if (progress.quizScores[`lesson-${lesson.order}`]) {
        score = progress.quizScores[`lesson-${lesson.order}`];
      }
      return {
        name: `Lección ${lesson.order}`,
        score: score !== null && score !== undefined ? score : 0
      };
    });
  }

  if (loading) return <div className="p-4">Cargando estadísticas...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a2342] via-[#2ca6e0] to-[#ffd700] flex flex-col py-8 px-2 animate-fade-in">
      {/* Botón para volver al curso, solo para docentes */}
      {user?.role === 'docente' && (
        <div className="max-w-2xl mx-auto mb-4 flex justify-start">
          <Link
            to={`/courses/${courseId}`}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-5 py-2 rounded-xl font-bold text-base shadow-lg hover:from-blue-700 hover:to-emerald-600 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200 animate-fade-in-up"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            Volver al curso
          </Link>
        </div>
      )}
      <motion.div
        key={courseInfo?.title || 'stats'}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="max-w-2xl mx-auto p-4 md:p-8 bg-white/90 rounded-3xl shadow-2xl border border-[#2ca6e0]/20 animate-fade-in overflow-x-auto"
      >
        <div className="flex flex-col items-center mb-4">
          <motion.img
            src={logo3}
            alt="Logo decorativo"
            className="w-16 h-16 mb-2 animate-bounce"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          />
         <motion.h2
           className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-yellow-400 via-blue-400 to-green-400 bg-clip-text text-transparent drop-shadow animate-pulse"
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
         >
           Estadísticas de {user?.name || user?.username || user?.email || 'Estudiante'}
         </motion.h2>
        </div>
        {/* Resumen matemático y gráfico de pastel mejorado */}
        <motion.div
          className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-gradient-to-br from-blue-50 via-yellow-50 to-green-50 rounded-2xl shadow-lg border border-[#ffd700]/30 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div>
            <div className="mb-2 font-semibold">Curso: <span className="font-normal">{courseInfo?.title}</span></div>
            <div>Total de lecciones: <b>{totalLessons}</b></div>
            <div>Lecciones completadas: <b>{completedLessons}</b></div>
            <div>Porcentaje de avance: <b>{percentComplete}%</b></div>
          </div>
          <div className="flex flex-col items-center">
            <PieChart width={220} height={220}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={true}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
            <div className="mt-2 flex gap-4 text-sm">
              <div className="flex items-center gap-1"><span style={{background: COLORS[0], width: 14, height: 14, display: 'inline-block', borderRadius: 3}}></span> Completadas</div>
              <div className="flex items-center gap-1"><span style={{background: COLORS[1], width: 14, height: 14, display: 'inline-block', borderRadius: 3}}></span> Pendientes</div>
            </div>
          </div>
        </motion.div>
        {/* Gráfico de barras de quizzes */}
        <motion.div
          className="mb-8 bg-gradient-to-br from-blue-50 via-yellow-50 to-green-50 rounded-2xl shadow-lg border border-[#2ca6e0]/20 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-blue-400 via-yellow-400 to-green-400 bg-clip-text text-transparent drop-shadow animate-fade-in">Resultados de Quizzes</h3>
          {quizBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={quizBarData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#8884d8" name="Puntaje" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-400">No hay resultados de quizzes aún.</div>
          )}
        </motion.div>
        {/* Chat/Feedback */}
        <motion.div
          className="mb-6 bg-gradient-to-br from-blue-50 via-yellow-50 to-green-50 rounded-2xl shadow-lg border border-[#2ca6e0]/20 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-blue-400 via-yellow-400 to-green-400 bg-clip-text text-transparent drop-shadow animate-fade-in">Feedback y Chat</h3>
          <div className="bg-white/80 rounded p-3 mb-2 max-h-60 overflow-y-auto border border-[#ffd700]/30">
            {chat.length === 0 ? (
              <div className="text-gray-400 text-center">No hay mensajes aún.</div>
            ) : (
              chat.map((msg, idx) => {
                // Determinar nombre a mostrar
                let senderName = '';
                if (msg.sender === 'estudiante') {
                  senderName = studentInfo?.name || studentInfo?.username || studentInfo?.email || '';
                } else if (msg.sender === 'docente') {
                  senderName = teacherInfo?.name || teacherInfo?.username || teacherInfo?.email || '';
                }
                return (
                  <div key={idx} className={`mb-2 ${msg.sender === user.role ? 'text-right' : 'text-left'}`}>
                    <span className="font-bold text-blue-700">{senderName}:</span> {msg.text}
                    <div className="text-xs text-gray-400">
                      {msg.date ? new Date(msg.date).toLocaleString() : ''}
                      {msg.lessonOrder !== null && msg.lessonOrder !== undefined && (
                        <span> | Lección: {msg.lessonOrder}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* Selector de lección opcional para el mensaje */}
          <form onSubmit={handleSendMessage} className="flex flex-col sm:flex-row gap-2 items-stretch w-full">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="flex-1 border rounded p-2 min-w-0"
              placeholder="Escribe un mensaje..."
              disabled={sending}
            />
            <select
              className="border rounded p-2 text-sm min-w-[110px]"
              value={currentLessonOrder || ''}
              onChange={e => setCurrentLessonOrder(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Lección...</option>
              {courseInfo && courseInfo.lessons && courseInfo.lessons.length > 0 &&
                courseInfo.lessons.map((lesson, idx) => (
                  <option key={idx} value={lesson.order}>Lección {lesson.order}</option>
                ))
              }
            </select>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto" disabled={sending}>
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
} 