import React, { useEffect, useState } from 'react';
import { getEnrolledCourses } from '../services/api';
import CourseList from '../components/CourseList';

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getEnrolledCourses()
      .then(res => setCourses(res.data))
      .catch(err => setError('Error al cargar cursos'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Mis Cursos Inscritos</h1>
      <CourseList courses={courses} />
    </div>
  );
} 