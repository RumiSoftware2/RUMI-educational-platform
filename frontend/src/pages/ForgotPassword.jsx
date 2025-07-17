import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo3zeus.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.post('/auth/forgot-password', { email });
      setEmailSent(true);
      setMessage('✅ Email de recuperación enviado. Revisa tu bandeja de entrada.');
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200">
      {/* Header */}
      <div className="text-center py-8 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold animate-pulse bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
          RUMI
        </h1>
        <p className="text-xl font-semibold mt-2 opacity-90">Recuperar Contraseña</p>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30">
            <div className="text-center mb-8">
              <img
                src={logo}
                alt="Logo de RUMI"
                className="w-20 h-20 mx-auto mb-4 object-contain rounded-xl shadow-lg"
              />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {emailSent ? 'Email Enviado' : '¿Olvidaste tu contraseña?'}
              </h2>
              <p className="text-gray-600">
                {emailSent 
                  ? 'Revisa tu email para continuar con la recuperación'
                  : 'Ingresa tu email y te enviaremos un enlace para recuperar tu contraseña'
                }
              </p>
            </div>

            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-300 bg-white/80"
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
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Enviar Email de Recuperación'}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
                  {message}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">¿Qué sigue?</h3>
                  <ol className="text-blue-700 text-sm space-y-1">
                    <li>1. Revisa tu bandeja de entrada</li>
                    <li>2. Busca el email de "Recupera tu contraseña - RUMI"</li>
                    <li>3. Haz clic en el enlace del email</li>
                    <li>4. Crea una nueva contraseña</li>
                  </ol>
                </div>

                <button
                  onClick={() => setEmailSent(false)}
                  className="w-full bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all duration-300"
                >
                  Intentar con otro email
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300">
                ← Volver al login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 