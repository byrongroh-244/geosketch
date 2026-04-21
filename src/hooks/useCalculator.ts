import { parseVal, toRad, toDeg } from '../utils/math'
import { parseVertices } from '../utils/svg'
import type { CalcResults } from '../types'

function r(label: string, value: number | null, given: boolean, isAngle = false) {
  return { label, value, given, isAngle }
}

// ── Vertex name helpers ───────────────────────────────────────────────
function triVerts(vertexName: string): [string, string, string] {
  const [a, b, c] = parseVertices(vertexName, 3)
  return [a||'A', b||'B', c||'C']
}
function quadVerts(vertexName: string): [string, string, string, string] {
  const [a, b, c, d] = parseVertices(vertexName, 4)
  return [a||'A', b||'B', c||'C', d||'D']
}

// ── Triangle solver ───────────────────────────────────────────────────
function solveTriangle(a: number|null, b: number|null, c: number|null, A: number|null, B: number|null, C: number|null, iso = false) {
  if (iso) {
    if (b !== null && c === null) c = b
    else if (c !== null && b === null) b = c
    if (B !== null && C === null) C = B
    else if (C !== null && B === null) B = C
  }
  if (A!==null&&B!==null&&C===null) C=180-A-B
  if (A!==null&&C!==null&&B===null) B=180-A-C
  if (B!==null&&C!==null&&A===null) A=180-B-C
  if (a!==null&&b!==null&&C!==null&&c===null) c=Math.sqrt(Math.max(0,a*a+b*b-2*a*b*Math.cos(toRad(C))))
  if (a!==null&&c!==null&&B!==null&&b===null) b=Math.sqrt(Math.max(0,a*a+c*c-2*a*c*Math.cos(toRad(B))))
  if (b!==null&&c!==null&&A!==null&&a===null) a=Math.sqrt(Math.max(0,b*b+c*c-2*b*c*Math.cos(toRad(A))))
  if (a!==null&&b!==null&&c!==null) {
    if (A===null){const v=(b*b+c*c-a*a)/(2*b*c);if(v>=-1&&v<=1)A=toDeg(Math.acos(v))}
    if (B===null){const v=(a*a+c*c-b*b)/(2*a*c);if(v>=-1&&v<=1)B=toDeg(Math.acos(v))}
    if (C===null){const v=(a*a+b*b-c*c)/(2*a*b);if(v>=-1&&v<=1)C=toDeg(Math.acos(v))}
  }
  let Rv: number|null = null
  if (a!==null&&A!==null) Rv=a/Math.sin(toRad(A))
  else if (b!==null&&B!==null) Rv=b/Math.sin(toRad(B))
  else if (c!==null&&C!==null) Rv=c/Math.sin(toRad(C))
  if (Rv!==null) {
    if (a===null&&A!==null) a=Rv*Math.sin(toRad(A))
    if (b===null&&B!==null) b=Rv*Math.sin(toRad(B))
    if (c===null&&C!==null) c=Rv*Math.sin(toRad(C))
    if (A===null&&a!==null){const v=a/Rv;if(v<=1)A=toDeg(Math.asin(v))}
    if (B===null&&b!==null){const v=b/Rv;if(v<=1)B=toDeg(Math.asin(v))}
    if (C===null&&c!==null){const v=c/Rv;if(v<=1)C=toDeg(Math.asin(v))}
  }
  if (A!==null&&B!==null&&C===null) C=180-A-B
  if (A!==null&&C!==null&&B===null) B=180-A-C
  if (B!==null&&C!==null&&A===null) A=180-B-C
  if (iso) {
    if (b!==null&&c===null) c=b; if(c!==null&&b===null) b=c
    if (B!==null&&C===null) C=B; if(C!==null&&B===null) B=C
  }
  return { a, b, c, A, B, C }
}

