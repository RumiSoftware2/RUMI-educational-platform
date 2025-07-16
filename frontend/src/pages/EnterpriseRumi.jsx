// frontend/src/pages/EnterpriseRumi.jsx
import { motion } from 'framer-motion';

const msg = "¡Estamos trabajando para traerte la mejor experiencia empresarial! Página en construcción 🚧";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a2342] via-[#2ca6e0] to-[#ffd700]">
      <motion.div
        className="rounded-3xl shadow-2xl px-8 py-10 bg-white/30 backdrop-blur-lg border-4 border-[#ffd700]/30"
        initial="hidden"
        animate="visible"
        variants={container}
      >
        <motion.h2
          className="text-2xl md:text-4xl font-bold text-[#0a2342] text-center"
        >
          {msg.split('').map((char, i) => (
            <motion.span key={i} variants={child} style={{ display: 'inline-block' }}>
              {char}
            </motion.span>
          ))}
        </motion.h2>
      </motion.div>
    </div>
  );
}

export default AnimatedConstruction; 