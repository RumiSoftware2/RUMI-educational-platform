// frontend/src/pages/EnterpriseRumi.jsx
import { motion } from 'framer-motion';
import logo3 from '../assets/logo3zeus.png';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a2342] via-[#2ca6e0] to-[#ffd700]">
      <motion.img
        src={logo3}
        alt="RUMI Logo"
        className="w-32 h-24 md:w-48 md:h-60 rounded-2xl shadow-2xl border-4 border-[#ffd700] mb-6 object-cover"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      />
      <motion.div
        className="rounded-3xl shadow-2xl px-8 py-10 bg-white/30 backdrop-blur-lg border-4 border-[#ffd700]/30 flex flex-col items-center"
        initial="hidden"
        animate="visible"
        variants={container}
      >
        <motion.div
          className="text-5xl mb-4 animate-bounce"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          🏢
        </motion.div>
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-[#0a2342] text-center mb-2"
        >
          {msg1.split('').map((char, i) => (
            <motion.span key={i} variants={child} style={{ display: 'inline-block' }}>
              {char}
            </motion.span>
          ))}
        </motion.h2>
        <motion.div className="text-xl md:text-2xl font-bold text-[#2ca6e0] text-center mt-2 flex items-center justify-center gap-2">
          <span className="text-2xl">🚧</span>
          {msg2.split('').map((char, i) => (
            <motion.span key={i} variants={child} style={{ display: 'inline-block' }}>
              {char}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default AnimatedConstruction; 