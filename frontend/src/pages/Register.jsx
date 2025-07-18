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
      <div className="container mx-auto px-2 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center max-w-2xl md:max-w-4xl mx-auto">
          
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

              {/* Beneficios (eliminados para simplificar) */}
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Contáctenos (igual que Login.jsx) */}
      <div className="bg-gradient-to-r from-purple-900 to-yellow-400 text-white py-12 mt-12">
        <div className="container mx-auto px-6 text-center flex flex-col items-center">
          <img
            src={logo}
            alt="RUMI Logo"
            className="w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-xl border-4 border-yellow-300 mb-6 object-cover"
          />
          <h3 className="text-2xl md:text-3xl font-bold mb-6">¿Conectemos?</h3>
          <p className="text-yellow-100 mb-8 max-w-2xl mx-auto">
            Sígueme en mis redes profesionales o revisa mi portafolio para conocer más sobre mi trabajo y proyectos.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 max-w-3xl mx-auto">
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/sebastian-mendoza-duitama-694845203"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/10 hover:bg-yellow-400/20 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/></svg>
              <span className="font-semibold text-lg">LinkedIn</span>
            </a>
            {/* YouTube */}
            <a
              href="https://www.youtube.com/@MAP_314"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/10 hover:bg-yellow-400/20 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.454 3.5 12 3.5 12 3.5s-7.454 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.12 0 12 0 12s0 3.88.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.546 20.5 12 20.5 12 20.5s7.454 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.88 24 12 24 12s0-3.88-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              <span className="font-semibold text-lg">YouTube</span>
            </a>
            {/* GitHub */}
            <a
              href="https://github.com/RumiSoftware2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/10 hover:bg-yellow-400/20 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              <span className="font-semibold text-lg">GitHub</span>
            </a>
            {/* Portafolio */}
            <a
              href="https://portafoliosmendo.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-purple-700 text-[#0a2342] px-6 py-4 rounded-xl shadow-xl font-bold text-lg hover:from-purple-800 hover:to-yellow-500 hover:text-white transition-all duration-300 border border-white/20"
            >
              <span className="text-2xl">💼</span>
              <span>Portafolio</span>
            </a>
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
