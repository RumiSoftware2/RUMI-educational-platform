// src/pages/MyCourses.jsx
import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function MyCourses() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (user) {
      api.get(`/courses?teacher=${user.id}`)
         .then(res => setCourses(res.data))
         .catch(console.error);
    }
  }, [user]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Mis cursos</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {courses.map(c => (
          <div key={c._id} className="border rounded p-4 shadow">
            <h3 className="font-bold">{c.title}</h3>
            <p>{c.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
