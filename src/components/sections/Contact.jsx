import { motion } from 'framer-motion';
import { profile } from '../../data/content';

export default function Contact() {
  return (
    <section id="contact" className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl"
      >
        <h2 className="section-title text-gradient mb-6">Let's talk</h2>
        <p className="text-gray-400 mb-10">
          Open to opportunities in data engineering, telecommunications and
          cloud-driven products. Reach out directly.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
          <a
            href={`mailto:${profile.email}`}
            className="glass glow-border px-6 py-3 rounded-full text-cyan-glow font-medium hover:scale-105 transition-transform"
          >
            {profile.email}
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="glass glow-border px-6 py-3 rounded-full text-purple-glow font-medium hover:scale-105 transition-transform"
          >
            LinkedIn
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="glass glow-border px-6 py-3 rounded-full text-emerald-glow font-medium hover:scale-105 transition-transform"
          >
            GitHub
          </a>
        </div>
        <p className="text-gray-500 text-sm mt-10">
          {profile.phone} · {profile.location}
        </p>
      </motion.div>
    </section>
  );
}
