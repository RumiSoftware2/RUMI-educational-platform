// frontend/src/pages/Profile.jsx
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, token, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Si prefieres usar el contexto directamente, puedes comentar este fetch
    api.get('/users/me')
      .then(res => setProfile(res.data))
      .catch(err => {
        console.error(err);
        // si token inválido, cerrar sesión
        if (err.response?.status === 401) logout();
      });
  }, [logout]);

  // Mientras carga
  if (!profile) {
    return <div className="p-4">Cargando perfil...</div>;
  }

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>
      <div className="mb-2">
        <span className="font-semibold">Nombre:</span> {profile.name}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Correo:</span> {profile.email}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Rol:</span> {profile.role}
      </div>
      <button
        onClick={logout}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}
