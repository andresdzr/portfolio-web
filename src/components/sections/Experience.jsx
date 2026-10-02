import GlassCard from '../GlassCard';
import { experience, featuredProjects } from '../../data/content';

export default function Experience() {
  return (
    <section id="experience" className="min-h-screen flex items-center px-6 sm:px-12 py-24">
      <div className="max-w-5xl mx-auto w-full">
        <h2 className="section-title text-gradient mb-10">
          Experience & Featured Projects
        </h2>

        <div className="mb-14">
          <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-6">
            Work Experience
          </h3>
          <div className="relative border-l border-white/10 pl-8 space-y-10">
            {experience.map((job, i) => (
              <div key={job.company} className="relative">
                <span className="absolute -left-[41px] top-1 w-3 h-3 rounded-full bg-cyan-glow shadow-[0_0_12px_#22d3ee]" />
                <GlassCard delay={i * 0.1}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <h4 className="text-lg font-semibold text-white">
                      {job.role} · <span className="text-cyan-glow">{job.company}</span>
                    </h4>
                    <span className="text-xs font-mono text-gray-500">{job.period}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {job.points.map((pt) => (
                      <li key={pt} className="text-gray-400 text-sm flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-purple-glow shrink-0" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-6">
            Featured Projects
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {featuredProjects.map((p, i) => (
              <GlassCard key={p.name} delay={i * 0.1}>
                <div className="flex items-baseline justify-between mb-2">
                  <h4 className="font-semibold text-emerald-glow">{p.name}</h4>
                  <span className="text-xs font-mono text-gray-500">{p.year}</span>
                </div>
                <p className="text-gray-400 text-sm">{p.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
