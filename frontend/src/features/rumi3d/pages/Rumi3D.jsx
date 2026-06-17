import React from 'react';
import RumiCampusWorld from '../world/RumiCampusWorld';
import '../styles/rumi3d.css';

export default function Rumi3D() {
  return (
    <main className="rumi3d-page">
      <section className="rumi3d-shell">
        <div className="rumi3d-intro">
          <p>Campus interactivo</p>
          <h1>RUMI 3D</h1>
          <span>Escoge al lobo o al pato estudiante y recorre el campus con las flechas.</span>
        </div>
        <RumiCampusWorld />
      </section>
    </main>
  );
}
