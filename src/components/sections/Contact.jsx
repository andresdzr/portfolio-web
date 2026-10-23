import { Heading, Reveal } from '../Reveal';
import { profile } from '../../data/content';
import ContactForm from '../ContactForm';

export default function Contact() {
  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="wrap grid lg:grid-cols-12 gap-y-12 gap-x-8">
        <div className="lg:col-span-5">
          <Heading id="contact-title" lines={["Let's build", <em key="e">something.</em>]} />
          <Reveal>
            <p className="t-lead text-slate-300 mt-6 max-w-[26ch]">
              Open to data engineering, telecommunications and cloud work, in Madrid or remote.
            </p>
          </Reveal>
          <Reveal delay={0.08} className="mt-10 flex flex-wrap gap-3">
            <a href={`mailto:${profile.email}`} className="btn-primary">{profile.email}</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn-ghost">LinkedIn</a>
            <a href={profile.github} target="_blank" rel="noreferrer" className="btn-ghost">GitHub</a>
          </Reveal>
        </div>
        <Reveal delay={0.1} className="lg:col-span-6 lg:col-start-7">
          <ContactForm />
        </Reveal>
      </div>

      <footer className="wrap mt-[clamp(6rem,12vw,10rem)]">
        <p aria-hidden="true" className="footer-name">Andrés Díaz Ruano</p>
        <div className="mt-6 flex flex-wrap justify-between gap-4 t-small text-slate-400">
          <span>{profile.location}</span>
          <span>Built with React and Three.js · deployed on AWS</span>
          <a href="#home" className="hover:text-white transition-colors">Back to top</a>
        </div>
      </footer>
    </section>
  );
}
