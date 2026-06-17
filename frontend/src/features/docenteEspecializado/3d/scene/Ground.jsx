import React from 'react';

export default function Ground() {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#e8f3d7" roughness={0.9} />
      </mesh>

      {[-1.1, -0.55, 0, 0.55, 1.1].map((x, index) => (
        <mesh key={x} receiveShadow position={[x, 0.025, 0.75 - index * 0.74]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.14, 24]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#9cbf8c' : '#f1d981'} roughness={0.78} />
        </mesh>
      ))}

      {[[-2.8, -2.3], [2.65, -2.1], [-3.2, 1.5], [3, 1.35]].map(([x, z]) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh castShadow position={[0, 0.25, 0]}>
            <sphereGeometry args={[0.22, 16, 12]} />
            <meshStandardMaterial color="#9cc77b" roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0, 0.58, 0]}>
            <sphereGeometry args={[0.16, 16, 12]} />
            <meshStandardMaterial color="#7fb26c" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
