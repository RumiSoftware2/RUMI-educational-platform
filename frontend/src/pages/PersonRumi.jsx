// frontend/src/pages/PersonRumi.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo2 from '../assets/logo2zeus.png';

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

const letters = ['R', 'U', 'M', 'I', ' ', 'P', 'e', 'r', 's', 'o', 'n', 'a', 'l'];

function AnimatedTitle() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };
  const child = {
    hidden: { y: -30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 20 } }
  };
  return (
    <motion.div
      className="w-full text-center pt-8 pb-4"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      <motion.h1
        className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-700 via-yellow-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-2xl"
        style={{ backgroundSize: '200% 200%', animation: 'gradient-x 3s ease-in-out infinite' }}
      >
        {letters.map((l, i) => (
          <motion.span
            key={i}
            variants={child}
            style={{ display: 'inline-block', marginRight: 2 }}
            whileHover={{ scale: 1.2, rotate: 8 }}
          >
            {l}
          </motion.span>
        ))}
      </motion.h1>
      <motion.div
        className="mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7 }}
      >
        <span className="text-lg md:text-2xl tracking-widest font-semibold text-yellow-400 drop-shadow-lg">
          Educación Personalizada
        </span>
      </motion.div>
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </motion.div>
  );
}

export default function PersonRumi() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-yellow-200 flex flex-col">
      {/* Logo y título animado */}
      <div className="flex flex-col items-center justify-center pt-8 pb-2">
        <motion.img
          src={logo2}
          alt="RUMI Logo"
          className="w-40 h-28 md:w-56 md:h-36 rounded-2xl shadow-2xl border-4 border-yellow-400 mb-4 object-cover"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        />
        <AnimatedTitle />
      </div>

      {/* Video y resumen */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-10 px-4 md:px-12 w-full max-w-6xl mx-auto mt-2 mb-8">
        {/* Video */}
        <motion.div
          className="flex-1 bg-white/90 rounded-3xl shadow-2xl border-4 border-yellow-300 p-4 md:p-8 flex flex-col items-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-purple-800 mb-4 text-center">
            🎥 Video Introductorio
          </h3>
          <div className="aspect-video rounded-xl overflow-hidden shadow-lg w-full max-w-xl mx-auto">
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
        </motion.div>
        {/* Resumen de valor */}
        <motion.div
          className="flex-1 bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border-2 border-yellow-200 p-8 flex flex-col justify-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-3xl font-extrabold text-purple-800 mb-4 text-center">
            Bienvenido a RUMI Personal
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed text-center">
            RUMI Personal es la plataforma educativa donde los <strong className="text-purple-700">docentes pueden publicar cursos de YouTube</strong> con preguntas integradas, y los <strong className="text-yellow-600">estudiantes pueden seguir su progreso</strong>, responder quizzes y mejorar sus habilidades a través de juegos interactivos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/register"
              className="bg-gradient-to-r from-purple-700 to-yellow-400 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-800 hover:to-yellow-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              ¡Comenzar Ahora!
            </Link>
            <Link
              to="/courses"
              className="bg-gradient-to-r from-yellow-400 to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-purple-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Explorar Cursos
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Sección de Contacto */}
      <motion.div
        className="mt-8 bg-gradient-to-r from-purple-900 to-yellow-400 text-white py-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="container mx-auto px-6 text-center flex flex-col items-center">
          <img
            src={logo2}
            alt="RUMI Logo"
            className="w-24 h-24 md:w-32 md:h-32 rounded-full shadow-xl border-4 border-yellow-300 mb-6"
          />
          <h3 className="text-2xl md:text-3xl font-bold mb-6">¿Conectemos?</h3>
          <p className="text-yellow-100 mb-8 max-w-2xl mx-auto">
            Sígueme en mis redes profesionales o revisa mi portafolio para conocer más sobre mi trabajo y proyectos.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 max-w-3xl mx-auto">
            {/* LinkedIn */}
            <a
              href="www.linkedin.com/in/sebastian-mendoza-duitama-694845203"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/10 hover:bg-yellow-400/20 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <LinkedInIcon />
              <span className="font-semibold text-lg">LinkedIn</span>
            </a>
            {/* YouTube */}
            <a
              href="https://www.youtube.com/@MAP_314"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/10 hover:bg-yellow-400/20 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <YouTubeIcon />
              <span className="font-semibold text-lg">YouTube</span>
            </a>
            {/* GitHub */}
            <a
              href="https://github.com/RumiSoftware2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/10 hover:bg-yellow-400/20 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <GitHubIcon />
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
      </motion.div>
    </div>
  );
} 