// ── Right triangle ────────────────────────────────────────────────────
export function calcRight(vals: Record<string, string>): { results: CalcResults; warning?: string } {
  const [sA, sB, sC] = triVerts(vals.vertexName ?? '')
  const ga=parseVal(vals.a),gb=parseVal(vals.b),gc=parseVal(vals.c)
  const gA=parseVal(vals.A),gB=parseVal(vals.B)
  let a=ga,b=gb,c=gc,A=gA,B=gB
  if(A!==null&&B===null) B=90-A; if(B!==null&&A===null) A=90-B
  if(a!==null&&A!==null&&c===null) c=a/Math.sin(toRad(A))
  if(b!==null&&B!==null&&c===null) c=b/Math.sin(toRad(B))
  if(c!==null&&A!==null&&a===null) a=c*Math.sin(toRad(A))
  if(c!==null&&B!==null&&b===null) b=c*Math.sin(toRad(B))
  if(c!==null&&A!==null&&b===null) b=c*Math.cos(toRad(A))
  if(c!==null&&B!==null&&a===null) a=c*Math.cos(toRad(B))
  if(a!==null&&b!==null&&c===null) c=Math.sqrt(a*a+b*b)
  if(a!==null&&c!==null&&b===null) b=Math.sqrt(Math.max(0,c*c-a*a))
  if(b!==null&&c!==null&&a===null) a=Math.sqrt(Math.max(0,c*c-b*b))
  if(a!==null&&c!==null&&A===null) A=toDeg(Math.asin(Math.min(1,a/c)))
  if(b!==null&&c!==null&&B===null) B=toDeg(Math.asin(Math.min(1,b/c)))
  if(A!==null&&B===null) B=90-A; if(B!==null&&A===null) A=90-B
  const inS=[ga,gb,gc].filter(x=>x!==null).length, inA=[gA,gB].filter(x=>x!==null).length
  const warning = inS<2&&!(inS>=1&&inA>=1) ? 'Need at least 2 sides or 1 side + 1 angle.' : undefined
  return { results: {
    a: r(`${sB}${sC}`, a, ga!==null),
    b: r(`${sA}${sC}`, b, gb!==null),
    c: r(`${sA}${sB} (hyp.)`, c, gc!==null),
    A: r(`∠${sA}`, A, gA!==null, true),
    B: r(`∠${sB}`, B, gB!==null, true),
    area: r('area', (a!==null&&b!==null)?0.5*a*b:null, false),
    peri: r('perimeter', (a!==null&&b!==null&&c!==null)?a+b+c:null, false),
  }, warning }
}

// ── General triangle ──────────────────────────────────────────────────
export function calcGeneral(vals: Record<string, string>, inclH: boolean, iso = false): { results: CalcResults; warning?: string } {
  const [sA, sB, sC] = triVerts(vals.vertexName ?? '')
  const ga=parseVal(vals.a),gb=parseVal(vals.b),gc=parseVal(vals.c)
  const gA=parseVal(vals.A),gB=parseVal(vals.B),gC=parseVal(vals.C)
  const { a,b,c,A,B,C } = solveTriangle(ga,gb,gc,gA,gB,gC,iso)
  const inS=[ga,gb,gc].filter(x=>x!==null).length, inA=[gA,gB,gC].filter(x=>x!==null).length
  const warning = !(inS>=2&&inA>=1||inS>=1&&inA>=2||inS>=3) ? 'Need 2 sides + 1 angle, or 1 side + 2 angles.' : undefined
  const area=(a!==null&&b!==null&&C!==null)?0.5*a*b*Math.sin(toRad(C)):(a!==null&&c!==null&&B!==null)?0.5*a*c*Math.sin(toRad(B)):(b!==null&&c!==null&&A!==null)?0.5*b*c*Math.sin(toRad(A)):null
  const res: CalcResults = {
    a: r(`${sB}${sC}`, a, ga!==null),
    b: r(`${sA}${sC}`, b, gb!==null),
    c: r(`${sA}${sB}`, c, gc!==null),
    A: r(`∠${sA}`, A, gA!==null, true),
    B: r(`∠${sB}`, B, gB!==null, true),
    C: r(`∠${sC}`, C, gC!==null, true),
    area: r('area', area, false),
    peri: r('perimeter', (a!==null&&b!==null&&c!==null)?a+b+c:null, false),
  }
  if(inclH) res.height = r('height', (area!==null&&a!==null)?2*area/a:null, false)
  return { results: res, warning }
}

