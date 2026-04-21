import React from 'react'
import type { ShapeKey } from '../../types'
import styles from './ShapeLibrary.module.css'

const BLUE = '#378ADD'

interface ThumbDef {
  key: ShapeKey
  name: string
  svg: string
  soon?: boolean
}

const TRIANGLES: ThumbDef[] = [
  { key: 'right', name: 'Right', svg: `<polygon points="7,30 7,4 40,30" fill="none" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/><rect x="7" y="20" width="8" height="8" fill="none" stroke="${BLUE}" stroke-width="1.4"/>` },
  { key: 'acute', name: 'Acute', svg: `<polygon points="23,3 42,30 4,30" fill="none" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/>` },
  { key: 'obtuse', name: 'Obtuse', svg: `<polygon points="4,30 40,30 34,6" fill="none" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/>` },
  { key: 'scalene', name: 'Scalene', svg: `<polygon points="4,30 42,30 30,5" fill="none" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/>` },
  { key: 'isosceles', name: 'Isosceles', svg: `<polygon points="23,3 42,30 4,30" fill="none" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/>` },
  { key: 'equilateral', name: 'Equilateral', svg: `<polygon points="23,2 44,32 2,32" fill="none" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/>` },
]

const QUADS: ThumbDef[] = [
  { key: 'parallelogram', name: 'Parallelogram', svg: `<polygon points="10,28 40,28 36,5 6,5" fill="none" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/>` },
  { key: 'rectangle', name: 'Rectangle', svg: `<rect x="4" y="7" width="38" height="20" fill="none" stroke="${BLUE}" stroke-width="2"/>` },
  { key: 'square', name: 'Square', svg: `<rect x="9" y="4" width="28" height="28" fill="none" stroke="${BLUE}" stroke-width="2"/>` },
  { key: 'rhombus', name: 'Rhombus', svg: `<polygon points="23,3 43,17 23,31 3,17" fill="none" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/>` },
  { key: 'kite', name: 'Kite', svg: `<polygon points="23,2 40,17 23,32 6,17" fill="none" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/>` },
  { key: 'trapezoid', name: 'Trapezoid', svg: `<polygon points="14,32 38,32 34,6 18,6" fill="none" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/>` },
  { key: 'trapezoid-right', name: 'Trap. Right', svg: `<polygon points="8,32 42,32 38,6 8,6" fill="none" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/><rect x="8" y="22" width="8" height="8" fill="none" stroke="${BLUE}" stroke-width="1.4"/>` },
  { key: 'trapezoid-iso', name: 'Trap. Iso.', svg: `<polygon points="12,32 40,32 36,6 16,6" fill="none" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/>` },
]

const ANGLES: ThumbDef[] = [
  { key: 'angle-acute',         name: 'Acute',         svg: `<line x1="8" y1="32" x2="38" y2="32" stroke="${BLUE}" stroke-width="2"/><line x1="8" y1="32" x2="28" y2="8" stroke="${BLUE}" stroke-width="2"/><path d="M 20 32 A 12 12 0 0 0 15 22" fill="none" stroke="${BLUE}" stroke-width="1.5"/><circle cx="8" cy="32" r="2.5" fill="${BLUE}"/>` },
  { key: 'angle-right',         name: 'Right',         svg: `<line x1="8" y1="32" x2="38" y2="32" stroke="${BLUE}" stroke-width="2"/><line x1="8" y1="32" x2="8" y2="6" stroke="${BLUE}" stroke-width="2"/><polyline points="18,32 18,22 8,22" fill="none" stroke="${BLUE}" stroke-width="1.5"/><circle cx="8" cy="32" r="2.5" fill="${BLUE}"/>` },
  { key: 'angle-obtuse',        name: 'Obtuse',        svg: `<line x1="6" y1="32" x2="40" y2="32" stroke="${BLUE}" stroke-width="2"/><line x1="6" y1="32" x2="38" y2="10" stroke="${BLUE}" stroke-width="2"/><path d="M 18 32 A 12 12 0 0 0 11 22" fill="none" stroke="${BLUE}" stroke-width="1.5"/><circle cx="6" cy="32" r="2.5" fill="${BLUE}"/>` },
  { key: 'angle-complementary', name: 'Complem.',      svg: `<line x1="8" y1="32" x2="38" y2="32" stroke="${BLUE}" stroke-width="2"/><line x1="8" y1="32" x2="8" y2="6" stroke="${BLUE}" stroke-width="2"/><line x1="8" y1="32" x2="30" y2="12" stroke="${BLUE}" stroke-width="2"/><polyline points="18,32 18,22 8,22" fill="none" stroke="${BLUE}" stroke-width="1.4"/><circle cx="8" cy="32" r="2.5" fill="${BLUE}"/>` },
  { key: 'angle-supplementary', name: 'Supplem.',      svg: `<line x1="2" y1="20" x2="44" y2="20" stroke="${BLUE}" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="20" x2="36" y2="4" stroke="${BLUE}" stroke-width="2"/><path d="M 30 20 A 8 8 0 0 0 26 13" fill="none" stroke="${BLUE}" stroke-width="1.4"/><path d="M 14 20 A 8 8 0 0 0 26 13" fill="none" stroke="${BLUE}" stroke-width="1.4"/><circle cx="22" cy="20" r="2.5" fill="${BLUE}"/>` },
  { key: 'angle-parallel',      name: 'Parallel',      svg: `<line x1="2" y1="12" x2="44" y2="12" stroke="${BLUE}" stroke-width="2"/><line x1="2" y1="26" x2="44" y2="26" stroke="${BLUE}" stroke-width="2"/><line x1="30" y1="2" x2="16" y2="36" stroke="${BLUE}" stroke-width="2"/><line x1="10" y1="8" x2="10" y2="16" stroke="${BLUE}" stroke-width="1.5"/><line x1="13" y1="8" x2="13" y2="16" stroke="${BLUE}" stroke-width="1.5"/><line x1="10" y1="22" x2="10" y2="30" stroke="${BLUE}" stroke-width="1.5"/><line x1="13" y1="22" x2="13" y2="30" stroke="${BLUE}" stroke-width="1.5"/>` },
]

