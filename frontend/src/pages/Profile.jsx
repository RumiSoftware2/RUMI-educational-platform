// frontend/src/pages/Profile.jsx
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import BankAccountForm from '../components/BankAccountForm';

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
    <div className="max-w-4xl mx-auto mt-8 p-6 space-y-8">
      {/* Sección de Perfil */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-green-200">
        <h1 className="text-3xl font-bold mb-6 text-green-700">👤 Mi Perfil</h1>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="font-semibold text-gray-700">Nombre:</span>
            <span className="text-gray-900">{profile.name}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="font-semibold text-gray-700">Correo:</span>
            <span className="text-gray-900">{profile.email}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="font-semibold text-gray-700">Rol:</span>
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
              {profile.role === 'docente' ? '👨‍🏫 Docente' : profile.role === 'estudiante' ? '👨‍🎓 Estudiante' : '👨‍💼 Admin'}
            </span>
          </div>
        </div>
      </div>

      {/* Mostrar BankAccountForm solo para docentes */}
      {profile.role === 'docente' && (
        <BankAccountForm />
      )}

      <button
        onClick={logout}
        className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold text-lg transition shadow-md"
      >
        🚪 Cerrar Sesión
      </button>
    </div>
  );
}
