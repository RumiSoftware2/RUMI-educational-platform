// frontend/src/pages/EnterpriseRumi.jsx
import { motion } from 'framer-motion';
import logo3 from '../assets/logo3zeus.png';
import { Link } from 'react-router-dom';

const msg1 = "¡Estamos trabajando para traerte la mejor experiencia empresarial!";
const msg2 = "Página en construcción";

function AnimatedConstruction() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  };
  const child = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a2342] via-[#2ca6e0] to-[#ffd700] px-2">
      <motion.img
        src={logo3}
        alt="RUMI Logo"
        className="w-24 h-16 sm:w-28 sm:h-20 md:w-48 md:h-60 rounded-2xl shadow-2xl border-4 border-[#ffd700] mb-4 sm:mb-6 object-cover"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      />
      <motion.div
        className="w-full max-w-xs sm:max-w-md md:max-w-lg rounded-3xl shadow-2xl px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 bg-white/30 backdrop-blur-lg border-4 border-[#ffd700]/30 flex flex-col items-center"
        initial="hidden"
        animate="visible"
        variants={container}
      >
        <motion.div
          className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-4 animate-bounce"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          🏢
        </motion.div>
        <motion.h2
          className="text-lg sm:text-xl md:text-3xl font-bold text-[#0a2342] text-center mb-1 sm:mb-2"
        >
          {msg1.split('').map((char, i) => (
            char === ' '
              ? <span key={i} style={{ display: 'inline-block', width: '0.5em' }}>&nbsp;</span>
              : <motion.span key={i} variants={child} style={{ display: 'inline-block' }}>{char}</motion.span>
          ))}
        </motion.h2>
        <motion.div className="text-base sm:text-lg md:text-2xl font-bold text-[#2ca6e0] text-center mt-1 sm:mt-2 flex items-center justify-center gap-2">
          <span className="text-xl sm:text-2xl">🚧</span>
          {msg2.split('').map((char, i) => (
            char === ' '
              ? <span key={i} style={{ display: 'inline-block', width: '0.5em' }}>&nbsp;</span>
              : <motion.span key={i} variants={child} style={{ display: 'inline-block' }}>{char}</motion.span>
          ))}
        </motion.div>
      </motion.div>
      {/* Botón para regresar a Home */}
      <Link
        to="/"
        className="mt-6 sm:mt-8 w-full max-w-xs sm:max-w-md md:max-w-lg inline-block bg-gradient-to-r from-[#2ca6e0] to-[#ffd700] text-[#0a2342] px-4 sm:px-8 py-2 sm:py-3 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:from-[#0a2342] hover:to-[#ffd700] hover:text-white transition-all duration-300 border-2 border-[#ffd700]/60 text-center"
      >
        ← Volver al inicio
      </Link>
    </div>
  );
} 

export default AnimatedConstruction; 