import React from 'react'
import { BLUE } from '../../utils/svg'
import type { LabelState } from '../../types'
import LabelCell from '../ui/LabelCell'
import katex from 'katex'

// ── Shared helpers ────────────────────────────────────────────────────
const SVG_W = 520, SVG_H = 340

function rk(latex: string): string {
  if (!latex.trim()) return ''
  try {
    const el = document.createElement('span')
    katex.render(latex, el, { throwOnError: false, displayMode: false })
    return el.outerHTML
  } catch { return latex }
}

function fo(x: number, y: number, latex: string, w = 110): string {
  if (!latex.trim()) return ''
  const html = rk(latex)
  return `<foreignObject x="${x - w/2}" y="${y - 20}" width="${w}" height="40" style="overflow:visible">
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

function Parts({ parts }: { parts: string[] }) {
  return <>{parts.map((p,i)=><g key={i} dangerouslySetInnerHTML={{__html:p}}/>)}</>
}

// ── ANGLE STATE ───────────────────────────────────────────────────────
export interface AngleState {
  angleVal: string    // e.g. "45°"
  vertexName: string  // e.g. "ABC" → ray1=A, vertex=B, ray2=C
  showArc: boolean
}

export type AngleVariant = 'acute' | 'right' | 'obtuse' | 'straight' | 'reflex'

export function defaultAngleState(): AngleState {
  return { angleVal: '', vertexName: '', showArc: true }
}

// Parse "ABC" → { ray1: 'A', vertex: 'B', ray2: 'C' }
function parseVertexName(s: string): { ray1: string; vertex: string; ray2: string } {
  const t = s.trim()
  if (t.length === 0) return { ray1: '', vertex: '', ray2: '' }
  if (t.length === 1) return { ray1: '', vertex: t, ray2: '' }
  if (t.length === 2) return { ray1: t[0], vertex: '', ray2: t[1] }
  // 3+ chars: first, middle, last
  const mid = Math.floor((t.length - 1) / 2)
  return { ray1: t[0], vertex: t[mid], ray2: t[t.length - 1] }
}

// ── Arrowhead at end of a ray ─────────────────────────────────────────
function arrowHead(ex: number, ey: number, ax: number, ay: number): string {
  // ex,ey = endpoint; ax,ay = direction vector (from vertex toward endpoint)
  const len = Math.sqrt(ax*ax + ay*ay) || 1
  const ux = ax/len, uy = ay/len
  const sz = 10
  const px = -uy, py = ux // perpendicular
  const bx = ex - ux*sz, by = ey - uy*sz
  return `<polygon points="${ex},${ey} ${bx+px*sz*0.45},${by+py*sz*0.45} ${bx-px*sz*0.45},${by-py*sz*0.45}" fill="${BLUE}"/>`
}

// Draw two rays from vertex at given angle (in degrees), with arc.
// Right ray is horizontal (pointing right), left ray opens upward at angleDeg.
function drawAngle(
  vx: number, vy: number,
  angleDeg: number,
  rayLen: number,
  st: AngleState,
  isRight: boolean,
): string[] {
  const toR = (d: number) => d * Math.PI / 180

  const a1 = 0
  const a2 = -toR(angleDeg)

  const r1x = vx + rayLen * Math.cos(a1)
  const r1y = vy + rayLen * Math.sin(a1)
  const r2x = vx + rayLen * Math.cos(a2)
  const r2y = vy + rayLen * Math.sin(a2)

  const bisA = (a1 + a2) / 2

  const parts: string[] = []

  // Rays (shortened slightly so arrowhead sits at end)
  parts.push(`<line x1="${vx}" y1="${vy}" x2="${r1x}" y2="${r1y}" stroke="${BLUE}" stroke-width="2" stroke-linecap="butt"/>`)
  parts.push(`<line x1="${vx}" y1="${vy}" x2="${r2x}" y2="${r2y}" stroke="${BLUE}" stroke-width="2" stroke-linecap="butt"/>`)

  // Arrowheads at ray endpoints
  parts.push(arrowHead(r1x, r1y, r1x - vx, r1y - vy))
  parts.push(arrowHead(r2x, r2y, r2x - vx, r2y - vy))

  // Vertex dot
  parts.push(`<circle cx="${vx}" cy="${vy}" r="4" fill="${BLUE}"/>`)

  // Arc — no fill
  if (st.showArc) {
    if (isRight) {
      const s = 22
      parts.push(`<polyline points="${vx+s},${vy} ${vx+s},${vy-s} ${vx},${vy-s}" fill="none" stroke="${BLUE}" stroke-width="1.8"/>`)
    } else {
      const arcR = 52
      const arcX1 = vx + arcR * Math.cos(a1), arcY1 = vy + arcR * Math.sin(a1)
      const arcX2 = vx + arcR * Math.cos(a2), arcY2 = vy + arcR * Math.sin(a2)
      parts.push(`<path d="M ${arcX1} ${arcY1} A ${arcR} ${arcR} 0 0 0 ${arcX2} ${arcY2}" fill="none" stroke="${BLUE}" stroke-width="1.5"/>`)
    }
  }

  // Angle label — interior, along bisector
  if (st.angleVal) {
    const v = st.angleVal.trim()
    const display = (v && !v.endsWith('°') && !v.includes('\\') && !v.includes('circ')) ? v + '°' : v
    const lblR = isRight ? 46 : 80
    parts.push(fo(vx + lblR * Math.cos(bisA), vy + lblR * Math.sin(bisA), display, 100))
  }

  // Vertex + endpoint labels
  const { ray1, vertex, ray2 } = parseVertexName(st.vertexName)
  if (vertex) {
    const extDist = 28
    parts.push(fo(vx - extDist * Math.cos(bisA), vy - extDist * Math.sin(bisA), vertex, 60))
  }
  if (ray1) parts.push(fo(r1x + 20, r1y + 18, ray1, 60))
  if (ray2) {
    const dx = r2x - vx, dy = r2y - vy, len = Math.sqrt(dx*dx + dy*dy) || 1
    parts.push(fo(r2x + (dx/len)*20, r2y + (dy/len)*20, ray2, 60))
  }

  return parts
}

// ── ANGLE SVG COMPONENTS ─────────────────────────────────────────────
// Vertex at lower-left, right ray horizontal, angle opens up-left.
// Vertex positioned so the visual mass of each angle is centered in the 520×340 canvas.
export function AcuteAngleSvg({ st }: { st: AngleState }) {
  // 55° angle: right ray goes to vx+190, left ray goes up-left
  // horizontal extent ≈ 190, vertical extent ≈ 190·sin(55°)≈155
  // center x = vx + 190/2 = 260 → vx = 165; center y = vy - 155/2 = 170 → vy = 248
  const p = drawAngle(155, 248, 55, 190, st, false)
  return <Parts parts={p} />
}
export function RightAngleSvg({ st }: { st: AngleState }) {
  // 90°: both rays equal length 190; extent is 190 right and 190 up
  // center x = vx + 95 = 260 → vx = 165; center y = vy - 95 = 170 → vy = 265
  const p = drawAngle(165, 265, 90, 190, st, true)
  return <Parts parts={p} />
}
export function ObtuseAngleSvg({ st }: { st: AngleState }) {
  // 130°: right ray goes 190 right, left ray goes mostly left and slightly up
  // left ray x-component = 190·cos(130°) ≈ -122, y-component ≈ -145
  // total x span ≈ 190-(-122)=312; center x = vx + 190/2 - 122/2 = vx + 34 = 260 → vx = 226
  // vertical span ≈ 145; center y = vy - 72 = 170 → vy = 242
  const p = drawAngle(200, 255, 130, 190, st, false)
  return <Parts parts={p} />
}
export function StraightAngleSvg({ st }: { st: AngleState }) {
  // Straight angle — flat line, arc above
  const vx=130, vy=220, rayLen=300
  const parts: string[] = []
  parts.push(`<line x1="${vx}" y1="${vy}" x2="${vx+rayLen}" y2="${vy}" stroke="${BLUE}" stroke-width="2" stroke-linecap="round"/>`)
  parts.push(`<circle cx="${vx}" cy="${vy}" r="4" fill="${BLUE}"/>`)
  parts.push(`<circle cx="${vx+rayLen}" cy="${vy}" r="3.5" fill="${BLUE}"/>`)
  if (st.showArc) {
    const arcR = 50
    parts.push(`<path d="M ${vx+arcR} ${vy} A ${arcR} ${arcR} 0 0 0 ${vx-arcR} ${vy}" fill="rgba(55,138,221,0.08)" stroke="${BLUE}" stroke-width="1.5"/>`)
  }
  if (st.angleVal) {
    const v = st.angleVal.trim()
    const display = (v && !v.endsWith('°') && !v.includes('\\') && !v.includes('circ')) ? v + '°' : v
    parts.push(fo(vx, vy - 72, display, 100))
  }
  const { ray1, vertex, ray2 } = parseVertexName(st.vertexName)
  if (vertex) parts.push(fo(vx - 24, vy + 26, vertex, 60))
  if (ray1)   parts.push(fo(vx + rayLen + 22, vy, ray1, 60))
  if (ray2)   parts.push(fo(vx - 44, vy, ray2, 60))
  return <Parts parts={parts} />
}
export function ReflexAngleSvg({ st }: { st: AngleState }) {
  // Reflex ~240° — first ray right, second ray pointing down-left
  const vx=260, vy=200, rayLen=160
  const a1 = 0
  const a2 = -(240 * Math.PI / 180)
  const r1x = vx + rayLen * Math.cos(a1), r1y = vy + rayLen * Math.sin(a1)
  const r2x = vx + rayLen * Math.cos(a2), r2y = vy + rayLen * Math.sin(a2)
  const parts: string[] = []
  parts.push(`<line x1="${vx}" y1="${vy}" x2="${r1x}" y2="${r1y}" stroke="${BLUE}" stroke-width="2" stroke-linecap="round"/>`)
  parts.push(`<line x1="${vx}" y1="${vy}" x2="${r2x}" y2="${r2y}" stroke="${BLUE}" stroke-width="2" stroke-linecap="round"/>`)
  parts.push(`<circle cx="${vx}" cy="${vy}" r="4" fill="${BLUE}"/>`)
  parts.push(`<circle cx="${r1x}" cy="${r1y}" r="3.5" fill="${BLUE}"/>`)
  parts.push(`<circle cx="${r2x}" cy="${r2y}" r="3.5" fill="${BLUE}"/>`)
  if (st.showArc) {
    const arcR = 50
    const arcX1 = vx + arcR * Math.cos(a1), arcY1 = vy + arcR * Math.sin(a1)
    const arcX2 = vx + arcR * Math.cos(a2), arcY2 = vy + arcR * Math.sin(a2)
    // large arc sweep going the long way around
    parts.push(`<path d="M ${arcX1} ${arcY1} A ${arcR} ${arcR} 0 1 0 ${arcX2} ${arcY2}" fill="rgba(55,138,221,0.08)" stroke="${BLUE}" stroke-width="1.5"/>`)
  }
  if (st.angleVal) {
    const v = st.angleVal.trim()
    const display = (v && !v.endsWith('°') && !v.includes('\\') && !v.includes('circ')) ? v + '°' : v
    parts.push(fo(vx + 70, vy + 50, display, 100))
  }
  const { ray1, vertex, ray2 } = parseVertexName(st.vertexName)
  if (vertex) parts.push(fo(vx - 28, vy - 6, vertex, 60))
  if (ray1)   parts.push(fo(r1x + 20, r1y, ray1, 60))
  if (ray2)   parts.push(fo(r2x - 10, r2y + 22, ray2, 60))
  return <Parts parts={parts} />
}

// ── ANGLE PANEL ───────────────────────────────────────────────────────
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

function mkAngleLabelState(val: string): LabelState { return { on: true, val, ticks: 0 } }

export function AnglePanel({ st, onChange }: { st: AngleState; onChange: (n: AngleState) => void }) {
  const angleLS = mkAngleLabelState(st.angleVal)

  return (
    <>
      <div className="section-lbl">Vertex name</div>
      <div style={{
        background: 'var(--bg)', border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '8px 10px', marginBottom: 6,
      }}>
        <input
          type="text"
          value={st.vertexName}
          placeholder="e.g. ABC"
          maxLength={10}
          onChange={e => onChange({ ...st, vertexName: e.target.value })}
          style={{
            width: '100%', fontSize: 16, fontWeight: 600,
            padding: '5px 8px', border: '0.5px solid var(--border)',
            borderRadius: 5, background: 'var(--bg2)', color: 'var(--blue)',
            outline: 'none', letterSpacing: '0.1em', textAlign: 'center',
            fontFamily: 'var(--font)',
          }}
        />
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 5, textAlign: 'center' }}>
          {(() => {
            const { ray1, vertex, ray2 } = parseVertexName(st.vertexName)
            if (!st.vertexName.trim()) return 'Type 3 characters, e.g. ABC'
            return `${ray1 || '–'} → ${vertex || '–'} → ${ray2 || '–'}`
          })()}
        </div>
      </div>

      <div className="section-lbl">Angle</div>
      <LabelCell
        id="angle" label="Angle value" state={angleLS}
        placeholder="e.g. 45" isAngle
        onChange={p => onChange({ ...st, angleVal: p.val ?? st.angleVal })}
      />

      <div className="section-lbl">Options</div>
      <Toggle on={st.showArc} label="Show arc" onToggle={v => onChange({ ...st, showArc: v })} />
    </>
  )
}

// ── SEGMENT STATE ─────────────────────────────────────────────────────
// ── SEGMENT STATE ─────────────────────────────────────────────────────
// Both segment types: three points, two sub-lengths, one full length
export interface SegmentState {
  pointName: string     // e.g. "APB" → left=A, mid=P, right=B (same parser as angles)
  seg1Val: string       // label for left sub-segment (above)
  seg1On: boolean
  seg2Val: string       // label for right sub-segment (above)
  seg2On: boolean
  totalVal: string      // label for full length (below)
  totalOn: boolean
  ticks1: 0|1|2|3      // ticks on left sub-segment
  ticks2: 0|1|2|3      // ticks on right sub-segment
}

export function defaultSegmentState(): SegmentState {
  return {
    pointName: '',
    seg1Val: '', seg1On: true,
    seg2Val: '', seg2On: true,
    totalVal: '', totalOn: true,
    ticks1: 0, ticks2: 0,
  }
}

// Shared point-name parser (same logic as angles)
function parsePointName(s: string): { left: string; mid: string; right: string } {
  const t = s.trim()
  if (t.length === 0) return { left: '', mid: '', right: '' }
  if (t.length === 1) return { left: '', mid: t, right: '' }
  if (t.length === 2) return { left: t[0], mid: '', right: t[1] }
  const m = Math.floor((t.length - 1) / 2)
  return { left: t[0], mid: t[m], right: t[t.length - 1] }
}

// ── Shared segment drawing function ───────────────────────────────────
function drawSegment(st: SegmentState, midFrac: number): string[] {
  const x1 = 70, y = SVG_H / 2, x2 = 450
  const mx = x1 + (x2 - x1) * midFrac
  const parts: string[] = []

  // Full line
  parts.push(`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round"/>`)

  // Dots
  parts.push(`<circle cx="${x1}" cy="${y}" r="4.5" fill="${BLUE}"/>`)
  parts.push(`<circle cx="${mx}" cy="${y}" r="4.5" fill="${BLUE}"/>`)
  parts.push(`<circle cx="${x2}" cy="${y}" r="4.5" fill="${BLUE}"/>`)

  // Tick marks on each sub-segment
  parts.push(ticks(x1, y, mx, y, st.ticks1))
  parts.push(ticks(mx, y, x2, y, st.ticks2))

  // Sub-segment labels — above the line
  if (st.seg1On && st.seg1Val) parts.push(fo((x1 + mx) / 2, y - 26, st.seg1Val))
  if (st.seg2On && st.seg2Val) parts.push(fo((mx + x2) / 2, y - 26, st.seg2Val))

  // Full length label — below the line with bracket lines
  if (st.totalOn && st.totalVal) {
    const bY = y + 22
    parts.push(`<line x1="${x1}" y1="${y+6}" x2="${x1}" y2="${bY}" stroke="${BLUE}" stroke-width="1.2" opacity="0.5"/>`)
    parts.push(`<line x1="${x2}" y1="${y+6}" x2="${x2}" y2="${bY}" stroke="${BLUE}" stroke-width="1.2" opacity="0.5"/>`)
    parts.push(`<line x1="${x1}" y1="${bY}" x2="${x2}" y2="${bY}" stroke="${BLUE}" stroke-width="1.2" opacity="0.5"/>`)
    parts.push(fo((x1 + x2) / 2, y + 46, st.totalVal))
  }

  // Point labels — just above the dots, close to the line
  const { left, mid, right } = parsePointName(st.pointName)
  if (left)  parts.push(fo(x1, y - 50, left, 60))
  if (mid)   parts.push(fo(mx, y - 50, mid, 60))
  if (right) parts.push(fo(x2, y - 50, right, 60))

  return parts
}