// ── Equilateral ───────────────────────────────────────────────────────
export function calcEquilateral(vals: Record<string, string>): { results: CalcResults; warning?: string } {
  const [sA, sB, sC] = triVerts(vals.vertexName ?? '')
  // use first entered side
  const s = parseVal(vals.a) ?? parseVal(vals.b) ?? parseVal(vals.c)
  if (!s) return { results: {
    a: r(`${sA}${sB}`, null, false), area: r('area', null, false),
    peri: r('perimeter', null, false), height: r('height', null, false),
  }, warning: 'Enter a side length.' }
  return { results: {
    a:      r(`${sA}${sB} = ${sA}${sC} = ${sB}${sC}`, s, true),
    area:   r('area', Math.sqrt(3)/4*s*s, false),
    peri:   r('perimeter', 3*s, false),
    height: r('height', Math.sqrt(3)/2*s, false),
  }}
}

// ── Parallelogram ─────────────────────────────────────────────────────
export function calcPara(vals: Record<string, string>): { results: CalcResults; warning?: string } {
  const [sA, sB, sC, sD] = quadVerts(vals.vertexName ?? '')
  const a=parseVal(vals.sAB)??parseVal(vals.sCD)
  const b=parseVal(vals.sBC)??parseVal(vals.sDA)
  const A=parseVal(vals.A)
  if(!a||!b) return { results:{
    a:r(`${sA}${sB}`,null,false), b:r(`${sB}${sC}`,null,false),
    A:r(`∠${sA}`,null,false,true), B:r(`∠${sB}`,null,false,true),
    d1:r('diag. 1',null,false), d2:r('diag. 2',null,false),
    area:r('area',null,false), peri:r('perimeter',null,false),
  }, warning:'Enter side lengths to begin.' }
  if(!A) return { results:{
    a:r(`${sA}${sB}`,a,true), b:r(`${sB}${sC}`,b,true),
    A:r(`∠${sA}`,null,false,true), B:r(`∠${sB}`,null,false,true),
    d1:r('diag. 1',null,false), d2:r('diag. 2',null,false),
    area:r('area',null,false), peri:r('perimeter',2*(a+b),false),
  }, warning:`Enter ∠${sA} for diagonals and area.` }
  const B2=180-A
  return { results:{
    a:  r(`${sA}${sB}`, a, true),
    b:  r(`${sB}${sC}`, b, true),
    A:  r(`∠${sA}`, A, true, true),
    B:  r(`∠${sB}`, B2, false, true),
    d1: r(`${sA}${sC}`, Math.sqrt(a*a+b*b-2*a*b*Math.cos(toRad(A))), false),
    d2: r(`${sB}${sD}`, Math.sqrt(a*a+b*b-2*a*b*Math.cos(toRad(B2))), false),
    area: r('area', a*b*Math.sin(toRad(A)), false),
    peri: r('perimeter', 2*(a+b), false),
  }}
}

// ── Rectangle ─────────────────────────────────────────────────────────
export function calcRect(vals: Record<string, string>): { results: CalcResults; warning?: string } {
  const [sA, sB, sC, sD] = quadVerts(vals.vertexName ?? '')
  const l=parseVal(vals.sAB)??parseVal(vals.sCD)
  const w=parseVal(vals.sBC)??parseVal(vals.sDA)
  if(!l&&!w) return { results:{
    l:r(`${sA}${sB}`,null,false), w:r(`${sB}${sC}`,null,false),
    diag:r(`${sA}${sC}`,null,false),
    A:r(`∠${sA}`,null,false,true),B:r(`∠${sB}`,null,false,true),
    C:r(`∠${sC}`,null,false,true),D:r(`∠${sD}`,null,false,true),
    area:r('area',null,false),peri:r('perimeter',null,false),
  }, warning:'Enter side lengths.' }
  return { results:{
    l:    r(`${sA}${sB}`, l, l!==null),
    w:    r(`${sB}${sC}`, w, w!==null),
    diag: r(`${sA}${sC}`, (l!==null&&w!==null)?Math.sqrt(l*l+w*w):null, false),
    A: r(`∠${sA}`,90,false,true), B:r(`∠${sB}`,90,false,true),
    C: r(`∠${sC}`,90,false,true), D:r(`∠${sD}`,90,false,true),
    area: r('area',(l!==null&&w!==null)?l*w:null,false),
    peri: r('perimeter',(l!==null&&w!==null)?2*(l+w):null,false),
  }}
}

