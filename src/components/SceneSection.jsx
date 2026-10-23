import { Suspense, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Desktop: the 3D scene fills the section behind the text, which sits in a column on
// one side; the scene drifts slightly against the scroll. Mobile: the scene stacks below.
export default function SceneSection({ id, side = 'left', glow = 'violet', scene, children, labelledBy }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['3%', '-3%']);

  return (
    <section ref={ref} id={id} aria-labelledby={labelledBy} className="section relative lg:min-h-[100svh] flex flex-col justify-center overflow-clip">
      <div className="wrap relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 pointer-events-none">
        <div className={`pointer-events-auto lg:col-span-5 ${side === 'right' ? 'lg:col-start-8' : ''}`}>{children}</div>
      </div>
      {/* coloured light behind the model, on the side it stands */}
      <div aria-hidden="true" className={`scene-glow scene-glow--${glow} ${side === 'right' ? 'scene-glow--left' : 'scene-glow--right'}`} />
      <div className="relative z-0 mt-10 h-[460px] w-full lg:mt-0 lg:h-auto lg:absolute lg:inset-0 pointer-events-none">
        <motion.div style={{ y }} className="h-full lg:sticky lg:top-0 lg:h-[100svh]">
          <Suspense fallback={null}>{scene}</Suspense>
        </motion.div>
      </div>
    </section>
  );
}
