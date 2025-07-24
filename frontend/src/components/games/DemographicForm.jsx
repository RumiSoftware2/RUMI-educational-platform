import React, { useState } from 'react';

export default function DemographicForm({ onSubmit }) {
  const [age, setAge] = useState('');
  const [educationLevel, setEducationLevel] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (age && educationLevel) {
      onSubmit(age, educationLevel);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-700 to-green-500 py-8">
      <div className="rounded-3xl shadow-2xl border-4 border-[#ffd700] bg-green-800/80 p-8 max-w-md w-full">
        <h1 className="text-3xl font-extrabold text-white mb-6 text-center">Blackjack Educativo</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-white font-bold mb-2">Edad:</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-yellow-400 focus:border-yellow-300 focus:outline-none"
              placeholder="Ingresa tu edad"
              min="1"
              max="120"
              required
            />
          </div>
          <div>
            <label className="block text-white font-bold mb-2">Último grado de estudio:</label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-yellow-400 focus:border-yellow-300 focus:outline-none"
              required
            >
              <option value="">Selecciona...</option>
              <option value="primaria">Primaria</option>
              <option value="secundaria">Secundaria</option>
              <option value="preparatoria">Preparatoria</option>
              <option value="universidad">Universidad</option>
              <option value="posgrado">Posgrado</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={!age || !educationLevel}
            className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${
              age && educationLevel 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Comenzar Juego
          </button>
        </form>
      </div>
    </div>
  );
} 