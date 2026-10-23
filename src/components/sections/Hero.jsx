import { Suspense, useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionTemplate, useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { profile } from '../../data/content';
import profilePhoto from '../../assets/andres-photo.jpg';
import OrbitalHorizon from '../three/OrbitalHorizon';

const ease = [0.16, 1, 0.3, 1];

const chain = ['Receive the signal.', 'Learn from the data.', 'Ship it to the cloud.'];

// Viewport size and the porthole's resting size, as a motion value so the window re-fits on resize.
function measure() {
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const w = vw < 768 ? vw * 0.62 : Math.min(vw * 0.34, 470);
  return { vw, vh, w, h: Math.min(w * (4 / 3), vh * 0.72) };
}
function useFrameSize() {
  const size = useMotionValue(typeof window === 'undefined' ? { vw: 1440, vh: 900, w: 470, h: 600 } : measure());
  useEffect(() => {
    const onResize = () => size.set(measure());
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [size]);
  return size;
}

// Each line owns a slice of the autoplayed sequence: rise in, hold, lift away.
function ChainLine({ progress, index, children }) {
  const start = 0.04 + index * 0.3;
  const opacity = useTransform(progress, [start, start + 0.06, start + 0.22, start + 0.28], [0, 1, 1, 0]);
  const y = useTransform(progress, [start, start + 0.08, start + 0.22, start + 0.28], [56, 0, 0, -32]);
  return (
    <motion.p style={{ opacity, y }} className="hero-chain__line">
      {children}
    </motion.p>
  );
}

const SEQUENCE_SECONDS = 9;
const OPEN_END = 0.6; // share of the hero's scroll spent opening the window

// Cinematic opener. The name is set huge around a porthole that frames a live 3D orbit.
// Scrolling opens the window to the whole screen; once it is fully open the page holds
// still and the engineering chain plays by itself like a film, then hands back the scroll.
export default function Hero() {
  const ref = useRef(null);
  const size = useFrameSize();
  const [active, setActive] = useState(true);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  // scroll opens the window to full bleed
  const open = useTransform(scrollYProgress, [0, OPEN_END], [0, 1], { clamp: true });
  // then the sequence runs on its own clock
  const auto = useMotionValue(0);
  const [phase, setPhase] = useState('idle'); // idle | playing | done
  const sceneProgress = useTransform([open, auto], ([o, a]) => o * 0.42 + a * 0.58);
  const hint = useTransform(auto, [0.94, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (phase !== 'idle' || v < OPEN_END - 0.002) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      auto.set(1);
      setPhase('done');
      return;
    }
    setPhase('playing');
    // hold the page exactly where the window finished opening
    const el = ref.current;
    const y = el.offsetTop + (el.offsetHeight - window.innerHeight) * OPEN_END;
    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(y, { immediate: true, force: true });
      lenis.stop();
    }
    // swallow scrolling input while the film plays
    const block = (e) => e.preventDefault();
    const keys = (e) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key)) e.preventDefault();
    };
    window.addEventListener('wheel', block, { passive: false });
    window.addEventListener('touchmove', block, { passive: false });
    window.addEventListener('keydown', keys);
    release.current = () => {
      window.removeEventListener('wheel', block);
      window.removeEventListener('touchmove', block);
      window.removeEventListener('keydown', keys);
      lenis?.start();
    };
    animate(auto, 1, {
      duration: SEQUENCE_SECONDS,
      ease: 'linear',
      onComplete: () => {
        release.current();
        setPhase('done');
      },
    });
  });
  const release = useRef(() => {});
  useEffect(() => () => release.current(), []);
  const eased = useTransform(open, (e) => 1 - Math.pow(1 - e, 3));
  const bezelW = useTransform([eased, size], ([e, s]) => s.w + (s.vw - s.w) * e);
  const bezelH = useTransform([eased, size], ([e, s]) => s.h + (s.vh - s.h) * e);
  const insetY = useTransform([bezelH, size], ([h, s]) => ((s.vh - h) / 2).toFixed(1));
  const insetX = useTransform([bezelW, size], ([w, s]) => ((s.vw - w) / 2).toFixed(1));
  const radius = useTransform([eased, size], ([e, s]) => (s.w / 2) * (1 - e) * (1 - e));
  const clipPath = useMotionTemplate`inset(${insetY}px ${insetX}px ${insetY}px ${insetX}px round ${radius}px)`;
  const bezelOpacity = useTransform(open, [0.6, 0.95], [1, 0]);

  const leftX = useTransform(scrollYProgress, [0, 0.45], ['0vw', '-70vw']);
  const rightX = useTransform(scrollYProgress, [0, 0.45], ['0vw', '70vw']);
  const wordsOpacity = useTransform(scrollYProgress, [0.15, 0.4], [1, 0]);
  const fade = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const exit = useTransform(scrollYProgress, [0.9, 1], [1, 0.35]);

  // Stop rendering the scene once the hero has scrolled away.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section id="home" ref={ref} className="relative h-[260vh]" aria-label="Introduction">
      <div className="sticky top-0 h-[100svh] overflow-hidden hero-sky">
        {/* the scene, clipped to the porthole */}
        <motion.div style={{ clipPath, opacity: exit }} className="absolute inset-0 z-10 hero-space">
          <Suspense fallback={null}>
            <OrbitalHorizon progress={sceneProgress} active={active} />
          </Suspense>
        </motion.div>

        {/* porthole bezel */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <motion.div
            style={{ width: bezelW, height: bezelH, borderRadius: radius, opacity: bezelOpacity }}
            className="porthole-bezel"
          />
        </div>

        {/* giant name, split around the window */}
        <motion.div style={{ x: leftX, opacity: wordsOpacity }} className="absolute left-[var(--gutter)] top-[13vh] z-20">
          <h1 className="hero-word">
            <span className="mask">
              <motion.span
                className="block"
                initial={{ y: '105%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, ease, delay: 0.1 }}
              >
                Andrés
              </motion.span>
            </span>
            <span className="sr-only"> Díaz Ruano</span>
          </h1>
        </motion.div>
        <motion.div
          aria-hidden="true"
          style={{ x: rightX, opacity: wordsOpacity }}
          className="absolute left-[var(--gutter)] top-[calc(13vh+17vw)] lg:left-auto lg:top-auto lg:right-[var(--gutter)] lg:bottom-[12vh] z-20"
        >
          <p className="hero-word hero-word--outline mask">
            <motion.span
              className="block"
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1.2, ease, delay: 0.22 }}
            >
              Díaz Ruano
            </motion.span>
          </p>
        </motion.div>

        {/* who and what */}
        <motion.div
          style={{ opacity: fade }}
          className="absolute left-[var(--gutter)] bottom-[6vh] lg:bottom-[10vh] z-20 max-w-[320px]"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7, ease }}
          >
            <div className="flex items-center gap-3 mb-4">
              <img src={profilePhoto} alt="Andrés Díaz Ruano" className="w-12 h-12 rounded-full object-cover" />
              <p className="t-small leading-snug">
                <span className="text-white">{profile.location}</span>
                <br />
                <span className="text-slate-400">UC3M · Politecnico di Milano</span>
              </p>
            </div>
            <p className="t-body text-slate-200">
              Data and telecom engineer, from the antenna to the model to the cloud.
            </p>
          </motion.div>
        </motion.div>

        <motion.nav
          style={{ opacity: fade }}
          aria-label="Profiles"
          className="absolute right-[var(--gutter)] top-[4vh] lg:top-[5vh] z-20"
        >
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease }}
            className="flex flex-row items-center gap-5 t-small"
          >
            <a href={profile.github} target="_blank" rel="noreferrer" className="hero-link">GitHub</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hero-link">LinkedIn</a>
            <a href="#contact" className="btn-primary">Get in touch</a>
          </motion.div>
        </motion.nav>

        {/* the chain, spelled out over the open window */}
        <div className="hero-chain absolute inset-x-0 bottom-[12vh] z-20 px-[var(--gutter)] pointer-events-none">
          {chain.map((line, i) => (
            <ChainLine key={line} progress={auto} index={i}>
              {line}
            </ChainLine>
          ))}
        </div>

        {phase === 'idle' && (
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute left-1/2 -translate-x-1/2 bottom-5 z-20 t-small text-slate-400 hidden lg:flex flex-col items-center gap-2"
        >
          Scroll
          <span className="scroll-line" aria-hidden="true" />
        </motion.div>
        )}

        {/* after the sequence: the cue to keep going */}
        <motion.div
          style={{ opacity: hint }}
          aria-hidden={phase !== 'done'}
          className="absolute left-1/2 -translate-x-1/2 bottom-6 z-20 t-small text-slate-200 flex flex-col items-center gap-2 pointer-events-none"
        >
          Scroll to explore
          <span className="scroll-line" aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  );
}
