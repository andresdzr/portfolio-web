import GlassCard from '../GlassCard';
import SceneSection from '../SceneSection';
import CloudNetwork from '../three/CloudNetwork';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { cloud } from '../../data/content';

export default function Cloud() {
  const isDesktop = useIsDesktop();
  return (
    <SceneSection id="cloud" scene={<CloudNetwork shiftX={isDesktop ? 2.2 : 0} />}>
      <div className="pointer-events-auto">
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
    </SceneSection>
  );
}
