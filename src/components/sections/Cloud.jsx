import { Suspense } from 'react';
import GlassCard from '../GlassCard';
import CloudNetwork from '../three/CloudNetwork';
import { cloud } from '../../data/content';

export default function Cloud() {
  return (
    <section id="cloud" className="min-h-screen flex items-center px-6 sm:px-12 py-24 noise-bg">
      <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="section-title text-gradient mb-4">Cloud Computing</h2>
          <p className="text-gray-400 mb-8">{cloud.intro}</p>
          <GlassCard>
            <ul className="space-y-3">
              {cloud.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-300">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-glow shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
        <div className="h-[380px] sm:h-[440px] md:h-[480px] w-full">
          <Suspense fallback={null}>
            <CloudNetwork />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
