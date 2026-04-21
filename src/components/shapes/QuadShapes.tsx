import React from 'react'
import { foLabel, tickMarks, rightAngleSq, dots, dashedLine, centroid, parseVertices, BLUE } from '../../utils/svg'
import { ensureDegree } from '../../utils/math'
import LabelCell from '../ui/LabelCell'
import VertexNameInput from '../ui/VertexNameInput'
import type { LabelState } from '../../types'

// ── Shared interfaces ─────────────────────────────────────────────────
export interface QuadSides { sAB: LabelState; sBC: LabelState; sCD: LabelState; sDA: LabelState }
export interface QuadAngles { A: LabelState; B: LabelState; C: LabelState; D: LabelState }

// Simple diagonal (Para) — both diagonals, one label
export interface DiagState { diagOn: boolean; d1: LabelState }

// Single diagonal (Rect/Square) — only A→C, one label
export interface SingleDiagState { diagOn: boolean; dLabel: LabelState }

// Rhombus diagonals — perpendicular bisectors, whole or halves mode
// d1 = vertical (A↔C), d2 = horizontal (B↔D)
export interface RhombusDiagState {
  diagOn: boolean
  diagMode: 'whole' | 'halves'
  d1: LabelState       // whole d1 (A↔C)
  d2: LabelState       // whole d2 (B↔D)
  d1a: LabelState      // top half of d1 (A→midpoint)
  d1b: LabelState      // bottom half of d1 (midpoint→C)
  d2a: LabelState      // right half of d2 (midpoint→B)
  d2b: LabelState      // left half of d2 (D→midpoint)
}

// Kite diagonals — axis A↔C (not bisected), cross B↔D (bisected by axis)
export interface KiteDiagState {
  diagOn: boolean
  diagMode: 'whole' | 'halves'
  dAxis: LabelState    // whole A↔C axis
  dCross: LabelState   // whole B↔D cross
  dAxisTop: LabelState    // A→intersection (top part of axis)
  dAxisBot: LabelState    // intersection→C (bottom part of axis)
  dCrossHalf: LabelState  // half of B↔D (both halves equal — one label)
}

export interface ParaState    extends QuadSides, QuadAngles, DiagState { vertexName: string }
export interface RectState    extends QuadSides, QuadAngles, SingleDiagState { vertexName: string }
export interface SquareState  extends QuadSides, QuadAngles, SingleDiagState { vertexName: string }
export interface RhombusState extends QuadSides, QuadAngles, RhombusDiagState { vertexName: string }
export interface KiteState    extends QuadSides, QuadAngles, KiteDiagState { vertexName: string }

export interface TrapState extends QuadSides, QuadAngles {
  vertexName: string
  hOn: boolean; hVal: string
}

const mk = (val = ''): LabelState => ({ on: true, val, ticks: 0 })
const mkOff = (): LabelState => ({ on: false, val: '', ticks: 0 })

export const defaultParaState    = (): ParaState    => ({ vertexName:'', sAB:mk(),sBC:mk(),sCD:mk(),sDA:mk(), A:mk(),B:mk(),C:mk(),D:mk(), diagOn:false,d1:mkOff() })
export const defaultRectState    = (): RectState    => ({ vertexName:'', sAB:mk(),sBC:mk(),sCD:mk(),sDA:mk(), A:mk('90°'),B:mk('90°'),C:mk('90°'),D:mk('90°'), diagOn:false,dLabel:mkOff() })
export const defaultSquareState  = (): SquareState  => ({ vertexName:'', sAB:mk(),sBC:mk(),sCD:mk(),sDA:mk(), A:mk('90°'),B:mk('90°'),C:mk('90°'),D:mk('90°'), diagOn:false,dLabel:mkOff() })
export const defaultRhombusState = (): RhombusState => ({ vertexName:'', sAB:mk(),sBC:mk(),sCD:mk(),sDA:mk(), A:mk(),B:mk(),C:mk(),D:mk(), diagOn:false, diagMode:'whole', d1:mkOff(),d2:mkOff(),d1a:mkOff(),d1b:mkOff(),d2a:mkOff(),d2b:mkOff() })
export const defaultKiteState    = (): KiteState    => ({ vertexName:'', sAB:mk(),sBC:mk(),sCD:mk(),sDA:mk(), A:mk(),B:mk(),C:mk(),D:mk(), diagOn:false, diagMode:'whole', dAxis:mkOff(),dCross:mkOff(),dAxisTop:mkOff(),dAxisBot:mkOff(),dCrossHalf:mkOff() })

const defaultTrapBase = (): TrapState => ({ vertexName:'', sAB:mk(),sBC:mk(),sCD:mk(),sDA:mk(), A:mk(),B:mk(),C:mk(),D:mk(), hOn:false,hVal:'' })
export const defaultTrapIrregularState = (): TrapState => defaultTrapBase()
export const defaultTrapRightState     = (): TrapState => ({ ...defaultTrapBase(), A:mk('90°'),D:mk('90°') })
export const defaultTrapIsoState       = (): TrapState => defaultTrapBase()

