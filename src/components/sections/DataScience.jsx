import GlassCard from '../GlassCard';
import SceneSection from '../SceneSection';
import NeuralConstellation from '../three/NeuralConstellation';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { dataScience } from '../../data/content';

export default function DataScience() {
  const isDesktop = useIsDesktop();
  return (
    <SceneSection id="data" scene={<NeuralConstellation shiftX={isDesktop ? -3.8 : 0} />}>
      <div className="md:col-start-2 pointer-events-auto">
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
    </SceneSection>
  );
}
