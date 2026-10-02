import { useEffect, useRef } from 'react';

// Tracks window scroll delta and exposes a cumulative rotation target.
// Scrolling down increases it, scrolling up decreases it — consumers
// should lerp toward this value each frame for a smooth, subtle spin.
export function useScrollRotation(factor = 0.0025) {
  const targetRef = useRef(0);
  const lastY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      lastY.current = y;
      targetRef.current += delta * factor;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [factor]);

  return targetRef;
}
