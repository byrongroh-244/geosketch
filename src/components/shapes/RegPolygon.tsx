import React from 'react'
import { BLUE } from '../../utils/svg'
import type { LabelState } from '../../types'
import LabelCell from '../ui/LabelCell'
import katex from 'katex'

// ── State ─────────────────────────────────────────────────────────────
export interface RegPolygonState {
  n: number
  sideOn: boolean
  sideVal: string
  sideTicks: 0|1|2|3
  showVertexLabels: boolean
  radiiOn: boolean
  radiiVal: string
  centralAngleOn: boolean
  centralAngleVal: string
  apothemOn: boolean
  apothemVal: string
}

export function defaultRegPolygonState(): RegPolygonState {
  return {
    n: 5,
    sideOn: true, sideVal: '', sideTicks: 0,
    showVertexLabels: true,
    radiiOn: false, radiiVal: '',
    centralAngleOn: false, centralAngleVal: '',
    apothemOn: false, apothemVal: '',
  }
}

// ── SVG helpers ───────────────────────────────────────────────────────
const SVG_W = 520, SVG_H = 340
const CX = SVG_W / 2, CY = SVG_H / 2
const R = 138
const VERTEX_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function getVertices(n: number): [number, number][] {
  // Rotate by π/n so there's always a flat edge at the bottom
  // (offset by half a step from the traditional top-vertex start)
  const startAngle = Math.PI / 2 + Math.PI / n
  return Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n + startAngle
    return [CX + R * Math.cos(angle), CY + R * Math.sin(angle)] as [number, number]
  })
}

// Find the index of the bottommost side (midpoint with highest y = lowest on screen)
function bottomSideIndex(pts: [number, number][]): number {
  let maxY = -Infinity, idx = 0
  pts.forEach(([x1,y1], i) => {
    const [x2,y2] = pts[(i+1) % pts.length]
    const my = (y1+y2)/2
    if (my > maxY) { maxY = my; idx = i }
  })
  return idx
}

function renderKatex(latex: string): string {
  if (!latex.trim()) return ''
  try {
    const el = document.createElement('span')
    katex.render(latex, el, { throwOnError: false, displayMode: false })
    return el.outerHTML
  } catch { return latex }
}

function foLabel(x: number, y: number, latex: string, w = 110): string {
  if (!latex.trim()) return ''
  const html = renderKatex(latex)
  return `<foreignObject x="${x-w/2}" y="${y-20}" width="${w}" height="40" style="overflow:visible">
    <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;width:${w}px;height:40px;font-size:18px;color:#1a1a19">${html}</div>
  </foreignObject>`
}

function ticks(x1:number,y1:number,x2:number,y2:number,n:0|1|2|3): string {
  if(!n) return ''
  const mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)
  const px=-dy/len*8,py=dx/len*8,gap=6,ux=dx/len,uy=dy/len
  const offs=n===1?[0]:n===2?[-gap/2,gap/2]:[-gap,0,gap]
  return offs.map(o=>{const cx=mx+ux*o,cy=my+uy*o;return `<line x1="${cx-px}" y1="${cy-py}" x2="${cx+px}" y2="${cy+py}" stroke="${BLUE}" stroke-width="2.2" stroke-linecap="round"/>`}).join('')
}

