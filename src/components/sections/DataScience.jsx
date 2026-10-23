import SceneSection from '../SceneSection';
import NeuralConstellation from '../three/NeuralConstellation';
import { Heading, Reveal } from '../Reveal';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { dataScience } from '../../data/content';

export default function DataScience() {
  const isDesktop = useIsDesktop('(min-width: 1024px)');
  return (
    <SceneSection id="data" side="right" glow="green" labelledBy="data-title" scene={<NeuralConstellation shiftX={isDesktop ? -3.8 : 0} />}>
      <Heading id="data-title" lines={['Data science', 'and AI']} />
      <Reveal>
        <p className="t-lead text-slate-300 mt-6 max-w-[36ch]">{dataScience.intro}</p>
      </Reveal>
      <Reveal delay={0.06}>
        <ul className="mt-8 flex flex-wrap gap-2">
          {dataScience.skills.map((s) => (
            <li key={s} className="chip chip--green">{s}</li>
          ))}
        </ul>
      </Reveal>
      <div className="mt-10 grid gap-3">
        {dataScience.projects.map((p, i) => (
          <Reveal key={p.name} delay={0.05 * i} className="panel panel--lit">
            <h3 className="text-white font-semibold">{p.name}</h3>
            <p className="mt-1 text-slate-400">{p.description}</p>
          </Reveal>
        ))}
      </div>
    </SceneSection>
  );
}
