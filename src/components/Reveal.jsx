import { motion } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1];

// Fades and lifts its children once, as they enter the viewport.
export function Reveal({ children, delay = 0, y = 28, className = '', as = 'div' }) {
  const Tag = motion[as];
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease, delay }}
      className={className}
    >
      {children}
    </Tag>
  );
}

// A section heading whose lines rise out of a mask, one after another.
// The heading itself is observed (the lines start clipped, so they can never intersect).
export function Heading({ lines, id, className = '' }) {
  return (
    <motion.h2
      id={id}
      className={`head ${className}`}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
    >
      {lines.map((line, i) => (
        <span key={i} className="mask">
          <motion.span
            className="block"
            variants={{ hidden: { y: '110%' }, shown: { y: 0, transition: { duration: 1, ease, delay: i * 0.08 } } }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  );
}