// ── Shared helpers ────────────────────────────────────────────────────
function vLabel(x:number,y:number,label:string,gx:number,gy:number):string {
  if(!label) return ''
  const dist=26, dx=x-gx, dy=y-gy, len=Math.sqrt(dx*dx+dy*dy)||1
  const nx=x+(dx/len)*dist, ny=y+(dy/len)*dist
  return `<text x="${nx}" y="${ny}" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="500" fill="${BLUE}" font-family="-apple-system,sans-serif">${label}</text>`
}

function drawDiags(Ax:number,Ay:number,Bx:number,By:number,Cx:number,Cy:number,Dx:number,Dy:number,d1:LabelState):string[] {
  const p:string[]=[]
  p.push(dashedLine(Ax,Ay,Cx,Cy)); p.push(dashedLine(Bx,By,Dx,Dy))
  if(d1.on&&d1.val) p.push(foLabel((Ax+Cx)/2+22,(Ay+Cy)/2,d1.val))
  return p
}

function quadSideLabels(p:string[],st:QuadSides,Ax:number,Ay:number,Bx:number,By:number,Cx:number,Cy:number,Dx:number,Dy:number){
  if(st.sAB.on&&st.sAB.val) p.push(foLabel((Ax+Bx)/2,(Ay+By)/2-24,st.sAB.val)); p.push(tickMarks(Ax,Ay,Bx,By,st.sAB.on?st.sAB.ticks:0))
  if(st.sBC.on&&st.sBC.val) p.push(foLabel((Bx+Cx)/2+32,(By+Cy)/2,st.sBC.val)); p.push(tickMarks(Bx,By,Cx,Cy,st.sBC.on?st.sBC.ticks:0))
  if(st.sCD.on&&st.sCD.val) p.push(foLabel((Cx+Dx)/2,(Cy+Dy)/2+26,st.sCD.val)); p.push(tickMarks(Cx,Cy,Dx,Dy,st.sCD.on?st.sCD.ticks:0))
  if(st.sDA.on&&st.sDA.val) p.push(foLabel((Dx+Ax)/2-32,(Dy+Ay)/2,st.sDA.val)); p.push(tickMarks(Dx,Dy,Ax,Ay,st.sDA.on?st.sDA.ticks:0))
}

function quadAngleLabels(p:string[],st:QuadAngles,Ax:number,Ay:number,Bx:number,By:number,Cx:number,Cy:number,Dx:number,Dy:number,offX=42,offY=34){
  if(st.A.on&&st.A.val) p.push(foLabel(Ax+offX,Ay+offY,ensureDegree(st.A.val)))
  if(st.B.on&&st.B.val) p.push(foLabel(Bx-offX,By+offY,ensureDegree(st.B.val)))
  if(st.C.on&&st.C.val) p.push(foLabel(Cx-offX,Cy-offY,ensureDegree(st.C.val)))
  if(st.D.on&&st.D.val) p.push(foLabel(Dx+offX,Dy-offY,ensureDegree(st.D.val)))
}

// ── PARALLELOGRAM ─────────────────────────────────────────────────────
export function ParallelogramSvg({ st }: { st: ParaState }) {
  const Ax=170,Ay=55,Bx=450,By=55,Cx=380,Cy=285,Dx=100,Dy=285
  const [gx,gy]=centroid([[Ax,Ay],[Bx,By],[Cx,Cy],[Dx,Dy]])
  const [vA,vB,vC,vD]=parseVertices(st.vertexName,4)
  const p:string[]=[]
  p.push(`<polygon points="${Ax},${Ay} ${Bx},${By} ${Cx},${Cy} ${Dx},${Dy}" fill="rgba(55,138,221,0.07)" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/>`)
  if(st.diagOn) p.push(...drawDiags(Ax,Ay,Bx,By,Cx,Cy,Dx,Dy,st.d1))
  p.push(dots([[Ax,Ay],[Bx,By],[Cx,Cy],[Dx,Dy]]))
  p.push(vLabel(Ax,Ay,vA,gx,gy)); p.push(vLabel(Bx,By,vB,gx,gy)); p.push(vLabel(Cx,Cy,vC,gx,gy)); p.push(vLabel(Dx,Dy,vD,gx,gy))
  quadSideLabels(p,st,Ax,Ay,Bx,By,Cx,Cy,Dx,Dy)
  quadAngleLabels(p,st,Ax,Ay,Bx,By,Cx,Cy,Dx,Dy)
  return <>{p.map((x,i)=><g key={i} dangerouslySetInnerHTML={{__html:x}}/>)}</>
}

