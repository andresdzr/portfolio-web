import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollRotation } from '../../hooks/useScrollRotation';
import AutoFit from './AutoFit';

// A large, imposing deep-space communications dish: solid shaded reflector,
// tripod feed converging on a ball joint, elevation pivot and a tiered
// control-tower pedestal — modeled after large array antennas.
const R = 2; // dish radius — big and dominant in frame
const DEPTH = 0.85; // deep bowl for a dramatic concave read
const RIM_Z = DEPTH;
const FEED_Z = DEPTH + 0.55;
const BASE_PITCH = -0.55; // tilted back, aimed skyward
const BASE_YAW = Math.PI - 0.25; // turned 180° from the previous facing, slightly off-axis for depth

function useDishProfile() {
  return useMemo(() => {
    const points = [];
    const segments = 26;
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * R;
      const y = ((x * x) / (R * R)) * DEPTH;
      points.push(new THREE.Vector2(x, y));
    }
    return points;
  }, []);
}

function rimPoint(angle, z = RIM_Z) {
  return new THREE.Vector3(R * Math.cos(angle), -R * Math.sin(angle), z);
}

function Strut({ from, to, color, opacity = 0.55, radius = 0.025 }) {
  const { position, quaternion, length } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    );
    return { position: mid, quaternion: quat, length: len };
  }, [from, to]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 8]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.4} metalness={0.3} />
    </mesh>
  );
}