// ── SEGMENT SVG (point at 2/3) ────────────────────────────────────────
export function SegmentSvg({ st }: { st: SegmentState }) {
  return <Parts parts={drawSegment(st, 2/3)} />
}

// ── SEGMENT MIDPOINT SVG (point at 1/2) ───────────────────────────────
export function SegmentMidpointSvg({ st }: { st: SegmentState }) {
  return <Parts parts={drawSegment(st, 1/2)} />
}

// ── RAY STATE ─────────────────────────────────────────────────────────
export interface RayState {
  lengthLabel: string
  point1Label: string  // endpoint (origin)
  point2Label: string  // point on ray
}

export function defaultRayState(): RayState {
  return { lengthLabel: '', point1Label: '', point2Label: '' }
}

// ── RAY SVG ───────────────────────────────────────────────────────────
export function RaySvg({ st }: { st: RayState }) {
  const x1=100, y=170, x2=430
  const parts: string[] = []
  // Line
  parts.push(`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round"/>`)
  // Arrowhead
  parts.push(`<polygon points="${x2},${y} ${x2-16},${y-7} ${x2-16},${y+7}" fill="${BLUE}"/>`)
  // Origin endpoint dot
  parts.push(`<circle cx="${x1}" cy="${y}" r="4.5" fill="${BLUE}"/>`)
  // Point on ray
  const px = x1 + (x2-x1)*0.55
  parts.push(`<circle cx="${px}" cy="${y}" r="4.5" fill="${BLUE}"/>`)
  if (st.lengthLabel) parts.push(fo((x1+px)/2, y - 30, st.lengthLabel))
  if (st.point1Label) parts.push(fo(x1, y + 30, st.point1Label, 60))
  if (st.point2Label) parts.push(fo(px, y + 30, st.point2Label, 60))
  return <Parts parts={parts} />
}

