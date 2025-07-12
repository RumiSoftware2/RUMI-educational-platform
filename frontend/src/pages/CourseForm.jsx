// src/pages/CourseForm.jsx
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    // Transformar la URL a formato embed si es de YouTube
    let videoUrl = formData.videoUrl;
    const ytMatch = videoUrl.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([\w-]+)/);
    if (ytMatch) {
      const videoId = ytMatch[1];
      const listMatch = videoUrl.match(/[?&]list=([\w-]+)/);
      videoUrl = `https://www.youtube.com/embed/${videoId}` + (listMatch ? `?list=${listMatch[1]}` : '');
    }
    // Si ya es embed o short, lo deja igual
    // (opcional: podrías agregar más validaciones para otros servicios)
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-green-200"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-green-700 text-center">Crear nuevo curso</h2>

        <input
          type="text"
          name="title"
          placeholder="Título del curso"
          value={formData.title}
          onChange={handleChange}
          className="w-full mb-4 p-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500"
          required
        />

        <input
          type="text"
          name="videoUrl"
          placeholder="URL del video de YouTube"
          value={formData.videoUrl}
          onChange={handleChange}
          className="w-full mb-4 p-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500"
          required
        />

        <textarea
          name="description"
          placeholder="Descripción del curso"
          value={formData.description}
          onChange={handleChange}
          className="w-full mb-4 p-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500"
          required
          rows={4}
        ></textarea>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-700 transition"
          disabled={loading}
        >
          {loading ? 'Creando curso...' : 'Crear curso'}
        </button>

        {message && <p className={`mt-6 text-center text-lg font-semibold ${message.startsWith('✅') ? 'text-green-700' : 'text-red-600'}`}>{message}</p>}

        <Link
          to="/teacher/courses"
          className="block mt-8 text-center bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
        >
          ← Volver a Mis cursos
        </Link>
      </form>
    </div>
  );
};

export default CourseForm;