const SEGMENTS: ThumbDef[] = [
  { key: 'segment',          name: 'Segment',    svg: `<line x1="4" y1="18" x2="42" y2="18" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round"/><circle cx="4" cy="18" r="3" fill="${BLUE}"/><circle cx="42" cy="18" r="3" fill="${BLUE}"/>` },
  { key: 'segment-midpoint', name: 'Midpoint',   svg: `<line x1="4" y1="18" x2="42" y2="18" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round"/><circle cx="4" cy="18" r="3" fill="${BLUE}"/><circle cx="23" cy="18" r="3" fill="${BLUE}"/><circle cx="42" cy="18" r="3" fill="${BLUE}"/>` },
  { key: 'ray',              name: 'Ray',        svg: `<line x1="4" y1="18" x2="38" y2="18" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round"/><polygon points="42,18 34,14 34,22" fill="${BLUE}"/><circle cx="4" cy="18" r="3" fill="${BLUE}"/>` },
]

const COMING: { name: string; svg: string }[] = [
  { name: '3D solids', svg: `<rect x="3" y="12" width="22" height="18" fill="none" stroke="${BLUE}" stroke-width="1.5"/><rect x="14" y="4" width="22" height="18" fill="none" stroke="${BLUE}" stroke-width="1.5"/><line x1="3" y1="12" x2="14" y2="4" stroke="${BLUE}" stroke-width="1.5"/><line x1="25" y1="12" x2="36" y2="4" stroke="${BLUE}" stroke-width="1.5"/><line x1="25" y1="30" x2="36" y2="22" stroke="${BLUE}" stroke-width="1.5"/>` },
]

const OTHER: ThumbDef[] = [
  { key: 'coord-plane', name: 'Coord. Plane', svg: `<line x1="3" y1="17" x2="43" y2="17" stroke="${BLUE}" stroke-width="1.5"/><line x1="23" y1="2" x2="23" y2="32" stroke="${BLUE}" stroke-width="1.5"/><circle cx="30" cy="10" r="2.5" fill="${BLUE}"/><circle cx="14" cy="22" r="2.5" fill="${BLUE}"/><circle cx="34" cy="20" r="2.5" fill="${BLUE}"/>` },
  { key: 'reg-polygon', name: 'Reg. Polygon', svg: `<polygon points="23,2 40,12 40,26 23,36 6,26 6,12" fill="none" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/>` },
]

interface Props {
  current: ShapeKey | null
  onSelect: (key: ShapeKey) => void
}

function Thumb({ def, active, onSelect }: { key?: string; def: ThumbDef; active: boolean; onSelect: (key: ShapeKey) => void }) {
  return (
    <div
      className={`${styles.thumb} ${active ? styles.active : ''} ${def.soon ? styles.soon : ''}`}
      onClick={() => !def.soon && def.key && onSelect(def.key as ShapeKey)}
    >
      <span className={styles.thumbName}>{def.name}</span>
      <svg viewBox="0 0 46 34" dangerouslySetInnerHTML={{ __html: def.svg }} />
    </div>
  )
}

export default function ShapeLibrary({ current, onSelect }: Props) {
  const thumb = (t: ThumbDef) => (
    <Thumb key={String(t.key)} def={t} active={current === t.key} onSelect={onSelect} />
  )
  return (
    <div className={styles.library}>
      <div className={styles.catLabel}>Triangles</div>
      <div className={styles.grid}>{TRIANGLES.map(thumb)}</div>

      <div className={styles.catLabel}>Quadrilaterals</div>
      <div className={styles.grid}>{QUADS.map(thumb)}</div>

      <div className={styles.catLabel}>Angles</div>
      <div className={styles.grid}>{ANGLES.map(thumb)}</div>

      <div className={styles.catLabel}>Segments</div>
      <div className={styles.grid}>{SEGMENTS.map(thumb)}</div>

      <div className={styles.catLabel}>Other</div>
      <div className={styles.grid}>{OTHER.map(thumb)}</div>

      <div className={`${styles.catLabel} ${styles.soon}`}>Coming soon</div>
      <div className={styles.grid}>
        {COMING.map(t => (
          <div key={t.name} className={`${styles.thumb} ${styles.soon}`}>
            <span className={styles.thumbName}>{t.name}</span>
            <svg viewBox="0 0 46 34" dangerouslySetInnerHTML={{ __html: t.svg }} />
          </div>
        ))}
      </div>
    </div>
  )
}
