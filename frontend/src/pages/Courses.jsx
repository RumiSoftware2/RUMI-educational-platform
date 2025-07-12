import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api, { enrollInCourse } from '../services/api';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const { user } = useContext(AuthContext);

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
      // Opcional: recargar cursos para reflejar inscripción
      api.get('/courses')
        .then(res => setCourses(res.data));
    } catch (err) {
      setMessage('Error al inscribirse o ya estás inscrito');
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="grid md:grid-cols-3 gap-4 p-4">
      {message && <div className="col-span-3 text-green-600 mb-2">{message}</div>}
      {courses.map(c => (
        <div key={c._id} className="border rounded p-4 shadow">
          <h3 className="font-bold">{c.title}</h3>
          <p>{c.description}</p>
          {/* Si el usuario es estudiante, mostrar botón de inscripción */}
          {user && user.role === 'estudiante' && (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
              onClick={() => handleEnroll(c._id)}
            >
              Inscribirse
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
