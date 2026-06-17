import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function DuckStudentModel() {
  const leftWing = useRef();
  const rightWing = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (leftWing.current) leftWing.current.rotation.z = 0.35 + Math.sin(time * 5) * 0.2;
    if (rightWing.current) rightWing.current.rotation.z = -0.35 - Math.sin(time * 5) * 0.2;
  });

  return (
    <group scale={0.95}>
      <mesh castShadow position={[0, 0.4, 0]} scale={[0.86, 1, 0.72]}>
        <sphereGeometry args={[0.48, 32, 24]} />
        <meshStandardMaterial color="#ffe27a" roughness={0.62} />
      </mesh>
      <mesh castShadow position={[0, 0.95, -0.08]}>
        <sphereGeometry args={[0.36, 32, 24]} />
        <meshStandardMaterial color="#fff0aa" roughness={0.58} />
      </mesh>
      <mesh castShadow position={[0, 0.87, -0.5]} scale={[1.08, 0.42, 0.48]}>
        <sphereGeometry args={[0.2, 24, 16]} />
        <meshStandardMaterial color="#f3a13b" roughness={0.48} />
      </mesh>
      <mesh castShadow position={[0, 0.38, 0.34]} scale={[0.64, 0.72, 0.2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#5a9a62" roughness={0.62} />
      </mesh>
      <mesh castShadow position={[-0.22, 0.58, 0.02]} rotation={[0.14, 0, -0.1]}>
        <capsuleGeometry args={[0.032, 0.56, 8, 10]} />
        <meshStandardMaterial color="#f4cf76" roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0.22, 0.58, 0.02]} rotation={[0.14, 0, 0.1]}>
        <capsuleGeometry args={[0.032, 0.56, 8, 10]} />
        <meshStandardMaterial color="#f4cf76" roughness={0.5} />
      </mesh>
      <mesh castShadow ref={leftWing} position={[-0.42, 0.46, -0.04]} rotation={[0.12, 0, 0.35]} scale={[0.34, 0.08, 0.24]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#f7d35e" roughness={0.65} />
      </mesh>
      <mesh castShadow ref={rightWing} position={[0.42, 0.46, -0.04]} rotation={[0.12, 0, -0.35]} scale={[0.34, 0.08, 0.24]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#f7d35e" roughness={0.65} />
      </mesh>
      <mesh castShadow position={[-0.11, 0.99, -0.38]}>
        <sphereGeometry args={[0.035, 12, 8]} />
        <meshStandardMaterial color="#1f2933" roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0.11, 0.99, -0.38]}>
        <sphereGeometry args={[0.035, 12, 8]} />
        <meshStandardMaterial color="#1f2933" roughness={0.4} />
      </mesh>
      {[[-0.13, -0.12, -0.08], [0.13, -0.12, -0.08]].map((position) => (
        <mesh castShadow position={position} key={position.join('-')} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.04, 0.3, 8, 8]} />
          <meshStandardMaterial color="#ef8d2f" roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
}
