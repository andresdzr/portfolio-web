import { Suspense } from 'react';
import GlassCard from '../GlassCard';
import NeuralConstellation from '../three/NeuralConstellation';
import { dataScience } from '../../data/content';

export default function DataScience() {
  return (
    <section id="data" className="min-h-screen flex items-center px-6 sm:px-12 py-24">
      <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-10 items-center">
        <div className="h-[380px] sm:h-[440px] md:h-[480px] w-full order-2 md:order-1">
          <Suspense fallback={null}>
            <NeuralConstellation />
          </Suspense>
        </div>
        <div className="order-1 md:order-2">
          <h2 className="section-title text-gradient mb-4">Data Science & AI</h2>
          <p className="text-gray-400 mb-6">{dataScience.intro}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {dataScience.skills.map((s) => (
              <span key={s} className="glass px-3 py-1 rounded-full text-xs text-purple-glow border border-purple-glow/20">
                {s}
              </span>
            ))}
          </div>
          <div className="space-y-4">
            {dataScience.projects.map((p) => (
              <GlassCard key={p.name}>
                <h3 className="font-semibold text-cyan-glow mb-1">{p.name}</h3>
                <p className="text-gray-400 text-sm">{p.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
