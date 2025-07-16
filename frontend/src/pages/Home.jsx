// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logo1zeus.png';
import logo2 from '../assets/logo2zeus.png';
import logo3 from '../assets/logo3zeus.png';

// SVGs para redes sociales
const LinkedInIcon = () => (
  <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/></svg>
);
const YouTubeIcon = () => (
  <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.454 3.5 12 3.5 12 3.5s-7.454 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.12 0 12 0 12s0 3.88.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.546 20.5 12 20.5 12 20.5s7.454 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.88 24 12 24 12s0-3.88-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);
const GitHubIcon = () => (
  <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
);

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = [logo, logo2, logo3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [images.length]);

  // Framer Motion variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  };
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.7, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2342] via-[#2ca6e0] to-[#ffd700] flex flex-col">
      {/* Hero Section: Slider + Cards */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 pt-12 pb-8 md:pb-16 w-full max-w-6xl mx-auto">
        {/* Slider */}
        <motion.div
          className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-2xl border-4 border-[#ffd700]/30 flex flex-col items-center justify-center p-4 md:p-6 w-72 h-72 md:w-80 md:h-80 relative"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={images[currentSlide]}
              alt={`Logo de RUMI ${currentSlide + 1}`}
              className="object-contain w-48 h-48 md:w-56 md:h-56 rounded-2xl shadow-lg border-2 border-[#ffd700]/40 transition-all duration-500"
            />
            {/* Indicadores */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                    idx === currentSlide
                      ? 'bg-[#ffd700] border-[#0a2342] scale-125 shadow-lg'
                      : 'bg-white/60 border-[#ffd700]/40 hover:bg-[#ffd700]/80'
                  }`}
                  aria-label={`Ir al slide ${idx + 1}`}
                />
              ))}
            </div>
            {/* Flechas */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#ffd700]/80 hover:bg-[#ffd700] text-[#0a2342] p-2 rounded-full shadow-md transition-all duration-300"
              aria-label="Anterior"
            >
              <span className="text-lg font-bold">←</span>
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#ffd700]/80 hover:bg-[#ffd700] text-[#0a2342] p-2 rounded-full shadow-md transition-all duration-300"
              aria-label="Siguiente"
            >
              <span className="text-lg font-bold">→</span>
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-6 w-full md:w-auto">
          {/* RUMI Personal */}
          <motion.div
            className="flex-1 bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border-2 border-[#2ca6e0]/20 p-6 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition-all duration-300"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#2ca6e0] to-[#ffd700] rounded-full flex items-center justify-center mb-4 shadow-lg">
              <span className="text-3xl">👤</span>
            </div>
            <h3 className="text-2xl font-bold text-[#0a2342] mb-2">RUMI Personal</h3>
            <ul className="text-gray-700 text-base space-y-1 mb-4">
              <li>✓ Cursos de YouTube con quizzes</li>
              <li>✓ Seguimiento de progreso</li>
              <li>✓ Juegos educativos</li>
              <li>✓ Comunidad de aprendizaje</li>
              <li>✓ Gratis para uso básico</li>
            </ul>
            <Link
              to="/person-rumi"
              className="bg-gradient-to-r from-[#2ca6e0] to-[#ffd700] text-[#0a2342] px-6 py-2 rounded-xl font-bold text-base hover:from-[#0a2342] hover:to-[#ffd700] hover:text-white transition-all duration-300 shadow-md"
            >
              Explorar RUMI Personal
            </Link>
          </motion.div>

          {/* RUMI Enterprise */}
          <motion.div
            className="flex-1 bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border-2 border-[#ffd700]/20 p-6 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition-all duration-300"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#ffd700] to-[#2ca6e0] rounded-full flex items-center justify-center mb-4 shadow-lg">
              <span className="text-3xl">🏢</span>
            </div>
            <h3 className="text-2xl font-bold text-[#0a2342] mb-2">RUMI Enterprise</h3>
            <ul className="text-gray-700 text-base space-y-1 mb-4">
              <li>✓ IA pedagógica especializada</li>
              <li>✓ Analytics avanzados</li>
              <li>✓ Gestión multi-usuario</li>
              <li>✓ Branding y personalización</li>
              <li>✓ Soporte dedicado</li>
            </ul>
            <Link
              to="/enterprise-rumi"
              className="bg-gradient-to-r from-[#ffd700] to-[#2ca6e0] text-[#0a2342] px-6 py-2 rounded-xl font-bold text-base hover:from-[#0a2342] hover:to-[#ffd700] hover:text-white transition-all duration-300 shadow-md"
            >
              Explorar RUMI Enterprise
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Comparación */}
      <motion.div
        className="mt-8 md:mt-0 max-w-4xl mx-auto w-full bg-white/90 rounded-3xl p-8 shadow-xl border border-[#2ca6e0]/10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
      >
        <h3 className="text-xl md:text-2xl font-bold text-center text-[#0a2342] mb-6">
          ¿No estás seguro? Compara las versiones
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="text-center">
            <h4 className="text-lg font-bold text-[#2ca6e0] mb-2">RUMI Personal</h4>
            <p className="text-gray-600">
              Ideal para estudiantes autodidactas, docentes que quieren compartir conocimiento, y personas que buscan una plataforma educativa simple y efectiva.
            </p>
          </div>
          <div className="text-center">
            <h4 className="text-lg font-bold text-[#ffd700] mb-2">RUMI Enterprise</h4>
            <p className="text-gray-600">
              Perfecto para universidades, colegios, empresas de capacitación y cualquier institución que necesite una solución educativa completa con IA y analytics avanzados.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Contacto */}
      <motion.div
        className="mt-12 bg-gradient-to-r from-[#0a2342] to-[#2ca6e0] text-white py-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-6">¿Conectemos?</h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Sígueme en mis redes profesionales o revisa mi portafolio para conocer más sobre mi trabajo y proyectos.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 max-w-3xl mx-auto">
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/smendozadev/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/10 hover:bg-[#ffd700]/20 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <LinkedInIcon />
              <span className="font-semibold text-lg">LinkedIn</span>
            </a>
            {/* YouTube */}
            <a
              href="https://www.youtube.com/@MAP_314"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/10 hover:bg-[#ffd700]/20 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <YouTubeIcon />
              <span className="font-semibold text-lg">YouTube</span>
            </a>
            {/* GitHub */}
            <a
              href="https://github.com/smendozadev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/10 hover:bg-[#ffd700]/20 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <GitHubIcon />
              <span className="font-semibold text-lg">GitHub</span>
            </a>
            {/* Portafolio */}
            <a
              href="https://tu-portafolio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-gradient-to-r from-[#ffd700] to-[#2ca6e0] text-[#0a2342] px-6 py-4 rounded-xl shadow-xl font-bold text-lg hover:from-[#2ca6e0] hover:to-[#ffd700] hover:text-white transition-all duration-300 border border-white/20"
            >
              <span className="text-2xl">💼</span>
              <span>Portafolio</span>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
