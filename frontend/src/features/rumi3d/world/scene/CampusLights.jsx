import React from 'react';

export default function CampusLights() {
  return (
    <>
      <ambientLight intensity={0.62} />
      <directionalLight
        castShadow
        position={[4.5, 7, 5]}
        intensity={1.35}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-4, 2.6, 2.2]} color="#fff2a8" intensity={0.5} />
      <pointLight position={[3.6, 2.4, -3]} color="#bfefff" intensity={0.42} />
    </>
  );
}
