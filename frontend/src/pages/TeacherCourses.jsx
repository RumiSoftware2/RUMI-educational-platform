import React, { useEffect, useState } from 'react';
import { getMyCourses } from '../services/api';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

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

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Mis Cursos como Docente</h1>
        <Link
          to="/courses/new"
          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition font-semibold text-center"
        >
          + Crear nuevo curso
        </Link>
      </div>
      {message && <div className="mb-4 text-green-700 font-semibold">{message}</div>}
      <div className="grid gap-4">
        {courses.map(course => (
          <div key={course._id} className="border rounded p-4 shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-bold text-lg mb-1">{course.title}</h2>
              <p className="mb-2 text-gray-700">{course.description}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link
                to={`/courses/${course._id}`}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Modificar
              </Link>
              <button
                onClick={() => handleDelete(course._id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 