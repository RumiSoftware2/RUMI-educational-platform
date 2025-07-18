import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api, { enrollInCourse } from '../services/api';
import logo3 from '../assets/logo3zeus.png';

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
      <div className="flex flex-col items-center mb-8">
        <img src={logo3} alt="Logo RUMI" className="w-28 h-28 object-contain rounded-2xl shadow-lg mb-2 animate-bounce" />
        <h1 className="text-4xl font-extrabold text-green-700 drop-shadow mb-1 text-center">Explora los Cursos</h1>
        <p className="text-gray-600 text-center max-w-xl">Descubre cursos disponibles y aprende a tu ritmo. ¡Inscríbete y comienza tu aprendizaje!</p>
      </div>
      {message && <div className="max-w-2xl mx-auto mb-4 text-center text-lg font-semibold animate-pulse text-green-700 bg-white/80 rounded-xl py-2 shadow">{message}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl md:max-w-4xl mx-auto">
        {courses.map(c => {
          const thumb = getYoutubeThumbnail(c.videoUrl);
          return (
            <div
              key={c._id}
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
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-2xl font-bold"
              onClick={() => setShowVideo(false)}
            >
              ×
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
    </div>
  );
}