// ── SVG Component ─────────────────────────────────────────────────────
export function RegPolygonSvg({ st }: { st: RegPolygonState }) {
  const { n } = st
  const pts = getVertices(n)
  const parts: string[] = []

  // Polygon fill + outline
  const ptStr = pts.map(([x,y])=>`${x},${y}`).join(' ')
  parts.push(`<polygon points="${ptStr}" fill="rgba(55,138,221,0.07)" stroke="${BLUE}" stroke-width="2" stroke-linejoin="round"/>`)

  // ── Single radius (to left vertex of bottom side) ────────────────
  if (st.radiiOn) {
    const bi = bottomSideIndex(pts)
    const [rx,ry] = pts[bi] // left vertex of bottom side
    parts.push(`<line x1="${CX}" y1="${CY}" x2="${rx}" y2="${ry}" stroke="${BLUE}" stroke-width="1.4" stroke-dasharray="6,4" opacity="0.7"/>`)
    parts.push(`<circle cx="${CX}" cy="${CY}" r="3.5" fill="${BLUE}"/>`)
    if (st.radiiVal) {
      const mx=(CX+rx)/2, my=(CY+ry)/2
      const dx=rx-CX, dy=ry-CY, len=Math.sqrt(dx*dx+dy*dy)||1
      const lx=mx+(-dy/len)*16, ly=my+(dx/len)*16
      parts.push(foLabel(lx, ly, st.radiiVal, 90))
    }
  }

  // ── Central angle (two radii to bottom side vertices, triangle) ───
  if (st.centralAngleOn) {
    const bi = bottomSideIndex(pts)
    const [ax,ay] = pts[bi]                  // left vertex of bottom side
    const [bx,by] = pts[(bi+1) % n]          // right vertex of bottom side
    parts.push(`<line x1="${CX}" y1="${CY}" x2="${ax}" y2="${ay}" stroke="${BLUE}" stroke-width="1.4" stroke-dasharray="6,4" opacity="0.7"/>`)
    parts.push(`<line x1="${CX}" y1="${CY}" x2="${bx}" y2="${by}" stroke="${BLUE}" stroke-width="1.4" stroke-dasharray="6,4" opacity="0.7"/>`)
    parts.push(`<polygon points="${CX},${CY} ${ax},${ay} ${bx},${by}" fill="rgba(55,138,221,0.12)" stroke="none"/>`)
    parts.push(`<circle cx="${CX}" cy="${CY}" r="3.5" fill="${BLUE}"/>`)
    // Arc near center showing the angle
    const arcR = 28
    const startA = Math.atan2(ay-CY, ax-CX)
    const endA   = Math.atan2(by-CY, bx-CX)
    const arcX1 = CX + arcR*Math.cos(startA)
    const arcY1 = CY + arcR*Math.sin(startA)
    const arcX2 = CX + arcR*Math.cos(endA)
    const arcY2 = CY + arcR*Math.sin(endA)
    parts.push(`<path d="M ${arcX1} ${arcY1} A ${arcR} ${arcR} 0 0 1 ${arcX2} ${arcY2}" fill="none" stroke="${BLUE}" stroke-width="1.5"/>`)
    if (st.centralAngleVal) {
      const midA = (startA + endA) / 2
      const lx = CX + (arcR+20)*Math.cos(midA)
      const ly = CY + (arcR+20)*Math.sin(midA)
      parts.push(foLabel(lx, ly, st.centralAngleVal, 90))
    }
  }

  // ── Apothem (center perpendicular to bottom side) ─────────────────
  if (st.apothemOn) {
    const bi = bottomSideIndex(pts)
    const [x1,y1] = pts[bi]
    const [x2,y2] = pts[(bi+1)%n]
    // Foot of perpendicular from center to the bottom side
    const dx=x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy)||1
    const t = ((CX-x1)*dx + (CY-y1)*dy)/(len*len)
    const fx = x1+t*dx, fy = y1+t*dy
    parts.push(`<line x1="${CX}" y1="${CY}" x2="${fx}" y2="${fy}" stroke="${BLUE}" stroke-width="1.4" stroke-dasharray="6,4" opacity="0.7"/>`)
    // Right-angle marker at foot
    const ux=dx/len, uy=dy/len, s=8
    parts.push(`<polyline points="${fx+ux*s},${fy+uy*s} ${fx+ux*s-uy*s},${fy+uy*s+ux*s} ${fx-uy*s},${fy+ux*s}" fill="none" stroke="${BLUE}" stroke-width="1.4"/>`)
    parts.push(`<circle cx="${CX}" cy="${CY}" r="3.5" fill="${BLUE}"/>`)
    if (st.apothemVal) {
      const mx=(CX+fx)/2, my=(CY+fy)/2
      const adx=fx-CX, ady=fy-CY, alen=Math.sqrt(adx*adx+ady*ady)||1
      const lx=mx+(-ady/alen)*16, ly=my+(adx/alen)*16
      parts.push(foLabel(lx, ly, st.apothemVal, 90))
    }
  }

  // ── Side label on bottom side only ────────────────────────────────
  if (st.sideOn) {
    const bi = bottomSideIndex(pts)
    const [x1,y1] = pts[bi]
    const [x2,y2] = pts[(bi+1)%n]
    const mx=(x1+x2)/2, my=(y1+y2)/2
    const dx=mx-CX, dy=my-CY, len=Math.sqrt(dx*dx+dy*dy)||1
    if (st.sideVal) parts.push(foLabel(mx+(dx/len)*24, my+(dy/len)*24, st.sideVal))
    parts.push(ticks(x1,y1,x2,y2, st.sideTicks))
  }

  // Vertex dots
  pts.forEach(([x,y])=>{
    parts.push(`<circle cx="${x}" cy="${y}" r="4.5" fill="${BLUE}"/>`)
  })

  // Vertex labels
  if (st.showVertexLabels) {
    pts.forEach(([x,y],i)=>{
      const dx=x-CX, dy=y-CY, len=Math.sqrt(dx*dx+dy*dy)||1
      const lx=x+(dx/len)*22, ly=y+(dy/len)*22
      const lbl = i<VERTEX_LABELS.length ? VERTEX_LABELS[i] : String(i+1)
      parts.push(`<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="500" fill="${BLUE}" font-family="-apple-system,sans-serif">${lbl}</text>`)
    })
  }

  return <>{parts.map((p,i)=><g key={i} dangerouslySetInnerHTML={{__html:p}}/>)}</>
}

