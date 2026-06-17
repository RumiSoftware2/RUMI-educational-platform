import React from 'react';
import '../styles/docenteEspecializado.css';
import AnimatedHero from '../components/AnimatedHero';
import ServicePanel from '../components/ServicePanel';
import RumiWorld from '../3d/RumiWorld';

export default function DocenteEspecializado() {
  return (
    <main className="de-main min-h-screen flex flex-col items-center justify-start p-8">
      <section className="de-hero w-full max-w-5xl mt-8">
        <AnimatedHero />
      </section>

      <section className="w-full max-w-5xl mt-8">
        <ServicePanel />
      </section>

      <section className="w-full max-w-6xl mt-10">
        <RumiWorld />
      </section>
    </main>
  );
}
