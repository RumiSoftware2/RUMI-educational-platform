import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEnrolledCourses, leaveCourse } from '../services/api';
import ChangePasswordModal from '../components/ChangePasswordModal';
import logo2 from '../assets/logo2zeus.png';
import CourseSearchBar from '../components/CourseSearchBar';

// Función para extraer el ID de YouTube y devolver la miniatura (igual que TeacherCourses.jsx)
function getYoutubeThumbnail(url) {
  if (!url) return null;
  // Formato largo
  let match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([\w-]+)/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  // Formato corto
  match = url.match(/(?:https?:\/\/)?youtu\.be\/([\w-]+)/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  // Formato embed (mejorado: solo el ID antes de ?)
  match = url.match(/youtube\.com\/embed\/([\w-]+)/);
  if (match) {
    const videoId = match[1].split('?')[0];
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return null;
}

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const messageRef = useRef(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const navigate = useNavigate();
  const courseRefs = useRef({});

  useEffect(() => {
    getEnrolledCourses()
      .then(res => setCourses(res.data))
      .catch(err => setError('Error al cargar cursos'))
      .finally(() => setLoading(false));
  }, []);

  const handleLeaveCourse = async (courseId) => {
    if (!window.confirm('¿Seguro que quieres abandonar este curso?')) return;
    try {
      await leaveCourse(courseId);
      setCourses(courses.filter(c => c._id !== courseId));
      setMessage('Has abandonado el curso.');
      setTimeout(() => {
        if (messageRef.current) {
          messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      setTimeout(() => {
        setMessage('');
      }, 2000);
    } catch (err) {
      setMessage('Error al abandonar el curso');
      setTimeout(() => {
        if (messageRef.current) {
          messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      setTimeout(() => {
        setMessage('');
      }, 2000);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div></div>;
  if (error) return <p className="p-6 text-center text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-100 to-purple-200 py-8 px-2">
      <div className="flex flex-col items-center mb-8">
        <img src={logo2} alt="Logo RUMI" className="w-24 h-24 object-contain rounded-2xl shadow-lg mb-2 animate-pulse" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 drop-shadow mb-1 text-center">Mis Cursos Inscritos</h1>
      </div>
      {/* Barra de búsqueda reutilizable */}
      <CourseSearchBar courses={courses} courseRefs={courseRefs} placeholder="Buscar en mis cursos..." />
      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-6 gap-4">
        <button
          onClick={() => setShowChangePassword(true)}
          className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-5 py-3 rounded-xl hover:from-blue-700 hover:to-emerald-600 transition font-bold text-lg shadow-lg animate-bounce"
        >
          🔐 Cambiar Contraseña
        </button>
      </div>
      {message && (
        <div
          ref={messageRef}
          className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-green-400 via-blue-200 to-yellow-200 border-4 border-green-600 shadow-2xl rounded-3xl px-8 py-6 text-center text-2xl font-extrabold text-green-900 animate-pulse flex flex-col items-center gap-2"
          style={{ maxWidth: 480 }}
        >
          <span className="text-4xl">{message.startsWith('Error') ? '❌' : '👋'}</span>
          {message}
        </div>
      )}
      {courses.length === 0 ? (
        <div className="text-center text-gray-500 mt-12">No estás inscrito en ningún curso.</div>
      ) : (
        <div className="grid gap-6 max-w-md md:max-w-2xl mx-auto">
          {courses.map(course => {
            const thumb = getYoutubeThumbnail(course.videoUrl);
            return (
              <div
                key={course._id}
                ref={el => courseRefs.current[course._id] = el}
                className="group bg-white/90 border border-blue-200 rounded-3xl shadow-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:scale-105 hover:shadow-2xl transition-transform duration-300 relative overflow-hidden"
              >
                {thumb && (
                  <img
                    src={thumb}
                    alt={course.title}
                    className="w-32 h-20 md:w-40 md:h-24 object-cover rounded-xl shadow-md mb-3 md:mb-0 md:mr-4 flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-blue-800 truncate drop-shadow mb-1">{course.title}</h2>
                  <p className="text-gray-600 mt-1 line-clamp-2">{course.description}</p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                  <button
                    className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-5 py-2 rounded-xl font-bold hover:from-blue-700 hover:to-emerald-600 transform hover:scale-105 transition-all duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                    onClick={() => navigate(`/student/course/${course._id}`)}
                  >
                    Abrir
                  </button>
                  <button
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2 rounded-xl font-bold hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-red-200"
                    onClick={() => handleLeaveCourse(course._id)}
                  >
                    Abandonar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Modal de cambio de contraseña */}
      <ChangePasswordModal 
        isOpen={showChangePassword} 
        onClose={() => setShowChangePassword(false)} 
      />
    </div>
  );
} 