// ── SEGMENT PANEL ─────────────────────────────────────────────────────
export function SegmentPanel({ st, onChange, isMidpoint = false }: {
  st: SegmentState; onChange: (n: SegmentState) => void; isMidpoint?: boolean
}) {
  const mk = (val: string): LabelState => ({ on: true, val, ticks: 0 })
  const { left, mid, right } = parsePointName(st.pointName)

  return (
    <>
      {/* Point name input */}
      <div className="section-lbl">Point names</div>
      <div style={{ background:'var(--bg)',border:'0.5px solid var(--border)',borderRadius:'var(--radius)',padding:'8px 10px',marginBottom:6 }}>
        <input
          type="text"
          value={st.pointName}
          placeholder={isMidpoint ? 'e.g. AMB' : 'e.g. APB'}
          maxLength={10}
          onChange={e => onChange({ ...st, pointName: e.target.value })}
          style={{ width:'100%',fontSize:16,fontWeight:600,padding:'5px 8px',border:'0.5px solid var(--border)',borderRadius:5,background:'var(--bg2)',color:'var(--blue)',outline:'none',letterSpacing:'0.1em',textAlign:'center',fontFamily:'var(--font)' }}
        />
        <div style={{ fontSize:10,color:'var(--text3)',marginTop:5,textAlign:'center' }}>
          {!st.pointName.trim()
            ? `Type 3 chars, e.g. ${isMidpoint ? 'AMB' : 'APB'}`
            : `${left||'–'} ── ${mid||'–'} ── ${right||'–'}`}
        </div>
      </div>

      {/* Sub-segment labels */}
      <div className="section-lbl">Segment lengths (above)</div>
      <LabelCell id="seg1" label={`${left||'?'}${mid||'?'} length`}
        state={{ on: st.seg1On, val: st.seg1Val, ticks: st.ticks1 }}
        hasTicks placeholder="e.g. 4"
        onChange={p => onChange({ ...st,
          seg1On: p.on ?? st.seg1On,
          seg1Val: p.val ?? st.seg1Val,
          ticks1: (p.ticks ?? st.ticks1) as 0|1|2|3,
        })} />
      <LabelCell id="seg2" label={`${mid||'?'}${right||'?'} length`}
        state={{ on: st.seg2On, val: st.seg2Val, ticks: st.ticks2 }}
        hasTicks placeholder="e.g. 4"
        onChange={p => onChange({ ...st,
          seg2On: p.on ?? st.seg2On,
          seg2Val: p.val ?? st.seg2Val,
          ticks2: (p.ticks ?? st.ticks2) as 0|1|2|3,
        })} />

      {/* Total length */}
      <div className="section-lbl">Total length (below)</div>
      <LabelCell id="total" label={`${left||'?'}${right||'?'} total`}
        state={{ on: st.totalOn, val: st.totalVal, ticks: 0 }}
        placeholder="e.g. 8"
        onChange={p => onChange({ ...st,
          totalOn: p.on ?? st.totalOn,
          totalVal: p.val ?? st.totalVal,
        })} />
    </>
  )
}

