import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import LessonQuiz from '../components/LessonQuiz';
import { motion, AnimatePresence } from 'framer-motion';
import logo2 from '../assets/logo2zeus.png';

export default function StudentCourseDetail() {
  const { id: courseId } = useParams();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lessons, setLessons] = useState([]);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [videoWatched, setVideoWatched] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      try {
        const res = await api.get(`/courses/${courseId}`);
        setCourse(res.data);
        setLessons(res.data.lessons || []);
      } catch (err) {
        setError('Error al cargar el curso');
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    setVideoWatched(false);
    setProgressMsg('');
  }, [currentLessonIdx]);

  if (loading) return <div className="p-4">Cargando curso...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!course) return <div className="p-4">Curso no encontrado.</div>;

  // Pantalla introductoria SIEMPRE que haya curso
  if (showIntro) {
    return (
      <AnimatePresence>
        <motion.div
          key="intro"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-xl"
        >
          {/* Botón para volver a Mis Cursos */}
          <div className="flex justify-start mb-4">
            <button
              onClick={() => navigate('/student/courses')}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg hover:from-blue-600 hover:to-emerald-600 transition-all duration-300"
            >
              ← Volver a Mis Cursos
            </button>
          </div>
          <div className="flex flex-col items-center mb-4">
            <motion.img
              src={logo2}
              alt="Logo decorativo"
              className="w-16 h-16 mb-2 animate-bounce"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            />
            <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-green-700 via-blue-400 to-yellow-400 bg-clip-text text-transparent drop-shadow animate-fade-in">
              {course.title}
            </h1>
          </div>
          {/* Modern video container */}
          <motion.div
            className="aspect-video mb-4 flex items-center justify-center bg-gradient-to-br from-blue-100 via-green-100 to-yellow-100 rounded-3xl shadow-2xl border-4 border-transparent bg-clip-padding relative overflow-hidden"
            style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {course.videoUrl ? (
              <iframe
                src={course.videoUrl}
                title={course.title}
                style={{ border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-2xl shadow-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded text-gray-500">
                Sin video principal
              </div>
            )}
          </motion.div>
          <p className="mb-8 text-lg text-center text-gray-700 animate-fade-in-slow">{course.description}</p>
          {lessons.length > 0 ? (
            <div className="flex justify-center mt-6">
              <motion.button
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.97 }}
                className="bg-gradient-to-r from-green-600 to-blue-400 text-white px-6 py-3 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-green-500 shadow-lg transition-all duration-300"
                onClick={() => setShowIntro(false)}
              >
                Comenzar lecciones
              </motion.button>
            </div>
          ) : (
            <motion.div
              className="flex flex-col items-center justify-center mt-8 p-6 bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 rounded-xl shadow-lg border border-blue-100"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <img src={logo2} alt="Logo TUMI" className="w-20 h-20 mb-2 animate-pulse" />
              <h2 className="text-xl font-bold text-blue-700 mb-2">¡Próximamente lecciones!</h2>
              <p className="text-gray-600 text-center mb-2">Este curso aún no tiene lecciones disponibles.<br/>Vuelve pronto para comenzar a aprender con TUMI.</p>
              <span className="text-yellow-500 font-bold animate-bounce">🚀</span>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  if (lessons.length === 0) return null; // No mostrar navegación de lecciones si no hay lecciones

  const lesson = lessons[currentLessonIdx];

  // Handler para guardar progreso por visualización
  const handleVideoEnded = async () => {
    try {
      await api.post(`/progress/lesson/${courseId}/${lesson.order}`, { score: 100, completed: true });
      setProgressMsg('¡Progreso guardado! Puntuación: 100');
      setVideoWatched(true);
    } catch (err) {
      setProgressMsg('Error al guardar el progreso');
    }
  };

  // Navegación entre lecciones
  const handlePrevLesson = () => {
    if (currentLessonIdx > 0) {
      setCurrentLessonIdx(currentLessonIdx - 1);
    }
  };
  const handleNextLesson = () => {
    if (currentLessonIdx < lessons.length - 1) {
      setCurrentLessonIdx(currentLessonIdx + 1);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentLessonIdx}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-lg"
      >
        {/* Botón para volver a Mis Cursos */}
        <div className="flex justify-start mb-4">
          <button
            onClick={() => navigate('/student/courses')}
            className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg hover:from-blue-600 hover:to-emerald-600 transition-all duration-300"
          >
            ← Volver a Mis Cursos
          </button>
        </div>
        <div className="flex justify-between mb-4">
          <button className="text-blue-600 underline" onClick={() => navigate(-1)}>← Volver</button>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: currentLessonIdx === 0 ? 1 : 1.07 }}
              whileTap={{ scale: 0.97 }}
              className={`px-3 py-1 rounded font-bold transition-all duration-200 ${currentLessonIdx === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
              onClick={handlePrevLesson}
              disabled={currentLessonIdx === 0}
            >
              ← Lección anterior
            </motion.button>
            <motion.button
              whileHover={{ scale: currentLessonIdx === lessons.length - 1 ? 1 : 1.07 }}
              whileTap={{ scale: 0.97 }}
              className={`px-3 py-1 rounded font-bold transition-all duration-200 ${currentLessonIdx === lessons.length - 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
              onClick={handleNextLesson}
              disabled={currentLessonIdx === lessons.length - 1}
            >
              Siguiente lección →
            </motion.button>
          </div>
        </div>
        <motion.h2
          className="text-2xl font-bold mb-2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {lesson.title}
        </motion.h2>
        {/* Modern video container for lesson */}
        <motion.div
          className="aspect-video mb-4 flex items-center justify-center bg-gradient-to-br from-blue-100 via-green-100 to-yellow-100 rounded-3xl shadow-2xl border-4 border-transparent bg-clip-padding relative overflow-hidden"
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <iframe
            src={lesson.videoUrl}
            title={lesson.title}
            style={{ border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-2xl shadow-lg"
            onLoad={() => {}}
            onEnded={handleVideoEnded}
          />
        </motion.div>
        <p className="mb-4 text-gray-700 text-center animate-fade-in-slow">{lesson.description}</p>
        {progressMsg && <motion.div className="mb-4 text-green-700 font-semibold text-center animate-fade-in" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{progressMsg}</motion.div>}
        <motion.div className="mt-6 p-4 border rounded bg-gray-50 text-gray-500 text-center animate-fade-in-slow">
          <LessonQuiz
            quizId={lesson.quiz}
            courseId={courseId}
            lessonOrder={lesson.order}
            onComplete={(score) => {
              setProgressMsg(`¡Progreso guardado! Puntuación: ${score}`);
              setVideoWatched(true);
              api.post(`/progress/lesson/${courseId}/${lesson.order}`, { score, completed: true });
            }}
          />
          {!lesson.quiz && videoWatched && <span>¡Has completado la lección!</span>}
        </motion.div>
        <div className="flex justify-end mt-6">
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.97 }}
            className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition-all duration-300"
            onClick={() => navigate(`/courses/${courseId}/students/${user.id}/statistics`)}
          >
            Ver mis estadísticas y feedback
          </motion.button>
        </div>
        {/*
          El Header/navbar ya está presente y es responsive porque AppLayout lo incluye automáticamente
          para rutas de estudiante. No se requiere cambio de código para el header.
        */}
      </motion.div>
    </AnimatePresence>
  );
} 