import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MenuEspecializado() {
  const navigate = useNavigate();

  const [cards] = useState([
    {
      id: 1,
      name: 'N males',
      description: 'Este software está diseñado para trabajar con números en cualquier base menor o igual a 36, ofreciendo una solución completa y versátil para operaciones matemáticas fuera del sistema decimal tradicional. Permite realizar cálculos con números en distintas bases, incluyendo suma, resta, multiplicación y división, manteniendo precisión en cada resultado Además, presenta el desarrollo paso a paso de cada operación, simulando los procedimientos realizados manualmente en papel, lo que facilita la comprensión y el aprendizaje de los procesos involucrados. ',
      icon: '🎯',
      url: 'https://nmal-fraccion.vercel.app/'
    },
    {
      id: 2,
      name: 'Recursos',
      description: 'Explora una amplia variedad de recursos educativos diseñados para tu aprendizaje.',
      icon: '📚',
      url: '/recursos'
    },
    {
      id: 3,
      name: 'Herramientas',
      description: 'Utiliza herramientas avanzadas para potenciar tu experiencia educativa.',
      icon: '🛠️',
      url: '/herramientas'
    },
    {
      id: 4,
      name: 'Soporte',
      description: 'Obtén ayuda y soporte especializado para resolver tus dudas y problemas.',
      icon: '💬',
      url: '/soporte'
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
    <div className="min-h-screen bg-gradient-to-br from-[#18465A] via-purple-800 to-indigo-900 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
            App Especializado
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Accede a herramientas y recursos especializados para potenciar tu experiencia de aprendizaje
          </p>
        </div>

        {/* Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.url)}
              className="group cursor-pointer"
            >
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-8 h-full hover:border-white/40 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20 hover:scale-105 transform">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                    {card.icon}
                  </div>
                  <div className="text-white/50 group-hover:text-white transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors duration-300">
                  {card.name}
                </h3>

                <p className="text-white/70 group-hover:text-white transition-colors duration-300 leading-relaxed">
                  {card.description}
                </p>

                {/* Botón de acción */}
                <div className="mt-6 flex items-center gap-2 text-white/60 group-hover:text-yellow-300 transition-colors duration-300 font-semibold">
                  <span>Acceder</span>
                  <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sección adicional de información */}
        <div className="mt-16 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-md border border-yellow-500/20 rounded-2xl p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">¿Cómo funciona App Especializado?</h2>
          <ul className="space-y-3 text-white/80">
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">✓</span>
              <span>Accede a recursos personalizados según tu rol y perfil educativo</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">✓</span>
              <span>Utiliza herramientas avanzadas diseñadas para mejorar tu aprendizaje</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">✓</span>
              <span>Obtén soporte especializado en tiempo real cuando lo necesites</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
