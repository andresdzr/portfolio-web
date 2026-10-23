import { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Heading, Reveal } from '../Reveal';
import { experience, featuredProjects } from '../../data/content';

export default function Experience() {
  const listRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 70%', 'end 60%'] });

  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <div className="wrap grid lg:grid-cols-12 gap-y-12 gap-x-8">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-[18vh]">
            <Heading id="experience-title" lines={['Experience']} />
          </div>
        </div>

        <div ref={listRef} className="lg:col-span-8 relative pl-8">
          {/* progress rail that fills as the roles scroll past */}
          <span className="absolute left-0 top-2 bottom-2 w-px bg-white/10" aria-hidden="true" />
          <motion.span
            style={{ scaleY: scrollYProgress }}
            className="absolute left-0 top-2 bottom-2 w-px origin-top bg-[var(--lilac)]"
            aria-hidden="true"
          />
          <ol className="grid gap-16">
            {experience.map((job) => (
              <li key={job.company} className="relative">
                <span className="absolute -left-[37px] top-2 w-[9px] h-[9px] rounded-full bg-[var(--lilac)]" aria-hidden="true" />
                <Reveal>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 className="role-title">
                      {job.role} <span className="text-[var(--lilac)]">· {job.company}</span>
                    </h3>
                    <p className="t-small text-slate-400">{job.period}</p>
                  </div>
                  <ul className="mt-4 grid gap-2 text-slate-300 max-w-[62ch]">
                    {job.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="wrap mt-[clamp(6rem,10vw,9rem)]">
        <Heading id="projects-title" lines={['Featured projects']} />
        <div className="mt-12 grid md:grid-cols-2 gap-4">
          {featuredProjects.map((p, i) => (
            <Reveal key={p.name} delay={0.08 * i} className="project-card panel panel--lit">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="role-title">{p.name}</h3>
                <span className="t-small text-slate-400">{p.year}</span>
              </div>
              <p className="mt-4 text-slate-300">{p.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
