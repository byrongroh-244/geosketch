// ── Angle conversion ──────────────────────────────────────────────────
export const toRad = (deg: number) => (deg * Math.PI) / 180
export const toDeg = (rad: number) => (rad * 180) / Math.PI

// ── Parse a label value as a number ───────────────────────────────────
export function parseVal(str: string): number | null {
  if (!str || !str.trim()) return null
  const n = parseFloat(str)
  if (!isNaN(n) && isFinite(n) && n > 0) return n
  // \sqrt{n}
  const sqM = str.match(/\\sqrt\{([^}]+)\}/)
  if (sqM) {
    const v = parseFloat(sqM[1])
    if (!isNaN(v) && v >= 0) return Math.sqrt(v)
  }
  // \frac{a}{b}
  const frM = str.match(/\\frac\{([^}]+)\}\{([^}]+)\}/)
  if (frM) {
    const a = parseFloat(frM[1]), b = parseFloat(frM[2])
    if (!isNaN(a) && !isNaN(b) && b !== 0) return a / b
  }
  return null
}

// ── Simplify a radical: returns { coeff, radicand } so n = coeff*√radicand ──
interface RadicalForm {
  coeff: number
  radicand: number
}

function simplifyRadical(n: number): RadicalForm | null {
  const sq = Math.round(n * n * 1e6) / 1e6
  const sqInt = Math.round(sq)
  if (Math.abs(sq - sqInt) > 0.0001) return null
  let radicand = sqInt, coeff = 1
  for (let i = 2; i * i <= radicand; i++) {
    while (radicand % (i * i) === 0) { coeff *= i; radicand /= i * i }
  }
  return { coeff, radicand }
}

// ── Format a number as radical + decimal ──────────────────────────────
export interface FormattedValue {
  primary: string
  secondary: string | null
}

export function formatValue(n: number | null): FormattedValue | null {
  if (n === null || n === undefined || isNaN(n) || !isFinite(n)) return null
  const r = Math.round(n * 1e6) / 1e6
  // Whole number
  if (Math.abs(r - Math.round(r)) < 0.0001) {
    return { primary: String(Math.round(r)), secondary: null }
  }
  // Try radical form
  const s = simplifyRadical(r)
  if (s) {
    let primary: string
    if (s.radicand === 1) primary = String(s.coeff)
    else if (s.coeff === 1) primary = `√${s.radicand}`
    else primary = `${s.coeff}√${s.radicand}`
    return { primary, secondary: `≈ ${parseFloat(r.toFixed(2))}` }
  }
  return { primary: parseFloat(r.toFixed(2)).toString(), secondary: null }
}

export function formatAngle(n: number | null): string | null {
  if (n === null || isNaN(n) || !isFinite(n)) return null
  return `${parseFloat(n.toFixed(2))}°`
}

// ── Append ° to angle label if not already present ────────────────────
export function ensureDegree(val: string): string {
  if (!val || !val.trim()) return ''
  if (val.trim().endsWith('°') || val.includes('circ')) return val
  return val + '°'
}

// ── Centroid of a polygon ─────────────────────────────────────────────
export function centroid(pts: [number, number][]): [number, number] {
  return [
    pts.reduce((s, p) => s + p[0], 0) / pts.length,
    pts.reduce((s, p) => s + p[1], 0) / pts.length,
  ]
}
