import React from 'react'
import { foLabel, tickMarks, polygon, dots, dashedLine, rightAngleSq, centroid, parseVertices } from '../../utils/svg'
import { ensureDegree } from '../../utils/math'
import LabelCell from '../ui/LabelCell'
import VertexNameInput from '../ui/VertexNameInput'
import type { LabelState } from '../../types'

// ── State types ───────────────────────────────────────────────────────
export interface RightTriangleState {
  vertexName: string
  a: LabelState; b: LabelState; c: LabelState
  A: LabelState; B: LabelState
}

export interface ThreeAngleTriState {
  vertexName: string
  a: LabelState; b: LabelState; c: LabelState
  A: LabelState; B: LabelState; C: LabelState
  h: LabelState
}

export interface EquilateralState {
  vertexName: string
  a: LabelState  // side AB (bottom)
  b: LabelState  // side AC (left)
  c: LabelState  // side BC (right)
  A: LabelState; B: LabelState; C: LabelState
}

// ── Default state factories ───────────────────────────────────────────
const mk = (val = ''): LabelState => ({ on: true, val, ticks: 0 })
const mkOff = (val = ''): LabelState => ({ on: false, val, ticks: 0 })

export const defaultRightState = (): RightTriangleState =>
  ({ vertexName: '', a: mk(), b: mk(), c: mk(), A: mk(), B: mk() })

export const defaultThreeAngleState = (): ThreeAngleTriState =>
  ({ vertexName: '', a: mk(), b: mk(), c: mk(), A: mk(), B: mk(), C: mk(), h: mkOff() })

export const defaultEquilateralState = (): EquilateralState =>
  ({ vertexName: '', a: mk(), b: mk(), c: mk(), A: mk('60°'), B: mk('60°'), C: mk('60°') })

// ── Shared render helper ──────────────────────────────────────────────
function Parts({ parts }: { parts: string[] }) {
  return <>{parts.map((p, i) => <g key={i} dangerouslySetInnerHTML={{ __html: p }} />)}</>
}

// ── Vertex label pushed outward from centroid ─────────────────────────
function vLabel(x: number, y: number, label: string, gx: number, gy: number): string {
  if (!label) return ''
  const dist = 26
  const dx = x - gx, dy = y - gy
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = x + (dx / len) * dist, ny = y + (dy / len) * dist
  return `<text x="${nx}" y="${ny}" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="500" fill="#378ADD" font-family="-apple-system,sans-serif">${label}</text>`
}

// ── RIGHT TRIANGLE ────────────────────────────────────────────────────
export function RightTriangleSvg({ st }: { st: RightTriangleState }) {
  const Ax=100,Ay=60,Bx=420,By=290,Cx=100,Cy=290
  const [gx,gy] = centroid([[Ax,Ay],[Bx,By],[Cx,Cy]])
  const [vA,vB,vC] = parseVertices(st.vertexName, 3)
  const p: string[] = []
  p.push(polygon([[Ax,Ay],[Bx,By],[Cx,Cy]]))
  p.push(rightAngleSq(Cx,Cy,'bl'))
  p.push(dots([[Ax,Ay],[Bx,By],[Cx,Cy]]))
  p.push(vLabel(Ax,Ay,vA,gx,gy))
  p.push(vLabel(Bx,By,vB,gx,gy))
  p.push(vLabel(Cx,Cy,vC,gx,gy))
  if(st.a.on&&st.a.val) p.push(foLabel((Cx+Bx)/2,(Cy+By)/2+26,st.a.val))
  p.push(tickMarks(Cx,Cy,Bx,By,st.a.on?st.a.ticks:0))
  if(st.b.on&&st.b.val) p.push(foLabel((Ax+Cx)/2-36,(Ay+Cy)/2,st.b.val))
  p.push(tickMarks(Ax,Ay,Cx,Cy,st.b.on?st.b.ticks:0))
  if(st.c.on&&st.c.val) p.push(foLabel((Ax+Bx)/2+36,(Ay+By)/2-12,st.c.val))
  if(st.A.on&&st.A.val) p.push(foLabel(Ax+22,Ay+52,ensureDegree(st.A.val)))
  if(st.B.on&&st.B.val) p.push(foLabel(Bx-76,By-28,ensureDegree(st.B.val)))
  return <Parts parts={p} />
}

