import React from 'react'
import { BLUE } from '../../utils/svg'

// ── State ─────────────────────────────────────────────────────────────
export interface CoordPlaneState {
  xMin: string
  xMax: string
  yMin: string
  yMax: string
  manualSpacing: boolean
  xStep: string
  yStep: string
  showTickMarks: boolean
}

export function defaultCoordPlaneState(): CoordPlaneState {
  return {
    xMin: '-10', xMax: '10',
    yMin: '-10', yMax: '10',
    manualSpacing: false,
    xStep: '1',
    yStep: '1',
    showTickMarks: true,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────
function autoStep(range: number): number {
  if (range <= 10) return 1
  if (range <= 20) return 2
  if (range <= 50) return 5
  return 10
}

// ── SVG ───────────────────────────────────────────────────────────────
const SVG_W = 520
const SVG_H = 340
const PAD = 40

export function CoordPlaneSvg({ st }: { st: CoordPlaneState }) {
  const xMin = parseFloat(st.xMin) || -10
  const xMax = parseFloat(st.xMax) || 10
  const yMin = parseFloat(st.yMin) || -10
  const yMax = parseFloat(st.yMax) || 10

  const xRange = xMax - xMin
  const yRange = yMax - yMin

  const rawXStep = st.manualSpacing ? (parseFloat(st.xStep) || 1) : autoStep(xRange)
  const rawYStep = st.manualSpacing ? (parseFloat(st.yStep) || 1) : autoStep(yRange)
  // Guard against zero/negative step to avoid infinite loops
  const xStep = Math.max(0.01, Math.abs(rawXStep))
  const yStep = Math.max(0.01, Math.abs(rawYStep))

  const gridW = SVG_W - PAD * 2
  const gridH = SVG_H - PAD * 2

  const toSvgX = (x: number) => PAD + ((x - xMin) / (xMax - xMin)) * gridW
  const toSvgY = (y: number) => PAD + ((yMax - y) / (yMax - yMin)) * gridH

  const originX = toSvgX(0)
  const originY = toSvgY(0)

  const parts: string[] = []

  // ── Grid lines ────────────────────────────────────────────────────
  for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax + 1e-9; x += xStep) {
    const sx = toSvgX(x)
    const isAxis = Math.abs(x) < 1e-9
    parts.push(`<line x1="${sx}" y1="${PAD}" x2="${sx}" y2="${SVG_H - PAD}" stroke="${isAxis ? '#1a1a19' : '#d0cfc9'}" stroke-width="${isAxis ? 1.5 : 0.5}"/>`)
  }
  for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax + 1e-9; y += yStep) {
    const sy = toSvgY(y)
    const isAxis = Math.abs(y) < 1e-9
    parts.push(`<line x1="${PAD}" y1="${sy}" x2="${SVG_W - PAD}" y2="${sy}" stroke="${isAxis ? '#1a1a19' : '#d0cfc9'}" stroke-width="${isAxis ? 1.5 : 0.5}"/>`)
  }

  // ── Axis arrows ───────────────────────────────────────────────────
  parts.push(`<polygon points="${SVG_W - PAD + 8},${originY} ${SVG_W - PAD},${originY - 5} ${SVG_W - PAD},${originY + 5}" fill="#1a1a19"/>`)
  parts.push(`<polygon points="${originX},${PAD - 8} ${originX - 5},${PAD} ${originX + 5},${PAD}" fill="#1a1a19"/>`)

  // ── Tick marks + number labels ────────────────────────────────────
  // Format number cleanly — avoid floating point noise like 2.9999999
  const fmt = (n: number) => {
    const r = Math.round(n * 1e6) / 1e6
    return parseFloat(r.toFixed(6)).toString()
  }

  if (st.showTickMarks) {
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax + 1e-9; x += xStep) {
      if (Math.abs(x) < 1e-9) continue
      const sx = toSvgX(x)
      parts.push(`<line x1="${sx}" y1="${originY - 4}" x2="${sx}" y2="${originY + 4}" stroke="#1a1a19" stroke-width="1"/>`)
      parts.push(`<text x="${sx}" y="${originY + 15}" text-anchor="middle" font-size="10" font-family="-apple-system,Arial,sans-serif" fill="#6b6b67">${fmt(x)}</text>`)
    }
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax + 1e-9; y += yStep) {
      if (Math.abs(y) < 1e-9) continue
      const sy = toSvgY(y)
      parts.push(`<line x1="${originX - 4}" y1="${sy}" x2="${originX + 4}" y2="${sy}" stroke="#1a1a19" stroke-width="1"/>`)
      parts.push(`<text x="${originX - 8}" y="${sy + 4}" text-anchor="end" font-size="10" font-family="-apple-system,Arial,sans-serif" fill="#6b6b67">${fmt(y)}</text>`)
    }
    // Origin label
    parts.push(`<text x="${originX - 8}" y="${originY + 15}" text-anchor="end" font-size="10" font-family="-apple-system,Arial,sans-serif" fill="#6b6b67">0</text>`)
  }

  // Axis labels
  parts.push(`<text x="${SVG_W - PAD + 12}" y="${originY + 5}" font-size="14" font-weight="600" font-family="-apple-system,Arial,sans-serif" font-style="italic" fill="#1a1a19">x</text>`)
  parts.push(`<text x="${originX + 8}" y="${PAD - 10}" font-size="14" font-weight="600" font-family="-apple-system,Arial,sans-serif" font-style="italic" fill="#1a1a19">y</text>`)

  return <>{parts.map((p, i) => <g key={i} dangerouslySetInnerHTML={{ __html: p }} />)}</>
}

