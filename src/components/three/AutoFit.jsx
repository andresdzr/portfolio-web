import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Keeps the model fully inside the canvas on any aspect ratio by moving the
// perspective camera back when the box is too tall or too wide for the view.
export default function AutoFit({ width, height, direction = [0.55, 0.12, 0.83] }) {
  const { camera, size } = useThree();

  useEffect(() => {
    const dir = new THREE.Vector3(...direction).normalize();
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const aspect = size.width / Math.max(size.height, 1);
    const distV = height / 2 / Math.tan(fov / 2);
    const distH = width / 2 / (Math.tan(fov / 2) * aspect);
    camera.position.copy(dir.multiplyScalar(Math.max(distV, distH)));
    camera.lookAt(0, 0, 0);
  }, [camera, size, width, height, direction]);

  return null;
}