// ── ACUTE TRIANGLE ────────────────────────────────────────────────────
export function AcuteTriangleSvg({ st }: { st: ThreeAngleTriState }) {
  const Ax=260,Ay=45,Bx=430,By=295,Cx=90,Cy=295
  const [gx,gy] = centroid([[Ax,Ay],[Bx,By],[Cx,Cy]])
  const [vA,vB,vC] = parseVertices(st.vertexName, 3)
  const p: string[] = []
  p.push(polygon([[Ax,Ay],[Bx,By],[Cx,Cy]]))
  p.push(dots([[Ax,Ay],[Bx,By],[Cx,Cy]]))
  p.push(vLabel(Ax,Ay,vA,gx,gy)); p.push(vLabel(Bx,By,vB,gx,gy)); p.push(vLabel(Cx,Cy,vC,gx,gy))
  if(st.a.on&&st.a.val) p.push(foLabel((Bx+Cx)/2,(By+Cy)/2+26,st.a.val))
  p.push(tickMarks(Bx,By,Cx,Cy,st.a.on?st.a.ticks:0))
  if(st.b.on&&st.b.val) p.push(foLabel((Ax+Cx)/2-36,(Ay+Cy)/2,st.b.val))
  p.push(tickMarks(Ax,Ay,Cx,Cy,st.b.on?st.b.ticks:0))
  if(st.c.on&&st.c.val) p.push(foLabel((Ax+Bx)/2+36,(Ay+By)/2,st.c.val))
  p.push(tickMarks(Ax,Ay,Bx,By,st.c.on?st.c.ticks:0))
  if(st.A.on&&st.A.val) p.push(foLabel(Ax,Ay+40,ensureDegree(st.A.val)))
  if(st.B.on&&st.B.val) p.push(foLabel(Bx-52,By-30,ensureDegree(st.B.val)))
  if(st.C.on&&st.C.val) p.push(foLabel(Cx+52,Cy-30,ensureDegree(st.C.val)))
  if(st.h.on&&st.h.val) { p.push(dashedLine(Ax,Ay,Ax,By)); p.push(rightAngleSq(Ax,By,'br')); p.push(foLabel(Ax-40,(Ay+By)/2,st.h.val)) }
  return <Parts parts={p} />
}

// ── OBTUSE TRIANGLE ───────────────────────────────────────────────────
export function ObtuseTriangleSvg({ st }: { st: ThreeAngleTriState }) {
  const Ax=65,Ay=290,Bx=390,By=55,Cx=465,Cy=290
  const [gx,gy] = centroid([[Ax,Ay],[Bx,By],[Cx,Cy]])
  const [vA,vB,vC] = parseVertices(st.vertexName, 3)
  const p: string[] = []
  p.push(polygon([[Ax,Ay],[Bx,By],[Cx,Cy]]))
  p.push(dots([[Ax,Ay],[Bx,By],[Cx,Cy]]))
  p.push(vLabel(Ax,Ay,vA,gx,gy)); p.push(vLabel(Bx,By,vB,gx,gy)); p.push(vLabel(Cx,Cy,vC,gx,gy))
  if(st.a.on&&st.a.val) p.push(foLabel((Bx+Cx)/2+36,(By+Cy)/2,st.a.val))
  p.push(tickMarks(Bx,By,Cx,Cy,st.a.on?st.a.ticks:0))
  if(st.b.on&&st.b.val) p.push(foLabel((Ax+Cx)/2,(Ay+Cy)/2+26,st.b.val))
  p.push(tickMarks(Ax,Ay,Cx,Cy,st.b.on?st.b.ticks:0))
  if(st.c.on&&st.c.val) p.push(foLabel((Ax+Bx)/2-36,(Ay+By)/2,st.c.val))
  p.push(tickMarks(Ax,Ay,Bx,By,st.c.on?st.c.ticks:0))
  if(st.A.on&&st.A.val) p.push(foLabel(Ax+68,Ay-24,ensureDegree(st.A.val)))
  if(st.B.on&&st.B.val) p.push(foLabel(Bx+24,By+44,ensureDegree(st.B.val)))
  if(st.C.on&&st.C.val) p.push(foLabel(Cx-48,Cy-30,ensureDegree(st.C.val)))
  if(st.h.on&&st.h.val) { p.push(dashedLine(Bx,By,Bx,Ay)); p.push(rightAngleSq(Bx,Ay,'bl')); p.push(foLabel(Bx-40,(By+Ay)/2,st.h.val)) }
  return <Parts parts={p} />
}

