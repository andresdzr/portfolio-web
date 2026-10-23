import SceneSection from '../SceneSection';
import SatelliteDish from '../three/SatelliteDish';
import { Heading, Reveal } from '../Reveal';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { telecom } from '../../data/content';

export default function Telecom() {
  const isDesktop = useIsDesktop('(min-width: 1024px)');
  return (
    <SceneSection id="telecom" labelledBy="telecom-title" scene={<SatelliteDish shiftX={isDesktop ? 3.6 : 0} />}>
      <Heading id="telecom-title" lines={['Signals and', 'telecom']} />
      <Reveal>
        <p className="t-lead text-slate-300 mt-6 max-w-[36ch]">{telecom.intro}</p>
      </Reveal>
      <Reveal delay={0.06} className="panel panel--lit mt-10">
        <h3 className="text-white font-semibold mb-4">Core skills</h3>
        <ul className="grid gap-2.5">
          {telecom.items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-slate-200">
              <span className="mt-[0.6em] w-1.5 h-1.5 rounded-full bg-[var(--lilac)] shrink-0" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </Reveal>
      {telecom.projects.map((p) => (
        <Reveal key={p.name} delay={0.1} className="panel panel--lit mt-10">
          <h3 className="text-white font-semibold">{p.name}</h3>
          <p className="mt-1 text-slate-400">{p.description}</p>
        </Reveal>
      ))}
    </SceneSection>
  );
}
