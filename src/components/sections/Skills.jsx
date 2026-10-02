import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../GlassCard';
import { skillCategories } from '../../data/content';

const colorMap = {
  cyan: { text: 'text-cyan-glow', border: 'border-cyan-glow/30', bg: 'bg-cyan-glow/10' },
  purple: { text: 'text-purple-glow', border: 'border-purple-glow/30', bg: 'bg-purple-glow/10' },
  emerald: { text: 'text-emerald-glow', border: 'border-emerald-glow/30', bg: 'bg-emerald-glow/10' },
};

const COLLAPSED_LIMIT = 6;

function SkillCard({ category, compact }) {
  const [expanded, setExpanded] = useState(false);
  const c = colorMap[category.color];
  const shouldTruncate = compact && category.skills.length > COLLAPSED_LIMIT && !expanded;
  const shown = shouldTruncate ? category.skills.slice(0, COLLAPSED_LIMIT) : category.skills;
  const hidden = category.skills.length - shown.length;

  return (
    <GlassCard>
      <h3 className={`font-semibold mb-4 ${c.text}`}>{category.category}</h3>
      <div className="flex flex-wrap gap-2">
        {shown.map((s) => (
          <span
            key={s}
            className={`px-3 py-1.5 rounded-lg text-sm ${c.bg} ${c.border} border text-gray-200`}
          >
            {s}
          </span>
        ))}
        {hidden > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className={`px-3 py-1.5 rounded-lg text-sm border border-dashed ${c.border} text-gray-400 hover:text-gray-200 transition-colors`}
          >
            +{hidden}
          </button>
        )}
        {expanded && category.skills.length > COLLAPSED_LIMIT && (
          <button
            onClick={() => setExpanded(false)}
            className="px-3 py-1.5 rounded-lg text-sm border border-dashed border-white/15 text-gray-500 hover:text-gray-300 transition-colors"
          >
            Show less
          </button>
        )}
      </div>
    </GlassCard>
  );
}

export default function Skills() {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...skillCategories.map((c) => c.category)];
  const visible =
    filter === 'All' ? skillCategories : skillCategories.filter((c) => c.category === filter);

  return (
    <section id="skills" className="min-h-screen flex items-center px-6 sm:px-12 py-24 noise-bg">
      <div className="max-w-5xl mx-auto w-full">
        <h2 className="section-title text-gradient mb-8">Technical Skills</h2>

        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                filter === c
                  ? 'bg-white/10 border-white/30 text-white'
                  : 'border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {visible.map((cat) => (
              <motion.div
                key={cat.category}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <SkillCard category={cat} compact={filter === 'All'} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