// ── Calculator ────────────────────────────────────────────────────────
import type { CalcResults } from '../../types'
function r(label:string,value:number|null,given:boolean,isAngle=false){return{label,value,given,isAngle}}

export function calcRegPolygonResults(st: RegPolygonState): { results: CalcResults; warning?: string } {
  const { n } = st
  const s = parseFloat(st.sideVal) || null
  const interiorDeg = ((n-2)*180)/n
  const centralDeg  = 360/n
  const area  = s!==null ? (n*s*s)/(4*Math.tan(Math.PI/n)) : null
  const peri  = s!==null ? n*s : null
  const apoth = s!==null ? s/(2*Math.tan(Math.PI/n)) : null
  return {
    results: {
      sides:    r('sides', n, true),
      interior: r('interior ∠', interiorDeg, false, true),
      central:  r('central ∠', centralDeg, false, true),
      side:     r('side', s, s!==null),
      apothem:  r('apothem', apoth, false),
      peri:     r('perimeter', peri, false),
      area:     r('area', area, false),
    },
    warning: s===null ? 'Enter side length for full calculation.' : undefined,
  }
}

// ── Panel ─────────────────────────────────────────────────────────────
function Toggle({ on, label, onToggle }: { on: boolean; label: string; onToggle: (v:boolean)=>void }) {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 8px',background:'var(--bg)',border:'0.5px solid var(--border)',borderRadius:'var(--radius)',marginBottom:5}}>
      <span style={{fontSize:12,fontWeight:500,color:'var(--text)'}}>{label}</span>
      <label style={{position:'relative',width:28,height:16,cursor:'pointer',flexShrink:0}}>
        <input type="checkbox" checked={on} onChange={e=>onToggle(e.target.checked)} style={{opacity:0,width:0,height:0,position:'absolute'}}/>
        <span style={{position:'absolute',inset:0,background:on?'var(--blue)':'var(--border2)',borderRadius:10,transition:'background .2s'}}>
          <span style={{position:'absolute',width:12,height:12,left:2,top:2,background:'#fff',borderRadius:'50%',transition:'transform .2s',transform:on?'translateX(12px)':'none'}}/>
        </span>
      </label>
    </div>
  )
}

const REG_INSERTS = [
  { display: '√',  insert: '\\sqrt{}', cursor: 1 },
  { display: 'x²', insert: '^2',       cursor: 0 },
  { display: 'x³', insert: '^3',       cursor: 0 },
  { display: 'θ',  insert: '\\theta',  cursor: 0 },
  { display: 'π',  insert: '\\pi',     cursor: 0 },
] as const