// ── RAY PANEL ─────────────────────────────────────────────────────────
export function RayPanel({ st, onChange }: { st: RayState; onChange: (n: RayState) => void }) {
  const p1LS = mkAngleLabelState(st.point1Label)
  const p2LS = mkAngleLabelState(st.point2Label)
  const llLS = mkAngleLabelState(st.lengthLabel)
  return (
    <>
      <div className="section-lbl">Labels</div>
      <LabelCell id="p1" label="Endpoint" state={p1LS} placeholder="e.g. A"
        onChange={p => onChange({ ...st, point1Label: p.val ?? st.point1Label })} />
      <LabelCell id="p2" label="Point on ray" state={p2LS} placeholder="e.g. B"
        onChange={p => onChange({ ...st, point2Label: p.val ?? st.point2Label })} />
      <LabelCell id="ll" label="Length label" state={llLS} placeholder="e.g. 6"
        onChange={p => onChange({ ...st, lengthLabel: p.val ?? st.lengthLabel })} />
    </>
  )
}

// ── COMPLEMENTARY / SUPPLEMENTARY STATE ──────────────────────────────
export interface AdjacentAngleState {
  vertexName: string
  innerRayLabel: string
  angle1Val: string
  angle1On: boolean
  angle2Val: string
  angle2On: boolean
}

