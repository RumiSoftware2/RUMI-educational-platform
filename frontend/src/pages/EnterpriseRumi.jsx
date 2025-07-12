// frontend/src/pages/EnterpriseRumi.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeaderEnterprise from '../components/HeaderEnterprise';
import logo from '../assets/logo1zeus.png';
import logo2 from '../assets/logo2zeus.png';
import logo3 from '../assets/logo3zeus.png';

export default function EnterpriseRumi() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-200">
      <HeaderEnterprise />

      {/* Título principal empresarial */}
      <div className="text-center py-16 bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-900 text-white relative overflow-hidden mt-20">
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-700/20 via-blue-700/20 to-indigo-700/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold animate-bounce bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl mx-auto max-w-xl">
            RUMI Enterprise
          </h1>
          <div className="mt-6">
            <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-200 via-green-200 to-yellow-200 bg-clip-text text-transparent animate-pulse drop-shadow-lg mx-auto max-w-2xl">
              Plataforma Educativa Institucional con IA
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-gray-200 to-green-200 mx-auto mt-4 rounded-full animate-pulse"></div>
            <p className="text-lg text-blue-200 mt-6 max-w-3xl mx-auto">
              Solución completa para universidades, colegios y organizaciones educativas. 
              Integración con IA especializada en pedagogía, análisis avanzado y gestión institucional.
            </p>
          </div>
        </div>
      </div>

      {/* Slider de imágenes empresarial */}
      <div className="relative h-96 md:h-[500px] overflow-hidden bg-gradient-to-r from-slate-600 via-blue-600 to-indigo-700">
        {/* Efectos de fondo del slider */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-500/30 via-blue-500/30 to-indigo-500/30 animate-pulse"></div>
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
                  alt={`Logo de RUMI Enterprise ${index + 1}`}
                  className="w-80 h-80 md:w-96 md:h-96 object-contain rounded-3xl shadow-2xl transform group-hover:scale-110 transition-all duration-500 animate-pulse border-4 border-white/30"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/30 via-blue-600/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -inset-4 bg-gradient-to-r from-slate-500 via-blue-500 to-indigo-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Indicadores del slider */}
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

        {/* Flechas de navegación */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        >
          <span className="text-xl font-bold">←</span>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % images.length)}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        >
          <span className="text-xl font-bold">→</span>
        </button>
      </div>

      {/* Sección de características empresariales */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">
            Características Empresariales
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Soluciones especializadas para instituciones educativas con necesidades avanzadas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Característica 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">IA Pedagógica Especializada</h3>
            <p className="text-slate-600">
              Inteligencia artificial entrenada específicamente en metodologías pedagógicas 
              para optimizar el aprendizaje según el perfil de cada estudiante.
            </p>
          </div>

          {/* Característica 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Analytics Avanzado</h3>
            <p className="text-slate-600">
              Dashboard completo con métricas de rendimiento, progreso estudiantil, 
              y análisis predictivo para toma de decisiones institucionales.
            </p>
          </div>

          {/* Característica 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Gestión Multi-Usuario</h3>
            <p className="text-slate-600">
              Sistema de roles y permisos avanzado para administradores, 
              docentes, estudiantes y padres de familia.
            </p>
          </div>

          {/* Característica 4 */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Seguridad Empresarial</h3>
            <p className="text-slate-600">
              Cumplimiento con estándares de seguridad educativa, 
              encriptación de datos y respaldos automáticos.
            </p>
          </div>

          {/* Característica 5 */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Personalización Institucional</h3>
            <p className="text-slate-600">
              Branding personalizado, integración con sistemas existentes 
              y adaptación a metodologías específicas de la institución.
            </p>
          </div>

          {/* Característica 6 */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Soporte Dedicado</h3>
            <p className="text-slate-600">
              Equipo de soporte técnico especializado, capacitación 
              para docentes y acompañamiento en la implementación.
            </p>
          </div>
        </div>

        {/* Sección de planes empresariales */}
        <div className="bg-gradient-to-r from-slate-800 to-blue-900 rounded-3xl p-12 text-white">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Planes Empresariales</h2>
            <p className="text-xl text-blue-200">
              Soluciones escalables para instituciones de todos los tamaños
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Plan Básico */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-4">Plan Básico</h3>
              <div className="text-3xl font-bold mb-6">$2,500<span className="text-lg">/mes</span></div>
              <ul className="space-y-3 mb-8">
                <li>✓ Hasta 500 estudiantes</li>
                <li>✓ IA pedagógica básica</li>
                <li>✓ Analytics estándar</li>
                <li>✓ Soporte por email</li>
                <li>✓ Branding básico</li>
              </ul>
              <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold transition-colors">
                Solicitar Demo
              </button>
            </div>

            {/* Plan Profesional */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 border-2 border-white/30 transform scale-105">
              <div className="text-center mb-4">
                <span className="bg-yellow-400 text-slate-800 px-3 py-1 rounded-full text-sm font-bold">
                  MÁS POPULAR
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Plan Profesional</h3>
              <div className="text-3xl font-bold mb-6">$5,000<span className="text-lg">/mes</span></div>
              <ul className="space-y-3 mb-8">
                <li>✓ Hasta 2,000 estudiantes</li>
                <li>✓ IA pedagógica avanzada</li>
                <li>✓ Analytics completo</li>
                <li>✓ Soporte prioritario</li>
                <li>✓ Branding completo</li>
                <li>✓ Integración personalizada</li>
              </ul>
              <button className="w-full bg-white text-blue-600 hover:bg-gray-100 py-3 rounded-xl font-bold transition-colors">
                Solicitar Demo
              </button>
            </div>

            {/* Plan Enterprise */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-4">Plan Enterprise</h3>
              <div className="text-3xl font-bold mb-6">Personalizado</div>
              <ul className="space-y-3 mb-8">
                <li>✓ Estudiantes ilimitados</li>
                <li>✓ IA personalizada</li>
                <li>✓ Analytics predictivo</li>
                <li>✓ Soporte 24/7</li>
                <li>✓ Desarrollo a medida</li>
                <li>✓ Implementación completa</li>
              </ul>
              <button className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold transition-colors">
                Contactar Ventas
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de casos de éxito */}
      <div className="bg-slate-100 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Casos de Éxito
            </h2>
            <p className="text-xl text-slate-600">
              Instituciones que ya confían en RUMI Enterprise
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                  U
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Universidad Pedagógica Nacional</h3>
                  <p className="text-slate-600">Implementación en progreso</p>
                </div>
              </div>
              <p className="text-slate-700 mb-4">
                "RUMI Enterprise nos permitirá modernizar nuestra metodología educativa 
                con IA especializada en pedagogía, mejorando significativamente 
                el aprendizaje de nuestros estudiantes."
              </p>
              <div className="text-sm text-slate-500">
                - Dr. María González, Directora de Innovación Educativa
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                  C
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Colegio San Agustín</h3>
                  <p className="text-slate-600">Implementado exitosamente</p>
                </div>
              </div>
              <p className="text-slate-700 mb-4">
                "La implementación de RUMI Enterprise ha transformado nuestra forma 
                de enseñar. Los estudiantes están más comprometidos y los resultados 
                académicos han mejorado notablemente."
              </p>
              <div className="text-sm text-slate-500">
                - Lic. Carlos Rodríguez, Director Académico
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de contacto empresarial */}
      <div className="bg-gradient-to-r from-slate-800 to-blue-900 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-6">¿Listo para transformar tu institución?</h3>
          <p className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto">
            Nuestro equipo de especialistas está listo para ayudarte a implementar 
            RUMI Enterprise en tu institución educativa.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <div className="text-4xl mb-4">📞</div>
              <h4 className="text-xl font-bold mb-4">Contacto Directo</h4>
              <div className="space-y-3">
                <a
                  href="mailto:enterprise@rumi.edu"
                  className="text-blue-200 underline hover:text-blue-400 transition-colors block"
                >
                  enterprise@rumi.edu
                </a>
                <p className="text-blue-200">+57 300 123 4567</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('enterprise@rumi.edu');
                    alert('Email copiado al portapapeles');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  📋 Copiar Email
                </button>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="text-xl font-bold mb-4">Demo Personalizada</h4>
              <p className="text-blue-200 mb-4">
                Agenda una demostración personalizada de RUMI Enterprise 
                adaptada a las necesidades específicas de tu institución.
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                Agendar Demo
              </button>
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