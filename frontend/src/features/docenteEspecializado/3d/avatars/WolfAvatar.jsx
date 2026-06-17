import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function WolfAvatar({ isEntering }) {
  const group = useRef();
  const legA = useRef();
  const legB = useRef();
  const tail = useRef();

  useFrame((state, delta) => {
    if (!group.current) return;

    const time = state.clock.elapsedTime;
    if (isEntering) {
      group.current.position.z = Math.max(-2.15, group.current.position.z - delta * 1.25);
      group.current.rotation.y = 0;
    } else {
      group.current.position.z = 2.6;
      group.current.rotation.y = Math.sin(time * 0.8) * 0.08;
    }

    group.current.position.y = Math.sin(time * 4) * 0.035;
    if (legA.current) legA.current.rotation.x = Math.sin(time * 8) * 0.24;
    if (legB.current) legB.current.rotation.x = Math.sin(time * 8 + Math.PI) * 0.24;
    if (tail.current) tail.current.rotation.z = -0.5 + Math.sin(time * 3) * 0.18;
  });

  return (
    <group ref={group} position={[0, 0.72, 2.6]} scale={0.92}>
      <mesh castShadow position={[0, 0.42, 0]}>
        <capsuleGeometry args={[0.36, 0.9, 8, 18]} />
        <meshStandardMaterial color="#8fa2ad" roughness={0.65} />
      </mesh>

      <mesh castShadow position={[0, 0.98, -0.5]}>
        <sphereGeometry args={[0.38, 32, 24]} />
        <meshStandardMaterial color="#9cadb6" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 0.9, -0.86]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.18, 0.34, 24]} />
        <meshStandardMaterial color="#eef4f3" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 0.94, -1.04]}>
        <sphereGeometry args={[0.06, 16, 12]} />
        <meshStandardMaterial color="#263238" roughness={0.45} />
      </mesh>

      <mesh castShadow position={[-0.22, 1.3, -0.52]} rotation={[0, 0, -0.28]}>
        <coneGeometry args={[0.11, 0.34, 3]} />
        <meshStandardMaterial color="#718791" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.22, 1.3, -0.52]} rotation={[0, 0, 0.28]}>
        <coneGeometry args={[0.11, 0.34, 3]} />
        <meshStandardMaterial color="#718791" roughness={0.7} />
      </mesh>

      <mesh castShadow position={[-0.13, 1.02, -0.84]}>
        <sphereGeometry args={[0.035, 12, 8]} />
        <meshStandardMaterial color="#75c7e8" emissive="#1a6f8c" emissiveIntensity={0.35} />
      </mesh>
      <mesh castShadow position={[0.13, 1.02, -0.84]}>
        <sphereGeometry args={[0.035, 12, 8]} />
        <meshStandardMaterial color="#75c7e8" emissive="#1a6f8c" emissiveIntensity={0.35} />
      </mesh>

      <group ref={tail} position={[0, 0.58, 0.58]} rotation={[0.55, 0, -0.5]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.09, 0.72, 8, 14]} />
          <meshStandardMaterial color="#6f838d" roughness={0.7} />
        </mesh>
      </group>

      {[[-0.24, 0, -0.26], [0.24, 0, -0.26]].map((position, index) => (
        <group ref={index === 0 ? legA : legB} position={position} key={position.join('-')}>
          <mesh castShadow position={[0, -0.22, 0]}>
            <capsuleGeometry args={[0.08, 0.38, 8, 12]} />
            <meshStandardMaterial color="#738994" roughness={0.72} />
          </mesh>
        </group>
      ))}
      {[[-0.24, -0.25, 0.34], [0.24, -0.25, 0.34]].map((position) => (
        <mesh castShadow position={position} key={position.join('-')}>
          <capsuleGeometry args={[0.08, 0.32, 8, 12]} />
          <meshStandardMaterial color="#738994" roughness={0.72} />
        </mesh>
      ))}
    </group>
  );
}
