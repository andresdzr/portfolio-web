import { createContext, Suspense, useContext, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment, Lightformer } from '@react-three/drei';
import CommSatellite from './CommSatellite';

// Hero scene: Earth's horizon seen from orbit, a communications satellite above it,
// a downlink beam with travelling wavefronts and a rippling footprint, packets riding it
// and data fragments drifting through space.
const EARTH_R = 5;
const EARTH_Y = -6.3;
const SAT = new THREE.Vector3(0, 0.75, 0);
const ORBIT_R = SAT.y - EARTH_Y;
const { damp } = THREE.MathUtils;

// Shared per-frame state: the smoothed scroll progress and where the satellite is now.
const Live = createContext(null);
const useLive = () => useContext(Live);
const BLUE = '#5b8cff';
const VIOLET = '#8b7bff';
const LILAC = '#a5b4fc';
const GREEN = '#34d399';
const SILVER = '#e2e8f0';

const atmosphereShader = {
  uniforms: { uColor: { value: new THREE.Color('#6f8dff') }, uPower: { value: 3.2 } },
  vertexShader: `
    varying vec3 vNormal; varying vec3 vView;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vView = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: `
    uniform vec3 uColor; uniform float uPower;
    varying vec3 vNormal; varying vec3 vView;
    void main() {
      float f = pow(1.0 - max(dot(vNormal, vView), 0.0), uPower);
      gl_FragColor = vec4(uColor, f * 0.95);
    }`,
};

// Points on the visible cap of the sphere (y > 0 in local space).
function capPoints(count, radius, minY = 0.55) {
  const pts = [];
  while (pts.length < count) {
    const v = new THREE.Vector3().randomDirection();
    if (v.y < minY) continue;
    pts.push(v.multiplyScalar(radius));
  }
  return pts;
}

function Stars() {
  const geo = useMemo(() => {
    const arr = new Float32Array(900 * 3);
    for (let i = 0; i < 900; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(18 + Math.random() * 20);
      v.z = -Math.abs(v.z);
      arr.set([v.x, v.y, v.z], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);
  const ref = useRef();
  useFrame((_, dt) => { ref.current.rotation.z += dt * 0.004; });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#c7d2fe" size={0.06} sizeAttenuation transparent opacity={0.8} depthWrite={false} />
    </points>
  );
}

function Earth() {
  const spin = useRef();
  const cities = useMemo(() => new THREE.BufferGeometry().setFromPoints(capPoints(3200, EARTH_R * 1.002, -1)), []);
  const live = useLive();
  useFrame((_, dt) => {
    // the planet rolls under the orbit, faster while the film plays
    spin.current.rotation.z += dt * (0.025 + live.p * 0.05);
    spin.current.rotation.y += dt * 0.01;
  });

  return (
    <group position={[0, EARTH_Y, 0]}>
      <mesh>
        <sphereGeometry args={[EARTH_R, 96, 96]} />
        <meshStandardMaterial color="#060a22" emissive="#080d2e" emissiveIntensity={0.35} roughness={0.85} metalness={0.1} />
      </mesh>
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[EARTH_R * 1.003, 40, 20]} />
          <meshBasicMaterial color={BLUE} wireframe transparent opacity={0.07} depthWrite={false} />
        </mesh>
        <points geometry={cities}>
          <pointsMaterial color={LILAC} size={0.035} sizeAttenuation transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
      </group>
      {/* atmosphere glow on the limb */}
      <mesh scale={1.06}>
        <sphereGeometry args={[EARTH_R, 96, 96]} />
        <shaderMaterial args={[atmosphereShader]} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh scale={1.015}>
        <sphereGeometry args={[EARTH_R, 96, 96]} />
        <shaderMaterial
          args={[{ ...atmosphereShader, uniforms: { uColor: { value: new THREE.Color(VIOLET) }, uPower: { value: 5 } } }]}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

const UP = new THREE.Vector3(0, 1, 0);
const EARTH_C = new THREE.Vector3(0, EARTH_Y, 0);

// The satellite keeps station over the visible limb while the planet turns beneath it.
// Its local +Y always points away from Earth, so the dish (underneath) always faces the
// planet; the bus yaws about that axis, and the beam follows wherever the dish looks.
function Satellite() {
  const ref = useRef();
  const feed = useRef();
  const dish = useRef();
  const live = useLive();
  const tmp = useMemo(
    () => ({
      radial: new THREE.Vector3(),
      oc: new THREE.Vector3(),
      x: new THREE.Vector3(1, 0, 0),
      align: new THREE.Quaternion(),
      yaw: new THREE.Quaternion(),
      tilt: new THREE.Quaternion(),
      q: new THREE.Quaternion(),
      wq: new THREE.Quaternion(),
    }),
    []
  );
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const p = live.p;
    const dt = Math.min(delta, 0.05);
    // a slow drift along the orbit, kept inside the frame
    const a = Math.sin(t * 0.11) * 0.045 - p * 0.05;
    tmp.radial.set(Math.sin(a), Math.cos(a), 0);
    ref.current.position.copy(tmp.radial).multiplyScalar(ORBIT_R + Math.sin(t * 0.8) * 0.04).add(EARTH_C);
    ref.current.position.z = THREE.MathUtils.lerp(0, 0.3, p);
    // attitude: up = radial, a small pitch so the dish face reads, then yaw about the radial
    tmp.align.setFromUnitVectors(UP, tmp.radial);
    tmp.tilt.setFromAxisAngle(tmp.x, 0.22);
    tmp.yaw.setFromAxisAngle(UP, -0.6 + p * Math.PI * 2 + Math.sin(t * 0.22) * 0.35);
    tmp.q.copy(tmp.align).multiply(tmp.tilt).multiply(tmp.yaw);
    ref.current.quaternion.slerp(tmp.q, 1 - Math.exp(-6 * dt));

    live.sat.copy(ref.current.position);
    if (feed.current) feed.current.getWorldPosition(live.feed);
    if (dish.current) {
      // the dish opens toward its local +Y; follow that axis down to the planet
      dish.current.getWorldQuaternion(tmp.wq);
      live.axis.copy(UP).applyQuaternion(tmp.wq).normalize();
      tmp.oc.copy(live.feed).sub(EARTH_C);
      const b = tmp.oc.dot(live.axis);
      const disc = b * b - (tmp.oc.lengthSq() - EARTH_R * EARTH_R);
      const d = disc > 0 ? -b - Math.sqrt(disc) : -1;
      if (d > 0) live.hit.copy(live.axis).multiplyScalar(d).add(live.feed);
      else live.hit.copy(tmp.oc).setLength(EARTH_R).add(EARTH_C);
      live.normal.copy(live.hit).sub(EARTH_C).normalize();
    }
  });
  return (
    <group ref={ref} position={SAT} scale={0.44}>
      <CommSatellite feedRef={feed} dishRef={dish} />
    </group>
  );
}

// A volumetric cone of light from the feed to the footprint: soft body that fades at the
// silhouette, and bands of signal travelling down it.
const beamShader = {
  uniforms: {
    uTime: { value: 0 },
    uTop: { value: new THREE.Color(SILVER) },
    uMid: { value: new THREE.Color(VIOLET) },
    uBottom: { value: new THREE.Color(GREEN) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv; varying vec3 vN; varying vec3 vV;
    void main() {
      vUv = uv;
      vN = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vV = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    uniform float uTime; uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uBottom;
    varying vec2 vUv; varying vec3 vN; varying vec3 vV;
    void main() {
      float along = vUv.y;                       // 1 at the feed, 0 at the ground
      float facing = abs(dot(normalize(vN), normalize(vV)));
      float body = pow(facing, 1.6);
      float x = fract(along * 9.0 + uTime * 1.1);
      float band = smoothstep(0.0, 0.08, x) * (1.0 - smoothstep(0.08, 0.38, x));
      float fine = 0.5 + 0.5 * sin(vUv.x * 48.0 + uTime * 2.0);
      vec3 col = along > 0.5 ? mix(uMid, uTop, (along - 0.5) * 2.0) : mix(uBottom, uMid, along * 2.0);
      float a = body * (0.10 + 0.55 * band * (0.75 + 0.25 * fine));
      a *= smoothstep(0.0, 0.06, along) * smoothstep(1.0, 0.9, along);
      gl_FragColor = vec4(col, a);
    }`,
};

