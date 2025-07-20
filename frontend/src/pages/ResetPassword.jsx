import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo3zeus.png';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, code } = location.state || {};
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Si no hay email o code, redirigir al inicio del flujo
  if (!email || !code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-orange-100 to-yellow-200">
        <div className="bg-white/90 p-8 rounded-3xl shadow-2xl border border-white/30 max-w-md mx-auto text-center">
          <img src={logo} alt="Logo de RUMI" className="w-20 h-20 mx-auto mb-4 object-contain rounded-xl shadow-lg" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Flujo inválido</h2>
          <p className="text-gray-600 mb-6">Debes ingresar tu email y código primero.</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300"
          >
            Volver a Recuperar Contraseña
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (newPassword.length < 6) {
      setMessage('❌ La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('❌ Las contraseñas no coinciden');
      setLoading(false);
      return;
    }
    try {
      await api.post('/auth/reset-password', {
        email,
        code,
        newPassword
      });
      setMessage('✅ Contraseña actualizada exitosamente');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-200">
      {/* Header */}
      <div className="text-center py-8 bg-gradient-to-r from-green-600 via-blue-600 to-purple-700 text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold animate-pulse bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
          RUMI
        </h1>
        <p className="text-xl font-semibold mt-2 opacity-90">Nueva Contraseña</p>
      </div>
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30">
            <div className="text-center mb-8">
              <img
                src={logo}
                alt="Logo de RUMI"
                className="w-20 h-20 mx-auto mb-4 object-contain rounded-xl shadow-lg"
              />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Crea tu Nueva Contraseña</h2>
              <p className="text-gray-600">
                Ingresa tu nueva contraseña para completar la recuperación
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Nueva Contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-all duration-300 bg-white/80"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Mínimo 6 caracteres</p>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-all duration-300 bg-white/80"
                  required
                />
              </div>
              {message && (
                <div className={`px-4 py-3 rounded-xl ${
                  message.startsWith('✅') 
                    ? 'bg-green-100 border border-green-400 text-green-700' 
                    : 'bg-red-100 border border-red-400 text-red-700'
                }`}>
                  {message}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-green-600 hover:text-green-800 font-semibold transition-colors duration-300"
              >
                ← Volver al login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 