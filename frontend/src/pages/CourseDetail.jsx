import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import EnrolledStudentsList from '../components/EnrolledStudentsList';
import { saveLessonProgress } from '../services/api';
import LessonQuiz from '../components/LessonQuiz';
import { createQuiz } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import logo1 from '../assets/logo1zeus.png';
import PaymentConfigModal from '../components/PaymentConfigModal';
import PaymentButton from '../components/PaymentButton';
import PaymentStats from '../components/PaymentStats';

// Función para convertir cualquier URL de YouTube a formato embed
function toYoutubeEmbed(url) {
  if (!url) return '';
  // Caso 1: Formato largo
  let match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([\w-]+)/);
  if (match) {
    const videoId = match[1];
    const listMatch = url.match(/[?&]list=([\w-]+)/);
    return `https://www.youtube.com/embed/${videoId}` + (listMatch ? `?list=${listMatch[1]}` : '');
  }
  // Caso 2: Formato corto (compartir)
  match = url.match(/(?:https?:\/\/)?youtu\.be\/([\w-]+)/);
  if (match) {
    const videoId = match[1];
    // Si hay parámetros extra, los puedes conservar si quieres
    const params = url.split('?')[1];
    return `https://www.youtube.com/embed/${videoId}` + (params ? `?${params}` : '');
  }
  // Si no es YouTube, devolver la URL original
  return url;
}

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lessons, setLessons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [lessonForm, setLessonForm] = useState({ order: 1, title: '', description: '', videoUrl: '' });
  const [message, setMessage] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [showStudentView, setShowStudentView] = useState(null); // index of lesson to show as student
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  // Mover hooks aquí
  const [videoWatched, setVideoWatched] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [quizForm, setQuizForm] = useState({ title: '', questions: [] });
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({ questionText: '', options: ['', ''], correctAnswer: '' });
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [editCourseForm, setEditCourseForm] = useState({ title: '', videoUrl: '', description: '' });
  const [editCourseLoading, setEditCourseLoading] = useState(false);
  const [editCourseMsg, setEditCourseMsg] = useState('');
  const [showPaymentConfig, setShowPaymentConfig] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data);
        setLessons(res.data.lessons || []);
      } catch (err) {
        setError('Error al cargar el curso');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (showForm && editingIndex === null) {
      setLessonForm(form => ({ ...form, order: lessons.length + 1 }));
    }
  }, [showForm, lessons.length, editingIndex]);

  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      try {
        const res = await api.get(`/courses/${id}/students`);
        setEnrolledStudents(res.data);
      } catch (err) {
        setEnrolledStudents([]);
      }
    };
    fetchEnrolledStudents();
  }, [id]);

  useEffect(() => {
    if (course && showEditCourse) {
      setEditCourseForm({
        title: course.title || '',
        videoUrl: course.videoUrl || '',
        description: course.description || '',
      });
    }
  }, [course, showEditCourse]);

  const isOwner = user && (
    user.role === 'admin' ||
    user.id === (course?.teacher?._id || course?.teacher)
  );

  const handleLessonChange = (e) => {
    setLessonForm({ ...lessonForm, [e.target.name]: e.target.value });
  };

  // Funciones para manejar el quiz
  const handleQuizInputChange = (e) => {
    setQuizForm({ ...quizForm, [e.target.name]: e.target.value });
  };
  const handleQuestionInputChange = (e, idx) => {
    const opts = [...currentQuestion.options];
    if (e.target.name === 'options') opts[idx] = e.target.value;
    setCurrentQuestion({ ...currentQuestion, options: opts });
  };
  const handleAddOption = () => {
    setCurrentQuestion({ ...currentQuestion, options: [...currentQuestion.options, ''] });
  };
  const handleAddQuestion = () => {
    if (!currentQuestion.questionText || !currentQuestion.correctAnswer || currentQuestion.options.length < 2) return;
    setQuizForm({ ...quizForm, questions: [...quizForm.questions, { ...currentQuestion }] });
    setCurrentQuestion({ questionText: '', options: ['', ''], correctAnswer: '' });
  };
  const handleRemoveQuestion = (idx) => {
    setQuizForm({ ...quizForm, questions: quizForm.questions.filter((_, i) => i !== idx) });
  };

  // Crear o actualizar lección
  const handleAddOrUpdateLesson = async (e) => {
    e.preventDefault();
    setMessage(editingIndex === null ? 'Guardando lección...' : 'Actualizando lección...');
    let updatedLessons;
    let quizId = null;
    // Si hay quiz, créalo primero
    if (showQuizForm && quizForm.title && quizForm.questions.length > 0) {
      try {
        const quizRes = await createQuiz({
          title: quizForm.title,
          questions: quizForm.questions,
          courseId: id
        });
        quizId = quizRes.data._id;
      } catch (err) {
        setMessage('Error al crear el quiz');
        return;
      }
    }
    // Transformar el videoUrl a embed antes de guardar
    const embedUrl = toYoutubeEmbed(lessonForm.videoUrl);
    if (editingIndex === null) {
      // Crear nueva lección
      updatedLessons = [
        ...lessons,
        { ...lessonForm, order: lessons.length + 1, videoUrl: embedUrl, quiz: quizId }
      ];
    } else {
      // Actualizar lección existente
      updatedLessons = lessons.map((l, idx) =>
        idx === editingIndex
          ? { ...lessonForm, order: l.order, videoUrl: embedUrl, quiz: quizId || l.quiz }
          : l
      );
    }
    try {
      await api.put(`/courses/${id}`, { lessons: updatedLessons });
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data);
      setLessons(res.data.lessons || []);
      setMessage(editingIndex === null ? 'Lección agregada correctamente' : 'Lección actualizada correctamente');
      setShowForm(false);
      setLessonForm({ order: lessons.length + 2, title: '', description: '', videoUrl: '' });
      setEditingIndex(null);
      setQuizForm({ title: '', questions: [] });
      setShowQuizForm(false);
      setCurrentQuestion({ questionText: '', options: ['', ''], correctAnswer: '' });
    } catch (err) {
      setMessage('Error al guardar la lección');
    }
  };

  // Editar lección
  const handleEditLesson = (idx) => {
    setLessonForm({ ...lessons[idx] });
    setShowForm(true);
    setEditingIndex(idx);
  };

  // Eliminar lección y reordenar
  const handleDeleteLesson = async (idx) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta lección?')) return;
    const updatedLessons = lessons.filter((_, i) => i !== idx).map((l, i) => ({ ...l, order: i + 1 }));
    try {
      await api.put(`/courses/${id}`, { lessons: updatedLessons });
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data);
      setLessons(res.data.lessons || []);
      setMessage('Lección eliminada correctamente');
      setShowForm(false);
      setEditingIndex(null);
      setLessonForm({ order: updatedLessons.length + 1, title: '', description: '', videoUrl: '' });
    } catch (err) {
      setMessage('Error al eliminar la lección');
    }
  };

  // Abrir vista de estudiante
  const handleOpenStudentView = (idx) => {
    setShowStudentView(idx);
  };

  // Cerrar vista de estudiante
  const handleCloseStudentView = () => {
    setShowStudentView(null);
  };

  // Función para actualizar la info general del curso
  const handleEditCourseChange = (e) => {
    setEditCourseForm({ ...editCourseForm, [e.target.name]: e.target.value });
  };
  const handleEditCourseSubmit = async (e) => {
    e.preventDefault();
    setEditCourseLoading(true);
    setEditCourseMsg('');
    try {
      // Transformar la URL a formato embed si es de YouTube
      const embedUrl = toYoutubeEmbed(editCourseForm.videoUrl);
      await api.put(`/courses/${id}`, {
        ...editCourseForm,
        videoUrl: embedUrl,
      });
      // Refrescar datos
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data);
      setEditCourseMsg('Información actualizada correctamente');
      setShowEditCourse(false);
    } catch (err) {
      setEditCourseMsg('Error al actualizar el curso');
    } finally {
      setEditCourseLoading(false);
    }
  };

  const handlePaymentConfigSuccess = (updatedCourse) => {
    setCourse(updatedCourse);
  };

  const mainVideoUrl = course?.videoUrl;

  if (loading) return <p className="p-4">Cargando curso...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!course) return <p className="p-4">Curso no encontrado.</p>;

  // Vista de estudiante para una lección
  if (showStudentView !== null && lessons[showStudentView]) {
    const lesson = lessons[showStudentView];
    
    // Verificar si la lección actual requiere pago
    const requiresPayment = course.isPaidCourse && 
                           course.paidFromLesson && 
                           lesson.order >= course.paidFromLesson;
    
    // Handler para guardar progreso por visualización
    const handleVideoEnded = async () => {
      try {
        await saveLessonProgress(id, lesson.order, { score: 100, completed: true });
        setProgressMsg('¡Progreso guardado! Puntuación: 100');
        setVideoWatched(true);
      } catch (err) {
        setProgressMsg('Error al guardar el progreso');
      }
    };

    // Navegación entre lecciones
    const handlePrevLesson = () => {
      if (showStudentView > 0) {
        setShowStudentView(showStudentView - 1);
        setProgressMsg('');
        setVideoWatched(false);
      }
    };
    const handleNextLesson = () => {
      if (showStudentView < lessons.length - 1) {
        setShowStudentView(showStudentView + 1);
        setProgressMsg('');
        setVideoWatched(false);
      }
    };

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={showStudentView}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="p-2 sm:p-4 max-w-lg md:max-w-2xl mx-auto bg-gradient-to-br from-blue-50 via-green-50 to-purple-100 rounded-3xl shadow-2xl border-4 border-blue-200/40"
        >
          <div className="flex justify-between mb-4">
            <button className="text-blue-600 font-bold underline hover:text-blue-800 transition text-base sm:text-lg" onClick={handleCloseStudentView}>← Volver</button>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: showStudentView === 0 ? 1 : 1.07 }}
                whileTap={{ scale: 0.97 }}
                className={`px-3 py-1 rounded-xl font-bold transition-all duration-200 ${showStudentView === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:from-green-700 hover:to-emerald-600 shadow'}`}
                onClick={handlePrevLesson}
                disabled={showStudentView === 0}
              >
                ← Lección anterior
              </motion.button>
              <motion.button
                whileHover={{ scale: showStudentView === lessons.length - 1 ? 1 : 1.07 }}
                whileTap={{ scale: 0.97 }}
                className={`px-3 py-1 rounded-xl font-bold transition-all duration-200 ${showStudentView === lessons.length - 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:from-green-700 hover:to-emerald-600 shadow'}`}
                onClick={handleNextLesson}
                disabled={showStudentView === lessons.length - 1}
              >
                Siguiente lección →
              </motion.button>
            </div>
          </div>
          <motion.h2
            className="text-3xl sm:text-4xl font-extrabold mb-3 text-center bg-gradient-to-r from-blue-700 via-green-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-xl animate-gradient-x"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {lesson.title}
          </motion.h2>
          <motion.div
            className="aspect-video mb-4 rounded-3xl border-4 border-green-200 shadow-2xl bg-white/80 flex items-center justify-center overflow-hidden animate-fade-in"
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
              className="w-full h-full rounded-2xl shadow-lg border-none"
              onLoad={() => {}}
              onEnded={handleVideoEnded}
            />
          </motion.div>
          <p className="mb-4 text-lg sm:text-xl text-center text-gray-700 font-medium animate-fade-in-slow">{lesson.description}</p>
          {progressMsg && <motion.div className="mb-4 text-green-700 font-semibold text-center animate-fade-in" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{progressMsg}</motion.div>}
          {requiresPayment ? (
            <PaymentButton 
              courseId={id}
              lessonOrder={lesson.order}
              onPaymentSuccess={() => {
                setProgressMsg('¡Pago exitoso! Ahora puedes continuar con el curso.');
                setVideoWatched(true);
              }}
            />
          ) : (
            <motion.div className="mt-6 p-4 border-4 border-blue-200 rounded-2xl bg-gradient-to-br from-blue-50 via-green-50 to-purple-100 text-gray-700 text-center animate-fade-in-slow shadow-lg">
              <LessonQuiz
                quizId={lesson.quiz}
                courseId={id}
                lessonOrder={lesson.order}
                onComplete={(score) => {
                  setProgressMsg(`¡Progreso guardado! Puntuación: ${score}`);
                  setVideoWatched(true);
                  // Guardar progreso actualizado
                  saveLessonProgress(id, lesson.order, { score, completed: true });
                }}
              />
              {!lesson.quiz && videoWatched && <span className="block mt-2 text-green-700 font-bold animate-bounce">¡Has completado la lección!</span>}
            </motion.div>
          )}
          {/* Animaciones personalizadas para la vista de estudiante */}
          <style jsx>{`
            @keyframes gradient-x {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 3s ease-in-out infinite; }
            .animate-fade-in-slow { animation: fade-in 1.5s cubic-bezier(0.4,0,0.2,1); }
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-bounce { animation: bounce 1.5s infinite; }
            @media (max-width: 640px) {
              .aspect-video { min-height: 180px; }
            }
          `}</style>
                  </motion.div>
        </AnimatePresence>
      );
    }

    // Modal de configuración de pago
    if (showPaymentConfig) {
      return (
        <PaymentConfigModal
          isOpen={showPaymentConfig}
          onClose={() => setShowPaymentConfig(false)}
          course={course}
          onSuccess={handlePaymentConfigSuccess}
        />
      );
    }

  // Componente para mostrar el número de la lección de forma grande y estilizada
  function LessonNumber({ number }) {
    return (
      <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-700 text-white text-4xl font-extrabold rounded-full shadow-lg border-4 border-white">
        {number}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={course?.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="p-2 sm:p-4 max-w-2xl md:max-w-4xl mx-auto bg-gradient-to-br from-blue-50 via-green-50 to-purple-100 rounded-3xl shadow-2xl border-4 border-blue-200/40"
      >
        {/* Botón para volver a TeacherCourses */}
        <div className="mb-4 flex justify-start">
          <Link
            to="/teacher/courses"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-5 py-2 rounded-xl font-bold text-base shadow-lg hover:from-blue-700 hover:to-emerald-600 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200 animate-fade-in-up"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            Volver a mis cursos
          </Link>
        </div>
        <div className="flex flex-col items-center mb-4">
          <motion.img
            src={logo1}
            alt="Logo decorativo"
            className="w-20 h-20 mb-2 animate-bounce-slow drop-shadow-xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          />
          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold mb-4 text-center bg-gradient-to-r from-blue-700 via-green-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-xl animate-gradient-x"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {course.title}
          </motion.h1>
        </div>
        {/* Botón y formulario de edición de info general */}
        {isOwner && !showEditCourse && (
          <div className="flex justify-end gap-2 mb-2">
            <button
              className="bg-purple-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-purple-600 shadow"
              onClick={() => setShowPaymentConfig(true)}
            >
              {course.isPaidCourse ? 'Editar Configuración de Pago' : 'Configurar Pago'}
            </button>
            <button
              className="bg-yellow-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-yellow-600 shadow"
              onClick={() => setShowEditCourse(true)}
            >
              Editar información del curso
            </button>
          </div>
        )}
        {isOwner && showEditCourse && (
          <form
            onSubmit={handleEditCourseSubmit}
            className="mb-6 border-2 border-yellow-200 bg-yellow-50 rounded-xl p-6 shadow-md"
          >
            <h3 className="text-lg font-bold mb-2 text-yellow-800">Editar información general del curso</h3>
            <input
              type="text"
              name="title"
              placeholder="Título del curso"
              value={editCourseForm.title}
              onChange={handleEditCourseChange}
              className="w-full mb-3 p-3 border-2 border-yellow-200 rounded-xl focus:outline-none focus:border-yellow-400 text-lg shadow-sm"
              required
            />
            <input
              type="text"
              name="videoUrl"
              placeholder="URL del video principal"
              value={editCourseForm.videoUrl}
              onChange={handleEditCourseChange}
              className="w-full mb-3 p-3 border-2 border-yellow-200 rounded-xl focus:outline-none focus:border-yellow-400 text-lg shadow-sm"
              required
            />
            <textarea
              name="description"
              placeholder="Descripción del curso"
              value={editCourseForm.description}
              onChange={handleEditCourseChange}
              className="w-full mb-3 p-3 border-2 border-yellow-200 rounded-xl focus:outline-none focus:border-yellow-400 text-lg shadow-sm"
              required
              rows={3}
            ></textarea>
            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50"
                disabled={editCourseLoading}
              >
                {editCourseLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button
                type="button"
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-400"
                onClick={() => setShowEditCourse(false)}
              >
                Cancelar
              </button>
            </div>
            {editCourseMsg && <div className={`mt-2 text-center font-semibold ${editCourseMsg.startsWith('Error') ? 'text-red-600' : 'text-green-700'}`}>{editCourseMsg}</div>}
          </form>
        )}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3 w-full mb-4 md:mb-0">
            <EnrolledStudentsList students={enrolledStudents} />
            {/* Estadísticas de pagos para docentes */}
            {isOwner && course.isPaidCourse && (
              <div className="mt-6">
                <PaymentStats courseId={id} />
              </div>
            )}
          </div>
          <div className="flex-1 w-full">
            <motion.div
              className="aspect-video mb-4 rounded-3xl border-4 border-green-200 shadow-2xl bg-white/80 flex items-center justify-center overflow-hidden animate-fade-in"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {mainVideoUrl ? (
                <iframe
                  src={mainVideoUrl}
                  title={course.title}
                  style={{ border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-2xl shadow-lg border-none"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-200 via-blue-100 to-green-100 rounded-2xl text-gray-500 font-bold text-xl animate-pulse">
                  Sin video principal
                </div>
              )}
            </motion.div>
            <motion.p
              className="mb-8 text-lg sm:text-xl text-center text-gray-700 font-medium animate-fade-in-slow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {course.description}
            </motion.p>

            {/* Información de pago del curso */}
            {course.isPaidCourse && (
              <motion.div
                className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">💰</span>
                  <h3 className="text-lg font-bold text-purple-800">Curso con Contenido Premium</h3>
                </div>
                <div className="text-purple-700 space-y-1">
                  <p><strong>Precio:</strong> ${course.price || 29.99}</p>
                  <p><strong>Lecciones gratuitas:</strong> {course.paidFromLesson ? course.paidFromLesson - 1 : 0} de {course.lessons.length}</p>
                  <p><strong>Lecciones premium:</strong> {course.paidFromLesson ? course.lessons.length - course.paidFromLesson + 1 : course.lessons.length} de {course.lessons.length}</p>
                </div>
              </motion.div>
            )}

            {/* Sección de lecciones */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-3xl font-extrabold mb-4 text-green-700 border-b-2 border-green-200 pb-2 animate-gradient-x bg-gradient-to-r from-blue-600 via-green-500 to-purple-600 bg-clip-text text-transparent drop-shadow">Lecciones del curso</h2>
              {isOwner && lessons.length === 0 && !showForm && (
                <div className="flex flex-col items-center my-8">
                  <p className="mb-4 text-gray-600">Aún no hay lecciones en este curso.</p>
                  <button
                    className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 shadow"
                    onClick={() => { setShowForm(true); setEditingIndex(null); }}
                  >
                    Crear primera lección
                  </button>
                </div>
              )}
              {isOwner && lessons.length > 0 && !showForm && (
                <div className="flex flex-col items-center my-8">
                  <button
                    className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 shadow"
                    onClick={() => { setShowForm(true); setEditingIndex(null); }}
                  >
                    Agregar otra lección
                  </button>
                </div>
              )}
              {isOwner && showForm && (
                <>
                  <motion.div
                    className="mb-8 border-4 border-green-300 bg-green-50 rounded-2xl p-4 sm:p-6 shadow-xl w-full max-w-xl mx-auto animate-fade-in-up"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-lg font-bold mb-2 text-green-800">{editingIndex === null ? 'Crear lección' : `Editar lección #${lessonForm.order}`}</h3>
                    <form onSubmit={handleAddOrUpdateLesson} className="flex flex-col gap-3">
                      <input
                        type="text"
                        name="title"
                        placeholder="Título"
                        value={lessonForm.title}
                        onChange={handleLessonChange}
                        className="p-3 border-2 border-green-400 rounded-xl focus:outline-none focus:border-green-600 text-lg shadow-sm"
                        required
                      />
                      <input
                        type="text"
                        name="videoUrl"
                        placeholder="URL del video"
                        value={lessonForm.videoUrl}
                        onChange={handleLessonChange}
                        className="p-3 border-2 border-green-400 rounded-xl focus:outline-none focus:border-green-600 text-lg shadow-sm"
                        required
                      />
                      <textarea
                        name="description"
                        placeholder="Descripción de la lección"
                        value={lessonForm.description}
                        onChange={handleLessonChange}
                        className="p-3 border-2 border-green-400 rounded-xl focus:outline-none focus:border-green-600 text-lg shadow-sm"
                        required
                        rows={2}
                      ></textarea>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl font-bold transition text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 shadow-lg"
                      >
                        {editingIndex === null ? 'Crear lección' : 'Actualizar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowForm(false); setEditingIndex(null); setLessonForm({ order: lessons.length + 1, title: '', description: '', videoUrl: '' }); }}
                        className="text-sm text-gray-600 hover:underline mt-2"
                      >
                        Cancelar
                      </button>
                    </form>
                  </motion.div>
                  <motion.button
                    type="button"
                    className="px-4 py-2 rounded-xl font-bold transition text-white bg-yellow-500 hover:bg-yellow-600 mt-2"
                    onClick={() => setShowQuizForm((v) => !v)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {showQuizForm ? 'Ocultar Quiz' : 'Agregar Quiz'}
                  </motion.button>
                  {showQuizForm && (
                    <motion.div
                      className="mt-4 border-2 border-yellow-200 bg-yellow-50 rounded-xl p-4 shadow-md"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h4 className="text-lg font-bold mb-2 text-yellow-800">Crear Quiz para la lección</h4>
                      <input
                        type="text"
                        name="title"
                        placeholder="Título del quiz"
                        value={quizForm.title}
                        onChange={handleQuizInputChange}
                        className="p-2 border-2 border-yellow-300 rounded-lg w-full mb-2"
                      />
                      <div className="mb-2">
                        <input
                          type="text"
                          placeholder="Pregunta"
                          value={currentQuestion.questionText}
                          onChange={e => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                          className="p-2 border border-yellow-300 rounded-lg w-full mb-2"
                        />
                        {currentQuestion.options.map((opt, idx) => (
                          <input
                            key={idx}
                            type="text"
                            placeholder={`Opción ${idx + 1}`}
                            value={opt}
                            onChange={e => handleQuestionInputChange(e, idx)}
                            name="options"
                            className="p-2 border border-yellow-200 rounded-lg w-full mb-1"
                          />
                        ))}
                        <button type="button" className="text-sm text-blue-600 hover:underline" onClick={handleAddOption}>+ Agregar opción</button>
                        <input
                          type="text"
                          placeholder="Respuesta correcta"
                          value={currentQuestion.correctAnswer}
                          onChange={e => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                          className="p-2 border border-yellow-300 rounded-lg w-full mt-2"
                        />
                        <button type="button" className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" onClick={handleAddQuestion}>Agregar pregunta</button>
                      </div>
                      <div className="mt-2">
                        {quizForm.questions.map((q, idx) => (
                          <div key={idx} className="mb-2 p-2 bg-white rounded shadow flex justify-between items-center">
                            <span>{q.questionText}</span>
                            <button type="button" className="text-red-500 ml-2" onClick={() => handleRemoveQuestion(idx)}>Eliminar</button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
              <motion.div
                className="grid gap-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson, idx) => (
                    <motion.div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 flex flex-col gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                    >
                      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                        <LessonNumber number={lesson.order} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-green-800">{lesson.title}</span>
                            {course.isPaidCourse && course.paidFromLesson && lesson.order >= course.paidFromLesson && (
                              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-semibold">
                                🔒 Premium
                              </span>
                            )}
                            {course.isPaidCourse && course.paidFromLesson && lesson.order < course.paidFromLesson && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                                ✅ Gratis
                              </span>
                            )}
                          </div>
                          <span className="block text-gray-600 mt-1">{lesson.description}</span>
                        </div>
                        {isOwner && (
                          <div className="flex gap-2 ml-auto">
                            <button
                              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                              onClick={() => handleEditLesson(idx)}
                            >
                              Editar
                            </button>
                            <button
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                              onClick={() => handleOpenStudentView(idx)}
                            >
                              Abrir
                            </button>
                            <button
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                              onClick={() => handleDeleteLesson(idx)}
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                        {!isOwner && (
                          <div className="flex gap-2 ml-auto">
                            <button
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                              onClick={() => handleOpenStudentView(idx)}
                            >
                              Abrir
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </motion.div>
            </motion.div>
            {message && <motion.div className="mt-4 text-green-700 font-semibold text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{message}</motion.div>}
          </div>
        </div>
      </motion.div>
      {/* Animaciones personalizadas para el diseño */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-bounce-slow { animation: bounce-slow 2.5s infinite; }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 3s ease-in-out infinite; }
        .animate-fade-in-slow { animation: fade-in 1.5s cubic-bezier(0.4,0,0.2,1); }
        .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(0.4,0,0.2,1); }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </AnimatePresence>
  );
}
