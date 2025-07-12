import React from 'react';
import CourseCard from './CourseCard';

export default function CourseList({ courses }) {
  if (!courses || courses.length === 0) {
    return <p>No hay cursos para mostrar.</p>;
  }
  return (
    <div>
      {courses.map(course => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  );
} 