// ── Square ────────────────────────────────────────────────────────────
export function calcSquare(vals: Record<string, string>): { results: CalcResults; warning?: string } {
  const [sA, sB, sC, sD] = quadVerts(vals.vertexName ?? '')
  const s=parseVal(vals.sAB)??parseVal(vals.sBC)??parseVal(vals.sCD)??parseVal(vals.sDA)
  if(!s) return { results:{
    s:r(`${sA}${sB}`,null,false), diag:r(`${sA}${sC}`,null,false),
    A:r(`∠${sA}`,null,false,true),B:r(`∠${sB}`,null,false,true),
    C:r(`∠${sC}`,null,false,true),D:r(`∠${sD}`,null,false,true),
    area:r('area',null,false),peri:r('perimeter',null,false),
  }, warning:'Enter a side length.' }
  return { results:{
    s:    r(`${sA}${sB} = ${sB}${sC} = ${sC}${sD} = ${sD}${sA}`, s, true),
    diag: r(`${sA}${sC}`, s*Math.sqrt(2), false),
    A: r(`∠${sA}`,90,false,true), B:r(`∠${sB}`,90,false,true),
    C: r(`∠${sC}`,90,false,true), D:r(`∠${sD}`,90,false,true),
    area: r('area',s*s,false), peri:r('perimeter',4*s,false),
  }}
}

// ── Rhombus ───────────────────────────────────────────────────────────
export function calcRhombus(vals: Record<string, string>): { results: CalcResults; warning?: string } {
  const [sA, sB, sC, sD] = quadVerts(vals.vertexName ?? '')
  const s=parseVal(vals.sAB)??parseVal(vals.sBC)??parseVal(vals.sCD)??parseVal(vals.sDA)
  const A=parseVal(vals.A)??parseVal(vals.C)
  if(!s) return { results:{
    s:r(`${sA}${sB}`,null,false),
    A:r(`∠${sA}`,null,false,true),B:r(`∠${sB}`,null,false,true),
    C:r(`∠${sC}`,null,false,true),D:r(`∠${sD}`,null,false,true),
    d1:r(`${sA}${sC}`,null,false),d2:r(`${sB}${sD}`,null,false),
    area:r('area',null,false),peri:r('perimeter',null,false),
  }, warning:'Enter a side length.' }
  let B: number|null=null, d1: number|null=null, d2: number|null=null, area: number|null=null
  if(A!==null){ B=180-A; d1=2*s*Math.sin(toRad(A/2)); d2=2*s*Math.cos(toRad(A/2)); area=d1*d2/2 }
  return { results:{
    s:  r(`${sA}${sB} = ${sB}${sC} = ${sC}${sD} = ${sD}${sA}`, s, true),
    A:  r(`∠${sA}`, A, A!==null, true),
    B:  r(`∠${sB}`, B, false, true),
    C:  r(`∠${sC}`, A, false, true),
    D:  r(`∠${sD}`, B, false, true),
    d1: r(`${sA}${sC}`, d1, false),
    d2: r(`${sB}${sD}`, d2, false),
    area: r('area', area, false),
    peri: r('perimeter', 4*s, false),
  }, warning: A===null ? `Enter ∠${sA} for diagonals and area.` : undefined }
}

