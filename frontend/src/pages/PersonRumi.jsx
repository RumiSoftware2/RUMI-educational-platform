// frontend/src/pages/PersonRumi.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo1zeus.png';
import logo2 from '../assets/logo2zeus.png';
import logo3 from '../assets/logo3zeus.png';

export default function PersonRumi() {
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
      {/* Header específico para PersonRumi */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src={logo} alt="RUMI Logo" className="w-12 h-12 rounded-full" />
            <div>
              <h1 className="text-2xl font-bold">RUMI Personal</h1>
              <p className="text-sm text-blue-200">Para estudiantes y docentes individuales</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/"
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ← Volver al Inicio
            </Link>
            <Link
              to="/enterprise-rumi"
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              Versión Empresarial
            </Link>
          </div>
        </div>
      </div>

      {/* Título principal mejorado */}
      <div className="text-center py-12 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white relative overflow-hidden">
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold animate-bounce bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 bg-clip-text text-transparent drop-shadow-2xl mx-auto max-w-xl">
            RUMI Personal
          </h1>
          <div className="mt-4">
            <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-200 via-green-200 to-yellow-200 bg-clip-text text-transparent animate-pulse drop-shadow-lg mx-auto max-w-lg">
              Educación Personalizada
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-gray-200 to-green-200 mx-auto mt-3 rounded-full animate-pulse"></div>
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

      {/* Contenido principal en dos columnas */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Columna izquierda - Contenido */}
          <div className="space-y-8 animate-fade-in-left">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-indigo-800 mb-4 animate-slide-up">
                Bienvenido a <span className="text-blue-600 animate-bounce">RUMI Personal</span>
              </h2>
              <h3 className="text-xl lg:text-2xl font-extrabold text-green-800 mb-6 animate-slide-up-delay">
                Tu plataforma educativa personal
              </h3>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 animate-slide-up-delay-2">
              <p className="text-lg text-gray-700 leading-relaxed">
                RUMI Personal es la plataforma educativa donde los{' '}
                <strong className="text-green-700">docentes pueden publicar cursos de YouTube</strong>{' '}
                con preguntas integradas, y los{' '}
                <strong className="text-blue-700">estudiantes pueden seguir su progreso</strong>, 
                responder quizzes y mejorar sus habilidades a través de juegos interactivos.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up-delay-3">
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                ¡Comenzar Ahora!
              </Link>
              <Link
                to="/courses"
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Explorar Cursos
              </Link>
            </div>
          </div>

          {/* Columna derecha - Video */}
          <div className="animate-fade-in-right">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/30">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                🎥 Video Introductorio
              </h3>
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Video introductorio de RUMI"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <p className="text-center text-gray-600 mt-4 text-sm">
                Descubre cómo RUMI está transformando la educación personal
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