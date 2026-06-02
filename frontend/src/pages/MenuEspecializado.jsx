import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MenuEspecializado() {
  const navigate = useNavigate();

  const [cards] = useState([
    {
      id: 1,
      name: 'N males',
      description: 'Aplicación para operar con números en distintas bases y visualizar el desarrollo paso a paso.',
      icon: '🎯',
      url: 'https://nmal-fraccion.vercel.app/'
    }
  ]);

  const handleCardClick = (url) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.location.href = url;
    } else {
      navigate(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18465A] via-purple-800 to-indigo-900 pt-8 pb-12">
      <div className="container mx-auto px-4">
        {/* Volver */}
        <div className="mb-4">
          <button onClick={() => {
            // Intentar volver en el historial, con fallback a /courses
            try {
              navigate(-1);
            } catch (e) {
              navigate('/courses');
            }
          }} className="text-white/90 hover:text-white font-medium">← Volver</button>
        </div>

        {/* Encabezado */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
            N males
          </h1>
        </div>

        {/* Single centered card */}
        <div className="max-w-xl mx-auto">
          {cards.map((card) => (
            <div key={card.id} onClick={() => handleCardClick(card.url)} className="group cursor-pointer">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-8 h-full hover:border-white/40 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20 hover:scale-105 transform">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors duration-300">{card.name}</h3>

                <p className="text-white/70 group-hover:text-white transition-colors duration-300 leading-relaxed">{card.description}</p>

                <div className="mt-6 flex items-center gap-2 text-white/60 group-hover:text-yellow-300 transition-colors duration-300 font-semibold">
                  <span>Acceder</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
