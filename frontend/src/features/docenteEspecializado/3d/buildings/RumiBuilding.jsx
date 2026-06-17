import React from 'react';
import { Text } from '@react-three/drei';

function Window({ position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.38, 0.38, 0.04]} />
      <meshStandardMaterial color="#d8f4ff" emissive="#9fdff2" emissiveIntensity={0.35} roughness={0.25} />
    </mesh>
  );
}

export default function RumiBuilding({ doorOpen }) {
  return (
    <group position={[0, 0, -3]}>
      <mesh receiveShadow castShadow position={[0, 1.25, 0]}>
        <boxGeometry args={[3.8, 2.5, 1.6]} />
        <meshStandardMaterial color="#dbeecb" roughness={0.7} />
      </mesh>

      <mesh castShadow position={[0, 2.75, 0]}>
        <coneGeometry args={[2.25, 1.25, 4]} />
        <meshStandardMaterial color="#7c9b68" roughness={0.68} />
      </mesh>

      <mesh castShadow position={[0, 3.35, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.45, 0.45, 0.18]} />
        <meshStandardMaterial color="#f1cf69" metalness={0.08} roughness={0.38} />
      </mesh>

      <mesh position={[0, 2.35, -0.84]}>
        <boxGeometry args={[1.25, 0.34, 0.08]} />
        <meshStandardMaterial color="#ffffff" roughness={0.42} />
      </mesh>
      <mesh position={[0, 2.36, -0.9]}>
        <boxGeometry args={[1.06, 0.04, 0.03]} />
        <meshStandardMaterial color="#315c38" />
      </mesh>

      <Text
        position={[0, 2.39, -0.91]}
        rotation={[0, 0, 0]}
        fontSize={0.28}
        color="#315c38"
        anchorX="center"
        anchorY="middle"
      >
        RUMI
      </Text>

      <group position={[0, 1.18, -0.84]}>
        <mesh castShadow position={doorOpen ? [-0.28, -0.35, -0.02] : [0, -0.35, 0]} rotation={[0, doorOpen ? -0.85 : 0, 0]}>
          <boxGeometry args={[0.68, 1.25, 0.08]} />
          <meshStandardMaterial color="#5b7f49" roughness={0.58} />
        </mesh>
        <mesh position={[0, 0.32, -0.03]}>
          <torusGeometry args={[0.43, 0.04, 12, 32, Math.PI]} />
          <meshStandardMaterial color="#315c38" roughness={0.45} />
        </mesh>
      </group>

      <Window position={[-1.15, 1.55, -0.84]} />
      <Window position={[1.15, 1.55, -0.84]} />
      <Window position={[-1.15, 0.85, -0.84]} />
      <Window position={[1.15, 0.85, -0.84]} />

      <mesh receiveShadow position={[0, 0.04, 1.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.35, 4.4]} />
        <meshStandardMaterial color="#e9d79b" roughness={0.88} />
      </mesh>

    </group>
  );
}
