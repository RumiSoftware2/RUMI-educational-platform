import React, { useEffect, useState, useRef } from 'react';
import { getMyCourses } from '../services/api';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ChangePasswordModal from '../components/ChangePasswordModal';
import logo1 from '../assets/logo1zeus.png';
import CourseSearchBar from '../components/CourseSearchBar';

// Función para extraer el ID de YouTube y devolver la miniatura
function getYoutubeThumbnail(url) {
  if (!url) return null;
  // Formato largo
  let match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([\w-]+)/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  // Formato corto
  match = url.match(/(?:https?:\/\/)?youtu\.be\/([\w-]+)/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  // Formato embed
  match = url.match(/youtube\.com\/embed\/([\w-]+)/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  return null;
}

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const courseRefs = useRef({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    setLoading(true);
    getMyCourses()
      .then(res => setCourses(res.data))
      .catch(err => setError('Error al cargar cursos'))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/courses/${id}`);
      setMessage('Curso eliminado correctamente');
      fetchCourses();
    } catch (err) {
      setMessage('Error al eliminar el curso');
    }
  };

  if (loading) return <p className="p-8 text-center animate-pulse text-lg">Cargando...</p>;
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-200 animate-fade-in">
      {/* Cabecera con logo y animación */}
      <div className="flex flex-col items-center mb-10 animate-fade-in-down">
        <img
          src={logo1}
          alt="Logo de RUMI"
          className="w-28 h-28 object-contain rounded-2xl shadow-lg mb-4 animate-pulse"
        />
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 drop-shadow mb-2 text-center">Mis Cursos como Docente</h1>
        <p className="text-gray-700 text-center max-w-xl">Gestiona, edita y elimina tus cursos. ¡Haz crecer tu biblioteca educativa!</p>
      </div>
      {/* Barra de búsqueda reutilizable */}
      <CourseSearchBar courses={courses} courseRefs={courseRefs} placeholder="Buscar en mis cursos..." />
      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-8 gap-4 animate-fade-in-up">
        <div className="flex gap-2">
          <Link
            to="/profile/change-name"
            className="bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition font-semibold shadow-md"
          >
            ✏️ Cambiar nombre de usuario
          </Link>
          <button
            onClick={() => setShowChangePassword(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition font-semibold shadow-md"
          >
            🔐 Cambiar Contraseña
          </button>
          <Link
            to="/courses/new"
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition font-semibold text-center shadow-md"
          >
            + Crear nuevo curso
          </Link>
        </div>
      </div>
      {message && <div className="mb-4 text-green-700 font-semibold text-center animate-fade-in">{message}</div>}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-md md:max-w-3xl mx-auto">
        {courses.map(course => {
          const thumbnail = getYoutubeThumbnail(course.videoUrl);
          return (
            <div key={course._id} ref={el => courseRefs.current[course._id] = el} className="bg-white/90 border rounded-2xl shadow-xl flex flex-col h-full hover:shadow-2xl transition-all duration-300 animate-fade-in-up">
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt="Miniatura del video"
                  className="w-full h-40 object-cover rounded-t-2xl"
                  loading="lazy"
                />
              )}
              <div className="flex-1 flex flex-col p-5">
                <h2 className="font-bold text-lg mb-1 text-blue-800 truncate">{course.title}</h2>
                <p className="mb-2 text-gray-700 line-clamp-3 flex-1">{course.description}</p>
                <div className="flex gap-2 mt-4">
                  <Link
                    to={`/courses/${course._id}`}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 font-semibold shadow"
                  >
                    Modificar
                  </Link>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-semibold shadow"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Modal de cambio de contraseña */}
      <ChangePasswordModal 
        isOpen={showChangePassword} 
        onClose={() => setShowChangePassword(false)} 
      />
      {/* Animaciones Tailwind personalizadas */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 1s ease; }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 1s ease; }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 1s ease; }
      `}</style>
    </div>
  );
} 