// ── RECTANGLE ─────────────────────────────────────────────────────────
export function RectangleSvg({ st }: { st: RectState }) {
  const Ax=80,Ay=55,Bx=440,By=55,Cx=440,Cy=285,Dx=80,Dy=285
  const [gx,gy]=centroid([[Ax,Ay],[Bx,By],[Cx,Cy],[Dx,Dy]])
  const [vA,vB,vC,vD]=parseVertices(st.vertexName,4)
  const p:string[]=[]
  p.push(`<rect x="${Ax}" y="${Ay}" width="${Bx-Ax}" height="${Cy-Ay}" fill="rgba(55,138,221,0.07)" stroke="${BLUE}" stroke-width="2"/>`)
  p.push(rightAngleSq(Ax,Ay,'tl')); p.push(rightAngleSq(Bx,By,'tr')); p.push(rightAngleSq(Cx,Cy,'br')); p.push(rightAngleSq(Dx,Dy,'bl'))
  if(st.diagOn) {
    p.push(dashedLine(Ax,Ay,Cx,Cy))
    if(st.dLabel.on&&st.dLabel.val) p.push(foLabel((Ax+Cx)/2+22,(Ay+Cy)/2,st.dLabel.val))
  }
  p.push(dots([[Ax,Ay],[Bx,By],[Cx,Cy],[Dx,Dy]]))
  p.push(vLabel(Ax,Ay,vA,gx,gy)); p.push(vLabel(Bx,By,vB,gx,gy)); p.push(vLabel(Cx,Cy,vC,gx,gy)); p.push(vLabel(Dx,Dy,vD,gx,gy))
  quadSideLabels(p,st,Ax,Ay,Bx,By,Cx,Cy,Dx,Dy)
  quadAngleLabels(p,st,Ax,Ay,Bx,By,Cx,Cy,Dx,Dy)
  return <>{p.map((x,i)=><g key={i} dangerouslySetInnerHTML={{__html:x}}/>)}</>
}

// ── SQUARE ────────────────────────────────────────────────────────────
export function SquareSvg({ st }: { st: SquareState }) {
  const Ax=120,Ay=30,Bx=400,By=30,Cx=400,Cy=310,Dx=120,Dy=310
  const [gx,gy]=centroid([[Ax,Ay],[Bx,By],[Cx,Cy],[Dx,Dy]])
  const [vA,vB,vC,vD]=parseVertices(st.vertexName,4)
  const p:string[]=[]
  p.push(`<rect x="${Ax}" y="${Ay}" width="${Bx-Ax}" height="${Cy-Ay}" fill="rgba(55,138,221,0.07)" stroke="${BLUE}" stroke-width="2"/>`)
  p.push(rightAngleSq(Ax,Ay,'tl')); p.push(rightAngleSq(Bx,By,'tr')); p.push(rightAngleSq(Cx,Cy,'br')); p.push(rightAngleSq(Dx,Dy,'bl'))
  if(st.diagOn) {
    p.push(dashedLine(Ax,Ay,Cx,Cy))
    if(st.dLabel.on&&st.dLabel.val) p.push(foLabel((Ax+Cx)/2+22,(Ay+Cy)/2,st.dLabel.val))
  }
  p.push(dots([[Ax,Ay],[Bx,By],[Cx,Cy],[Dx,Dy]]))
  p.push(vLabel(Ax,Ay,vA,gx,gy)); p.push(vLabel(Bx,By,vB,gx,gy)); p.push(vLabel(Cx,Cy,vC,gx,gy)); p.push(vLabel(Dx,Dy,vD,gx,gy))
  quadSideLabels(p,st,Ax,Ay,Bx,By,Cx,Cy,Dx,Dy)
  quadAngleLabels(p,st,Ax,Ay,Bx,By,Cx,Cy,Dx,Dy)
  return <>{p.map((x,i)=><g key={i} dangerouslySetInnerHTML={{__html:x}}/>)}</>
}

