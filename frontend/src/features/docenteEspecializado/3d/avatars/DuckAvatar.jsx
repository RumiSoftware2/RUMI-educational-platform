import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function DuckAvatar() {
  const group = useRef();
  const wingLeft = useRef();
  const wingRight = useRef();

  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.elapsedTime;
    group.current.position.y = 0.72 + Math.sin(time * 3.2) * 0.06;
    group.current.rotation.y = Math.sin(time * 1.4) * 0.16;
    if (wingLeft.current) wingLeft.current.rotation.z = 0.45 + Math.sin(time * 5) * 0.22;
    if (wingRight.current) wingRight.current.rotation.z = -0.45 - Math.sin(time * 5) * 0.22;
  });

  return (
    <group ref={group} position={[0, 0.72, 2.55]} scale={0.9}>
      <mesh castShadow position={[0, 0.36, 0]} scale={[1.05, 0.9, 0.92]}>
        <sphereGeometry args={[0.46, 32, 24]} />
        <meshStandardMaterial color="#ffe77b" roughness={0.62} />
      </mesh>
      <mesh castShadow position={[0, 0.94, -0.12]}>
        <sphereGeometry args={[0.34, 32, 24]} />
        <meshStandardMaterial color="#fff0a5" roughness={0.58} />
      </mesh>
      <mesh castShadow position={[0, 0.88, -0.48]} scale={[1, 0.45, 0.5]}>
        <sphereGeometry args={[0.2, 24, 16]} />
        <meshStandardMaterial color="#f6a23b" roughness={0.5} />
      </mesh>
      <mesh castShadow ref={wingLeft} position={[-0.43, 0.38, 0.02]} rotation={[0.2, 0, 0.45]} scale={[0.42, 0.1, 0.26]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#f8d95e" roughness={0.65} />
      </mesh>
      <mesh castShadow ref={wingRight} position={[0.43, 0.38, 0.02]} rotation={[0.2, 0, -0.45]} scale={[0.42, 0.1, 0.26]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#f8d95e" roughness={0.65} />
      </mesh>
      <mesh castShadow position={[-0.11, 0.99, -0.39]}>
        <sphereGeometry args={[0.035, 12, 8]} />
        <meshStandardMaterial color="#1f2933" roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0.11, 0.99, -0.39]}>
        <sphereGeometry args={[0.035, 12, 8]} />
        <meshStandardMaterial color="#1f2933" roughness={0.4} />
      </mesh>
      {[[-0.14, -0.12, -0.16], [0.14, -0.12, -0.16]].map((position) => (
        <mesh castShadow position={position} key={position.join('-')} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.035, 0.28, 8, 8]} />
          <meshStandardMaterial color="#ef8d2f" roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
}