// ── Panel ─────────────────────────────────────────────────────────────
interface PanelProps { st: CoordPlaneState; onChange: (n: CoordPlaneState) => void }

function NumInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: 'var(--text2)', width: 32, flexShrink: 0 }}>{label}</span>
      <input
        type="number"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ flex: 1, fontSize: 13, padding: '4px 8px', border: '0.5px solid var(--border)', borderRadius: 5, background: 'var(--bg2)', color: 'var(--text)', outline: 'none', fontFamily: 'var(--mono)' }}
      />
    </div>
  )
}

function SectionBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 12px', marginBottom: 6 }}>
      {children}
    </div>
  )
}

function ToggleRow({ on, label, onToggle }: { on: boolean; label: string; onToggle: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{label}</span>
      <label style={{ position: 'relative', width: 28, height: 16, cursor: 'pointer', flexShrink: 0 }}>
        <input type="checkbox" checked={on} onChange={e => onToggle(e.target.checked)}
          style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
        <span style={{ position: 'absolute', inset: 0, background: on ? 'var(--blue)' : 'var(--border2)', borderRadius: 10, transition: 'background .2s' }}>
          <span style={{ position: 'absolute', width: 12, height: 12, left: 2, top: 2, background: '#fff', borderRadius: '50%', transition: 'transform .2s', transform: on ? 'translateX(12px)' : 'none' }} />
        </span>
      </label>
    </div>
  )
}

export function CoordPlanePanel({ st, onChange }: PanelProps) {
  return (
    <>
      <div className="section-lbl">X Axis</div>
      <SectionBox>
        <NumInput label="min" value={st.xMin} onChange={v => onChange({ ...st, xMin: v })} />
        <NumInput label="max" value={st.xMax} onChange={v => onChange({ ...st, xMax: v })} />
      </SectionBox>

      <div className="section-lbl">Y Axis</div>
      <SectionBox>
        <NumInput label="min" value={st.yMin} onChange={v => onChange({ ...st, yMin: v })} />
        <NumInput label="max" value={st.yMax} onChange={v => onChange({ ...st, yMax: v })} />
      </SectionBox>

      <div className="section-lbl">Grid Spacing</div>
      <ToggleRow
        on={st.manualSpacing}
        label="Manual spacing"
        onToggle={v => onChange({ ...st, manualSpacing: v })}
      />
      {st.manualSpacing && (
        <SectionBox>
          <NumInput label="x step" value={st.xStep} placeholder="e.g. 2" onChange={v => onChange({ ...st, xStep: v })} />
          <NumInput label="y step" value={st.yStep} placeholder="e.g. 2" onChange={v => onChange({ ...st, yStep: v })} />
        </SectionBox>
      )}
      {!st.manualSpacing && (
        <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5, padding: '4px 2px' }}>
          Auto-adjusts based on range.
        </p>
      )}

      <div className="section-lbl">Display</div>
      <ToggleRow
        on={st.showTickMarks}
        label="Tick marks &amp; numbers"
        onToggle={v => onChange({ ...st, showTickMarks: v })}
      />
    </>
  )
}