// ── RHOMBUS ───────────────────────────────────────────────────────────
export function RhombusSvg({ st }: { st: RhombusState }) {
  const Ax=260,Ay=20,Bx=460,By=170,Cx=260,Cy=320,Dx=60,Dy=170
  const [gx,gy]=centroid([[Ax,Ay],[Bx,By],[Cx,Cy],[Dx,Dy]])
  const [vA,vB,vC,vD]=parseVertices(st.vertexName,4)
  // intersection = midpoint of both diagonals (since rhombus diagonals bisect each other)
  const mx=(Ax+Cx)/2, my=(Ay+Cy)/2
  const p:string[]=[]
  p.push(`<polygon points="${Ax},${Ay} ${Bx},${By} ${Cx},${Cy} ${Dx},${Dy}" fill="rgba(55,138,221,0.07)" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/>`)
  if(st.diagOn) {
    p.push(dashedLine(Ax,Ay,Cx,Cy))
    p.push(dashedLine(Bx,By,Dx,Dy))
    // right-angle marker at intersection
    const s=10
    p.push(`<polyline points="${mx},${my-s} ${mx+s},${my-s} ${mx+s},${my}" fill="none" stroke="${BLUE}" stroke-width="1.4"/>`)
    if(st.diagMode==='whole') {
      if(st.d1.on&&st.d1.val) p.push(foLabel(mx+26,my,st.d1.val))       // d1 = A↔C (vertical)
      if(st.d2.on&&st.d2.val) p.push(foLabel(mx,(my+Ay)/2-10,st.d2.val)) // d2 = B↔D (horizontal)
    } else {
      // halves — d1a = A→mid, d1b = mid→C, d2a = mid→B, d2b = D→mid
      if(st.d1a.on&&st.d1a.val) p.push(foLabel(mx+26,(Ay+my)/2,st.d1a.val))
      if(st.d1b.on&&st.d1b.val) p.push(foLabel(mx+26,(my+Cy)/2,st.d1b.val))
      if(st.d2a.on&&st.d2a.val) p.push(foLabel((mx+Bx)/2,my-22,st.d2a.val))
      if(st.d2b.on&&st.d2b.val) p.push(foLabel((Dx+mx)/2,my-22,st.d2b.val))
    }
  }
  p.push(dots([[Ax,Ay],[Bx,By],[Cx,Cy],[Dx,Dy]]))
  p.push(vLabel(Ax,Ay,vA,gx,gy)); p.push(vLabel(Bx,By,vB,gx,gy)); p.push(vLabel(Cx,Cy,vC,gx,gy)); p.push(vLabel(Dx,Dy,vD,gx,gy))
  if(st.sAB.on&&st.sAB.val) p.push(foLabel((Ax+Bx)/2+36,(Ay+By)/2-10,st.sAB.val)); p.push(tickMarks(Ax,Ay,Bx,By,st.sAB.on?st.sAB.ticks:0))
  if(st.sBC.on&&st.sBC.val) p.push(foLabel((Bx+Cx)/2+36,(By+Cy)/2+10,st.sBC.val)); p.push(tickMarks(Bx,By,Cx,Cy,st.sBC.on?st.sBC.ticks:0))
  if(st.sCD.on&&st.sCD.val) p.push(foLabel((Cx+Dx)/2-36,(Cy+Dy)/2+10,st.sCD.val)); p.push(tickMarks(Cx,Cy,Dx,Dy,st.sCD.on?st.sCD.ticks:0))
  if(st.sDA.on&&st.sDA.val) p.push(foLabel((Dx+Ax)/2-36,(Dy+Ay)/2-10,st.sDA.val)); p.push(tickMarks(Dx,Dy,Ax,Ay,st.sDA.on?st.sDA.ticks:0))
  if(st.A.on&&st.A.val) p.push(foLabel(Ax,Ay+40,ensureDegree(st.A.val)))
  if(st.B.on&&st.B.val) p.push(foLabel(Bx-52,By,ensureDegree(st.B.val)))
  if(st.C.on&&st.C.val) p.push(foLabel(Cx,Cy-40,ensureDegree(st.C.val)))
  if(st.D.on&&st.D.val) p.push(foLabel(Dx+52,Dy,ensureDegree(st.D.val)))
  return <>{p.map((x,i)=><g key={i} dangerouslySetInnerHTML={{__html:x}}/>)}</>
}