export function defaultAdjacentAngleState(): AdjacentAngleState {
  return {
    vertexName: '', innerRayLabel: '',
    angle1Val: '', angle1On: true,
    angle2Val: '', angle2On: true,
  }
}

function ensureDeg(v: string): string {
  const t = v.trim()
  if (!t || t.endsWith('°') || t.includes('\\')) return t
  return t + '°'
}

// ── COMPLEMENTARY ANGLES SVG ──────────────────────────────────────────
export function ComplementaryAngleSvg({ st }: { st: AdjacentAngleState }) {
  const vx = 165, vy = 265, rayLen = 190
  const { ray1, vertex, ray2 } = parseVertexName(st.vertexName)
  const inner = st.innerRayLabel

  const a_right = 0                   // horizontal right ray
  const a_left  = -Math.PI / 2        // vertical up ray
  const a_inner = -Math.PI / 4        // 45° bisecting inner ray

  const rx = vx + rayLen, ry = vy
  const lx = vx,          ly = vy - rayLen
  const ix = vx + rayLen * Math.cos(a_inner), iy = vy + rayLen * Math.sin(a_inner)

  const parts: string[] = []

  // Three rays
  parts.push(`<line x1="${vx}" y1="${vy}" x2="${rx}" y2="${ry}" stroke="${BLUE}" stroke-width="2" stroke-linecap="butt"/>`)
  parts.push(`<line x1="${vx}" y1="${vy}" x2="${lx}" y2="${ly}" stroke="${BLUE}" stroke-width="2" stroke-linecap="butt"/>`)
  parts.push(`<line x1="${vx}" y1="${vy}" x2="${ix}" y2="${iy}" stroke="${BLUE}" stroke-width="2" stroke-linecap="butt"/>`)

  // Arrowheads on all three outer rays
  parts.push(arrowHead(rx, ry, rx - vx, ry - vy))
  parts.push(arrowHead(lx, ly, lx - vx, ly - vy))
  parts.push(arrowHead(ix, iy, ix - vx, iy - vy))

  // Vertex dot
  parts.push(`<circle cx="${vx}" cy="${vy}" r="4" fill="${BLUE}"/>`)

  // Angle labels — interior bisector of each sub-angle, close enough to read
  // Angle 1: between left (vertical) and inner (45°) — bisector at 67.5° from horizontal = -67.5° = -3π/8
  if (st.angle1On && st.angle1Val) {
    const bisA1 = (a_left + a_inner) / 2   // bisector of left sub-angle
    const lbl1R = 68
    parts.push(fo(vx + lbl1R * Math.cos(bisA1), vy + lbl1R * Math.sin(bisA1), ensureDeg(st.angle1Val), 90))
  }
  // Angle 2: between inner (45°) and right (0°) — bisector at 22.5° = -π/8
  if (st.angle2On && st.angle2Val) {
    const bisA2 = (a_inner + a_right) / 2  // bisector of right sub-angle
    const lbl2R = 68
    parts.push(fo(vx + lbl2R * Math.cos(bisA2), vy + lbl2R * Math.sin(bisA2), ensureDeg(st.angle2Val), 90))
  }

  // Vertex label — exterior below-left of the right-angle corner
  if (vertex) parts.push(fo(vx - 26, vy + 24, vertex, 60))
  // Outer ray labels — beyond arrowheads
  if (ray1) parts.push(fo(lx - 12, ly - 22, ray1, 60))
  if (ray2) parts.push(fo(rx + 22, ry + 16, ray2, 60))
  if (inner) parts.push(fo(ix + 18, iy - 20, inner, 60))

  return <Parts parts={parts} />
}

