import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollRotation } from '../../hooks/useScrollRotation';

// Generates a random 3D point cloud representing neurons/data nodes.
function useNodes(count) {
  return useMemo(() => {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.6 + Math.random() * 0.6;
      pts.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        )
      );
    }
    return pts;
  }, [count]);
}

function Constellation() {
  const group = useRef();
  const nodes = useNodes(26);
  const rotTarget = useScrollRotation();

  // Connect each node to its nearest neighbors to form a neural-graph look.
  const lines = useMemo(() => {
    const segs = [];
    nodes.forEach((a, i) => {
      const distances = nodes
        .map((b, j) => ({ j, d: a.distanceTo(b) }))
        .filter((x) => x.j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 2);
      distances.forEach(({ j }) => {
        segs.push(a, nodes[j]);
      });
    });
    return segs;
  }, [nodes]);

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setFromPoints(lines);
    return geo;
  }, [lines]);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        rotTarget.current,
        0.06
      );
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.15;
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#a855f7" transparent opacity={0.35} />
      </lineSegments>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color={i % 3 === 0 ? '#38bdf8' : '#a855f7'} />
        </mesh>
      ))}
      {/* Outer hypercube-style wireframe shell */}
      <mesh>
        <icosahedronGeometry args={[2.1, 1]} />
        <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

export default function NeuralConstellation() {
  return (
    <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.4} />
      <Constellation />
    </Canvas>
  );
}