// ── KITE ──────────────────────────────────────────────────────────────
export function KiteSvg({ st }: { st: KiteState }) {
  const Ax=30,Ay=170,Bx=190,By=30,Cx=490,Cy=170,Dx=190,Dy=310
  const [gx,gy]=centroid([[Ax,Ay],[Bx,By],[Cx,Cy],[Dx,Dy]])
  const [vA,vB,vC,vD]=parseVertices(st.vertexName,4)
  // Intersection of diagonals: axis A↔C is horizontal (y=170), cross B↔D is vertical (x=190)
  const ix=190, iy=170  // where diagonals cross
  const p:string[]=[]
  p.push(`<polygon points="${Ax},${Ay} ${Bx},${By} ${Cx},${Cy} ${Dx},${Dy}" fill="rgba(55,138,221,0.07)" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/>`)
  if(st.diagOn) {
    p.push(dashedLine(Ax,Ay,Cx,Cy))
    p.push(dashedLine(Bx,By,Dx,Dy))
    // right-angle marker at intersection (axis bisects cross perpendicularly)
    const s=10
    p.push(`<polyline points="${ix},${iy-s} ${ix+s},${iy-s} ${ix+s},${iy}" fill="none" stroke="${BLUE}" stroke-width="1.4"/>`)
    if(st.diagMode==='whole') {
      if(st.dAxis.on&&st.dAxis.val)  p.push(foLabel((Ax+Cx)/2,iy-22,st.dAxis.val))   // A↔C label above axis
      if(st.dCross.on&&st.dCross.val) p.push(foLabel(ix+28,(By+Dy)/2,st.dCross.val))  // B↔D label right of cross
    } else {
      // Axis halves: A→intersection (left), intersection→C (right)
      if(st.dAxisTop.on&&st.dAxisTop.val) p.push(foLabel((Ax+ix)/2,iy-22,st.dAxisTop.val))
      if(st.dAxisBot.on&&st.dAxisBot.val) p.push(foLabel((ix+Cx)/2,iy-22,st.dAxisBot.val))
      // Cross halves: both equal (B→mid = mid→D), one shared label shown on upper half
      if(st.dCrossHalf.on&&st.dCrossHalf.val) {
        p.push(foLabel(ix+28,(By+iy)/2,st.dCrossHalf.val))
        p.push(foLabel(ix+28,(iy+Dy)/2,st.dCrossHalf.val))
      }
    }
  }
  p.push(dots([[Ax,Ay],[Bx,By],[Cx,Cy],[Dx,Dy]]))
  p.push(vLabel(Ax,Ay,vA,gx,gy)); p.push(vLabel(Bx,By,vB,gx,gy)); p.push(vLabel(Cx,Cy,vC,gx,gy)); p.push(vLabel(Dx,Dy,vD,gx,gy))
  if(st.sAB.on&&st.sAB.val) p.push(foLabel((Ax+Bx)/2-32,(Ay+By)/2,st.sAB.val)); p.push(tickMarks(Ax,Ay,Bx,By,st.sAB.on?st.sAB.ticks:0))
  if(st.sBC.on&&st.sBC.val) p.push(foLabel((Bx+Cx)/2+10,(By+Cy)/2-28,st.sBC.val)); p.push(tickMarks(Bx,By,Cx,Cy,st.sBC.on?st.sBC.ticks:0))
  if(st.sCD.on&&st.sCD.val) p.push(foLabel((Cx+Dx)/2+10,(Cy+Dy)/2+28,st.sCD.val)); p.push(tickMarks(Cx,Cy,Dx,Dy,st.sCD.on?st.sCD.ticks:0))
  if(st.sDA.on&&st.sDA.val) p.push(foLabel((Dx+Ax)/2-32,(Dy+Ay)/2,st.sDA.val)); p.push(tickMarks(Dx,Dy,Ax,Ay,st.sDA.on?st.sDA.ticks:0))
  if(st.A.on&&st.A.val) p.push(foLabel(Ax+48,Ay,ensureDegree(st.A.val)))
  if(st.B.on&&st.B.val) p.push(foLabel(Bx,By+42,ensureDegree(st.B.val)))
  if(st.C.on&&st.C.val) p.push(foLabel(Cx-48,Cy,ensureDegree(st.C.val)))
  if(st.D.on&&st.D.val) p.push(foLabel(Dx,Dy-42,ensureDegree(st.D.val)))
  return <>{p.map((x,i)=><g key={i} dangerouslySetInnerHTML={{__html:x}}/>)}</>
}

// ── TRAPEZOID shared body ─────────────────────────────────────────────
function trapBody(Ax:number,Ay:number,Bx:number,By:number,Cx:number,Cy:number,Dx:number,Dy:number,st:TrapState,rightAngles?:('A'|'D')[]):string[] {
  const [gx,gy]=centroid([[Ax,Ay],[Bx,By],[Cx,Cy],[Dx,Dy]])
  const [vA,vB,vC,vD]=parseVertices(st.vertexName,4)
  const p:string[]=[]
  p.push(`<polygon points="${Ax},${Ay} ${Bx},${By} ${Cx},${Cy} ${Dx},${Dy}" fill="rgba(55,138,221,0.07)" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/>`)
  if(rightAngles?.includes('A')) p.push(rightAngleSq(Ax,Ay,'tl'))
  if(rightAngles?.includes('D')) p.push(rightAngleSq(Dx,Dy,'bl'))
  // Height
  if(st.hOn) {
    p.push(dashedLine(Ax,Ay,Ax,Dy))
    p.push(rightAngleSq(Ax,Dy,'bl'))
    if(st.hVal) p.push(foLabel(Ax-36,(Ay+Dy)/2,st.hVal))
  }
  p.push(dots([[Ax,Ay],[Bx,By],[Cx,Cy],[Dx,Dy]]))
  p.push(vLabel(Ax,Ay,vA,gx,gy)); p.push(vLabel(Bx,By,vB,gx,gy)); p.push(vLabel(Cx,Cy,vC,gx,gy)); p.push(vLabel(Dx,Dy,vD,gx,gy))
  if(st.sAB.on&&st.sAB.val) p.push(foLabel((Ax+Bx)/2,(Ay+By)/2-22,st.sAB.val)); p.push(tickMarks(Ax,Ay,Bx,By,st.sAB.on?st.sAB.ticks:0))
  if(st.sBC.on&&st.sBC.val) p.push(foLabel((Bx+Cx)/2+30,(By+Cy)/2,st.sBC.val)); p.push(tickMarks(Bx,By,Cx,Cy,st.sBC.on?st.sBC.ticks:0))
  if(st.sCD.on&&st.sCD.val) p.push(foLabel((Cx+Dx)/2,(Cy+Dy)/2+22,st.sCD.val)); p.push(tickMarks(Cx,Cy,Dx,Dy,st.sCD.on?st.sCD.ticks:0))
  if(st.sDA.on&&st.sDA.val) p.push(foLabel((Dx+Ax)/2-30,(Dy+Ay)/2,st.sDA.val)); p.push(tickMarks(Dx,Dy,Ax,Ay,st.sDA.on?st.sDA.ticks:0))
  if(st.A.on&&st.A.val) p.push(foLabel(Ax+42,Ay+30,ensureDegree(st.A.val)))
  if(st.B.on&&st.B.val) p.push(foLabel(Bx-42,By+30,ensureDegree(st.B.val)))
  if(st.C.on&&st.C.val) p.push(foLabel(Cx-42,Cy-30,ensureDegree(st.C.val)))
  if(st.D.on&&st.D.val) p.push(foLabel(Dx+42,Dy-30,ensureDegree(st.D.val)))
  return p
}

