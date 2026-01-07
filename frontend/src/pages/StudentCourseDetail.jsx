import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import LessonQuiz from '../components/LessonQuiz';
import PaymentButton from '../components/PaymentButton';
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
  const [hasPaid, setHasPaid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      try {
        const res = await api.get(`/courses/${courseId}`);
        setCourse(res.data);
        setLessons(res.data.lessons || []);

        // Verificar si el estudiante ha pagado (si es un curso de pago)
        if (res.data.isPaid) {
          try {
            const paymentRes = await api.get(`/payments/courses/${courseId}/has-paid`);
            setHasPaid(paymentRes.data.hasPaid);
          } catch (paymentErr) {
            console.error('Error al verificar pago:', paymentErr);
            setHasPaid(false);
          }
        } else {
          setHasPaid(true); // Cursos gratuitos siempre son accesibles
        }
      } catch (err) {
        setError('Error al cargar el curso');
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
    
    // Refresca el estado de pago cada 2 segundos si es un curso de pago
    const interval = setInterval(() => {
      if (course?.isPaid) {
        api.get(`/payments/courses/${courseId}/has-paid`)
          .then(res => setHasPaid(res.data.hasPaid))
          .catch(err => console.error('Error verificando pago:', err));
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [courseId]);

  useEffect(() => {
    setVideoWatched(false);
    setProgressMsg('');
  }, [currentLessonIdx]);

  if (loading) return <div className="p-4">Cargando curso...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!course) return <div className="p-4">Curso no encontrado.</div>;

  // VALIDACIÓN: Si es curso de pago y NO ha pagado, SIEMPRE mostrar pantalla de pago (incluso si intenta acceder a lecciones)
  if (course.isPaid && !hasPaid) {
    return (
      <AnimatePresence>
        <motion.div
          key="intro-paid"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#0a2342] via-[#2ca6e0] to-[#ffd700] py-12 px-2 animate-fade-in"
        >
          <div className="max-w-3xl w-full bg-white/90 rounded-3xl shadow-2xl border border-[#2ca6e0]/20 p-6 md:p-12 flex flex-col items-center animate-fade-in">
            {/* Botón para volver a Mis Cursos */}
            <div className="flex justify-start mb-4 w-full">
              <button
                onClick={() => navigate('/student/courses')}
                className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg hover:from-blue-600 hover:to-emerald-600 transition-all duration-300"
              >
                ← Volver a Mis Cursos
              </button>
            </div>
            <div className="flex flex-col items-center mb-4 w-full">
              <motion.img
                src={logo2}
                alt="Logo decorativo"
                className="w-16 h-16 mb-2 animate-bounce"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              />
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-center bg-gradient-to-r from-green-700 via-blue-400 to-yellow-400 bg-clip-text text-transparent drop-shadow animate-gradient-x animate-pulse" style={{ backgroundSize: '200% 200%' }}>
                {course.title}
              </h1>
              <p className="text-lg md:text-xl text-center text-gray-700 mb-4 animate-fade-in-slow animate-pulse">Aquí puedes ver una vista previa del curso. Paga para obtener acceso completo.</p>
            </div>
            {/* Modern video container - Solo video de introducción */}
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
            
            {/* Mostrar PaymentButton */}
            <PaymentButton 
              courseId={courseId} 
              courseName={course.title}
              price={course.price}
              currency={course.currency}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

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
          className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#0a2342] via-[#2ca6e0] to-[#ffd700] py-12 px-2 animate-fade-in"
        >
          <div className="max-w-3xl w-full bg-white/90 rounded-3xl shadow-2xl border border-[#2ca6e0]/20 p-6 md:p-12 flex flex-col items-center animate-fade-in">
            {/* Botón para volver a Mis Cursos */}
            <div className="flex justify-start mb-4 w-full">
              <button
                onClick={() => navigate('/student/courses')}
                className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg hover:from-blue-600 hover:to-emerald-600 transition-all duration-300"
              >
                ← Volver a Mis Cursos
              </button>
            </div>
            <div className="flex flex-col items-center mb-4 w-full">
              <motion.img
                src={logo2}
                alt="Logo decorativo"
                className="w-16 h-16 mb-2 animate-bounce"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              />
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-center bg-gradient-to-r from-green-700 via-blue-400 to-yellow-400 bg-clip-text text-transparent drop-shadow animate-gradient-x animate-pulse" style={{ backgroundSize: '200% 200%' }}>
                {course.title}
              </h1>
              <p className="text-lg md:text-xl text-center text-gray-700 mb-4 animate-fade-in-slow animate-pulse">Bienvenido a tu curso, explora el video introductorio y comienza a aprender.</p>
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
            
            {/* Mostrar PaymentButton si es curso de pago y no ha pagado */}
            {course.isPaid && !hasPaid && (
              <PaymentButton 
                courseId={courseId} 
                courseName={course.title}
                price={course.price}
                currency={course.currency}
              />
            )}

            {/* Mostrar botón de comenzar solo si tiene acceso */}
            {hasPaid && lessons.length > 0 ? (
              <div className="flex justify-center mt-6">
                <motion.button
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gradient-to-r from-green-600 to-blue-400 text-white px-6 py-3 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-green-500 shadow-lg transition-all duration-300"
                      onClick={() => {
                        // Previene el acceso a lecciones si es curso de pago y no ha pagado
                        if (course.isPaid && !hasPaid) {
                          // Alentar al usuario a pagar: deslizar a la sección de pago
                          const payBtn = document.querySelector('.rumi-payment-focus');
                          if (payBtn) payBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          return;
                        }
                        setShowIntro(false);
                      }}
                >
                  Comenzar lecciones
                </motion.button>
              </div>
            ) : (
              hasPaid ? (
              // Si ya tiene acceso pero no hay lecciones
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
              ) : (
              // Si no tiene acceso porque no pagó y es un curso de pago
              null
            )
            )}
          </div>
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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a2342] via-[#2ca6e0] to-[#ffd700] flex flex-col py-8 px-2 animate-fade-in">
      {/* Botón para volver a Mis Cursos */}
      <div className="flex justify-start mb-4 max-w-5xl mx-auto w-full">
        <button
          onClick={() => navigate('/student/courses')}
          className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg hover:from-blue-600 hover:to-emerald-600 transition-all duration-300"
        >
          ← Volver a Mis Cursos
        </button>
      </div>
      <div className="max-w-5xl mx-auto w-full bg-white/90 rounded-3xl shadow-2xl border border-[#2ca6e0]/20 p-4 md:p-12 flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* Video y descripción */}
          <div className="flex-1 flex flex-col gap-4">
            <motion.h2
              className="text-2xl font-bold mb-2 text-center md:text-left bg-gradient-to-r from-yellow-500 via-blue-400 to-green-400 bg-clip-text text-transparent drop-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {lesson.title}
            </motion.h2>
                         <motion.div
               className="aspect-video flex items-center justify-center bg-gradient-to-br from-blue-100 via-green-100 to-yellow-100 rounded-2xl shadow-xl border-4 border-transparent bg-clip-padding relative overflow-hidden"
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
                 className="w-full h-full rounded-xl shadow-lg"
                 onLoad={() => {}}
                 onEnded={handleVideoEnded}
               />
             </motion.div>
            <p className="mb-2 text-gray-700 text-center md:text-left animate-fade-in-slow">{lesson.description}</p>
            
            <div className="flex gap-2 justify-center md:justify-start mt-2">
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
                         {progressMsg && <motion.div className="mt-2 mb-2 text-green-700 font-semibold text-center md:text-left animate-fade-in" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{progressMsg}</motion.div>}
           </div>
          {/* Quiz */}
          <motion.div
            className="flex-1 flex flex-col justify-center md:justify-start md:items-center bg-gradient-to-br from-yellow-50 via-blue-50 to-green-50 rounded-2xl shadow-lg border border-[#ffd700]/30 p-4 animate-fade-in-slow"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
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
            {!lesson.quiz && videoWatched && <span className="block mt-2 text-green-700 font-semibold">¡Has completado la lección!</span>}
          </motion.div>
        </div>
        
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
      </div>
    </div>
  );
} 