// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo1zeus.png';
import logo2 from '../assets/logo2zeus.png';
import logo3 from '../assets/logo3zeus.png';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = [logo, logo2, logo3];

  // Auto-slide cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-indigo-200">
      {/* Título principal mejorado */}
      <div className="text-center py-12 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white relative overflow-hidden">
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold animate-bounce bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 bg-clip-text text-transparent drop-shadow-2xl mx-auto max-w-xl">
            RUMI
          </h1>
          <div className="mt-4">
            <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-200 via-green-200 to-yellow-200 bg-clip-text text-transparent animate-pulse drop-shadow-lg mx-auto max-w-lg">
              Plataforma Educativa
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-gray-200 to-green-200 mx-auto mt-3 rounded-full animate-pulse"></div>
            <p className="text-lg text-blue-200 mt-6 max-w-3xl mx-auto">
              Elige la versión que mejor se adapte a tus necesidades educativas
            </p>
          </div>
        </div>
      </div>

      {/* Slider de imágenes mejorado con colores llamativos */}
      <div className="relative h-96 md:h-[500px] overflow-hidden bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-600">
        {/* Efectos de fondo del slider */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-indigo-500/30 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        <div 
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {images.map((img, index) => (
            <div key={index} className="w-full flex-shrink-0 flex items-center justify-center p-4">
              <div className="relative group">
                <img
                  src={img}
                  alt={`Logo de RUMI ${index + 1}`}
                  className="w-80 h-80 md:w-96 md:h-96 object-contain rounded-3xl shadow-2xl transform group-hover:scale-110 transition-all duration-500 animate-pulse border-4 border-white/30"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/30 via-blue-600/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Indicadores del slider mejorados */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-5 h-5 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125 shadow-lg ring-2 ring-white/50' 
                  : 'bg-white/50 hover:bg-white/80 hover:scale-110'
              }`}
            />
          ))}
        </div>

        {/* Flechas de navegación mejoradas */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-purple-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        >
          <span className="text-xl font-bold">←</span>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % images.length)}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-purple-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        >
          <span className="text-xl font-bold">→</span>
        </button>
      </div>

      {/* Sección de selección de versión */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-indigo-800 mb-4">
            Elige tu versión de RUMI
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tenemos soluciones adaptadas para diferentes necesidades educativas
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Versión Personal */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 shadow-2xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 transform hover:scale-105">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">👤</span>
              </div>
              <h3 className="text-3xl font-bold text-purple-800 mb-4">RUMI Personal</h3>
              <p className="text-lg text-gray-600 mb-6">
                Para estudiantes y docentes individuales
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <span className="text-green-500 text-xl mr-3">✓</span>
                <span className="text-gray-700">Cursos de YouTube con quizzes integrados</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 text-xl mr-3">✓</span>
                <span className="text-gray-700">Seguimiento de progreso personal</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 text-xl mr-3">✓</span>
                <span className="text-gray-700">Juegos educativos interactivos</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 text-xl mr-3">✓</span>
                <span className="text-gray-700">Comunidad de aprendizaje</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 text-xl mr-3">✓</span>
                <span className="text-gray-700">Gratis para uso básico</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/person-rumi"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl inline-block"
              >
                Explorar RUMI Personal
              </Link>
            </div>
          </div>

          {/* Versión Empresarial */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-8 shadow-2xl border-2 border-slate-300 hover:border-slate-500 transition-all duration-300 transform hover:scale-105">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-slate-700 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🏢</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-4">RUMI Enterprise</h3>
              <p className="text-lg text-gray-600 mb-6">
                Para instituciones educativas
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <span className="text-green-500 text-xl mr-3">✓</span>
                <span className="text-gray-700">IA pedagógica especializada</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 text-xl mr-3">✓</span>
                <span className="text-gray-700">Analytics y métricas avanzadas</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 text-xl mr-3">✓</span>
                <span className="text-gray-700">Gestión multi-usuario institucional</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 text-xl mr-3">✓</span>
                <span className="text-gray-700">Branding y personalización completa</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 text-xl mr-3">✓</span>
                <span className="text-gray-700">Soporte técnico dedicado</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/enterprise-rumi"
                className="bg-gradient-to-r from-slate-700 to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-slate-800 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl inline-block"
              >
                Explorar RUMI Enterprise
              </Link>
            </div>
          </div>
        </div>

        {/* Sección de comparación */}
        <div className="mt-16 bg-white rounded-3xl p-8 shadow-xl">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
            ¿No estás seguro? Compara las versiones
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <h4 className="text-xl font-bold text-purple-800 mb-4">RUMI Personal</h4>
              <p className="text-gray-600">
                Ideal para estudiantes que quieren aprender a su ritmo, 
                docentes que quieren compartir conocimiento, y personas 
                que buscan una plataforma educativa simple y efectiva.
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-bold text-slate-800 mb-4">RUMI Enterprise</h4>
              <p className="text-gray-600">
                Perfecto para universidades, colegios, empresas de capacitación 
                y cualquier institución que necesite una solución educativa 
                completa con IA y analytics avanzados.
              </p>
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
            sobre la plataforma, quieres crear un curso o necesitas soporte técnico.
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
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-left {
          animation: fade-in-left 1s ease-out;
        }
        
        .animate-fade-in-right {
          animation: fade-in-right 1s ease-out 0.3s both;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        
        .animate-slide-up-delay {
          animation: slide-up 0.8s ease-out 0.2s both;
        }
        
        .animate-slide-up-delay-2 {
          animation: slide-up 0.8s ease-out 0.4s both;
        }
        
        .animate-slide-up-delay-3 {
          animation: slide-up 0.8s ease-out 0.6s both;
        }
      `}</style>
    </div>
  );
}
