import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollRotation } from '../../hooks/useScrollRotation';

// Peripheral service nodes orbiting the cloud, each synced back by a connection line.
function usePeripheralNodes(count, radius) {
  return useMemo(() => {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const y = (Math.random() - 0.5) * 1.3;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
    }
    return pts;
  }, [count, radius]);
}

// Lobe layout tuned to read as a classic, recognizable cloud silhouette:
// a wide flat-ish base row with bumpy, smaller lobes stacked on top.
const LOBES = [
  [-1.3, -0.15, 0, 0.72],
  [-0.55, -0.3, 0.1, 0.85],
  [0.3, -0.25, -0.05, 0.9],
  [1.15, -0.1, 0.05, 0.68],
  [-0.65, 0.45, 0.15, 0.65],
  [0.15, 0.6, -0.1, 0.7],
  [0.85, 0.4, 0.1, 0.55],
];

function CloudShape() {
  const group = useRef();
  const linesRef = useRef([]);
  const nodes = usePeripheralNodes(7, 2.5);
  const rotTarget = useScrollRotation();

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        rotTarget.current,
        0.06
      );
    }
    linesRef.current.forEach((line, i) => {
      if (!line) return;
      const pulse = 0.4 + 0.6 * Math.abs(Math.sin(state.clock.elapsedTime * 1.2 + i));
      line.material.opacity = pulse * 0.45;
    });
  });

  return (
    <group ref={group}>
      {/* Cloud body: overlapping low-poly spheres arranged into a recognizable cloud silhouette */}
      {LOBES.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]}>
          <icosahedronGeometry args={[s, 1]} />
          <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.45} />
        </mesh>
      ))}

      {/* Peripheral data/service nodes synced to the cloud */}
      {nodes.map((p, i) => (
        <group key={i}>
          <mesh position={p}>
            <octahedronGeometry args={[0.12, 0]} />
            <meshBasicMaterial color="#a855f7" wireframe />
          </mesh>
          <line ref={(el) => (linesRef.current[i] = el)}>
            <bufferGeometry
              attach="geometry"
              onUpdate={(geo) => geo.setFromPoints([new THREE.Vector3(0, 0, 0), p])}
            />
            <lineBasicMaterial attach="material" color="#38bdf8" transparent opacity={0.4} />
          </line>
        </group>
      ))}
    </group>
  );
}

export default function CloudNetwork() {
  return (
    <Canvas camera={{ position: [0, 0.6, 6.2], fov: 42 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.4} />
      <CloudShape />
    </Canvas>
  );
}
