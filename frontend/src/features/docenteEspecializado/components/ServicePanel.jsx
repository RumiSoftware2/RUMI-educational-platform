import React from 'react';

export default function ServicePanel({ onOpenMarcaPersonal }) {
  return (
    <div className="de-panel rounded-xl p-8 shadow-lg bg-white/30 backdrop-blur-sm border border-white/20 text-center">
      <h3 className="text-3xl font-extrabold text-emerald-900 mb-2">Marca Personal RUMI</h3>
      <p className="text-md text-emerald-800/90 mb-6 max-w-xl mx-auto">
        Diseña tu portafolio profesional en minutos. Completa tu información académica y obtén una página de presentación interactiva con un enlace público único listo para compartir.
      </p>

      <button
        onClick={onOpenMarcaPersonal}
        className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-emerald-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        ✨ Crear Marca Personal
      </button>
    </div>
  );
}
