import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo2zeus.png';

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener email de los parámetros de URL o del estado
  useState(() => {
    const params = new URLSearchParams(location.search);
    const emailFromParams = params.get('email');
    if (emailFromParams) {
      setEmail(emailFromParams);
    }
  }, [location]);

  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await api.post('/auth/verify-email', { email, code: verificationCode });
      setMessage('✅ Email verificado exitosamente');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setMessage('');

    try {
      await api.post('/auth/resend-verification', { email });
      setMessage('✅ Nuevo código enviado a tu email');
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || err.message}`);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-200">
      {/* Header */}
      <div className="text-center py-8 bg-gradient-to-r from-green-600 via-blue-600 to-purple-700 text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold animate-pulse bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
          RUMI
        </h1>
        <p className="text-xl font-semibold mt-2 opacity-90">Verificación de Email</p>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifica tu Email</h2>
              <p className="text-gray-600">
                Hemos enviado un código de verificación a tu email
              </p>
              <p className="text-yellow-700 text-sm mt-2">
                <b>Revisa también tu bandeja de correos no deseados o spam.</b>
              </p>
            </div>

            <form onSubmit={handleVerification} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-all duration-300 bg-white/80"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Código de Verificación</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  maxLength="6"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-all duration-300 bg-white/80 text-center text-2xl font-bold tracking-widest"
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
                {loading ? 'Verificando...' : 'Verificar Email'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-4">¿No recibiste el código?</p>
              <button
                onClick={handleResendCode}
                disabled={resendLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? 'Enviando...' : 'Reenviar Código'}
              </button>
            </div>

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

export default EmailVerification; 