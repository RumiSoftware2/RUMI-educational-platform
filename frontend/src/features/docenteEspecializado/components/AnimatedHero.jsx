import React from 'react';
import Footprints from './Footprints';

export default function AnimatedHero() {
  return (
    <div className="de-hero-container rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="de-bg-decor absolute inset-0 opacity-40"></div>
      <div className="de-content relative z-10 flex flex-col md:flex-row items-center gap-6">
        <div className="de-image-wrapper flex-1 flex items-center justify-center">
          <img
            src="/src/features/docenteEspecializado/assets/rumi-portada-estudio-tecnico.png"
            alt="Rumi Portada"
            className="de-image"
          />
        </div>

        <div className="de-text flex-1">
          <h1 className="de-title">Docente Especializado</h1>
          <h2 className="de-subtitle">Análisis y Estudio Técnico</h2>
          <p className="de-lead mt-4">Interfaz creada para apoyar el trabajo técnico y analítico de docentes especializados, con visuales suaves y elementos animados.</p>
        </div>
      </div>

      <Footprints />
    </div>
  );
}