// ── SCALENE TRIANGLE ──────────────────────────────────────────────────
export function ScaleneTriangleSvg({ st }: { st: ThreeAngleTriState }) {
  const Ax=75,Ay=295,Bx=445,By=295,Cx=315,Cy=45
  const [gx,gy] = centroid([[Ax,Ay],[Bx,By],[Cx,Cy]])
  const [vA,vB,vC] = parseVertices(st.vertexName, 3)
  const p: string[] = []
  p.push(polygon([[Ax,Ay],[Bx,By],[Cx,Cy]]))
  p.push(dots([[Ax,Ay],[Bx,By],[Cx,Cy]]))
  p.push(vLabel(Ax,Ay,vA,gx,gy)); p.push(vLabel(Bx,By,vB,gx,gy)); p.push(vLabel(Cx,Cy,vC,gx,gy))
  if(st.a.on&&st.a.val) p.push(foLabel((Bx+Cx)/2+36,(By+Cy)/2,st.a.val))
  p.push(tickMarks(Bx,By,Cx,Cy,st.a.on?st.a.ticks:0))
  if(st.b.on&&st.b.val) p.push(foLabel((Ax+Cx)/2-36,(Ay+Cy)/2,st.b.val))
  p.push(tickMarks(Ax,Ay,Cx,Cy,st.b.on?st.b.ticks:0))
  if(st.c.on&&st.c.val) p.push(foLabel((Ax+Bx)/2,(Ay+By)/2+26,st.c.val))
  p.push(tickMarks(Ax,Ay,Bx,By,st.c.on?st.c.ticks:0))
  if(st.A.on&&st.A.val) p.push(foLabel(Ax+58,Ay-30,ensureDegree(st.A.val)))
  if(st.B.on&&st.B.val) p.push(foLabel(Bx-58,By-30,ensureDegree(st.B.val)))
  if(st.C.on&&st.C.val) p.push(foLabel(Cx+12,Cy+42,ensureDegree(st.C.val)))
  if(st.h.on&&st.h.val) { p.push(dashedLine(Cx,Cy,Cx,Ay)); p.push(rightAngleSq(Cx,Ay,'br')); p.push(foLabel(Cx+40,(Cy+Ay)/2,st.h.val)) }
  return <Parts parts={p} />
}

