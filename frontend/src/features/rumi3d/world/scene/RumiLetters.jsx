import React from 'react';
import { Text } from '@react-three/drei';

export default function RumiLetters() {
  return (
    <group position={[0, 2.03, -4.38]}>
      <Text
        fontSize={0.46}
        color="#315c38"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.018}
        outlineColor="#f5d56f"
        characters="RUMI"
      >
        RUMI
      </Text>
    </group>
  );
}
