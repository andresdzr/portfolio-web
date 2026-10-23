import { useMemo } from 'react';
import * as THREE from 'three';

// A communications satellite, built after a classic studio model: a cylindrical bus
// wrapped in crumpled gold foil under a glossy violet dome, a square section clad in
// solar cells, two three-panel wings on trusses and a large dish with a tripod feed.
// Local axes: the bus runs along Y (dome up), the dish looks down -Y, the wings span X.

// ---------- procedural textures ----------
function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Blue-violet cells on a grid, copper bus bars and diamonds at the joints, copper frame.
function solarCells(cols = 6, rows = 4) {
  return canvasTexture(512, 512 * (rows / cols), (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#2b2fb8');
    grad.addColorStop(0.5, '#3a2fb0');
    grad.addColorStop(1, '#2a3ccf');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    const cw = w / cols;
    const ch = h / rows;
    // fine cell lines
    g.strokeStyle = 'rgba(150, 160, 255, 0.35)';
    g.lineWidth = 1;
    for (let x = 0; x <= w; x += cw / 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    // cell borders
    g.strokeStyle = 'rgba(190, 200, 255, 0.55)';
    g.lineWidth = 2;
    for (let i = 0; i <= cols; i++) { g.beginPath(); g.moveTo(i * cw, 0); g.lineTo(i * cw, h); g.stroke(); }
    for (let j = 0; j <= rows; j++) { g.beginPath(); g.moveTo(0, j * ch); g.lineTo(w, j * ch); g.stroke(); }
    // copper diamonds
    g.fillStyle = '#d9925f';
    for (let i = 1; i < cols; i++) {
      for (let j = 0; j <= rows; j++) {
        const x = i * cw;
        const y = j * ch;
        g.beginPath(); g.moveTo(x, y - 5); g.lineTo(x + 5, y); g.lineTo(x, y + 5); g.lineTo(x - 5, y); g.fill();
      }
    }
    // frame
    g.strokeStyle = '#c47a4a';
    g.lineWidth = 8;
    g.strokeRect(4, 4, w - 8, h - 8);
  });
}

// Crumpled multi-layer insulation: patches of light and shadow over gold.
function goldFoil() {
  return canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = '#b8862b';
    g.fillRect(0, 0, w, h);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 260; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const r = 12 + rnd() * 60;
      const light = rnd() > 0.5;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, light ? 'rgba(255, 226, 140, 0.55)' : 'rgba(90, 50, 10, 0.5)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      g.fillStyle = grad;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    // creases
    g.strokeStyle = 'rgba(255, 235, 170, 0.35)';
    for (let i = 0; i < 40; i++) {
      g.lineWidth = 1 + rnd() * 2;
      g.beginPath();
      let x = rnd() * w;
      let y = rnd() * h;
      g.moveTo(x, y);
      for (let k = 0; k < 4; k++) { x += (rnd() - 0.5) * 90; y += (rnd() - 0.5) * 90; g.lineTo(x, y); }
      g.stroke();
    }
  });
}

