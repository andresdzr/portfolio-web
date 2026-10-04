import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollRotation } from '../../hooks/useScrollRotation';
import AutoFit from './AutoFit';

const NODE_COUNT = 26;
const NEIGHBORS = 3;
const SHELL_RADIUS = 1.9;

// Evenly spread nodes on a sphere (Fibonacci lattice), with a small
// deterministic radial variation so the cloud feels organic, not perfect.
function buildNodes(count) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (i / (count - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const r = SHELL_RADIUS * (1 + 0.12 * Math.sin(i * 2.3) * Math.cos(i * 1.1));
    return new THREE.Vector3(Math.cos(theta) * ring * r, y * r, Math.sin(theta) * ring * r);
  });
}

// Candidate links: each node to its nearest neighbours, deduplicated.
function buildPairs(nodes) {
  const seen = new Set();
  const pairs = [];
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, d: a.distanceTo(b) }))
      .filter((x) => x.j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, NEIGHBORS)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          pairs.push([i, j]);
        }
      });
  });
  return pairs;
}

// Sharp, short flashes: near zero most of the time, a soft peak now and then.
function flash(t, period, phase) {
  const s = 0.5 + 0.5 * Math.sin((t / period) * Math.PI * 2 + phase);
  return Math.pow(s, 14);
}

const SUB = 10;

function Constellation() {
  const group = useRef();
  const nodeRefs = useRef([]);
  const rotTarget = useScrollRotation();

  const { nodes, pairs, nodeTiming, linkTiming, colors } = useMemo(() => {
    const nodes = buildNodes(NODE_COUNT);
    const pairs = buildPairs(nodes);
    return {
      nodes,
      pairs,
      nodeTiming: nodes.map(() => ({ period: 3 + Math.random() * 4, phase: Math.random() * Math.PI * 2 })),
      linkTiming: pairs.map(() => ({ period: 5 + Math.random() * 3, phase: Math.random() }) ),
      colors: {
        nodeBase: new THREE.Color('#9461cc'),
        cyan: new THREE.Color('#4aaed9'),
        nodeFlash: new THREE.Color('#e2d4f5'),
        linkBase: new THREE.Color('#7a52b0'),
        linkPulse: new THREE.Color('#d9c6f2'),
        tmp: new THREE.Color(),
      },
    };
  }, []);

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const segCount = pairs.length * SUB;
    const positions = new Float32Array(segCount * 2 * 3);
    const point = new THREE.Vector3();
    pairs.forEach(([a, b], p) => {
      for (let k = 0; k < SUB; k++) {
        const seg = (p * SUB + k) * 6;
        point.lerpVectors(nodes[a], nodes[b], k / SUB).toArray(positions, seg);
        point.lerpVectors(nodes[a], nodes[b], (k + 1) / SUB).toArray(positions, seg + 3);
      }
    });
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(segCount * 2 * 3), 3));
    return geo;
  }, [nodes, pairs]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, rotTarget.current, 0.06);
      group.current.rotation.x = Math.sin(t * 0.15) * 0.15;
    }

    const nodeLight = nodeTiming.map(({ period, phase }) => flash(t, period, phase));

    nodeRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const base = i % 3 === 0 ? colors.cyan : colors.nodeBase;
      mesh.material.color.copy(base).lerp(colors.nodeFlash, nodeLight[i]);
    });

    const attr = lineGeometry.attributes.color;
    const pulseWidth = 0.14;
    pairs.forEach(([a, b], p) => {
      const { period, phase } = linkTiming[p];
      const pulse = (t / period + phase) % 1;
      const level = 0.75;
      const write = (s, index) => {
        const d = s - pulse;
        const glow = Math.exp(-(d * d) / (2 * pulseWidth * pulseWidth));
        colors.tmp.copy(colors.linkBase).multiplyScalar(level);
        colors.tmp.lerp(colors.linkPulse, glow * 0.6);
        attr.setXYZ(index, colors.tmp.r, colors.tmp.g, colors.tmp.b);
      };
      for (let k = 0; k < SUB; k++) {
        const seg = (p * SUB + k) * 2;
        write(k / SUB, seg);
        write((k + 1) / SUB, seg + 1);
      }
    });
    attr.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial vertexColors />
      </lineSegments>
      {nodes.map((p, i) => (
        <mesh key={i} position={p} ref={(el) => (nodeRefs.current[i] = el)}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshBasicMaterial color={i % 3 === 0 ? '#4aaed9' : '#9461cc'} />
        </mesh>
      ))}
      {/* Outer hypercube-style wireframe shell */}
      <mesh>
        <icosahedronGeometry args={[2.1, 1]} />
        <meshBasicMaterial color="#2f9e7a" wireframe transparent opacity={0.14} />
      </mesh>
    </group>
  );
}

export default function NeuralConstellation({ shiftX = 0 }) {
  return (
    <Canvas camera={{ position: [0, 0, 4.8], fov: 45 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.4} />
      <AutoFit width={12.5} height={7.4} direction={[0, 0.05, 1]} />
      <group position={[shiftX, 0, 0]}>
        <Constellation />
      </group>
    </Canvas>
  );
}
