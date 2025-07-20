import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import LessonQuiz from '../components/LessonQuiz';

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
  if (!course || lessons.length === 0) return <div className="p-4">Curso no encontrado o sin lecciones.</div>;

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
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between mb-4">
        <button className="text-blue-600 underline" onClick={() => navigate(-1)}>← Volver</button>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded font-bold ${currentLessonIdx === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
            onClick={handlePrevLesson}
            disabled={currentLessonIdx === 0}
          >
            ← Lección anterior
          </button>
          <button
            className={`px-3 py-1 rounded font-bold ${currentLessonIdx === lessons.length - 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
            onClick={handleNextLesson}
            disabled={currentLessonIdx === lessons.length - 1}
          >
            Siguiente lección →
          </button>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
      <div className="aspect-video mb-4">
        <iframe
          src={lesson.videoUrl}
          title={lesson.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded"
          onLoad={() => {}}
          onEnded={handleVideoEnded}
        />
      </div>
      <p className="mb-4 text-gray-700">{lesson.description}</p>
      {progressMsg && <div className="mb-4 text-green-700 font-semibold text-center">{progressMsg}</div>}
      <div className="mt-6 p-4 border rounded bg-gray-50 text-gray-500 text-center">
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
      </div>
      <div className="flex justify-end mt-6">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700"
          onClick={() => navigate(`/courses/${courseId}/students/${user.id}/statistics`)}
        >
          Ver mis estadísticas y feedback
        </button>
      </div>
    </div>
  );
} 