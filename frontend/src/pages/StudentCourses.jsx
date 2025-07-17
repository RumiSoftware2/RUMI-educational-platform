import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEnrolledCourses, leaveCourse } from '../services/api';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const navigate = useNavigate();

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
    } catch (err) {
      setMessage('Error al abandonar el curso');
    }
  };

  if (loading) return <p className="p-6 text-center">Cargando...</p>;
  if (error) return <p className="p-6 text-center text-red-600">{error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-blue-900 drop-shadow">Mis Cursos Inscritos</h1>
        <button
          onClick={() => setShowChangePassword(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition font-semibold"
        >
          🔐 Cambiar Contraseña
        </button>
      </div>
      {message && <div className="mb-4 text-green-700 font-semibold text-center animate-fade-in">{message}</div>}
      {courses.length === 0 ? (
        <div className="text-center text-gray-500 mt-12">No estás inscrito en ningún curso.</div>
      ) : (
        <div className="grid gap-6">
          {courses.map(course => (
            <div
              key={course._id}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:shadow-2xl transition"
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-blue-800 truncate">{course.title}</h2>
                <p className="text-gray-600 mt-1 line-clamp-2">{course.description}</p>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow"
                  onClick={() => navigate(`/courses/${course._id}`)}
                >
                  Abrir
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition shadow"
                  onClick={() => handleLeaveCourse(course._id)}
                >
                  Abandonar
                </button>
              </div>
            </div>
          ))}
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