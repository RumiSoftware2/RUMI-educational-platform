import React from 'react';

export default function GameStatsBar({ money, children }) {
  return (
    <div className="flex gap-6 mb-4 items-center">
      {children}
      <div className="bg-black/40 rounded-lg px-4 py-2 text-center">
        <div className="text-white text-xs">Dinero</div>
        <div className="text-green-300 font-bold text-lg">${money}</div>
      </div>
    </div>
  );
} 