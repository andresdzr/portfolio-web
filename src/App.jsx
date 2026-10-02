import { useEffect, useState } from 'react';
import StickyIndex from './components/StickyIndex';
import Hero from './components/sections/Hero';
import Profile from './components/sections/Profile';
import Telecom from './components/sections/Telecom';
import DataScience from './components/sections/DataScience';
import Cloud from './components/sections/Cloud';
import Experience from './components/sections/Experience';
import Skills from './components/sections/Skills';
import Contact from './components/sections/Contact';
import { navItems } from './data/content';

export default function App() {
  const [activeId, setActiveId] = useState('home');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative bg-bg">
      <StickyIndex activeId={activeId} />
      <Hero />
      <Profile />
      <Telecom />
      <DataScience />
      <Cloud />
      <Experience />
      <Skills />
      <Contact />
    </div>
  );
}