export function TrapIrregularSvg({ st }: { st: TrapState }) {
  const p=trapBody(130,55,370,55,440,285,70,285,st)
  return <>{p.map((x,i)=><g key={i} dangerouslySetInnerHTML={{__html:x}}/>)}</>
}
export function TrapRightSvg({ st }: { st: TrapState }) {
  const p=trapBody(100,55,360,55,440,285,100,285,st,['A','D'])
  return <>{p.map((x,i)=><g key={i} dangerouslySetInnerHTML={{__html:x}}/>)}</>
}
export function TrapIsoSvg({ st }: { st: TrapState }) {
  const p=trapBody(130,55,390,55,450,285,70,285,st)
  return <>{p.map((x,i)=><g key={i} dangerouslySetInnerHTML={{__html:x}}/>)}</>
}

// ── Shared toggle row ─────────────────────────────────────────────────
function ToggleRow({ on, label, onToggle }: { on:boolean; label:string; onToggle:(v:boolean)=>void }) {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 8px',background:'var(--bg)',border:'0.5px solid var(--border)',borderRadius:'var(--radius)',marginBottom:5}}>
      <span style={{fontSize:13,fontWeight:500}}>{label}</span>
      <label style={{position:'relative',width:28,height:16,cursor:'pointer',flexShrink:0}}>
        <input type="checkbox" checked={on} onChange={e=>onToggle(e.target.checked)} style={{opacity:0,width:0,height:0,position:'absolute'}}/>
        <span style={{position:'absolute',inset:0,background:on?'var(--blue)':'var(--border2)',borderRadius:10,transition:'background .2s'}}>
          <span style={{position:'absolute',width:12,height:12,left:2,top:2,background:'#fff',borderRadius:'50%',transition:'transform .2s',transform:on?'translateX(12px)':'none'}}/>
        </span>
      </label>
    </div>
  )
}

// Para diagonal toggle (simple — both diagonals, one label)
function DiagToggle({ on, d1, onToggle, onD1 }: { on:boolean;d1:LabelState;onToggle:(v:boolean)=>void;onD1:(p:Partial<LabelState>)=>void }) {
  return (
    <>
      <ToggleRow on={on} label="Show diagonals" onToggle={onToggle}/>
      {on && <LabelCell id="d1" label="Diagonal label" state={d1} placeholder="e.g. d" onChange={onD1}/>}
    </>
  )
}

// Rect/Square diagonal toggle (single diagonal A→C)
function SingleDiagPanel<T extends SingleDiagState>({ st, onChange, verts }: { st:T; onChange:(n:T)=>void; verts:string[] }) {
  const [sA,,sC]=verts
  return (
    <>
      <ToggleRow on={st.diagOn} label={`Show diagonal ${sA}${sC}`} onToggle={v=>onChange({...st,diagOn:v})}/>
      {st.diagOn && <LabelCell id="dLabel" label={`${sA}${sC} length`} state={st.dLabel} placeholder="e.g. d" onChange={p=>onChange({...st,dLabel:{...st.dLabel,...p}})}/>}
    </>
  )
}

// Rhombus diagonal panel — whole or halves toggle
function RhombusDiagPanel({ st, onChange, verts }: { st:RhombusState; onChange:(n:RhombusState)=>void; verts:string[] }) {
  const [sA,sB,sC,sD]=verts
  const u=(key:keyof RhombusState)=>(p:Partial<LabelState>)=>onChange({...st,[key]:{...(st[key] as LabelState),...p}})
  return (
    <>
      <ToggleRow on={st.diagOn} label="Show diagonals" onToggle={v=>onChange({...st,diagOn:v})}/>
      {st.diagOn && <>
        <div style={{display:'flex',gap:4,marginBottom:5}}>
          {(['whole','halves'] as const).map(m=>(
            <button key={m} onClick={()=>onChange({...st,diagMode:m})}
              style={{flex:1,padding:'4px 0',fontSize:11,fontWeight:600,border:'0.5px solid var(--border)',borderRadius:'var(--radius)',background:st.diagMode===m?'var(--blue)':'var(--bg)',color:st.diagMode===m?'#fff':'var(--text)',cursor:'pointer'}}>
              {m==='whole'?'Whole':'Halves'}
            </button>
          ))}
        </div>
        {st.diagMode==='whole' ? <>
          <LabelCell id="d1" label={`${sA}${sC} (d₁)`} state={st.d1} placeholder="e.g. 10" onChange={u('d1')}/>
          <LabelCell id="d2" label={`${sB}${sD} (d₂)`} state={st.d2} placeholder="e.g. 8"  onChange={u('d2')}/>
        </> : <>
          <div className="section-lbl">{sA}{sC} halves (equal — bisect each other)</div>
          <LabelCell id="d1a" label={`${sA}→mid`} state={st.d1a} placeholder="e.g. 5" onChange={u('d1a')}/>
          <LabelCell id="d1b" label={`mid→${sC}`} state={st.d1b} placeholder="e.g. 5" onChange={u('d1b')}/>
          <div className="section-lbl">{sB}{sD} halves (equal — bisect each other)</div>
          <LabelCell id="d2a" label={`mid→${sB}`} state={st.d2a} placeholder="e.g. 4" onChange={u('d2a')}/>
          <LabelCell id="d2b" label={`${sD}→mid`} state={st.d2b} placeholder="e.g. 4" onChange={u('d2b')}/>
        </>}
      </>}
    </>
  )
}