// ---------- parts ----------
function Wing({ side, cells }) {
  const panelW = 0.92;
  const panelH = 0.62;
  const gap = 0.05;
  const start = 0.62;
  return (
    <group rotation={[0.25 * side, 0, 0]}>
      {/* truss: a V of struts from the bus to the inner panel */}
      {[-0.18, 0.18].map((dy) => (
        <mesh key={dy} position={[side * (start / 2 + 0.05), dy * 0.5, 0]} rotation={[0, 0, Math.PI / 2 - side * dy * 0.6]}>
          <cylinderGeometry args={[0.012, 0.012, start - 0.1, 6]} />
          <meshStandardMaterial color="#c9cbe0" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => {
        const x = side * (start + panelW / 2 + i * (panelW + gap));
        return (
          <group key={i} position={[x, 0, 0]}>
            <mesh>
              <boxGeometry args={[panelW, panelH, 0.025]} />
              <meshPhysicalMaterial map={cells} metalness={0.55} roughness={0.28} clearcoat={1} clearcoatRoughness={0.15} />
            </mesh>
            {/* hinge between panels */}
            {i < 2 && (
              <mesh position={[side * (panelW / 2 + gap / 2), 0, 0]}>
                <boxGeometry args={[gap, panelH * 0.9, 0.012]} />
                <meshStandardMaterial color="#d79a6a" metalness={1} roughness={0.3} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

function Dish({ feedRef }) {
  const R = 0.95;
  const D = 0.26;
  const profile = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 32; i++) {
      const x = (i / 32) * R;
      pts.push(new THREE.Vector2(x, (x * x) / (R * R) * D));
    }
    return pts;
  }, []);
  const focus = 0.78;
  const rim = [0, 1, 2].map((k) => {
    const a = (k / 3) * Math.PI * 2 + Math.PI / 6;
    return new THREE.Vector3(Math.cos(a) * R * 0.92, D * 0.85, Math.sin(a) * R * 0.92);
  });
  const tip = new THREE.Vector3(0, focus, 0);
  return (
    // opens toward local +Y; mounted upside down under the bus and tipped forward
    <group>
      <mesh>
        <latheGeometry args={[profile, 72]} />
        <meshPhysicalMaterial
          color="#ece6ff"
          metalness={0.15}
          roughness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.2}
          sheen={0.6}
          sheenColor="#c4b5fd"
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* rim */}
      <mesh position={[0, D, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R, 0.012, 8, 96]} />
        <meshStandardMaterial color="#d6d0f5" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* gold collar and boom */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.08, 32]} />
        <meshStandardMaterial color="#e2b24a" metalness={1} roughness={0.25} />
      </mesh>
      <mesh position={[0, focus / 2, 0]}>
        <cylinderGeometry args={[0.025, 0.025, focus, 12]} />
        <meshStandardMaterial color="#cfd2ea" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* tripod struts from the rim to the feed */}
      {rim.map((p, k) => {
        const mid = p.clone().add(tip).multiplyScalar(0.5);
        const len = p.distanceTo(tip);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tip.clone().sub(p).normalize());
        return (
          <mesh key={k} position={mid} quaternion={q}>
            <cylinderGeometry args={[0.014, 0.014, len, 8]} />
            <meshStandardMaterial color="#d8dbf0" metalness={0.9} roughness={0.2} />
          </mesh>
        );
      })}
      {/* feed horn */}
      <mesh ref={feedRef} position={tip}>
        <sphereGeometry args={[0.075, 24, 24]} />
        <meshStandardMaterial color="#f0c25a" metalness={1} roughness={0.18} emissive="#7a4d0a" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

export default function CommSatellite({ feedRef, dishRef }) {
  const cells = useMemo(() => solarCells(6, 4), []);
  const bodyCells = useMemo(() => solarCells(4, 5), []);
  const foil = useMemo(() => goldFoil(), []);

  return (
    <group>
      {/* violet dome */}
      <mesh position={[0, 0.68, 0]} scale={[1, 0.55, 1]}>
        <sphereGeometry args={[0.4, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#5b3fd6" metalness={0.6} roughness={0.12} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      <mesh position={[0, 0.68, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.025, 12, 48]} />
        <meshPhysicalMaterial color="#6d4ff0" metalness={0.7} roughness={0.15} clearcoat={1} />
      </mesh>

      {/* gold foil section */}
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.39, 0.39, 0.62, 10, 1]} />
        <meshStandardMaterial map={foil} bumpMap={foil} bumpScale={2.5} color="#ffd27a" metalness={0.95} roughness={0.32} />
      </mesh>
      {[0.12, 0.5].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.395, 0.008, 6, 48]} />
          <meshStandardMaterial color="#f3d27a" metalness={1} roughness={0.2} />
        </mesh>
      ))}

      {/* violet band */}
      <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.43, 0.06, 16, 64]} />
        <meshPhysicalMaterial color="#5a3fe0" metalness={0.65} roughness={0.15} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      <mesh position={[0, -0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.43, 0.02, 8, 64]} />
        <meshPhysicalMaterial color="#7a5cff" metalness={0.7} roughness={0.15} clearcoat={1} />
      </mesh>

      {/* solar-clad square section */}
      <mesh position={[0, -0.45, 0]}>
        <boxGeometry args={[0.66, 0.78, 0.66]} />
        <meshPhysicalMaterial map={bodyCells} color="#c9c4ff" metalness={0.5} roughness={0.25} clearcoat={1} clearcoatRoughness={0.12} />
      </mesh>
      <mesh position={[0, -0.86, 0]}>
        <boxGeometry args={[0.6, 0.05, 0.6]} />
        <meshStandardMaterial color="#3b2a9a" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* wings, mounted on the gold section */}
      <group position={[0, 0.36, 0]}>
        <Wing side={1} cells={cells} />
        <Wing side={-1} cells={cells} />
      </group>

      {/* dish under the bus, tipped a little off nadir so the beam sweeps as the bus turns */}
      <group ref={dishRef} position={[0, -0.9, 0]} rotation={[Math.PI - 0.35, 0, 0]}>
        <Dish feedRef={feedRef} />
      </group>
    </group>
  );
}
