import { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api, { enrollInCourse } from '../services/api';
import logo3 from '../assets/logo3zeus.png';
import CourseSearchBar from '../components/CourseSearchBar';

// Función mejorada para extraer el ID de YouTube y devolver la miniatura (igual que TeacherCourses.jsx)
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

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const { user } = useContext(AuthContext);
  const [showVideo, setShowVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  // Referencias para cada curso
  const courseRefs = useRef({});

  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data))
      .catch(() => setError('Error al cargar cursos'))
      .finally(() => setLoading(false));
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await enrollInCourse(courseId);
      setMessage('Inscripción exitosa');
      api.get('/courses')
        .then(res => setCourses(res.data));
    } catch (err) {
      setMessage('Error al inscribirse o ya estás inscrito');
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div></div>;
  if (error) return <p className="text-red-600 text-center mt-8">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-200 py-8 px-2">
      {/* Barra de búsqueda pública reutilizable */}
      <CourseSearchBar courses={courses} courseRefs={courseRefs} placeholder="Buscar curso..." />
      {/* Vista pública animada para usuarios no logueados */}
      {!user && (
        <>
          <div className="relative flex flex-col items-center mb-6 animate-fade-in-down">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-tr from-blue-300 via-purple-200 to-green-200 rounded-full blur-2xl opacity-60 z-0 animate-pulse"></div>
            <div className="z-10 bg-white/90 border border-blue-200 rounded-xl px-6 py-4 shadow-lg flex flex-col items-center gap-2">
              <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-500 to-purple-600 animate-text-gradient">Bienvenido a RUMI Cursos</span>
              <span className="text-lg text-blue-700 font-semibold">Si quieres inscribirte en algún curso, inicia sesión</span>
              <a
                href="/login"
                className="mt-2 bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-6 py-2 rounded-xl font-bold text-base shadow-lg hover:from-blue-700 hover:to-emerald-600 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200 animate-bounce"
              >
                Iniciar sesión
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center mb-8 animate-fade-in-up">
            <img src={logo3} alt="Logo RUMI" className="w-32 h-32 object-contain rounded-2xl shadow-lg mb-2 animate-bounce-slow" />
            <h1 className="text-5xl font-extrabold text-green-700 drop-shadow mb-1 text-center animate-gradient-x bg-gradient-to-r from-blue-600 via-green-500 to-purple-600 bg-clip-text text-transparent">Explora los Cursos</h1>
            <p className="text-gray-700 text-center max-w-xl text-lg font-medium animate-fade-in">Descubre cursos disponibles y aprende a tu ritmo. ¡Inscríbete y comienza tu aprendizaje!</p>
          </div>
        </>
      )}
      {/* Si está logueado, usa el diseño normal */}
      {user && (
        <div className="flex flex-col items-center mb-8">
          <img src={logo3} alt="Logo RUMI" className="w-28 h-28 object-contain rounded-2xl shadow-lg mb-2 animate-bounce" />
          <h1 className="text-4xl font-extrabold text-green-700 drop-shadow mb-1 text-center">Explora los Cursos</h1>
          <p className="text-gray-600 text-center max-w-xl">Descubre cursos disponibles y aprende a tu ritmo. ¡Inscríbete y comienza tu aprendizaje!</p>
        </div>
      )}
      {message && <div className="max-w-2xl mx-auto mb-4 text-center text-lg font-semibold animate-pulse text-green-700 bg-white/80 rounded-xl py-2 shadow">{message}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl md:max-w-4xl mx-auto">
        {courses.map(c => {
          const thumb = getYoutubeThumbnail(c.videoUrl);
          return (
            <div
              key={c._id}
              ref={el => courseRefs.current[c._id] = el}
              className="group bg-white/90 border border-green-200 rounded-3xl shadow-xl p-4 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden"
            >
              {thumb ? (
                <div className="w-full aspect-video rounded-xl overflow-hidden mb-3 shadow-md">
                  <img
                    src={thumb}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="w-full aspect-video flex items-center justify-center bg-gray-200 rounded-xl mb-3 text-gray-400">Sin video</div>
              )}
              <h3 className="font-extrabold text-xl text-green-800 mb-1 text-center drop-shadow">{c.title}</h3>
              <p className="text-gray-700 text-center mb-4 line-clamp-3">{c.description}</p>
              <div className="flex gap-2 w-full justify-center">
                <button
                  className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-6 py-2 rounded-xl font-bold text-base shadow-lg hover:from-blue-700 hover:to-emerald-600 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200 animate-bounce flex items-center gap-2"
                  onClick={() => { setShowVideo(true); setVideoUrl(c.videoUrl); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.25v13.5l13.5-6.75-13.5-6.75z" /></svg>
                  Ver
                </button>
                {/* Mostrar botón Inscribirse solo si el usuario está logueado y es estudiante */}
                {user && user.role === 'estudiante' && (
                  <button
                    className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-6 py-2 rounded-xl font-bold text-base shadow-lg hover:from-blue-700 hover:to-emerald-600 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200 animate-bounce"
                    onClick={() => handleEnroll(c._id)}
                  >
                    <span className="inline-block mr-2">🎓</span>Inscribirse
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Modal para ver video */}
      {showVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-2xl w-full relative flex flex-col items-center">
            <button
              className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-4xl font-extrabold shadow-lg border-4 border-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-300 z-50"
              onClick={() => setShowVideo(false)}
            >
              &times;
            </button>
            <div className="w-full aspect-video mb-4">
              <iframe
                src={videoUrl}
                title="Video introductorio"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
      {/* Animaciones Tailwind personalizadas */}
      <style jsx>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-fade-in-down { animation: fade-in-down 1s cubic-bezier(0.4,0,0.2,1); }
        .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(0.4,0,0.2,1); }
        .animate-bounce-slow { animation: bounce-slow 2.5s infinite; }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 3s ease-in-out infinite; }
        .animate-text-gradient { background-size: 200% 200%; animation: gradient-x 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
