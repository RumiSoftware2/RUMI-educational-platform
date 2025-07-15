import React from 'react';

const EnrolledStudentsList = ({ students }) => (
  <div className="bg-white rounded-xl shadow-md p-4 mb-4">
    <h3 className="text-lg font-bold mb-2">Estudiantes inscritos</h3>
    <ul className="space-y-2">
      {students.length === 0 ? (
        <li className="text-gray-500">No hay estudiantes inscritos aún.</li>
      ) : (
        students.map(student => (
          <li key={student.id} className="font-semibold text-gray-700">
            {student.name}
          </li>
        ))
      )}
    </ul>
  </div>
);

export default EnrolledStudentsList; 