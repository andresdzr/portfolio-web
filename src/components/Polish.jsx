import { useEffect, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[60] bg-gradient-to-r from-violet-400 via-emerald-300 to-slate-300"
    />
  );
}

// A beam of light that trails the pointer, and the spotlight inside lit panels.
// Fine pointers only; on touch screens neither runs.
export function CursorBeam() {
  const beam = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;
    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let bx = x;
    let by = y;

    const tick = () => {
      // ease the beam toward the pointer so it trails a little
      bx += (x - bx) * 0.14;
      by += (y - by) * 0.14;
      if (beam.current) beam.current.style.transform = `translate3d(${bx}px, ${by}px, 0)`;
      raf = Math.abs(x - bx) + Math.abs(y - by) > 0.5 ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
      const panel = e.target.closest?.('.panel--lit');
      if (panel) {
        const r = panel.getBoundingClientRect();
        panel.style.setProperty('--mx', `${e.clientX - r.left}px`);
        panel.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={beam} aria-hidden="true" className="cursor-beam" />;
}
