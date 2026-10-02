import { motion } from 'framer-motion';
import { profile } from '../../data/content';
import profilePhoto from '../../assets/andres-photo.jpg';

export default function Hero() {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col items-center justify-center relative px-6 noise-bg"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative mb-8 animate-float"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-glow/30 via-indigo-glow/20 to-transparent blur-2xl scale-110" />
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-[2px] bg-gradient-to-br from-cyan-glow via-indigo-glow to-platinum/40">
          <div className="w-full h-full rounded-full overflow-hidden glass">
            <img
              src={profilePhoto}
              alt="Andrés Díaz Ruano"
              className="w-full h-full object-cover"
              style={{
                maskImage:
                  'radial-gradient(circle at 50% 42%, black 62%, transparent 92%)',
                WebkitMaskImage:
                  'radial-gradient(circle at 50% 42%, black 62%, transparent 92%)',
              }}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-center max-w-3xl"
      >
        <p className="font-mono text-cyan-glow text-sm uppercase tracking-[0.3em] mb-4">
          Portfolio
        </p>
        <h1 className="text-5xl sm:text-7xl font-extrabold text-gradient mb-6 leading-tight">
          {profile.name}
        </h1>
        <p className="text-gray-300 text-lg sm:text-xl mb-3">{profile.degree}</p>
        <p className="text-gray-500 text-sm sm:text-base mb-8">{profile.schools}</p>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {profile.highlights.map((h) => (
            <span
              key={h}
              className="glass px-4 py-1.5 rounded-full text-xs font-medium text-emerald-glow border border-emerald-glow/20"
            >
              {h}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <a href={profile.github} target="_blank" rel="noreferrer" className="glass px-5 py-2.5 rounded-full hover:border-cyan-glow/50 border border-transparent transition-colors">
            GitHub
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="glass px-5 py-2.5 rounded-full hover:border-cyan-glow/50 border border-transparent transition-colors">
            LinkedIn
          </a>
          <a href={`mailto:${profile.email}`} className="glass px-5 py-2.5 rounded-full hover:border-cyan-glow/50 border border-transparent transition-colors">
            {profile.email}
          </a>
          <span className="glass px-5 py-2.5 rounded-full">{profile.phone}</span>
          <span className="glass px-5 py-2.5 rounded-full">{profile.location}</span>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 text-gray-500 text-xs uppercase tracking-widest"
      >
        Scroll to explore ↓
      </motion.div>
    </section>
  );
}
