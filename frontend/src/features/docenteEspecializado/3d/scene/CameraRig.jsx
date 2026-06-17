import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

const defaultPosition = new Vector3(5.5, 4.2, 8);
const entryPosition = new Vector3(3.6, 2.8, 5.4);

export default function CameraRig({ isEntering, selectedAvatar }) {
  const { camera } = useThree();

  useFrame(() => {
    const targetPosition = isEntering && selectedAvatar === 'wolf' ? entryPosition : defaultPosition;
    camera.position.lerp(targetPosition, 0.035);
    camera.lookAt(0, 1.1, -1.35);
  });

  return null;
}
