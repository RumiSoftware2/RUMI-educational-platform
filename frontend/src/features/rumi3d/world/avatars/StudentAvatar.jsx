import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import WolfStudentModel from './WolfStudentModel';
import DuckStudentModel from './DuckStudentModel';

const campusLimit = 4.2;

export default function StudentAvatar({ avatar, touchMovement = {} }) {
  const group = useRef();
  const model = useRef();
  const [, getKeys] = useKeyboardControls();

  useFrame((state, delta) => {
    if (!group.current || !model.current) return;

    const keys = getKeys();
    const tm = touchMovement || {};
    const right = Boolean(keys.right || tm.right);
    const left = Boolean(keys.left || tm.left);
    const back = Boolean(keys.back || tm.back);
    const forward = Boolean(keys.forward || tm.forward);
    const x = Number(right) - Number(left);
    const z = Number(back) - Number(forward);
    const moving = x !== 0 || z !== 0;
    const speed = avatar === 'duck' ? 2.1 : 2.35;
    const time = state.clock.elapsedTime;

    if (moving) {
      const length = Math.hypot(x, z) || 1;
      group.current.position.x += (x / length) * speed * delta;
      group.current.position.z += (z / length) * speed * delta;
      group.current.position.x = Math.max(-campusLimit, Math.min(campusLimit, group.current.position.x));
      group.current.position.z = Math.max(-0.9, Math.min(campusLimit, group.current.position.z));
      group.current.rotation.y = Math.atan2(x, z);
    }

    model.current.position.y = Math.sin(time * (moving ? 9 : 3)) * (moving ? 0.055 : 0.025);
    model.current.rotation.z = Math.sin(time * (moving ? 7 : 2.3)) * (moving ? 0.035 : 0.015);

    state.camera.position.lerp(
      {
        x: group.current.position.x + 5.2,
        y: 4.2,
        z: group.current.position.z + 7.2,
      },
      0.035
    );
    state.camera.lookAt(group.current.position.x, 1.15, group.current.position.z - 1.1);
  });

  return (
    <group ref={group} position={[0, 0.72, 2.7]}>
      <group ref={model}>
        {avatar === 'wolf' ? <WolfStudentModel /> : <DuckStudentModel />}
      </group>
    </group>
  );
}
