import React from 'react';

export default function EnrollButton({ courseId, onEnroll }) {
  return (
    <button onClick={() => onEnroll(courseId)} className="bg-blue-600 text-white px-4 py-2 rounded">
      Inscribirse
    </button>
  );
} 