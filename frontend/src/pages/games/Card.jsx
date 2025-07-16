// src/pages/games/Card.jsx
import React from 'react';

// Palos y colores
const suitSymbols = {
  spades:   { symbol: '♠', color: '#222' },
  hearts:   { symbol: '♥', color: '#e3342f' },
  diamonds: { symbol: '♦', color: '#e3342f' },
  clubs:    { symbol: '♣', color: '#222' },
};

// SVG reverso de carta
function CardBack() {
  return (
    <svg width="70" height="100" viewBox="0 0 70 100">
      <rect x="2" y="2" width="66" height="96" rx="10" fill="#ffd700" stroke="#0a2342" strokeWidth="3"/>
      <rect x="8" y="8" width="54" height="84" rx="7" fill="#2ca6e0" />
      <text x="35" y="55" textAnchor="middle" fontSize="32" fill="#fff" fontWeight="bold" opacity="0.5">★</text>
    </svg>
  );
}

export default function Card({ value, suit, faceDown = false }) {
  if (faceDown) return (
    <div className="w-[70px] h-[100px] rounded-xl shadow-lg bg-transparent flex items-center justify-center">
      <CardBack />
    </div>
  );

  const { symbol, color } = suitSymbols[suit] || suitSymbols.spades;
  return (
    <div className="w-[70px] h-[100px] rounded-xl shadow-lg bg-white border-2 border-[#ffd700] flex flex-col justify-between p-2 relative">
      <span className="text-lg font-bold" style={{ color }}>{value}</span>
      <span className="text-2xl font-bold absolute left-2 bottom-2" style={{ color }}>{symbol}</span>
      <span className="text-2xl font-bold absolute right-2 top-2" style={{ color, opacity: 0.5 }}>{symbol}</span>
    </div>
  );
} 