// ── ISOSCELES TRIANGLE ────────────────────────────────────────────────
export function IsoscelesTriangleSvg({ st }: { st: ThreeAngleTriState }) {
  const Ax=75,Ay=295,Bx=445,By=295,Cx=260,Cy=45
  const [gx,gy] = centroid([[Ax,Ay],[Bx,By],[Cx,Cy]])
  const [vA,vB,vC] = parseVertices(st.vertexName, 3)
  const p: string[] = []
  p.push(polygon([[Ax,Ay],[Bx,By],[Cx,Cy]]))
  p.push(dots([[Ax,Ay],[Bx,By],[Cx,Cy]]))
  p.push(vLabel(Ax,Ay,vA,gx,gy)); p.push(vLabel(Bx,By,vB,gx,gy)); p.push(vLabel(Cx,Cy,vC,gx,gy))
  if(st.a.on&&st.a.val) p.push(foLabel((Ax+Bx)/2,(Ay+By)/2+26,st.a.val))
  p.push(tickMarks(Ax,Ay,Bx,By,st.a.on?st.a.ticks:0))
  if(st.b.on&&st.b.val) p.push(foLabel((Ax+Cx)/2-36,(Ay+Cy)/2,st.b.val))
  p.push(tickMarks(Ax,Ay,Cx,Cy,st.b.on?st.b.ticks:0))
  if(st.c.on&&st.c.val) p.push(foLabel((Bx+Cx)/2+36,(By+Cy)/2,st.c.val))
  p.push(tickMarks(Bx,By,Cx,Cy,st.c.on?st.c.ticks:0))
  if(st.A.on&&st.A.val) p.push(foLabel(Ax+58,Ay-30,ensureDegree(st.A.val)))
  if(st.B.on&&st.B.val) p.push(foLabel(Bx-58,By-30,ensureDegree(st.B.val)))
  if(st.C.on&&st.C.val) p.push(foLabel(Cx,Cy+42,ensureDegree(st.C.val)))
  if(st.h.on&&st.h.val) { p.push(dashedLine(Cx,Cy,Cx,Ay)); p.push(rightAngleSq(Cx,Ay,'br')); p.push(foLabel(Cx+40,(Cy+Ay)/2,st.h.val)) }
  return <Parts parts={p} />
}

// ── EQUILATERAL TRIANGLE ──────────────────────────────────────────────
export function EquilateralTriangleSvg({ st }: { st: EquilateralState }) {
  const Ax=85,Ay=310,Bx=435,By=310,Cx=260,Cy=25
  const [gx,gy] = centroid([[Ax,Ay],[Bx,By],[Cx,Cy]])
  const [vA,vB,vC] = parseVertices(st.vertexName, 3)
  const p: string[] = []
  p.push(polygon([[Ax,Ay],[Bx,By],[Cx,Cy]]))
  p.push(dots([[Ax,Ay],[Bx,By],[Cx,Cy]]))
  p.push(vLabel(Ax,Ay,vA,gx,gy)); p.push(vLabel(Bx,By,vB,gx,gy)); p.push(vLabel(Cx,Cy,vC,gx,gy))
  if(st.a.on&&st.a.val) p.push(foLabel((Ax+Bx)/2,(Ay+By)/2+26,st.a.val))
  p.push(tickMarks(Ax,Ay,Bx,By,st.a.on?st.a.ticks:0))
  if(st.b.on&&st.b.val) p.push(foLabel((Ax+Cx)/2-36,(Ay+Cy)/2,st.b.val))
  p.push(tickMarks(Ax,Ay,Cx,Cy,st.b.on?st.b.ticks:0))
  if(st.c.on&&st.c.val) p.push(foLabel((Bx+Cx)/2+36,(By+Cy)/2,st.c.val))
  p.push(tickMarks(Bx,By,Cx,Cy,st.c.on?st.c.ticks:0))
  if(st.A.on&&st.A.val) p.push(foLabel(Ax+58,Ay-28,ensureDegree(st.A.val)))
  if(st.B.on&&st.B.val) p.push(foLabel(Bx-58,By-28,ensureDegree(st.B.val)))
  if(st.C.on&&st.C.val) p.push(foLabel(Cx,Cy+42,ensureDegree(st.C.val)))
  return <Parts parts={p} />
}

// ── Label panels ──────────────────────────────────────────────────────
export function RightTrianglePanel({ st, onChange }: { st: RightTriangleState; onChange: (n: RightTriangleState) => void }) {
  const upd = (key: keyof RightTriangleState) => (patch: Partial<LabelState>) =>
    onChange({ ...st, [key]: { ...(st[key] as LabelState), ...patch } })
  const [vA, vB, vC] = parseVertices(st.vertexName, 3)
  const sA = vA||'A', sB = vB||'B', sC = vC||'C'
  return (
    <>
      <div className="section-lbl">Vertex names</div>
      <VertexNameInput value={st.vertexName} n={3} onChange={v => onChange({ ...st, vertexName: v })} />
      <div className="section-lbl">Sides</div>
      <LabelCell id="a" label={`${sB}${sC}`} state={st.a} hasTicks onChange={upd('a')} />
      <LabelCell id="b" label={`${sA}${sC}`} state={st.b} hasTicks onChange={upd('b')} />
      <LabelCell id="c" label={`${sA}${sB} hyp.`} state={st.c} onChange={upd('c')} />
      <div className="section-lbl">Angles</div>
      <LabelCell id="A" label={sA} state={st.A} placeholder="e.g. 45" isAngle onChange={upd('A')} />
      <LabelCell id="B" label={sB} state={st.B} placeholder="e.g. 45" isAngle onChange={upd('B')} />
    </>
  )
}

