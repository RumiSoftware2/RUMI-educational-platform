import React from 'react';

export default function GameStatsBar({ money, timer }) {
  return (
    <div className="flex gap-6 mb-4">
      <div className="bg-black/40 rounded-lg px-4 py-2 text-center">
        <div className="text-white text-xs">Tiempo restante</div>
        <div className="text-yellow-300 font-bold text-lg">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</div>
      </div>
      <div className="bg-black/40 rounded-lg px-4 py-2 text-center">
        <div className="text-white text-xs">Dinero</div>
        <div className="text-green-300 font-bold text-lg">${money}</div>
      </div>
    </div>
  );
} 