// Kite diagonal panel — whole or halves toggle
function KiteDiagPanel({ st, onChange, verts }: { st:KiteState; onChange:(n:KiteState)=>void; verts:string[] }) {
  const [sA,sB,sC,sD]=verts
  const u=(key:keyof KiteState)=>(p:Partial<LabelState>)=>onChange({...st,[key]:{...(st[key] as LabelState),...p}})
  return (
    <>
      <ToggleRow on={st.diagOn} label="Show diagonals" onToggle={v=>onChange({...st,diagOn:v})}/>
      {st.diagOn && <>
        <div style={{display:'flex',gap:4,marginBottom:5}}>
          {(['whole','halves'] as const).map(m=>(
            <button key={m} onClick={()=>onChange({...st,diagMode:m})}
              style={{flex:1,padding:'4px 0',fontSize:11,fontWeight:600,border:'0.5px solid var(--border)',borderRadius:'var(--radius)',background:st.diagMode===m?'var(--blue)':'var(--bg)',color:st.diagMode===m?'#fff':'var(--text)',cursor:'pointer'}}>
              {m==='whole'?'Whole':'Halves'}
            </button>
          ))}
        </div>
        {st.diagMode==='whole' ? <>
          <LabelCell id="dAxis"  label={`${sA}${sC} (axis)`}  state={st.dAxis}  placeholder="e.g. 12" onChange={u('dAxis')}/>
          <LabelCell id="dCross" label={`${sB}${sD} (cross)`} state={st.dCross} placeholder="e.g. 8"  onChange={u('dCross')}/>
        </> : <>
          <div className="section-lbl">{sA}{sC} axis — not bisected (two unequal parts)</div>
          <LabelCell id="dAxisTop" label={`${sA}→mid`} state={st.dAxisTop} placeholder="e.g. 4" onChange={u('dAxisTop')}/>
          <LabelCell id="dAxisBot" label={`mid→${sC}`} state={st.dAxisBot} placeholder="e.g. 8" onChange={u('dAxisBot')}/>
          <div className="section-lbl">{sB}{sD} cross — bisected (both halves equal)</div>
          <LabelCell id="dCrossHalf" label={`${sB}↔mid = mid↔${sD}`} state={st.dCrossHalf} placeholder="e.g. 4" onChange={u('dCrossHalf')}/>
        </>}
      </>}
    </>
  )
}

function QuadSidesPanel<T extends QuadSides>({ st, onChange, verts=['A','B','C','D'] }:{st:T;onChange:(n:T)=>void;verts?:string[]}) {
  const upd=(key:keyof QuadSides)=>(patch:Partial<LabelState>)=>onChange({...st,[key]:{...st[key],...patch}})
  const [sA,sB,sC,sD]=verts
  return (<>
    <div className="section-lbl">Sides</div>
    <LabelCell id="sAB" label={`${sA}${sB} (top)`}    state={st.sAB} hasTicks onChange={upd('sAB')}/>
    <LabelCell id="sBC" label={`${sB}${sC} (right)`}  state={st.sBC} hasTicks onChange={upd('sBC')}/>
    <LabelCell id="sCD" label={`${sC}${sD} (bottom)`} state={st.sCD} hasTicks onChange={upd('sCD')}/>
    <LabelCell id="sDA" label={`${sD}${sA} (left)`}   state={st.sDA} hasTicks onChange={upd('sDA')}/>
  </>)
}

