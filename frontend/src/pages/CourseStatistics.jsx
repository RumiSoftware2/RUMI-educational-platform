import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseStatistics } from '../services/api';

export default function CourseStatistics() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCourseStatistics(id)
      .then(res => setStats(res.data))
      .catch(err => setError('Error al cargar estadísticas'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Estadísticas del Curso</h1>
      <div>
        {!stats ? (
          <p>No hay estadísticas disponibles.</p>
        ) : (
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        )}
      </div>
    </div>
  );
} 