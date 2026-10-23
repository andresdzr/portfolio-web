import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollRotation } from '../../hooks/useScrollRotation';

// Profile visual: two degrees as one surface. A carrier wave runs across a lit sheet
// (telecom) and is sampled into glowing points above it (data), coloured from violet
// through green to silver.
const COLS = 90;
const ROWS = 46;
const W = 5.6;
const H = 3.2;
const palette = [new THREE.Color('#7c5cff'), new THREE.Color('#34d399'), new THREE.Color('#e2e8f0')];

function height(x, z, t) {
  return (
    Math.sin(x * 1.6 - t * 1.4) * 0.28 * Math.cos(z * 0.8) +
    Math.sin((x + z) * 2.4 - t * 2.1) * 0.08 +
    Math.cos(Math.hypot(x, z) * 2.2 - t * 1.8) * 0.12
  );
}

function colourAt(u) {
  const k = THREE.MathUtils.clamp(u, 0, 1) * (palette.length - 1);
  const i = Math.min(palette.length - 2, Math.floor(k));
  return palette[i].clone().lerp(palette[i + 1], k - i);
}

function Field() {
  const group = useRef();
  const sheet = useRef();
  const dots = useRef();
  const rot = useScrollRotation();

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(W, H, COLS - 1, ROWS - 1);
    g.rotateX(-Math.PI / 2);
    const colors = new Float32Array(g.attributes.position.count * 3);
    for (let i = 0; i < g.attributes.position.count; i++) {
      colourAt((g.attributes.position.getX(i) + W / 2) / W).toArray(colors, i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  // sampled points: every third vertex, lifted above the sheet
  const sample = useMemo(() => {
    const idx = [];
    for (let r = 0; r < ROWS; r += 3) for (let c = 0; c < COLS; c += 3) idx.push(r * COLS + c);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(idx.length * 3), 3));
    const colors = new Float32Array(idx.length * 3);
    idx.forEach((v, i) => colourAt((geo.attributes.position.getX(v) + W / 2) / W).toArray(colors, i * 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return { g, idx };
  }, [geo]);

  useFrame(({ clock, pointer }, delta) => {
    const t = clock.elapsedTime;
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, height(pos.getX(i), pos.getZ(i), t));
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    const sp = sample.g.attributes.position;
    sample.idx.forEach((v, i) => sp.setXYZ(i, pos.getX(v), pos.getY(v) + 0.32, pos.getZ(v)));
    sp.needsUpdate = true;

    const dt = Math.min(delta, 0.05);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, -0.5 + rot.current * 0.5 + pointer.x * 0.15, 3, dt);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, 0.45 - pointer.y * 0.08, 3, dt);
  });

  return (
    <group ref={group} rotation={[0.45, -0.5, 0]}>
      <mesh ref={sheet} geometry={geo}>
        <meshPhysicalMaterial vertexColors metalness={0.35} roughness={0.5} clearcoat={0.3} clearcoatRoughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geo} position={[0, 0.002, 0]}>
        <meshBasicMaterial color="#c7d2fe" wireframe transparent opacity={0.08} />
      </mesh>
      <points ref={dots} geometry={sample.g}>
        <pointsMaterial vertexColors size={0.05} sizeAttenuation transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

function PointerLight() {
  const ref = useRef();
  useFrame(({ pointer, viewport }, delta) => {
    const dt = Math.min(delta, 0.05);
    ref.current.position.x = THREE.MathUtils.damp(ref.current.position.x, (pointer.x * viewport.width) / 2, 5, dt);
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, (pointer.y * viewport.height) / 2 + 1, 5, dt);
  });
  return <pointLight ref={ref} position={[0, 1, 2.5]} intensity={4} distance={6} decay={1.5} color="#a78bfa" />;
}

export default function SignalField() {
  return (
    <Canvas
      camera={{ position: [0, 2.4, 7.8], fov: 40 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ camera }) => camera.lookAt(0, -0.15, 0)}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 5, 2]} intensity={1.2} color="#e2e8f0" />
      <directionalLight position={[-4, 2, -3]} intensity={1.6} color="#34d399" />
      <PointerLight />
      <Field />
    </Canvas>
  );
}