export function ThreeAngleTriPanel({ st, onChange, showHeight }: { st: ThreeAngleTriState; onChange: (n: ThreeAngleTriState) => void; showHeight?: boolean }) {
  const upd = (key: keyof ThreeAngleTriState) => (patch: Partial<LabelState>) =>
    onChange({ ...st, [key]: { ...(st[key] as LabelState), ...patch } })
  const [vA, vB, vC] = parseVertices(st.vertexName, 3)
  const sA = vA||'A', sB = vB||'B', sC = vC||'C'
  return (
    <>
      <div className="section-lbl">Vertex names</div>
      <VertexNameInput value={st.vertexName} n={3} onChange={v => onChange({ ...st, vertexName: v })} />
      <div className="section-lbl">Sides</div>
      <LabelCell id="a" label={`${sB}${sC}`} state={st.a} hasTicks onChange={upd('a')} />
      <LabelCell id="b" label={`${sA}${sC}`} state={st.b} hasTicks onChange={upd('b')} />
      <LabelCell id="c" label={`${sA}${sB}`} state={st.c} hasTicks onChange={upd('c')} />
      <div className="section-lbl">Angles</div>
      <LabelCell id="A" label={sA} state={st.A} placeholder="e.g. 60" isAngle onChange={upd('A')} />
      <LabelCell id="B" label={sB} state={st.B} placeholder="e.g. 60" isAngle onChange={upd('B')} />
      <LabelCell id="C" label={sC} state={st.C} placeholder="e.g. 60" isAngle onChange={upd('C')} />
      {showHeight && (
        <>
          <div className="section-lbl">Height</div>
          <LabelCell id="h" label="h" state={st.h} placeholder="e.g. h" onChange={upd('h')} />
        </>
      )}
    </>
  )
}

export function EquilateralPanel({ st, onChange }: { st: EquilateralState; onChange: (n: EquilateralState) => void }) {
  const upd = (key: keyof EquilateralState) => (patch: Partial<LabelState>) =>
    onChange({ ...st, [key]: { ...(st[key] as LabelState), ...patch } })
  const [vA, vB, vC] = parseVertices(st.vertexName, 3)
  const sA = vA||'A', sB = vB||'B', sC = vC||'C'
  return (
    <>
      <div className="section-lbl">Vertex names</div>
      <VertexNameInput value={st.vertexName} n={3} onChange={v => onChange({ ...st, vertexName: v })} />
      <div className="section-lbl">Sides</div>
      <LabelCell id="a" label={`${sA}${sB}`} state={st.a} hasTicks placeholder="e.g. 5" onChange={upd('a')} />
      <LabelCell id="b" label={`${sA}${sC}`} state={st.b} hasTicks placeholder="e.g. 5" onChange={upd('b')} />
      <LabelCell id="c" label={`${sB}${sC}`} state={st.c} hasTicks placeholder="e.g. 5" onChange={upd('c')} />
      <div className="section-lbl">Angles</div>
      <LabelCell id="A" label={sA} state={st.A} placeholder="60°" isAngle onChange={upd('A')} />
      <LabelCell id="B" label={sB} state={st.B} placeholder="60°" isAngle onChange={upd('B')} />
      <LabelCell id="C" label={sC} state={st.C} placeholder="60°" isAngle onChange={upd('C')} />
    </>
  )
}
