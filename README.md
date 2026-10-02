# Andrés Díaz Ruano — Portfolio

Interactive dark-tech portfolio built with React, Vite, Tailwind CSS, Framer Motion and React Three Fiber.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Build for production

```bash
npm run build
npm run preview
```

## Structure

- `src/data/content.js` — all CV text content (edit here to update copy).
- `src/components/three/` — the three WebGL wireframe scenes (antenna, neural constellation, cloud).
- `src/components/sections/` — one component per page section.
- `src/components/StickyIndex.jsx` — the scroll-spy side navigation.
