import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollRotation } from '../../hooks/useScrollRotation';
import AutoFit from './AutoFit';

// Cloud lobes: [x, y, z, radius]. A wide, flat-bottomed cluster with stacked
// rounded lobes on top, giving a recognizable geometric cloud silhouette.
const LOBES = [
  [-1.5, -0.25, 0, 0.62],
  [-0.9, -0.2, 0.25, 0.78],
  [-0.2, -0.3, 0.1, 0.9],
  [0.55, -0.25, -0.15, 0.82],
  [1.3, -0.3, 0.1, 0.64],
  [-1.1, 0.5, 0.05, 0.6],
  [-0.35, 0.78, -0.1, 0.78],
  [0.45, 0.85, 0.15, 0.7],
  [1.1, 0.5, -0.05, 0.58],
  [-0.05, 0.25, 0.45, 0.55],
  [0.6, 0.3, 0.4, 0.5],
];

// Service nodes placed on a ring around the cloud, at fixed positions.
const NODE_COUNT = 9;
const NODE_RING = 2.7;
const NODE_HEIGHTS = [0.5, -0.4, 0.2, -0.7, 0.7, -0.15, 0.4, -0.55, 0.05];

function buildNodes() {
  return Array.from({ length: NODE_COUNT }, (_, i) => {
    const angle = (i / NODE_COUNT) * Math.PI * 2 + 0.3;
    return new THREE.Vector3(
      Math.cos(angle) * NODE_RING,
      NODE_HEIGHTS[i],
      Math.sin(angle) * NODE_RING * 0.8
    );
  });
}

// Anchor each connection on the surface of the lobe closest to its node,
// so every line visibly starts on the cloud and ends exactly on its node.
function lobeSurfaceAnchor(node) {
  let best = null;
  let bestDist = Infinity;
  for (const [x, y, z, r] of LOBES) {
    const center = new THREE.Vector3(x, y, z);
    const d = center.distanceTo(node) - r;
    if (d < bestDist) {
      bestDist = d;
      best = { center, r };
    }
  }
  const dir = new THREE.Vector3().subVectors(node, best.center).normalize();
  return best.center.clone().addScaledVector(dir, best.r);
}

// Glowing core inside a wireframe shell, with an orbit ring tilted per node.
function ServiceNode({ position, index }) {
  const ring = useRef();
  useFrame((state) => {
    if (ring.current) ring.current.rotation.z = state.clock.elapsedTime * 0.8 + index;
  });

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#f0abfc" emissive="#d946ef" emissiveIntensity={1.4} roughness={0.2} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.14, 1]} />
        <meshBasicMaterial color="#e879f9" wireframe transparent opacity={0.7} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2.6, 0, index * 0.7]}>
        <torusGeometry args={[0.22, 0.008, 8, 40]} />
        <meshBasicMaterial color="#e879f9" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function CloudShape() {
  const group = useRef();
  const linesMat = useRef();
  const nodes = useMemo(buildNodes, []);
  const rotTarget = useScrollRotation();

  const connectionGeometry = useMemo(() => {
    const points = [];
    nodes.forEach((node) => {
      points.push(lobeSurfaceAnchor(node), node);
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [nodes]);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        rotTarget.current,
        0.06
      );
    }
    if (linesMat.current) {
      linesMat.current.opacity = 0.25 + 0.2 * Math.abs(Math.sin(state.clock.elapsedTime * 1.2));
    }
  });

  return (
    <group ref={group}>
      {/* Cloud body: dense platinum wireframe lobes over a solid, opaque core */}
      {LOBES.map(([x, y, z, r], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh>
            <icosahedronGeometry args={[r, 3]} />
            <meshBasicMaterial color="#7b8494" wireframe transparent opacity={0.6} />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[r * 0.97, 2]} />
            <meshStandardMaterial color="#4b5566" transparent opacity={0.5} roughness={0.7} metalness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Connections: each line runs from a lobe surface point to its node */}
      <lineSegments geometry={connectionGeometry}>
        <lineBasicMaterial ref={linesMat} color="#38bdf8" transparent opacity={0.4} />
      </lineSegments>

      {/* Peripheral service nodes, exactly at the connection endpoints */}
      {nodes.map((p, i) => (
        <ServiceNode key={i} position={p} index={i} />
      ))}
    </group>
  );
}

export default function CloudNetwork({ shiftX = 0 }) {
  return (
    <Canvas camera={{ position: [0, 0.6, 5.4], fov: 42 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.4} />
      <AutoFit width={11} height={6} direction={[0, 0.1, 1]} />
      <group position={[shiftX, 0, 0]}>
        <CloudShape />
      </group>
    </Canvas>
  );
}