function Dish({ shiftX }) {
  const group = useRef();
  const ringsRef = useRef([]);
  const beaconRef = useRef();
  const forward = useRef(new THREE.Vector3(0, 0, 1));
  const profile = useDishProfile();
  const rotTarget = useScrollRotation();

  const feed = useMemo(() => new THREE.Vector3(0, 0, FEED_Z), []);
  const strutAngles = useMemo(() => [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3], []);
  const spokeAngles = useMemo(
    () => Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2),
    []
  );
  const ribRadii = useMemo(() => [0.5, 1, 1.5, R], []);

  const pivot = useMemo(() => new THREE.Vector3(0, -0.2, -0.25), []);
  const elbow = useMemo(() => new THREE.Vector3(0, -1.1, -0.65), []);
  const towerTop = useMemo(() => new THREE.Vector3(0, -1.5, -0.65), []);

  const waveColors = ['#38bdf8', '#38bdf8', '#818cf8', '#38bdf8', '#818cf8', '#38bdf8'];

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        BASE_YAW + rotTarget.current,
        0.06
      );
    }
    if (beaconRef.current) {
      const pulse = 0.4 + 0.6 * Math.abs(Math.sin(state.clock.elapsedTime * 2));
      beaconRef.current.material.opacity = pulse;
    }
    // Wavefronts travel along the dish's actual boresight (its local +Z,
    // rotated into world space), so they always radiate the direction it faces.
    if (group.current) {
      forward.current.set(0, 0, 1).applyQuaternion(group.current.quaternion);
    }
    ringsRef.current.forEach((ring, i) => {
      if (!ring) return;
      const t = (state.clock.elapsedTime * 0.4 + i * 0.6) % 4.5;
      const scale = 0.6 + t * 0.75;
      ring.scale.set(scale, scale, 1);
      ring.material.opacity = Math.max(0, 0.5 - t / 4.5) * 0.85;
      const dist = 0.8 + t * 1.1;
      ring.position.set(
        forward.current.x * dist,
        forward.current.y * dist,
        forward.current.z * dist
      );
      ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), forward.current);
    });
  });

  return (
    <group position={[shiftX, 0.35, 0]}>
      <group ref={group} rotation={[BASE_PITCH, BASE_YAW, 0]}>
        {/* Solid shaded parabolic reflector */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <latheGeometry args={[profile, 64]} />
          <meshStandardMaterial
            color="#aab4c4"
            transparent
            opacity={0.55}
            side={THREE.DoubleSide}
            roughness={0.35}
            metalness={0.5}
          />
        </mesh>
        {/* Fine tech-grid overlay for the high-tech read */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <latheGeometry args={[profile, 40]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.22} />
        </mesh>

        {/* Rim ring defining the aperture */}
        <mesh position={[0, 0, RIM_Z]}>
          <torusGeometry args={[R, 0.03, 10, 64]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.6} />
        </mesh>

        {/* Structural ribs: concentric bands */}
        {ribRadii.map((radius, i) => (
          <mesh key={`band-${i}`} position={[0, 0, (radius * radius / (R * R)) * DEPTH]}>
            <torusGeometry args={[radius, 0.012, 6, 56]} />
            <meshStandardMaterial color="#cbd5e1" transparent opacity={0.5} roughness={0.4} metalness={0.4} />
          </mesh>
        ))}

        {/* Structural ribs: radial spokes */}
        {spokeAngles.map((a, i) => (
          <Strut
            key={`spoke-${i}`}
            from={new THREE.Vector3(0, 0, 0.02)}
            to={rimPoint(a)}
            color="#cbd5e1"
            opacity={0.3}
            radius={0.012}
          />
        ))}

        {/* Tripod struts bracing the feed, converging on a ball joint */}
        {strutAngles.map((a, i) => (
          <Strut key={`strut-${i}`} from={rimPoint(a)} to={feed} color="#e2e8f0" opacity={0.85} radius={0.035} />
        ))}
        <mesh position={feed}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.5} />
        </mesh>

        {/* Feed horn / subreflector instrument */}
        <mesh position={[0, 0, FEED_Z + 0.26]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.14, 0.4, 14]} />
          <meshStandardMaterial color="#a855f7" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0, FEED_Z + 0.5]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.4} />
        </mesh>

        {/* Elevation bearing behind the dish */}
        <mesh position={pivot} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.14, 20]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.6} />
        </mesh>
        <Strut from={pivot} to={rimPoint(Math.PI / 2, 0.1)} color="#cbd5e1" opacity={0.75} radius={0.03} />
        <Strut from={pivot} to={rimPoint(-Math.PI / 2, 0.1)} color="#cbd5e1" opacity={0.75} radius={0.03} />

        {/* Elbow arm down to the tower */}
        <Strut from={pivot} to={elbow} color="#cbd5e1" opacity={0.8} radius={0.05} />
        <Strut from={elbow} to={towerTop} color="#cbd5e1" opacity={0.8} radius={0.06} />

        {/* Tiered control-tower pedestal */}
        <mesh position={[towerTop.x, towerTop.y - 0.35, towerTop.z]}>
          <cylinderGeometry args={[0.35, 0.42, 0.7, 16]} />
          <meshStandardMaterial color="#9aa5b8" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[towerTop.x, towerTop.y - 0.95, towerTop.z]}>
          <cylinderGeometry args={[0.45, 0.55, 0.55, 16]} />
          <meshStandardMaterial color="#8793a8" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[towerTop.x, towerTop.y - 1.35, towerTop.z]}>
          <cylinderGeometry args={[0.6, 0.72, 0.4, 16]} />
          <meshStandardMaterial color="#76839a" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[towerTop.x, towerTop.y - 1.58, towerTop.z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.66, 0.02, 8, 32]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.5} />
        </mesh>

        {/* Beacon light for scale and drama */}
        <mesh ref={beaconRef} position={[towerTop.x + 0.3, towerTop.y - 0.1, towerTop.z]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#f87171" emissive="#f87171" emissiveIntensity={0.9} transparent />
        </mesh>
      </group>
      <TransmittedWaves ringsRef={ringsRef} waveColors={waveColors} />
    </group>
  );
}

// Rendered outside the dish's rotated group so the wavefronts always travel
// in world space, straight toward the camera, regardless of the dish's pose.
function TransmittedWaves({ ringsRef, waveColors }) {
  return (
    <group>
      {waveColors.map((color, i) => (
        <mesh key={`wave-${i}`} ref={(el) => (ringsRef.current[i] = el)}>
          <torusGeometry args={[1.1, 0.014, 8, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export default function SatelliteDish({ shiftX = 0 }) {
  return (
    <Canvas camera={{ position: [4.6, 0.6, 7.2], fov: 34 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} color="#e2e8f0" />
      <directionalLight position={[-3, -1, 2]} intensity={0.35} color="#38bdf8" />
      <AutoFit width={12.2} height={9.3} />
      <Dish shiftX={shiftX} />
    </Canvas>
  );
}