// ── SUPPLEMENTARY ANGLES SVG ──────────────────────────────────────────
export function SupplementaryAngleSvg({ st }: { st: AdjacentAngleState }) {
  const vx = 260, vy = 220, rayLen = 190
  const { ray1, vertex, ray2 } = parseVertexName(st.vertexName)
  const inner = st.innerRayLabel

  const a_left  = Math.PI               // pointing left
  const a_right = 0                     // pointing right
  const a_inner = -Math.PI * 65 / 180  // ~65° above horizontal

  const lx = vx - rayLen, ly = vy
  const rx = vx + rayLen, ry = vy
  const ix = vx + rayLen * Math.cos(a_inner), iy = vy + rayLen * Math.sin(a_inner)

  const parts: string[] = []

  // Three rays
  parts.push(`<line x1="${vx}" y1="${vy}" x2="${lx}" y2="${ly}" stroke="${BLUE}" stroke-width="2" stroke-linecap="butt"/>`)
  parts.push(`<line x1="${vx}" y1="${vy}" x2="${rx}" y2="${ry}" stroke="${BLUE}" stroke-width="2" stroke-linecap="butt"/>`)
  parts.push(`<line x1="${vx}" y1="${vy}" x2="${ix}" y2="${iy}" stroke="${BLUE}" stroke-width="2" stroke-linecap="butt"/>`)

  // Arrowheads on all three outer rays
  parts.push(arrowHead(lx, ly, lx - vx, ly - vy))
  parts.push(arrowHead(rx, ry, rx - vx, ry - vy))
  parts.push(arrowHead(ix, iy, ix - vx, iy - vy))

  // Vertex dot
  parts.push(`<circle cx="${vx}" cy="${vy}" r="4" fill="${BLUE}"/>`)

  if (st.angle1On && st.angle1Val) {
    parts.push(fo(vx - 30, vy - 30, ensureDeg(st.angle1Val), 90))
  }
  if (st.angle2On && st.angle2Val) {
    const bisA2 = -Math.PI * 32.5 / 180
    parts.push(fo(vx + 65 * Math.cos(bisA2), vy + 65 * Math.sin(bisA2), ensureDeg(st.angle2Val), 90))
  }

  // Labels
  if (vertex) parts.push(fo(vx, vy + 26, vertex, 60))
  if (ray1)   parts.push(fo(lx - 22, ly + 18, ray1, 60))
  if (ray2)   parts.push(fo(rx + 22, ry + 18, ray2, 60))
  if (inner)  parts.push(fo(ix + 20, iy - 20, inner, 60))

  return <Parts parts={parts} />
}

