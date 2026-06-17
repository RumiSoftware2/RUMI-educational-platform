import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import AvatarSelector from './AvatarSelector';
import WolfAvatar from './avatars/WolfAvatar';
import DuckAvatar from './avatars/DuckAvatar';
import RumiBuilding from './buildings/RumiBuilding';
import CameraRig from './scene/CameraRig';
import Ground from './scene/Ground';
import Lighting from './scene/Lighting';
import './styles/rumiWorld.css';

export default function RumiWorld() {
  const [selectedAvatar, setSelectedAvatar] = useState('wolf');
  const [isEntering, setIsEntering] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const startEntry = () => {
    setSelectedAvatar('wolf');
    setIsEntering(true);
  };

  const resetScene = () => {
    setIsEntering(false);
    setResetKey((key) => key + 1);
  };

  return (
    <section className="rumi-world">
      <div className="rumi-world__toolbar">
        <div>
          <p className="rumi-world__eyebrow">Entorno 3D</p>
          <h2 className="rumi-world__title">Elige tu avatar RUMI</h2>
        </div>

        <AvatarSelector
          selectedAvatar={selectedAvatar}
          onSelect={(avatar) => {
            setSelectedAvatar(avatar);
            setIsEntering(false);
          }}
        />

        <div className="rumi-world__actions">
          <button type="button" onClick={startEntry}>
            Entrar a RUMI
          </button>
          <button type="button" onClick={resetScene} className="rumi-world__secondary">
            Reiniciar
          </button>
        </div>
      </div>

      <div className="rumi-world__canvas" aria-label="Escena 3D de RUMI con avatar y edificio">
        <Canvas shadows dpr={[1, 1.75]}>
          <color attach="background" args={['#f7fbef']} />
          <fog attach="fog" args={['#f7fbef', 12, 32]} />
          <PerspectiveCamera makeDefault position={[5.5, 4.2, 8]} fov={46} />
          <Suspense fallback={null}>
            <Lighting />
            <Ground />
            <RumiBuilding doorOpen={isEntering} />
            {selectedAvatar === 'wolf' ? (
              <WolfAvatar key={`wolf-${resetKey}`} isEntering={isEntering} />
            ) : (
              <DuckAvatar key={`duck-${resetKey}`} />
            )}
            <CameraRig isEntering={isEntering} selectedAvatar={selectedAvatar} />
          </Suspense>
          <OrbitControls
            enablePan={false}
            minDistance={6}
            maxDistance={13}
            minPolarAngle={Math.PI / 5}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Canvas>
      </div>
    </section>
  );
}
