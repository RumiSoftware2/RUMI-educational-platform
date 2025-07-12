// src/pages/Login.jsx
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import logo from '../assets/logo3zeus.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Por favor, llena todos los campos');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      login(token, user);
      
      // Redirigir según rol
      if (user.role === 'estudiante') {
        navigate('/student/courses');
      } else if (user.role === 'docente') {
        navigate('/teacher/courses');
      } else if (user.role === 'admin') {
        navigate('/admin/courses');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      console.error(err);
      setError('Credenciales incorrectas o error en el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200">
      {/* Header con título */}
      <div className="text-center py-8 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold animate-pulse bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
          RUMI
        </h1>
        <p className="text-xl font-semibold mt-2 opacity-90">Iniciar Sesión</p>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          
          {/* Columna izquierda - Formulario */}
          <div className="animate-fade-in-left">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Bienvenido de vuelta!</h2>
                <p className="text-gray-600">Accede a tu cuenta para continuar</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-300 bg-white/80"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Contraseña</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-300 bg-white/80"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">¿No tienes una cuenta?</p>
                <Link
                  to="/register"
                  className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Registrarse
                </Link>
              </div>

              <div className="mt-6 text-center">
                <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300">
                  ← Volver al inicio
                </Link>
              </div>
            </div>
          </div>

          {/* Columna derecha - Logo y descripción */}
          <div className="animate-fade-in-right">
            <div className="text-center lg:text-left space-y-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
                <div className="flex justify-center lg:justify-start mb-6">
                  <img
                    src={logo}
                    alt="Logo de RUMI"
                    className="w-32 h-32 object-contain rounded-2xl shadow-lg animate-pulse"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Plataforma Educativa RUMI
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Accede a cursos interactivos, sigue tu progreso y mejora tus habilidades 
                  a través de nuestra plataforma educativa innovadora.
                </p>
              </div>

              {/* Características */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">📚</div>
                  <h4 className="font-semibold text-gray-800">Cursos Interactivos</h4>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">🎮</div>
                  <h4 className="font-semibold text-gray-800">Juegos Educativos</h4>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <h4 className="font-semibold text-gray-800">Seguimiento de Progreso</h4>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">👥</div>
                  <h4 className="font-semibold text-gray-800">Comunidad Activa</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Contáctenos */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-6">¿Necesitas ayuda?</h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Nuestro equipo está aquí para ayudarte. Contáctanos si tienes alguna pregunta 
            sobre la plataforma o necesitas soporte técnico.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl mb-4">📧</div>
              <h4 className="font-semibold mb-2">Email</h4>
              <div className="space-y-2">
                <a
                  href="mailto:s.mendowork@gmail.com"
                  className="text-blue-200 underline hover:text-blue-400 transition-colors block"
                >
                  s.mendowork@gmail.com
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('s.mendowork@gmail.com');
                    alert('Email copiado al portapapeles');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  📋 Copiar
                </button>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl mb-4">📱</div>
              <h4 className="font-semibold mb-2">youtube</h4>
              <a
                href="https://www.youtube.com/@MAP_314"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-200 underline break-words break-all max-w-full overflow-x-auto text-sm md:text-base hover:text-blue-400 transition-colors"
              >
                https://www.youtube.com/@MAP_314
              </a>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl mb-4">💼</div>
              <h4 className="font-semibold mb-2">Portafolio</h4>
              <a
                href="https://tu-portafolio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-200 underline hover:text-blue-400 transition-colors block"
              >
                Ver mi portafolio
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in-left {
          animation: fade-in-left 1s ease-out;
        }
        
        .animate-fade-in-right {
          animation: fade-in-right 1s ease-out 0.3s both;
        }
      `}</style>
    </div>
  );
}

