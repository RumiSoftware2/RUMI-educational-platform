import React from 'react';

export default function CourseCard({ course }) {
  if (!course) return null;
  return (
    <div className="border rounded p-4 mb-2">
      <h3 className="font-bold">{course.title}</h3>
      <p>{course.description}</p>
      {/* Aquí irán botones y acciones según el rol */}
    </div>
  );
} 