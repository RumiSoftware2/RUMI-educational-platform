import React from 'react';

export default function ServicePanel() {
  return (
    <div className="de-panel rounded-xl p-6 shadow-lg bg-white/30 backdrop-blur-sm">
      <h3 className="text-2xl font-bold mb-2">Recursos para docentes</h3>
      <p className="mb-4">Herramientas de análisis, plantillas de estudio técnico y guías para implementación en el aula.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="de-card p-4 rounded-lg">📈 Análisis Técnico</div>
        <div className="de-card p-4 rounded-lg">🧾 Plantillas</div>
        <div className="de-card p-4 rounded-lg">🔧 Herramientas</div>
      </div>
    </div>
  );
}
