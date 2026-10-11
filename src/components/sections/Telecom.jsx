import GlassCard from '../GlassCard';
import SceneSection from '../SceneSection';
import SatelliteDish from '../three/SatelliteDish';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { telecom } from '../../data/content';

export default function Telecom() {
  const isDesktop = useIsDesktop();
  return (
    <SceneSection id="telecom" scene={<SatelliteDish shiftX={isDesktop ? 3 : 0} />}>
      <div className="pointer-events-auto">
        <h2 className="section-title text-gradient mb-4">Telecommunications</h2>
        <p className="text-gray-400 mb-8">{telecom.intro}</p>
        <GlassCard>
          <ul className="space-y-3">
            {telecom.items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-gray-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-glow shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </GlassCard>
        <div className="mt-4 space-y-4">
          {telecom.projects.map((p) => (
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
