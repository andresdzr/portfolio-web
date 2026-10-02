import GlassCard from '../GlassCard';
import { profile } from '../../data/content';

export default function Profile() {
  return (
    <section id="profile" className="min-h-screen flex items-center px-6 sm:px-12 py-24">
      <div className="max-w-5xl mx-auto w-full">
        <h2 className="section-title text-gradient mb-4">Profile & Education</h2>
        <p className="text-gray-400 max-w-2xl mb-12">
          A dual background bridging hardware-level telecommunications with
          data-driven decision making — trained across two leading European
          institutions.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <GlassCard>
            <h3 className="text-xl font-semibold text-cyan-glow mb-2">
              Double Degree
            </h3>
            <p className="text-gray-300">{profile.degree}</p>
            <p className="text-gray-500 text-sm mt-2">{profile.schools}</p>
          </GlassCard>
          <GlassCard delay={0.1}>
            <h3 className="text-xl font-semibold text-purple-glow mb-2">
              Recognition
            </h3>
            <ul className="text-gray-300 space-y-2">
              {profile.highlights.map((h) => (
                <li key={h} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-glow" />
                  {h}
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
