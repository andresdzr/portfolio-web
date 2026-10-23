import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Heading, Reveal } from '../Reveal';
import { skillCategories } from '../../data/content';

const ease = [0.16, 1, 0.3, 1];
const chipTone = { cyan: '', purple: ' chip--violet', emerald: ' chip--green' };

export default function Skills() {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...skillCategories.map((c) => c.category)];
  const visible = filter === 'All' ? skillCategories : skillCategories.filter((c) => c.category === filter);

  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <Heading id="skills-title" lines={['Technical skills']} />
          <Reveal>
            <LayoutGroup>
              <div role="group" aria-label="Filter skills" className="flex flex-wrap gap-1 p-1 rounded-full bg-[var(--surface)]">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFilter(c)}
                    aria-pressed={filter === c}
                    className={`relative px-4 py-2 rounded-full t-small transition-colors ${filter === c ? 'text-[var(--bg)]' : 'text-slate-300 hover:text-white'}`}
                  >
                    {filter === c && (
                      <motion.span layoutId="skill-pill" className="absolute inset-0 rounded-full bg-[var(--ink)]" transition={{ duration: 0.45, ease }} />
                    )}
                    <span className="relative">{c}</span>
                  </button>
                ))}
              </div>
            </LayoutGroup>
          </Reveal>
        </div>

        <motion.div layout className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {visible.map((cat, i) => (
              <motion.article
                key={cat.category}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease, delay: i * 0.05 } }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
                className="panel panel--lit"
              >
                <h3 className="role-title">{cat.category}</h3>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {cat.skills.map((s) => (
                    <li key={s} className={`chip${chipTone[cat.color] ?? ''}`}>{s}</li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
