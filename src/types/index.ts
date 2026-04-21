// ── Shape keys ────────────────────────────────────────────────────────
export type TriangleKey =
  | 'right'
  | 'acute'
  | 'obtuse'
  | 'scalene'
  | 'isosceles'
  | 'equilateral'

export type QuadKey =
  | 'parallelogram'
  | 'rectangle'
  | 'square'
  | 'rhombus'
  | 'kite'
  | 'trapezoid'
  | 'trapezoid-right'
  | 'trapezoid-iso'

export type OtherKey = 'coord-plane' | 'reg-polygon'

export type AngleKey = 'angle-acute' | 'angle-right' | 'angle-obtuse' | 'angle-complementary' | 'angle-supplementary' | 'angle-parallel'

export type SegmentKey = 'segment' | 'segment-midpoint' | 'ray'

export type ShapeKey = TriangleKey | QuadKey | OtherKey | AngleKey | SegmentKey

// ── Label state ───────────────────────────────────────────────────────
export interface LabelState {
  on: boolean
  val: string
  ticks: 0 | 1 | 2 | 3
}

// ── Per-shape state maps ──────────────────────────────────────────────
export interface TriangleLabelState {
  a: LabelState
  b: LabelState
  c: LabelState
  A: LabelState
  B: LabelState
  C?: LabelState   // not used on right triangle angles (C is 90°)
  h?: LabelState   // height — acute/obtuse only
}

export interface QuadLabelState {
  sAB: LabelState
  sBC: LabelState
  sCD: LabelState
  sDA: LabelState
  A: LabelState
  B: LabelState
  C: LabelState
  D: LabelState
  diag: { on: boolean }
  d1: LabelState
}

export interface SquareLabelState {
  s: LabelState
  A: LabelState
  B: LabelState
  C: LabelState
  D: LabelState
  diag: { on: boolean }
  d1: LabelState
}

export interface EquilateralLabelState {
  a: LabelState
  A: LabelState
  B: LabelState
  C: LabelState
}

export type ShapeLabelState =
  | TriangleLabelState
  | QuadLabelState
  | SquareLabelState
  | EquilateralLabelState

// ── Calculator result ─────────────────────────────────────────────────
export interface CalcResult {
  label: string
  value: number | null
  given: boolean
  isAngle?: boolean
}

export type CalcResults = Record<string, CalcResult>

// ── Library item ──────────────────────────────────────────────────────
export interface LibraryItem {
  key: ShapeKey
  name: string
  category: 'Triangles' | 'Quadrilaterals'
  available: boolean
  thumbPath: string   // inline SVG path data
}
