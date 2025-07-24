import React from 'react';

export default function SessionAnalysis({ gameStats, money, timer, onNewSession, onAdvancedAnalysis }) {
  const winRate = gameStats.rounds > 0 ? ((gameStats.wins / gameStats.rounds) * 100).toFixed(1) : 0;
  const quizAccuracy = gameStats.totalQuizzes > 0 ? ((gameStats.quizScore / gameStats.totalQuizzes) * 100).toFixed(1) : 0;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-700 to-green-500 py-8">
      <div className="rounded-3xl shadow-2xl border-4 border-[#ffd700] bg-green-800/80 p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Análisis de tu Juego</h2>
        <div className="space-y-4 text-white">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-300">{gameStats.rounds}</div>
              <div className="text-sm">Rondas jugadas</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-300">{winRate}%</div>
              <div className="text-sm">Tasa de victoria</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-600/80 rounded-lg p-2 text-center">
              <div className="text-lg font-bold">{gameStats.wins}</div>
              <div className="text-xs">Victorias</div>
            </div>
            <div className="bg-red-600/80 rounded-lg p-2 text-center">
              <div className="text-lg font-bold">{gameStats.losses}</div>
              <div className="text-xs">Derrotas</div>
            </div>
            <div className="bg-blue-600/80 rounded-lg p-2 text-center">
              <div className="text-lg font-bold">{gameStats.ties}</div>
              <div className="text-xs">Empates</div>
            </div>
          </div>
          {gameStats.totalQuizzes > 0 && (
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-center mb-2">
                <div className="text-xl font-bold text-yellow-300">{quizAccuracy}%</div>
                <div className="text-sm">Precisión en quizzes</div>
              </div>
              <div className="text-xs text-center">
                {gameStats.quizScore} de {gameStats.totalQuizzes} correctas
              </div>
            </div>
          )}
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-300">{Math.floor(gameStats.timeSpent / 60)}:{(gameStats.timeSpent % 60).toString().padStart(2, '0')}</div>
              <div className="text-sm">Tiempo total jugado</div>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">${money}</div>
              <div className="text-sm">Dinero restante</div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button
            onClick={onNewSession}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            Nueva Sesión
          </button>
          <button
            onClick={onAdvancedAnalysis}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Análisis Avanzado
          </button>
        </div>
      </div>
    </div>
  );
} 