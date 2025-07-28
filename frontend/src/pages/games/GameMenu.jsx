// IMPORTANTE: Todos los juegos deben implementar la lógica de wake lock (Screen Wake Lock API)
// para mantener la pantalla encendida mientras el usuario juega. Ver ejemplos en Sudoku.jsx y Blackjack.jsx.
// src/pages/games/GameMenu.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// SVG de ejemplo para Blackjack
const BlackjackSVG = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
    <rect x="5" y="5" width="50" height="50" rx="8" fill="#fff" stroke="#2ca6e0" strokeWidth="3"/>
    <text x="15" y="35" fontSize="24" fill="#ffd700" fontWeight="bold">A♠</text>
  </svg>
);

// SVG de ejemplo para Sudoku
const SudokuSVG = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
    <rect x="5" y="5" width="50" height="50" rx="8" fill="#fff" stroke="#0a2342" strokeWidth="3"/>
    {/* Cuadrícula Sudoku */}
    {[1,2].map(i => (
      <line key={i} x1={5 + i*50/3} y1={5} x2={5 + i*50/3} y2={55} stroke="#2ca6e0" strokeWidth="2" />
    ))}
    {[1,2].map(i => (
      <line key={i} x1={5} y1={5 + i*50/3} x2={55} y2={5 + i*50/3} stroke="#2ca6e0" strokeWidth="2" />
    ))}
    <text x="15" y="38" fontSize="20" fill="#0a2342" fontWeight="bold">9x9</text>
  </svg>
);

// SVGs de ejemplo para categorías
const MathSVG = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
    <rect x="5" y="5" width="50" height="50" rx="8" fill="#fff" stroke="#2ca6e0" strokeWidth="3"/>
    <text x="15" y="38" fontSize="28" fill="#2ca6e0" fontWeight="bold">Σ</text>
  </svg>
);

// Estructura de categorías y juegos - Solo Matemáticas
const categories = [
  {
    id: 'matematicas',
    name: 'Juegos de Matemáticas',
    icon: <MathSVG />,
    games: [
      {
        id: 'blackjack',
        name: 'Blackjack: Probabilidad Condicional',
        image: <BlackjackSVG />,
      },
      {
        id: 'sudoku',
        name: 'Sudoku',
        image: <SudokuSVG />,
      },
    ],
  },
];

export default function GameMenu() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (!selectedCategory) {
    // Mostrar menú de categorías
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a2342] via-[#2ca6e0] to-[#ffd700] py-12">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold mb-10 bg-gradient-to-r from-[#0a2342] via-[#2ca6e0] to-[#ffd700] bg-clip-text text-transparent drop-shadow-2xl"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Menú de Juegos
        </motion.h1>
        <div className="grid grid-cols-1 gap-8 w-full max-w-2xl px-4">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border-2 border-[#2ca6e0]/20 flex items-center gap-6 p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1, duration: 0.7 }}
              whileHover={{ scale: 1.07, boxShadow: '0 8px 32px 0 rgba(44,166,224,0.25)' }}
              onClick={() => setSelectedCategory(cat)}
            >
              <div className="flex-shrink-0">
                {cat.icon}
              </div>
              <div className="flex-1">
                <div className="block text-xl md:text-2xl font-bold text-[#0a2342] hover:text-[#2ca6e0] transition-colors">
                  {cat.name}
                </div>
                <div className="text-xs text-[#2ca6e0] mt-1">{cat.games.length > 0 ? `${cat.games.length} juegos` : 'Próximamente'}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Mostrar juegos de la categoría seleccionada
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a2342] via-[#2ca6e0] to-[#ffd700] py-12">
      <motion.h2
        className="text-3xl md:text-4xl font-extrabold mb-8 bg-gradient-to-r from-[#0a2342] via-[#2ca6e0] to-[#ffd700] bg-clip-text text-transparent drop-shadow-2xl"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {selectedCategory.name}
      </motion.h2>
      <button
        className="mb-8 px-6 py-2 rounded-xl font-bold text-white bg-[#2ca6e0] hover:bg-[#0a2342] transition-colors"
        onClick={() => setSelectedCategory(null)}
      >
        ← Volver a categorías
      </button>
      {selectedCategory.games.length === 0 ? (
        <div className="text-lg text-[#0a2342] bg-white/70 rounded-xl px-6 py-4 shadow-md">Próximamente juegos en esta categoría.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl px-4">
          {selectedCategory.games.map((game, idx) => (
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
      )}
    </div>
  );
}