export function AdjacentAnglePanel({ st, onChange, totalLabel }: {
  st: AdjacentAngleState
  onChange: (n: AdjacentAngleState) => void
  totalLabel: string
}) {
  const { ray1, vertex, ray2 } = parseVertexName(st.vertexName)
  const a1LS = mkAngleLabelState(st.angle1Val)
  const a2LS = mkAngleLabelState(st.angle2Val)

  return (
    <>
      <div className="section-lbl">Vertex name</div>
      <div style={{background:'var(--bg)',border:'0.5px solid var(--border)',borderRadius:'var(--radius)',padding:'8px 10px',marginBottom:6}}>
        <input
          type="text"
          value={st.vertexName}
          placeholder="e.g. ABC"
          maxLength={10}
          onChange={e => onChange({ ...st, vertexName: e.target.value })}
          style={{width:'100%',fontSize:16,fontWeight:600,padding:'5px 8px',border:'0.5px solid var(--border)',borderRadius:5,background:'var(--bg2)',color:'var(--blue)',outline:'none',letterSpacing:'0.1em',textAlign:'center',fontFamily:'var(--font)'}}
        />
        <div style={{fontSize:10,color:'var(--text3)',marginTop:5,textAlign:'center'}}>
          {!st.vertexName.trim() ? 'e.g. ABC → A, B (vertex), C' : `${ray1||'–'} | ${vertex||'–'} (vertex) | ${ray2||'–'}`}
        </div>
      </div>

      <div className="section-lbl">Inner ray label</div>
      <div style={{background:'var(--bg)',border:'0.5px solid var(--border)',borderRadius:'var(--radius)',padding:'6px 10px',marginBottom:6}}>
        <input
          type="text"
          value={st.innerRayLabel}
          placeholder="e.g. D"
          maxLength={4}
          onChange={e => onChange({ ...st, innerRayLabel: e.target.value })}
          style={{width:'100%',fontSize:14,fontWeight:600,padding:'4px 8px',border:'0.5px solid var(--border)',borderRadius:5,background:'var(--bg2)',color:'var(--blue)',outline:'none',textAlign:'center',fontFamily:'var(--font)'}}
        />
      </div>

      <div className="section-lbl">Angle labels (sum = {totalLabel})</div>
      <LabelCell id="a1" label={`∠${ray1||'A'}${vertex||'B'}${st.innerRayLabel||'D'}`}
        state={a1LS} placeholder="e.g. 45" isAngle
        onChange={p => onChange({ ...st, angle1Val: p.val ?? st.angle1Val, angle1On: p.on ?? st.angle1On })} />
      <LabelCell id="a2" label={`∠${st.innerRayLabel||'D'}${vertex||'B'}${ray2||'C'}`}
        state={a2LS} placeholder="e.g. 45" isAngle
        onChange={p => onChange({ ...st, angle2Val: p.val ?? st.angle2Val, angle2On: p.on ?? st.angle2On })} />
    </>
  )
}

