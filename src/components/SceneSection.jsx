import { Suspense } from 'react';

// Desktop: the 3D scene fills the section as a background layer and the text
// sits in a narrower column on one side. Mobile: the scene stacks below the text.
export default function SceneSection({ id, className = '', scene, children }) {
  return (
    <section
      id={id}
      className={`relative min-h-screen flex flex-col justify-center px-6 sm:px-12 py-24 overflow-hidden noise-bg ${className}`}
    >
      <div className="relative z-10 max-w-[1600px] mx-auto w-full grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-10 md:items-center pointer-events-none">
        {children}
      </div>
      <div className="relative z-0 mt-10 h-[360px] w-full md:mt-0 md:h-auto md:absolute md:inset-0 pointer-events-none">
        <Suspense fallback={null}>{scene}</Suspense>
      </div>
    </section>
  );
}
