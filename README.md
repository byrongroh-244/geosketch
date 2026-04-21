# GeoSketch

A geometric diagram generator for math teachers. Create labeled diagrams with KaTeX math notation, congruency marks, and export to PNG or SVG.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173/geosketch/

## Build for production

```bash
npm run build
```

Output goes to `dist/`. Upload that folder to any static host.

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages → Source** and set to **GitHub Actions**
3. Every push to `main` will auto-build and deploy via `.github/workflows/deploy.yml`
4. Your app will be live at `https://<username>.github.io/geosketch/`

> If your repo is at the root (not a subpath), change `base` in `vite.config.ts` from `'/geosketch/'` to `'/'`.

## Shapes included

**Triangles:** Right, Acute, Obtuse, Scalene, Isosceles, Equilateral

**Quadrilaterals:** Parallelogram, Rectangle, Square *(Rhombus, Kite, Trapezoid coming soon)*

## Adding a new shape

1. Create `src/components/shapes/MyShape.tsx` — export a `MySvg` component and a `MyPanel` component
2. Add a default state factory `defaultMyState()`
3. Wire it into `App.tsx` in the three switch statements
4. Add a thumbnail to `ShapeLibrary.tsx`
5. Add a calculator function to `src/hooks/useCalculator.ts`

## Tech stack

- React 18 + TypeScript
- Vite
- KaTeX (math rendering)
- html-to-image (PNG export — correctly handles KaTeX foreignObject)
- CSS Modules
# geosketch
