import React from 'react';

export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight
        castShadow
        position={[4, 6, 5]}
        intensity={1.35}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-3, 2.5, 2]} color="#fff0a6" intensity={0.65} />
      <pointLight position={[3, 2.2, -2]} color="#c8efff" intensity={0.45} />
    </>
  );
}
