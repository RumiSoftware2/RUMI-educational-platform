import React, { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import CampusEnvironment from './scene/CampusEnvironment';
import CampusLights from './scene/CampusLights';
import RumiAcademy from './scene/RumiAcademy';
import RumiLetters from './scene/RumiLetters';
import StudentAvatar from './avatars/StudentAvatar';
import StudentAvatarSelector from './ui/StudentAvatarSelector';

export default function RumiCampusWorld() {
  const [avatar, setAvatar] = useState('wolf');
  const controls = useMemo(
    () => [
      { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
      { name: 'back', keys: ['ArrowDown', 'KeyS'] },
      { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
      { name: 'right', keys: ['ArrowRight', 'KeyD'] },
    ],
    []
  );

  return (
    <section className="rumi3d-world">
      <div className="rumi3d-toolbar">
        <StudentAvatarSelector selectedAvatar={avatar} onSelect={setAvatar} />
        <div className="rumi3d-help">Flechas o WASD para moverte</div>
      </div>

      <KeyboardControls map={controls}>
        <div className="rumi3d-canvas" aria-label="Campus 3D de RUMI">
          <Canvas shadows dpr={[1, 1.75]}>
            <color attach="background" args={['#eef8f3']} />
            <fog attach="fog" args={['#eef8f3', 16, 36]} />
            <PerspectiveCamera makeDefault position={[6, 4.5, 8]} fov={46} />
            <Suspense fallback={null}>
              <CampusLights />
              <CampusEnvironment />
              <RumiAcademy />
              <RumiLetters />
              <StudentAvatar avatar={avatar} />
            </Suspense>
            <OrbitControls
              enablePan={false}
              minDistance={6}
              maxDistance={14}
              minPolarAngle={Math.PI / 5}
              maxPolarAngle={Math.PI / 2.15}
            />
          </Canvas>
        </div>
      </KeyboardControls>
    </section>
  );
}