function Downlink() {
  const live = useLive();
  const beam = useRef();
  const fronts = useRef([]);
  const ripples = useRef([]);
  const core = useRef();
  const packets = useRef([]);
  const shader = useMemo(() => ({ ...beamShader, uniforms: THREE.UniformsUtils.clone(beamShader.uniforms) }), []);
  const tmp = useMemo(
    () => ({ dir: new THREE.Vector3(), mid: new THREE.Vector3(), q: new THREE.Quaternion(), qn: new THREE.Quaternion(), z: new THREE.Vector3(0, 0, 1) }),
    []
  );
  const FRONTS = 7;
  const RIPPLES = 4;
  const PACKETS = 10;
  const R_TOP = 0.05;
  const R_GROUND = 0.62;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const start = live.feed;
    const end = live.hit;
    const len = start.distanceTo(end);
    tmp.dir.copy(start).sub(end).normalize(); // ground → feed
    tmp.mid.copy(start).add(end).multiplyScalar(0.5);
    tmp.q.setFromUnitVectors(UP, tmp.dir);

    beam.current.position.copy(tmp.mid);
    beam.current.quaternion.copy(tmp.q);
    beam.current.scale.set(1, len, 1);
    shader.uniforms.uTime.value = t;

    // wavefronts: paired rings that leave the dish and widen with the cone
    tmp.qn.setFromUnitVectors(tmp.z, tmp.dir);
    fronts.current.forEach((m, i) => {
      if (!m) return;
      const f = (t * 0.32 + i / FRONTS) % 1; // 0 at the feed
      m.position.lerpVectors(start, end, f);
      m.quaternion.copy(tmp.qn);
      m.scale.setScalar(THREE.MathUtils.lerp(R_TOP, R_GROUND, f));
      const fade = Math.sin(Math.PI * f);
      m.children.forEach((c, k) => {
        c.material.opacity = fade * (k === 0 ? 0.85 : 0.35);
      });
    });

    // footprint: ripples spreading over the surface where the beam lands
    tmp.qn.setFromUnitVectors(tmp.z, live.normal);
    ripples.current.forEach((m, i) => {
      if (!m) return;
      const f = (t * 0.45 + i / RIPPLES) % 1;
      m.position.copy(end).addScaledVector(live.normal, 0.01);
      m.quaternion.copy(tmp.qn);
      m.scale.setScalar(0.08 + f * 1.1);
      m.material.opacity = (1 - f) * 0.7;
    });
    core.current.position.copy(end).addScaledVector(live.normal, 0.02);
    core.current.quaternion.copy(tmp.qn);
    core.current.scale.setScalar(1 + Math.sin(t * 4) * 0.15);

    // data packets riding the link, down and back up
    packets.current.forEach((m, i) => {
      if (!m) return;
      const down = i % 2 === 0;
      const f = (t * 0.42 + i / PACKETS) % 1;
      m.position.lerpVectors(down ? start : end, down ? end : start, f);
      m.material.opacity = Math.sin(Math.PI * f);
    });
  });

  return (
    <group>
      <mesh ref={beam}>
        <cylinderGeometry args={[R_TOP, R_GROUND, 1, 64, 1, true]} />
        <shaderMaterial args={[shader]} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      {Array.from({ length: FRONTS }, (_, i) => (
        <group key={i} ref={(el) => (fronts.current[i] = el)}>
          <mesh>
            <torusGeometry args={[1, 0.018, 8, 96]} />
            <meshBasicMaterial color={[SILVER, VIOLET, GREEN][i % 3]} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh scale={0.82}>
            <torusGeometry args={[1, 0.01, 6, 96]} />
            <meshBasicMaterial color={[VIOLET, GREEN, BLUE][i % 3]} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: RIPPLES }, (_, i) => (
        <mesh key={i} ref={(el) => (ripples.current[i] = el)}>
          <ringGeometry args={[0.9, 1, 96]} />
          <meshBasicMaterial color={i % 2 ? GREEN : LILAC} transparent side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      <group ref={core}>
        <mesh>
          <circleGeometry args={[0.07, 32]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <circleGeometry args={[0.22, 32]} />
          <meshBasicMaterial color={GREEN} transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
      {Array.from({ length: PACKETS }, (_, i) => (
        <mesh key={i} ref={(el) => (packets.current[i] = el)}>
          <boxGeometry args={[0.04, 0.04, 0.04]} />
          <meshBasicMaterial color={i % 2 ? '#ffffff' : GREEN} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

// Data fragments: small glowing tiles drifting up from the planet.
function DataField() {
  const COUNT = 110;
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        x: (Math.random() - 0.5) * 6,
        z: (Math.random() - 0.5) * 4 - 0.5,
        y: Math.random() * 5 - 1.6,
        speed: 0.08 + Math.random() * 0.22,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 1.2,
        s: 0.015 + Math.random() * 0.03,
      })),
    []
  );
  useFrame((_, dt) => {
    seeds.forEach((d, i) => {
      d.y += d.speed * dt;
      if (d.y > 3.2) d.y = -1.6;
      d.rot += d.spin * dt;
      dummy.position.set(d.x, d.y, d.z);
      dummy.rotation.set(d.rot, d.rot * 0.7, 0);
      const fade = Math.min(1, (d.y + 1.6) / 0.8) * Math.min(1, (3.2 - d.y) / 0.8);
      dummy.scale.setScalar(d.s * fade);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  const colors = useMemo(() => {
    const c = new Float32Array(COUNT * 3);
    const pal = [new THREE.Color(BLUE), new THREE.Color(VIOLET), new THREE.Color(SILVER), new THREE.Color(GREEN)];
    for (let i = 0; i < COUNT; i++) pal[i % 4].toArray(c, i * 3);
    return c;
  }, []);
  return (
    <instancedMesh ref={mesh} args={[null, null, COUNT]}>
      <boxGeometry args={[1.6, 0.5, 0.1]}>
        <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
      </boxGeometry>
      <meshBasicMaterial vertexColors transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

// Orbital track arcing over the horizon through the satellite.
function OrbitTrack() {
  const ref = useRef();
  useFrame((_, dt) => { ref.current.rotation.z += dt * 0.03; });
  const r = ORBIT_R;
  return (
    <group position={[0, EARTH_Y, 0]} rotation={[0.18, 0, 0]}>
      <mesh ref={ref} rotation={[Math.PI / 2 - 0.18, 0, 0]}>
        <torusGeometry args={[r, 0.006, 6, 256]} />
        <meshBasicMaterial color={LILAC} transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2 + 0.35, 0.25, 0]}>
        <torusGeometry args={[r + 0.6, 0.004, 6, 256]} />
        <meshBasicMaterial color={GREEN} transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Smooths the raw scroll progress and moves the camera; pointer adds a slight parallax.
function Rig({ progress, children }) {
  const ref = useRef();
  const live = useLive();
  useFrame(({ camera, pointer, size }, delta) => {
    const dt = Math.min(delta, 0.05);
    const target = progress ? progress.get() : 0;
    live.p = damp(live.p, target, 3.2, dt);
    const p = live.p;
    // portrait screens see the scene through a much smaller window, so start further out
    const portrait = size.width / size.height < 0.9;
    const open = Math.min(1, p / 0.42);
    const z = portrait ? THREE.MathUtils.lerp(10.5, 7, open) - p * 1.2 : 5.6 - p * 1.4;
    camera.position.x = damp(camera.position.x, pointer.x * 0.25 + p * 0.9, 2.5, dt);
    camera.position.y = damp(camera.position.y, 0.55 - p * 0.35 + pointer.y * 0.12, 2.5, dt);
    camera.position.z = damp(camera.position.z, z, 2.5, dt);
    camera.lookAt(live.sat.x * 0.6, -0.2 + p * 0.15, 0);
  });
  return <group ref={ref}>{children}</group>;
}

// A soft light that sits where the pointer is, so the model catches it as you move.
function PointerLight() {
  const ref = useRef();
  useFrame(({ pointer, viewport }, delta) => {
    const dt = Math.min(delta, 0.05);
    const x = (pointer.x * viewport.width) / 2;
    const y = (pointer.y * viewport.height) / 2;
    ref.current.position.x = damp(ref.current.position.x, x, 5, dt);
    ref.current.position.y = damp(ref.current.position.y, y, 5, dt);
  });
  return <pointLight ref={ref} position={[0, 0, 2.5]} intensity={9} distance={7} color="#c4b5fd" />;
}

function Scene({ progress }) {
  const live = useMemo(
    () => ({ p: 0, sat: SAT.clone(), feed: SAT.clone(), axis: new THREE.Vector3(0, -1, 0), hit: new THREE.Vector3(0, EARTH_Y + EARTH_R, 0), normal: new THREE.Vector3(0, 1, 0) }),
    []
  );
  return (
    <Live.Provider value={live}>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 5, 3]} intensity={2.6} color="#fff1dc" />
      <directionalLight position={[-5, 1, -2]} intensity={1.4} color={VIOLET} />
      <pointLight position={[-3, -1, 2]} intensity={6} color={VIOLET} distance={8} />
      <PointerLight />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[3, 4, 4]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={2.5} color={VIOLET} position={[-5, 1, 2]} scale={[4, 6, 1]} />
        <Lightformer form="rect" intensity={1.5} color={GREEN} position={[0, -4, 3]} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={2} color={SILVER} position={[2, 2, -5]} scale={3} />
      </Environment>
      <Stars />
      <Rig progress={progress}>
        <Earth />
        <OrbitTrack />
        <Satellite />
        <Downlink />
        <DataField />
      </Rig>
    </Live.Provider>
  );
}

export default function OrbitalHorizon({ progress, active = true }) {
  return (
    <Canvas
      camera={{ position: [0, 0.55, 5.6], fov: 48 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
    >
      <Suspense fallback={null}>
        <Scene progress={progress} />
      </Suspense>
    </Canvas>
  );
}
