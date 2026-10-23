import SceneSection from '../SceneSection';
import CloudNetwork from '../three/CloudNetwork';
import { Heading, Reveal } from '../Reveal';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { cloud } from '../../data/content';

export default function Cloud() {
  const isDesktop = useIsDesktop('(min-width: 1024px)');
  return (
    <SceneSection id="cloud" glow="silver" labelledBy="cloud-title" scene={<CloudNetwork shiftX={isDesktop ? 2.2 : 0} />}>
      <Heading id="cloud-title" lines={['Cloud', 'computing']} />
      <Reveal>
        <p className="t-lead text-slate-300 mt-6 max-w-[36ch]">{cloud.intro}</p>
      </Reveal>

      <Reveal delay={0.06} className="panel panel--lit mt-10">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="text-white font-semibold">AWS services</h3>
          <span className="t-small text-[var(--lilac)]">{cloud.certification}</span>
        </div>
        <ul className="flex flex-wrap gap-2">
          {cloud.awsServices.map((service) => (
            <li key={service} className="chip chip--violet">{service}</li>
          ))}
        </ul>
      </Reveal>

      <ul className="mt-8 grid gap-3">
        {cloud.items.map((item, i) => (
          <Reveal as="li" key={item} delay={0.05 * i} y={16} className="text-slate-200">
            {item}
          </Reveal>
        ))}
      </ul>
    </SceneSection>
  );
}
