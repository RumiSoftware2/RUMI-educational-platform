import React from 'react';

function AcademyWindow({ position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.42, 0.42, 0.05]} />
      <meshStandardMaterial color="#d9f5ff" emissive="#8ddbec" emissiveIntensity={0.28} roughness={0.28} />
    </mesh>
  );
}

export default function RumiAcademy() {
  return (
    <group position={[0, 0, -3.4]}>
      <mesh castShadow receiveShadow position={[0, 1.28, 0]}>
        <boxGeometry args={[4.4, 2.55, 1.75]} />
        <meshStandardMaterial color="#d8edca" roughness={0.68} />
      </mesh>
      <mesh castShadow position={[0, 2.9, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.55, 1.35, 4]} />
        <meshStandardMaterial color="#6f965f" roughness={0.68} />
      </mesh>
      <mesh castShadow position={[0, 3.55, -0.02]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.52, 0.52, 0.2]} />
        <meshStandardMaterial color="#f1cf69" metalness={0.05} roughness={0.36} />
      </mesh>

      <mesh castShadow position={[0, 1.95, -0.93]}>
        <boxGeometry args={[1.48, 0.36, 0.08]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0, 0.66, -0.92]}>
        <boxGeometry args={[0.84, 1.28, 0.1]} />
        <meshStandardMaterial color="#547d45" roughness={0.55} />
      </mesh>
      <mesh position={[0.28, 0.7, -1]}>
        <sphereGeometry args={[0.04, 12, 8]} />
        <meshStandardMaterial color="#f6d76d" metalness={0.15} roughness={0.3} />
      </mesh>

      <AcademyWindow position={[-1.45, 1.36, -0.93]} />
      <AcademyWindow position={[1.45, 1.36, -0.93]} />
      <AcademyWindow position={[-1.45, 0.76, -0.93]} />
      <AcademyWindow position={[1.45, 0.76, -0.93]} />

      <mesh castShadow position={[-2.45, 0.78, 0]}>
        <boxGeometry args={[0.5, 1.55, 1.45]} />
        <meshStandardMaterial color="#c7e3ba" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[2.45, 0.78, 0]}>
        <boxGeometry args={[0.5, 1.55, 1.45]} />
        <meshStandardMaterial color="#c7e3ba" roughness={0.7} />
      </mesh>
    </group>
  );
}