function QuadAnglesPanel<T extends QuadAngles>({ st,onChange,placeholder='e.g. 60°',verts=['A','B','C','D'] }:{st:T;onChange:(n:T)=>void;placeholder?:string;verts?:string[]}) {
  const upd=(key:keyof QuadAngles)=>(patch:Partial<LabelState>)=>onChange({...st,[key]:{...st[key],...patch}})
  const [sA,sB,sC,sD]=verts
  return (<>
    <div className="section-lbl">Angles</div>
    <LabelCell id="A" label={sA} state={st.A} placeholder={placeholder} isAngle onChange={upd('A')}/>
    <LabelCell id="B" label={sB} state={st.B} placeholder={placeholder} isAngle onChange={upd('B')}/>
    <LabelCell id="C" label={sC} state={st.C} placeholder={placeholder} isAngle onChange={upd('C')}/>
    <LabelCell id="D" label={sD} state={st.D} placeholder={placeholder} isAngle onChange={upd('D')}/>
  </>)
}

// ── Quad panels ───────────────────────────────────────────────────────
function quadVerts(vertexName: string) {
  const [a,b,c,d] = parseVertices(vertexName, 4)
  return [a||'A', b||'B', c||'C', d||'D']
}

export function ParaPanel({ st,onChange }:{st:ParaState;onChange:(n:ParaState)=>void}) {
  const v = quadVerts(st.vertexName)
  return (<>
    <div className="section-lbl">Vertex names</div>
    <VertexNameInput value={st.vertexName} n={4} onChange={vn=>onChange({...st,vertexName:vn})}/>
    <QuadSidesPanel st={st} onChange={onChange} verts={v}/>
    <QuadAnglesPanel st={st} onChange={onChange} verts={v}/>
    <div className="section-lbl">Diagonals</div>
    <DiagToggle on={st.diagOn} d1={st.d1} onToggle={dv=>onChange({...st,diagOn:dv})} onD1={p=>onChange({...st,d1:{...st.d1,...p}})}/>
  </>)
}

export function RectPanel({ st,onChange }:{st:RectState;onChange:(n:RectState)=>void}) {
  const v = quadVerts(st.vertexName)
  return (<>
    <div className="section-lbl">Vertex names</div>
    <VertexNameInput value={st.vertexName} n={4} onChange={vn=>onChange({...st,vertexName:vn})}/>
    <QuadSidesPanel st={st} onChange={onChange} verts={v}/>
    <QuadAnglesPanel st={st} onChange={onChange} placeholder="90°" verts={v}/>
    <div className="section-lbl">Diagonal</div>
    <SingleDiagPanel st={st} onChange={onChange} verts={v}/>
  </>)
}

export function SquarePanel({ st,onChange }:{st:SquareState;onChange:(n:SquareState)=>void}) {
  const v = quadVerts(st.vertexName)
  return (<>
    <div className="section-lbl">Vertex names</div>
    <VertexNameInput value={st.vertexName} n={4} onChange={vn=>onChange({...st,vertexName:vn})}/>
    <QuadSidesPanel st={st} onChange={onChange} verts={v}/>
    <QuadAnglesPanel st={st} onChange={onChange} placeholder="90°" verts={v}/>
    <div className="section-lbl">Diagonal</div>
    <SingleDiagPanel st={st} onChange={onChange} verts={v}/>
  </>)
}

export function RhombusPanel({ st,onChange }:{st:RhombusState;onChange:(n:RhombusState)=>void}) {
  const v = quadVerts(st.vertexName)
  return (<>
    <div className="section-lbl">Vertex names</div>
    <VertexNameInput value={st.vertexName} n={4} onChange={vn=>onChange({...st,vertexName:vn})}/>
    <QuadSidesPanel st={st} onChange={onChange} verts={v}/>
    <QuadAnglesPanel st={st} onChange={onChange} verts={v}/>
    <div className="section-lbl">Diagonals</div>
    <RhombusDiagPanel st={st} onChange={onChange} verts={v}/>
  </>)
}

export function KitePanel({ st,onChange }:{st:KiteState;onChange:(n:KiteState)=>void}) {
  const v = quadVerts(st.vertexName)
  return (<>
    <div className="section-lbl">Vertex names</div>
    <VertexNameInput value={st.vertexName} n={4} onChange={vn=>onChange({...st,vertexName:vn})}/>
    <QuadSidesPanel st={st} onChange={onChange} verts={v}/>
    <QuadAnglesPanel st={st} onChange={onChange} verts={v}/>
    <div className="section-lbl">Diagonals</div>
    <KiteDiagPanel st={st} onChange={onChange} verts={v}/>
  </>)
}

export function TrapPanel({ st,onChange }:{st:TrapState;onChange:(n:TrapState)=>void}) {
  const v = quadVerts(st.vertexName)
  const hLS:LabelState={on:st.hOn,val:st.hVal,ticks:0}
  return (<>
    <div className="section-lbl">Vertex names</div>
    <VertexNameInput value={st.vertexName} n={4} onChange={vn=>onChange({...st,vertexName:vn})}/>
    <QuadSidesPanel st={st} onChange={onChange} verts={v}/>
    <QuadAnglesPanel st={st} onChange={onChange} verts={v}/>
    <div className="section-lbl">Height</div>
    <LabelCell id="h" label="h" state={hLS} placeholder="e.g. h"
      onChange={p=>onChange({...st,hOn:p.on??st.hOn,hVal:p.val??st.hVal})}/>
  </>)
}
