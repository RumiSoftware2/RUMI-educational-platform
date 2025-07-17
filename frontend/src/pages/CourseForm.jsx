// src/pages/CourseForm.jsx
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import logo2 from '../assets/logo2zeus.png';

const CourseForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    description: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    // Transformar la URL a formato embed si es de YouTube
    let videoUrl = toYoutubeEmbed(formData.videoUrl);
    try {
      // Usar la API centralizada, el token se añade automáticamente
      const res = await api.post('/courses', { ...formData, videoUrl });
      setMessage('✅ Curso creado exitosamente');
      setFormData({ title: '', videoUrl: '', description: '' });
      // Opcional: redirigir después de un tiempo
      setTimeout(() => navigate('/teacher/courses'), 1200);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Acceso denegado</h2>
          <p>Solo docentes o administradores pueden crear cursos.</p>
          <Link to="/" className="text-blue-600 hover:underline mt-4 block">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-purple-200 py-12">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-xl border border-green-200 px-8 py-10 md:px-12 md:py-12"
      >
        <div className="flex flex-col items-center mb-8">
          <img
            src={logo2}
            alt="Logo de RUMI"
            className="w-24 h-24 object-contain rounded-2xl shadow-lg mb-4 animate-pulse"
          />
          <h2 className="text-3xl font-extrabold mb-2 text-green-700 text-center drop-shadow">Crear nuevo curso</h2>
          <p className="text-gray-600 text-center max-w-md">Completa la información para crear un curso atractivo y útil para tus estudiantes.</p>
        </div>

        <input
          type="text"
          name="title"
          placeholder="Título del curso"
          value={formData.title}
          onChange={handleChange}
          className="w-full mb-4 p-4 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 text-lg shadow-sm bg-white/80"
          required
        />

        <input
          type="text"
          name="videoUrl"
          placeholder="URL del video de YouTube"
          value={formData.videoUrl}
          onChange={handleChange}
          className="w-full mb-2 p-4 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 text-lg shadow-sm bg-white/80"
          required
        />
        <p className="text-sm text-green-700 mb-4">Este será el video principal o de introducción del curso.</p>

        <textarea
          name="description"
          placeholder="Descripción del curso"
          value={formData.description}
          onChange={handleChange}
          className="w-full mb-4 p-4 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 text-lg shadow-sm bg-white/80"
          required
          rows={4}
        ></textarea>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Creando curso...' : 'Crear curso'}
        </button>

        {message && <p className={`mt-6 text-center text-lg font-semibold ${message.startsWith('✅') ? 'text-green-700' : 'text-red-600'}`}>{message}</p>}

        <Link
          to="/teacher/courses"
          className="block mt-8 text-center bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-bold text-lg shadow-md"
        >
          ← Volver a Mis cursos
        </Link>
      </form>
    </div>
  );
};

export default CourseForm;
