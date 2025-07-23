import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function ProfileChangeName() {
  const { user, login } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/users/${user._id}`, { name });
      setSuccess('Nombre actualizado correctamente');
      // Actualizar contexto de usuario
      login(user.token, { ...user, name });
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      setError('Error al actualizar el nombre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-blue-100 to-green-100 px-4 py-8">
      <div className="bg-white/90 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-blue-200">
        <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-blue-600 via-green-500 to-yellow-500 bg-clip-text text-transparent">Cambiar nombre de usuario</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="font-semibold text-gray-700">Nombre actual</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="p-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 text-lg shadow-sm"
            required
          />
          {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
          {success && <div className="text-green-700 text-center font-semibold animate-pulse">{success}</div>}
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
        <button
          onClick={() => navigate('/profile')}
          className="mt-6 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300"
        >
          ← Volver al perfil
        </button>
      </div>
    </div>
  );
} 