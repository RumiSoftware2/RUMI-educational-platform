// src/pages/Register.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo2zeus.png';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'estudiante'
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!emailRegex.test(formData.email)) {
      setMessage('❌ Ingresa un correo electrónico válido');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/register', formData);
      
      if (res.data.requiresVerification) {
        // Redirigir a verificación de email
        window.location.href = `/verify-email?email=${encodeURIComponent(formData.email)}`;
      } else {
        setMessage('✅ Registro exitoso');
        setFormData({ name: '', email: '', password: '', role: 'estudiante' });
      }
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-200">
      {/* Header con título */}
      <div className="text-center py-8 bg-gradient-to-r from-green-600 via-blue-600 to-purple-700 text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold animate-pulse bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
          RUMI
        </h1>
        <p className="text-xl font-semibold mt-2 opacity-90">Registro de Usuario</p>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          
          {/* Columna izquierda - Formulario */}
          <div className="animate-fade-in-left">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Únete a RUMI!</h2>
                <p className="text-gray-600">Crea tu cuenta y comienza tu viaje educativo</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Nombre completo</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Tu nombre completo"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-all duration-300 bg-white/80"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-all duration-300 bg-white/80"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-all duration-300 bg-white/80"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Tipo de cuenta</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-all duration-300 bg-white/80"
                  >
                    <option value="estudiante">👨‍🎓 Estudiante</option>
                    <option value="docente">👨‍🏫 Docente</option>
                  </select>
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
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">¿Ya tienes una cuenta?</p>
                <Link
                  to="/login"
                  className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Iniciar Sesión
                </Link>
              </div>

              <div className="mt-6 text-center">
                <Link to="/" className="text-green-600 hover:text-green-800 font-semibold transition-colors duration-300">
                  ← Volver al inicio
                </Link>
              </div>
            </div>
          </div>

          {/* Columna derecha - Logo y beneficios */}
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
                  ¡Bienvenido a la comunidad RUMI!
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Únete a miles de estudiantes y docentes que ya están transformando 
                  la educación con nuestra plataforma innovadora.
                </p>
              </div>

              {/* Beneficios */}
              <div className="space-y-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 flex items-center">
                  <div className="text-2xl mr-4">🚀</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Acceso inmediato</h4>
                    <p className="text-gray-600 text-sm">Comienza a aprender desde el primer momento</p>
                  </div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 flex items-center">
                  <div className="text-2xl mr-4">🎯</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Contenido personalizado</h4>
                    <p className="text-gray-600 text-sm">Adaptado a tu nivel y objetivos</p>
                  </div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 flex items-center">
                  <div className="text-2xl mr-4">👥</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Comunidad activa</h4>
                    <p className="text-gray-600 text-sm">Conecta con otros estudiantes</p>
                  </div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 flex items-center">
                  <div className="text-2xl mr-4">🎮</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Juegos educativos</h4>
                    <p className="text-gray-600 text-sm">Aprende de forma divertida e interactiva</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Contáctenos */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-6">¿Tienes preguntas?</h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Nuestro equipo está aquí para ayudarte con el proceso de registro 
            y cualquier duda que tengas sobre la plataforma.
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
};

export default Register;
