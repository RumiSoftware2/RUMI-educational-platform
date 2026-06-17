import React from 'react';

function Tree({ position, color = '#83b56d' }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.72, 10]} />
        <meshStandardMaterial color="#9b7655" roughness={0.76} />
      </mesh>
      <mesh castShadow position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.38, 18, 14]} />
        <meshStandardMaterial color={color} roughness={0.82} />
      </mesh>
    </group>
  );
}

export default function CampusEnvironment() {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#dff0d1" roughness={0.92} />
      </mesh>

      <mesh receiveShadow position={[0, 0.026, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.15, 6.2]} />
        <meshStandardMaterial color="#eadfa8" roughness={0.84} />
      </mesh>

      <mesh receiveShadow position={[0, 0.028, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.48, 1.72, 48]} />
        <meshStandardMaterial color="#cce6bd" roughness={0.84} />
      </mesh>

      {[[-4, -2.6], [4, -2.4], [-4.2, 1.8], [4.1, 2.1], [-2.7, 3.6], [2.9, 3.4]].map(([x, z], index) => (
        <Tree key={`${x}-${z}`} position={[x, 0, z]} color={index % 2 ? '#77aa7a' : '#91c56e'} />
      ))}

      {[[-2.2, 0.2], [2.2, 0.2], [-2.2, 2.2], [2.2, 2.2]].map(([x, z]) => (
        <mesh key={`${x}-${z}`} castShadow position={[x, 0.28, z]}>
          <boxGeometry args={[0.82, 0.18, 0.24]} />
          <meshStandardMaterial color="#f0cf85" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}