// ── Kite ──────────────────────────────────────────────────────────────
export function calcKite(vals: Record<string, string>): { results: CalcResults; warning?: string } {
  const [sA, sB, sC, sD] = quadVerts(vals.vertexName ?? '')
  const a=parseVal(vals.sAB)??parseVal(vals.sDA)
  const b=parseVal(vals.sBC)??parseVal(vals.sCD)
  if(!a&&!b) return { results:{
    a:r(`${sA}${sB}`,null,false), b:r(`${sB}${sC}`,null,false),
    A:r(`∠${sA}`,null,false,true),B:r(`∠${sB}`,null,false,true),
    C:r(`∠${sC}`,null,false,true),D:r(`∠${sD}`,null,false,true),
    area:r('area',null,false),peri:r('perimeter',null,false),
  }, warning:'Enter at least one pair of side lengths.' }
  const peri=(a!==null&&b!==null)?2*(a+b):null
  const Bval=parseVal(vals.B)
  return { results:{
    a:  r(`${sA}${sB} = ${sA}${sD}`, a, a!==null),
    b:  r(`${sB}${sC} = ${sD}${sC}`, b, b!==null),
    A:  r(`∠${sA}`, parseVal(vals.A), parseVal(vals.A)!==null, true),
    B:  r(`∠${sB}`, Bval, Bval!==null, true),
    C:  r(`∠${sC}`, parseVal(vals.C), parseVal(vals.C)!==null, true),
    D:  r(`∠${sD} = ∠${sB}`, Bval, false, true),
    area: r('area', null, false),
    peri: r('perimeter', peri, false),
  }, warning:(!a||!b)?'Enter both side pairs for perimeter.':undefined }
}

// ── Trapezoid ─────────────────────────────────────────────────────────
export function calcTrap(vals: Record<string, string>): { results: CalcResults; warning?: string } {
  const [sA, sB, sC, sD] = quadVerts(vals.vertexName ?? '')
  const ab=parseVal(vals.sAB), dc=parseVal(vals.sCD)
  const bc=parseVal(vals.sBC), da=parseVal(vals.sDA)
  const h=parseVal(vals.h)
  const A=parseVal(vals.A),B=parseVal(vals.B),C=parseVal(vals.C),D=parseVal(vals.D)
  const peri=(ab!==null&&bc!==null&&dc!==null&&da!==null)?ab+bc+dc+da:null
  const area=(ab!==null&&dc!==null&&h!==null)?0.5*(ab+dc)*h:null
  const warning=!ab&&!dc?`Enter the two parallel sides (${sA}${sB} and ${sD}${sC}).`:undefined
  return { results:{
    AB:  r(`${sA}${sB} (top)`,    ab, ab!==null),
    DC:  r(`${sD}${sC} (bottom)`, dc, dc!==null),
    BC:  r(`${sB}${sC} (leg)`,    bc, bc!==null),
    DA:  r(`${sD}${sA} (leg)`,    da, da!==null),
    h:   r('height',               h,  h!==null),
    A:   r(`∠${sA}`, A, A!==null, true),
    B:   r(`∠${sB}`, B, B!==null, true),
    C:   r(`∠${sC}`, C, C!==null, true),
    D:   r(`∠${sD}`, D, D!==null, true),
    area: r('area', area, false),
    peri: r('perimeter', peri, false),
  }, warning }
}

// ── Regular Polygon ───────────────────────────────────────────────────
import type { RegPolygonState } from '../components/shapes/RegPolygon'

export function calcRegPolygonResults(st: RegPolygonState): { results: CalcResults; warning?: string } {
  const { n } = st
  const s=parseFloat(st.sideVal)||null
  const interiorDeg=((n-2)*180)/n
  const centralDeg=360/n
  const area=s!==null?(n*s*s)/(4*Math.tan(Math.PI/n)):null
  const peri=s!==null?n*s:null
  const apoth=s!==null?s/(2*Math.tan(Math.PI/n)):null
  return { results:{
    sides:    r('sides', n, true),
    interior: r('interior ∠', interiorDeg, false, true),
    central:  r('central ∠', centralDeg, false, true),
    side:     r('side', s, s!==null),
    apothem:  r('apothem', apoth, false),
    peri:     r('perimeter', peri, false),
    area:     r('area', area, false),
  }, warning: s===null?'Enter side length for full calculation.':undefined }
}