// ── PARALLEL LINES STATE ──────────────────────────────────────────────
export interface ParallelLinesState {
  _type: 'parallel-lines'
}
export function defaultParallelLinesState(): ParallelLinesState {
  return { _type: 'parallel-lines' }
}

// ── PARALLEL LINES SVG ────────────────────────────────────────────────
export function ParallelLinesSvg({ st: _st }: { st: ParallelLinesState }) {
  const W = 520, H = 340
  // Two horizontal parallel lines
  const y1 = 110, y2 = 230
  const lineX1 = 40, lineX2 = 480
  // Transversal: diagonal crossing both lines
  const tx1 = 130, ty1 = H - 40
  const tx2 = 360, ty2 = 20
  const parts: string[] = []

  // Parallel lines
  parts.push(`<line x1="${lineX1}" y1="${y1}" x2="${lineX2}" y2="${y1}" stroke="#1a1a19" stroke-width="2" stroke-linecap="round"/>`)
  parts.push(`<line x1="${lineX1}" y1="${y2}" x2="${lineX2}" y2="${y2}" stroke="#1a1a19" stroke-width="2" stroke-linecap="round"/>`)

  // Tick marks on both parallel lines (indicating they are parallel)
  const tickX = 80
  const tickLen = 10
  ;[y1, y2].forEach(ty => {
    parts.push(`<line x1="${tickX}" y1="${ty - tickLen/2}" x2="${tickX}" y2="${ty + tickLen/2}" stroke="#1a1a19" stroke-width="2"/>`)
    parts.push(`<line x1="${tickX + 10}" y1="${ty - tickLen/2}" x2="${tickX + 10}" y2="${ty + tickLen/2}" stroke="#1a1a19" stroke-width="2"/>`)
  })

  // Transversal
  parts.push(`<line x1="${tx1}" y1="${ty1}" x2="${tx2}" y2="${ty2}" stroke="#1a1a19" stroke-width="2" stroke-linecap="round"/>`)

  // Intersection dots
  // Find where transversal crosses each parallel line
  const slope = (ty2 - ty1) / (tx2 - tx1)
  const intX1 = tx1 + (y1 - ty1) / slope
  const intX2 = tx1 + (y2 - ty1) / slope
  parts.push(`<circle cx="${intX1}" cy="${y1}" r="4" fill="${BLUE}"/>`)
  parts.push(`<circle cx="${intX2}" cy="${y2}" r="4" fill="${BLUE}"/>`)

  return <>{parts.map((p,i) => <g key={i} dangerouslySetInnerHTML={{__html:p}}/>)}</>
}

// ── PARALLEL LINES PANEL ──────────────────────────────────────────────
export function ParallelLinesPanel({ st: _st, onChange: _onChange }: {
  st: ParallelLinesState
  onChange: (n: ParallelLinesState) => void
}) {
  return (
    <div style={{fontSize:12,color:'var(--text3)',lineHeight:1.6,padding:'8px 2px'}}>
      Two parallel lines cut by a transversal.<br/>
      Double tick marks indicate the lines are parallel.<br/>
      Labeling options coming soon.
    </div>
  )
}
