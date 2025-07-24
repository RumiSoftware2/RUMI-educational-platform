import React from 'react';

export default function CountdownTimer({ seconds }) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  const isWarning = seconds <= 120;
  return (
    <div className={`flex flex-col items-center ${isWarning ? 'animate-pulse' : ''}`}>
      <div className={`text-3xl md:text-4xl font-mono font-extrabold ${isWarning ? 'text-red-400' : 'text-yellow-300'} drop-shadow-lg`}>
        {min.toString().padStart(2, '0')}:{sec.toString().padStart(2, '0')}
      </div>
      <div className="text-xs text-white mt-1">Tiempo restante</div>
    </div>
  );
} 