function SmallInput({ label, value, onChange, placeholder, isAngle }: {
  label: string; value: string; onChange: (v:string)=>void; placeholder?: string; isAngle?: boolean
}) {
  const ref = React.useRef<HTMLInputElement>(null)

  function insertAt(ins: string, cursorFromEnd: number) {
    const el = ref.current
    const start = el ? (el.selectionStart ?? value.length) : value.length
    const end   = el ? (el.selectionEnd   ?? value.length) : value.length
    const next  = value.slice(0, start) + ins + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      const pos = start + ins.length - cursorFromEnd
      el.setSelectionRange(pos, pos)
    })
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (!isAngle) return
    const v = e.target.value.trim()
    if (v && !v.endsWith('°') && !v.includes('circ') && !v.includes('\\')) {
      onChange(v + '°')
    }
  }

  return (
    <div style={{ marginBottom: 5 }}>
      <div style={{ display:'flex', flexWrap:'wrap', gap:3, marginBottom:4 }}>
        {REG_INSERTS.map(btn => (
          <button
            key={btn.display}
            type="button"
            tabIndex={-1}
            onMouseDown={e => { e.preventDefault(); insertAt(btn.insert, btn.cursor) }}
            style={{ fontSize:12, padding:'2px 6px', border:'0.5px solid var(--border2)', borderRadius:4, background:'var(--bg2)', color:'var(--text)', cursor:'pointer', fontFamily:'var(--font)', userSelect:'none' }}
          >
            {btn.display}
          </button>
        ))}
      </div>
      <input
        ref={ref}
        type="text"
        value={value}
        placeholder={placeholder ?? `Label for ${label}`}
        onChange={e => onChange(e.target.value)}
        onBlur={handleBlur}
        style={{ width:'100%', fontSize:12, padding:'4px 8px', border:'0.5px solid var(--border)', borderRadius:5, background:'var(--bg2)', color:'var(--text)', outline:'none', fontFamily:'var(--mono)' }}
      />
    </div>
  )
}

interface PanelProps { st: RegPolygonState; onChange: (n: RegPolygonState) => void }

export function RegPolygonPanel({ st, onChange }: PanelProps) {
  const upd = <K extends keyof RegPolygonState>(key: K, val: RegPolygonState[K]) =>
    onChange({ ...st, [key]: val })

  const sideState: LabelState = { on: st.sideOn, val: st.sideVal, ticks: st.sideTicks }

  return (
    <>
      <div className="section-lbl">Number of sides</div>
      <input
        type="number" min={3} max={26} value={st.n}
        onChange={e => {
          const newN = Math.max(3, Math.min(26, parseInt(e.target.value)||3))
          onChange({ ...st, n: newN })
        }}
        style={{width:'100%',fontSize:14,padding:'6px 10px',border:'0.5px solid var(--border)',borderRadius:'var(--radius)',background:'var(--bg)',color:'var(--text)',outline:'none',fontFamily:'var(--mono)',marginBottom:8}}
      />

      <div className="section-lbl">Side length</div>
      <LabelCell
        id="side" label="s (bottom side)"
        state={sideState}
        hasTicks
        placeholder="e.g. 5"
        onChange={patch => onChange({
          ...st,
          sideOn: patch.on ?? st.sideOn,
          sideVal: patch.val ?? st.sideVal,
          sideTicks: (patch.ticks ?? st.sideTicks) as 0|1|2|3,
        })}
      />

      <div className="section-lbl">Lines</div>

      <Toggle on={st.radiiOn} label="Radius" onToggle={v=>upd('radiiOn',v)}/>
      {st.radiiOn && (
        <SmallInput label="radius" value={st.radiiVal} placeholder="e.g. r or 6" onChange={v=>upd('radiiVal',v)}/>
      )}

      <Toggle on={st.centralAngleOn} label="Central angle" onToggle={v=>upd('centralAngleOn',v)}/>
      {st.centralAngleOn && (
        <SmallInput label="central angle" value={st.centralAngleVal} placeholder="e.g. 72°" isAngle onChange={v=>upd('centralAngleVal',v)}/>
      )}

      <Toggle on={st.apothemOn} label="Apothem" onToggle={v=>upd('apothemOn',v)}/>
      {st.apothemOn && (
        <SmallInput label="apothem" value={st.apothemVal} placeholder="e.g. a or 4.9" onChange={v=>upd('apothemVal',v)}/>
      )}

      <div className="section-lbl">Options</div>
      <Toggle on={st.showVertexLabels} label="Vertex labels (A, B, C…)" onToggle={v=>upd('showVertexLabels',v)}/>
    </>
  )
}
