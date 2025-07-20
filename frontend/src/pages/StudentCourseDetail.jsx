import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import LessonQuiz from '../components/LessonQuiz';
import { motion, AnimatePresence } from 'framer-motion';

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
          className="p-6 max-w-2xl mx-auto"
        >
          <div className="flex justify-between mb-4">
            <button className="text-blue-600 underline" onClick={() => navigate(-1)}>← Volver</button>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-center animate-fade-in">{course.title}</h1>
          <motion.div
            className="aspect-video mb-4"
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
                className="w-full h-full rounded shadow-lg"
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
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-lg hover:bg-green-700 shadow-lg transition-all duration-300"
                onClick={() => setShowIntro(false)}
              >
                Comenzar lecciones
              </motion.button>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-8">Este curso aún no tiene lecciones disponibles.</div>
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
        <motion.div
          className="aspect-video mb-4"
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
            className="w-full h-full rounded shadow-lg"
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
      </motion.div>
    </AnimatePresence>
  );
} 