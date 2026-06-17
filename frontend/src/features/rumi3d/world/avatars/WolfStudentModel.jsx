import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function WolfStudentModel() {
  const tail = useRef();
  const leftArm = useRef();
  const rightArm = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (tail.current) tail.current.rotation.z = -0.55 + Math.sin(time * 4) * 0.16;
    if (leftArm.current) leftArm.current.rotation.x = Math.sin(time * 6) * 0.18;
    if (rightArm.current) rightArm.current.rotation.x = Math.sin(time * 6 + Math.PI) * 0.18;
  });

  return (
    <group scale={0.95}>
      <mesh castShadow position={[0, 0.48, 0]} scale={[0.82, 1.08, 0.62]}>
        <sphereGeometry args={[0.48, 32, 24]} />
        <meshStandardMaterial color="#8ea1aa" roughness={0.68} />
      </mesh>
      <mesh castShadow position={[0, 0.95, -0.05]}>
        <sphereGeometry args={[0.38, 32, 24]} />
        <meshStandardMaterial color="#aebdc4" roughness={0.72} />
      </mesh>
      <mesh castShadow position={[0, 0.86, -0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.19, 0.38, 28]} />
        <meshStandardMaterial color="#eff4f0" roughness={0.58} />
      </mesh>
      <mesh castShadow position={[0, 0.9, -0.64]}>
        <sphereGeometry args={[0.055, 16, 10]} />
        <meshStandardMaterial color="#263036" roughness={0.42} />
      </mesh>
      <mesh castShadow position={[-0.2, 1.28, -0.03]} rotation={[0.1, 0, -0.35]}>
        <coneGeometry args={[0.12, 0.34, 3]} />
        <meshStandardMaterial color="#6e828d" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.2, 1.28, -0.03]} rotation={[0.1, 0, 0.35]}>
        <coneGeometry args={[0.12, 0.34, 3]} />
        <meshStandardMaterial color="#6e828d" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-0.12, 0.98, -0.4]}>
        <sphereGeometry args={[0.035, 12, 8]} />
        <meshStandardMaterial color="#73c8ea" emissive="#236f8a" emissiveIntensity={0.35} />
      </mesh>
      <mesh castShadow position={[0.12, 0.98, -0.4]}>
        <sphereGeometry args={[0.035, 12, 8]} />
        <meshStandardMaterial color="#73c8ea" emissive="#236f8a" emissiveIntensity={0.35} />
      </mesh>
      <mesh castShadow position={[0, 0.42, 0.34]} scale={[0.72, 0.82, 0.22]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4f7d55" roughness={0.62} />
      </mesh>
      <mesh castShadow position={[-0.25, 0.62, 0.02]} rotation={[0.18, 0, -0.08]}>
        <capsuleGeometry args={[0.035, 0.64, 8, 10]} />
        <meshStandardMaterial color="#f3d077" roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0.25, 0.62, 0.02]} rotation={[0.18, 0, 0.08]}>
        <capsuleGeometry args={[0.035, 0.64, 8, 10]} />
        <meshStandardMaterial color="#f3d077" roughness={0.5} />
      </mesh>
      <group ref={tail} position={[0, 0.48, 0.58]} rotation={[0.45, 0, -0.55]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.09, 0.74, 8, 14]} />
          <meshStandardMaterial color="#6d818b" roughness={0.72} />
        </mesh>
      </group>
      <group ref={leftArm} position={[-0.43, 0.48, -0.04]} rotation={[0, 0, 0.2]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.07, 0.5, 8, 12]} />
          <meshStandardMaterial color="#80949e" roughness={0.7} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.43, 0.48, -0.04]} rotation={[0, 0, -0.2]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.07, 0.5, 8, 12]} />
          <meshStandardMaterial color="#80949e" roughness={0.7} />
        </mesh>
      </group>
      {[[-0.2, -0.05, -0.12], [0.2, -0.05, -0.12]].map((position) => (
        <mesh castShadow position={position} key={position.join('-')}>
          <capsuleGeometry args={[0.085, 0.46, 8, 12]} />
          <meshStandardMaterial color="#718691" roughness={0.72} />
        </mesh>
      ))}
    </group>
  );
}
