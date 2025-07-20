import React from 'react';
import { Link, useParams } from 'react-router-dom';

const EnrolledStudentsList = ({ students }) => {
  const { id: courseId } = useParams();
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4">
      <h3 className="text-lg font-bold mb-2">Estudiantes inscritos</h3>
      <ul className="space-y-2">
        {students.length === 0 ? (
          <li className="text-gray-500">No hay estudiantes inscritos aún.</li>
        ) : (
          students.map(student => (
            <li key={student.id} className="font-semibold text-gray-700 flex items-center justify-between gap-2">
              <span>{student.name}</span>
              <Link
                to={`/courses/${courseId}/students/${student.id}/statistics`}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
              >
                Ver estadísticas
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default EnrolledStudentsList; 