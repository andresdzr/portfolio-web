import { Suspense } from 'react';

// Full-bleed section: the 3D scene fills the whole section behind the content,
// so models can use all the available space and waves/glows pass behind text.
export default function SceneSection({ id, className = '', scene, children }) {
  return (
    <section
      id={id}
      className={`relative min-h-screen flex items-center px-6 sm:px-12 py-24 overflow-hidden noise-bg ${className}`}
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Suspense fallback={null}>{scene}</Suspense>
      </div>
      <div className="relative z-10 max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-10 items-center pointer-events-none">
        {children}
      </div>
    </section>
  );
}
