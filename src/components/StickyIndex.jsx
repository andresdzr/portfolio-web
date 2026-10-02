import { motion } from 'framer-motion';
import { navItems } from '../data/content';

export default function StickyIndex({ activeId }) {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-end gap-3">
      {navItems.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className="group flex items-center gap-3"
          >
            <span
              className={`text-xs tracking-wide uppercase font-medium transition-all duration-300 ${
                active
                  ? 'text-gradient opacity-100 translate-x-0'
                  : 'text-gray-500 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
              }`}
            >
              {item.label}
            </span>
            <motion.span
              className="block rounded-full"
              animate={{
                width: active ? 24 : 8,
                height: 8,
                backgroundColor: active ? '#22d3ee' : '#4b5563',
                boxShadow: active ? '0 0 12px #22d3ee' : 'none',
              }}
              transition={{ duration: 0.3 }}
            />
          </button>
        );
      })}
    </nav>
  );
}
