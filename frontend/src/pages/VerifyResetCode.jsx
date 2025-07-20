import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo3zeus.png';

const VerifyResetCode = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    if (!emailRegex.test(email)) {
      setMessage('❌ Ingresa un correo electrónico válido');
      setLoading(false);
      return;
    }
    if (!code || code.length < 4) {
      setMessage('❌ Ingresa el código recibido');
      setLoading(false);
      return;
    }
    try {
      await api.post('/auth/verify-reset-code', { email, code });
      // Si es válido, navegar a ResetPassword pasando email y code
      navigate('/reset-password', { state: { email, code } });
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-blue-100 to-purple-200">
      <div className="text-center py-8 bg-gradient-to-r from-yellow-600 via-blue-600 to-purple-700 text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold animate-pulse bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
          RUMI
        </h1>
        <p className="text-xl font-semibold mt-2 opacity-90">Verifica tu Código</p>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Ingresa el código recibido</h2>
              <p className="text-gray-600">
                Escribe el correo y el código que recibiste para continuar
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 transition-all duration-300 bg-white/80"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Código de recuperación</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="Código de 6 dígitos"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 transition-all duration-300 bg-white/80"
                  required
                />
              </div>
              {message && (
                <div className={`px-4 py-3 rounded-xl ${
                  message.startsWith('❌')
                    ? 'bg-red-100 border border-red-400 text-red-700'
                    : 'bg-green-100 border border-green-400 text-green-700'
                }`}>
                  {message}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-white py-4 rounded-xl font-bold text-lg hover:from-yellow-700 hover:to-yellow-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : 'Verificar Código'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-yellow-600 hover:text-yellow-800 font-semibold transition-colors duration-300"
              >
                ← Volver a recuperar contraseña
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetCode; 