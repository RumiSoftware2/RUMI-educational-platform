import React, { useState } from 'react';
import '../styles/docenteEspecializado.css';
import AnimatedHero from '../components/AnimatedHero';
import ServicePanel from '../components/ServicePanel';
import RumiWorld from '../3d/RumiWorld';
import TeacherProfileForm from '../components/TeacherProfileForm';

export default function DocenteEspecializado() {
  const [openMarca, setOpenMarca] = useState(false);

  return (
    <main className="de-main min-h-screen flex flex-col items-center justify-start p-8">
      <section className="de-hero w-full max-w-5xl mt-8">
        <AnimatedHero />
      </section>

      <section className="w-full max-w-5xl mt-8">
        <ServicePanel onOpenMarcaPersonal={() => setOpenMarca(true)} />
      </section>

      <section className="w-full max-w-6xl mt-10">
        <RumiWorld />
      </section>

      {openMarca && <TeacherProfileForm onClose={() => setOpenMarca(false)} />}
    </main>
  );
}
