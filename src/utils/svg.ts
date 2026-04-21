import katex from 'katex'
import { centroid } from './math'

export const BLUE = '#378ADD'

// ── KaTeX inline render → HTML string ────────────────────────────────
export function renderKatex(latex: string): string {
  if (!latex || !latex.trim()) return ''
  try {
    const span = document.createElement('span')
    katex.render(latex, span, { throwOnError: false, displayMode: false })
    return span.outerHTML
  } catch {
    return latex
  }
}

// ── foreignObject label (KaTeX in SVG) ────────────────────────────────
export function foLabel(
  x: number,
  y: number,
  latex: string,
  w = 120
): string {
  if (!latex || !latex.trim()) return ''
  const html = renderKatex(latex)
  return `<foreignObject x="${x - w / 2}" y="${y - 22}" width="${w}" height="44" style="overflow:visible">
    <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;width:${w}px;height:44px;font-size:18px;color:#1a1a19">
      ${html}
    </div>
  </foreignObject>`
}

// ── Vertex letter label pushed away from centroid ────────────────────
export function vertexLabel(
  x: number,
  y: number,
  label: string,
  gcx: number,
  gcy: number
): string {
  const dist = 26
  const dx = x - gcx, dy = y - gcy
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = x + (dx / len) * dist
  const ny = y + (dy / len) * dist
  return `<text x="${nx}" y="${ny}" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="500" fill="${BLUE}" font-family="-apple-system,sans-serif">${label}</text>`
}

// ── Tick marks on a side ─────────────────────────────────────────────
export function tickMarks(
  x1: number, y1: number,
  x2: number, y2: number,
  n: 0 | 1 | 2 | 3
): string {
  if (!n) return ''
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  const px = (-dy / len) * 8, py = (dx / len) * 8
  const gap = 6, ux = dx / len, uy = dy / len
  const offsets: number[] =
    n === 1 ? [0] : n === 2 ? [-gap / 2, gap / 2] : [-gap, 0, gap]
  return offsets
    .map(o => {
      const cx = mx + ux * o, cy = my + uy * o
      return `<line x1="${cx - px}" y1="${cy - py}" x2="${cx + px}" y2="${cy + py}" stroke="${BLUE}" stroke-width="2.2" stroke-linecap="round"/>`
    })
    .join('')
}

// ── Right-angle square marker ─────────────────────────────────────────
type Corner = 'tl' | 'tr' | 'br' | 'bl'
export function rightAngleSq(x: number, y: number, dir: Corner): string {
  const s = 14
  const offsets: Record<Corner, [number, number]> = {
    tl: [0, 0], tr: [-s, 0], br: [-s, -s], bl: [0, -s],
  }
  const [ox, oy] = offsets[dir]
  return `<rect x="${x + ox}" y="${y + oy}" width="${s}" height="${s}" fill="none" stroke="${BLUE}" stroke-width="1.6"/>`
}

// ── Filled polygon helper ─────────────────────────────────────────────
export function polygon(pts: [number, number][]): string {
  const points = pts.map(([x, y]) => `${x},${y}`).join(' ')
  return `<polygon points="${points}" fill="rgba(55,138,221,0.07)" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/>`
}

// ── Vertex dots ───────────────────────────────────────────────────────
export function dots(pts: [number, number][]): string {
  return pts
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${BLUE}"/>`)
    .join('')
}

// ── Dashed diagonal line ──────────────────────────────────────────────
export function dashedLine(
  x1: number, y1: number,
  x2: number, y2: number
): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${BLUE}" stroke-width="1.4" stroke-dasharray="7,4" opacity="0.6"/>`
}

// ── Parse vertex name string into array of n labels ───────────────────
// "ABCD" with n=4 → ['A','B','C','D']
// "AB"   with n=4 → ['A','B','','']
// ""     with n=4 → ['','','','']
export function parseVertices(s: string, n: number): string[] {
  const t = s.trim()
  return Array.from({ length: n }, (_, i) => t[i] ?? '')
}

// ── Re-export centroid for convenience ───────────────────────────────
export { centroid }
