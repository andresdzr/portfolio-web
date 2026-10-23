import { Suspense } from 'react';
import { Heading, Reveal } from '../Reveal';
import SignalField from '../three/SignalField';
import { profile } from '../../data/content';

const facts = [
  { value: 'Dual degree', label: 'Data Science and Engineering + Telecommunication Technologies, UC3M' },
  { value: 'Milan', label: 'Abroad studies at the Politecnico di Milano' },
  { value: '2×', label: 'Academic Excellence Scholarship' },
  { value: 'C1', label: 'Advanced Cambridge English' },
];

export default function Profile() {
  return (
    <section id="profile" className="section" aria-labelledby="profile-title">
      <div className="wrap grid lg:grid-cols-12 gap-y-12 gap-x-8">
        <div className="lg:col-span-5">
          <Heading id="profile-title" lines={['Profile &', 'education']} />
          <Reveal delay={0.1} className="scene-frame mt-10 h-[320px] lg:h-[460px] lg:-ml-[var(--gutter)] lg:w-[calc(100%+var(--gutter)*2)]">
            <Suspense fallback={null}>
              <SignalField />
            </Suspense>
          </Reveal>
        </div>
        <div className="lg:col-span-7 lg:pt-3">
          <Reveal>
            <p className="t-lead text-slate-200 max-w-[34ch]">
              One degree taught me how a signal crosses an antenna, a channel and a circuit. The other, how to
              turn what arrives into a model that decides something.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 text-slate-400 max-w-[60ch]">
              {profile.fullDegree} at {profile.schools}. {profile.programNote}
            </p>
          </Reveal>

          <dl className="mt-14 grid sm:grid-cols-2 gap-4">
            {facts.map((f, i) => (
              <Reveal key={f.value} delay={0.06 * i} className="panel panel--lit">
                <dt className="display text-[var(--t-lead)] font-semibold text-white">{f.value}</dt>
                <dd className="mt-2 t-small text-slate-400">{f.label}</dd>
              </Reveal>
            ))}
          </dl>
          <Reveal delay={0.1} className="mt-4">
            <p className="panel panel--lit flex flex-wrap items-center justify-between gap-3">
              <span className="text-white font-medium">AWS Certified Cloud Practitioner</span>
              <span className="t-small text-slate-400">Amazon Web Services</span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
