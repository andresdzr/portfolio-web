import { useEffect, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[60] bg-gradient-to-r from-cyan-glow via-indigo-glow to-platinum"
    />
  );
}

// Soft spotlight that follows the pointer on fine-pointer devices only.
export function CursorGlow() {
  const glow = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;
    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (glow.current) {
            glow.current.style.transform = `translate3d(${x - 260}px, ${y - 260}px, 0)`;
          }
        });
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={glow}
      aria-hidden="true"
      className="hidden md:block pointer-events-none fixed top-0 left-0 w-[520px] h-[520px] rounded-full z-[1] opacity-60 will-change-transform"
      style={{
        background:
          'radial-gradient(circle, rgba(56,189,248,0.10) 0%, rgba(129,140,248,0.06) 35%, transparent 70%)',
      }}
    />
  );
}
