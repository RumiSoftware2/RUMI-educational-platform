import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="w-full bg-[#18465A] text-white p-4 fixed top-0 left-0 z-50 shadow-2xl backdrop-blur-sm border-b border-white/20">
      <div className="container mx-auto flex items-center justify-between">
        
        {/* Logo y navegación principal */}
        <div className="flex items-center space-x-6">
          {/* Logo animado */}
          <Link 
            to="/" 
            className="font-extrabold text-3xl sm:text-4xl tracking-wide bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent animate-pulse hover:scale-105 transition-transform duration-300"
          >
            RUMI
          </Link>

          {/* Navegación principal - Desktop */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link 
              to="/courses" 
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 hover:scale-105 transition-all duration-300 font-semibold border border-white/30"
            >
              📚 Ver Cursos
            </Link>
            <Link 
              to="/games" 
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 hover:scale-105 transition-all duration-300 font-semibold border border-white/30"
            >
              🎮 Juegos
            </Link>
            {user && user.role === 'estudiante' && (
              <Link 
                to="/student/courses" 
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-300 font-semibold shadow-lg"
              >
                📖 Mis Cursos
              </Link>
            )}
            {user && user.role === 'docente' && (
              <Link 
                to="/teacher/courses" 
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-xl hover:from-yellow-600 hover:to-orange-600 hover:scale-105 transition-all duration-300 font-semibold shadow-lg"
              >
                👨‍🏫 Mis Cursos
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link 
                to="/admin/courses" 
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-all duration-300 font-semibold shadow-lg"
              >
                ⚙️ Gestión
              </Link>
            )}
          </nav>
        </div>

        {/* Usuario y acciones - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                <span className="text-sm opacity-90">Bienvenido,</span>
                <div className="font-bold text-white">
                  {user.name || user.email}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-all duration-300 font-semibold shadow-lg"
              >
                🚪 Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-600 hover:scale-105 transition-all duration-300 font-semibold shadow-lg"
              >
                🔑 Iniciar sesión
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 hover:scale-105 transition-all duration-300 font-semibold shadow-lg"
              >
                ✨ Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Menú móvil */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="bg-white/20 backdrop-blur-sm p-2 rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-purple-600/95 to-indigo-700/95 backdrop-blur-sm border-t border-white/20 animate-slide-down">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link 
              to="/courses" 
              className="block bg-white/20 backdrop-blur-sm text-white px-4 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 font-semibold border border-white/30"
              onClick={() => setIsMenuOpen(false)}
            >
              📚 Ver Cursos
            </Link>
            <Link 
              to="/games" 
              className="block bg-white/20 backdrop-blur-sm text-white px-4 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 font-semibold border border-white/30"
              onClick={() => setIsMenuOpen(false)}
            >
              🎮 Juegos Educativos
            </Link>
            {user && user.role === 'estudiante' && (
              <Link 
                to="/student/courses" 
                className="block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                📖 Mis Cursos
              </Link>
            )}
            {user && user.role === 'docente' && (
              <Link 
                to="/teacher/courses" 
                className="block bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                👨‍🏫 Mis Cursos
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link 
                to="/admin/courses" 
                className="block bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                ⚙️ Gestión de Cursos
              </Link>
            )}
            {user ? (
              <>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/30">
                  <span className="text-sm opacity-90">Bienvenido,</span>
                  <div className="font-bold text-white">
                    {user.name || user.email}
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-semibold"
                >
                  🚪 Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🔑 Iniciar sesión
                </Link>
                <Link 
                  to="/register" 
                  className="block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ✨ Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </header>
  );
} 