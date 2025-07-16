// src/pages/games/GameMenu.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// SVG de ejemplo para Blackjack
const BlackjackSVG = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
    <rect x="5" y="5" width="50" height="50" rx="8" fill="#fff" stroke="#2ca6e0" strokeWidth="3"/>
    <text x="15" y="35" fontSize="24" fill="#ffd700" fontWeight="bold">A♠</text>
  </svg>
);

const games = [
  {
    id: 'blackjack',
    name: 'Blackjack: Probabilidad Condicional',
    image: <BlackjackSVG />,
  },
  // más juegos futuros aquí
];

export default function GameMenu() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a2342] via-[#2ca6e0] to-[#ffd700] py-12">
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold mb-10 bg-gradient-to-r from-[#0a2342] via-[#2ca6e0] to-[#ffd700] bg-clip-text text-transparent drop-shadow-2xl"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Juegos Matemáticos
      </motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl px-4">
        {games.map((game, idx) => (
          <motion.div
            key={game.id}
            className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border-2 border-[#2ca6e0]/20 flex items-center gap-6 p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1, duration: 0.7 }}
            whileHover={{ scale: 1.07, boxShadow: '0 8px 32px 0 rgba(44,166,224,0.25)' }}
          >
            <div className="flex-shrink-0">
              {game.image}
            </div>
            <div className="flex-1">
              <Link
                to={`/games/${game.id}`}
                className="block text-xl md:text-2xl font-bold text-[#0a2342] hover:text-[#2ca6e0] transition-colors"
              >
                {game.name}
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}