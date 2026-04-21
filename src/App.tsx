import React, { useState, useRef, useCallback } from 'react'
import type { ShapeKey } from './types'
import ShapeLibrary from './components/ui/ShapeLibrary'
import CalcPanel from './components/ui/CalcPanel'
import InsertBar from './components/ui/InsertBar'

// Triangle shape components — all in one file
import {
  RightTriangleSvg, RightTrianglePanel, defaultRightState,
  AcuteTriangleSvg,
  ObtuseTriangleSvg, ScaleneTriangleSvg, IsoscelesTriangleSvg, EquilateralTriangleSvg,
  ThreeAngleTriPanel, EquilateralPanel,
  defaultThreeAngleState, defaultEquilateralState,
  type RightTriangleState, type ThreeAngleTriState, type EquilateralState,
} from './components/shapes/TriangleShapes'

// Quad shape components
import {
  ParallelogramSvg, RectangleSvg, SquareSvg, RhombusSvg, KiteSvg,
  TrapIrregularSvg, TrapRightSvg, TrapIsoSvg, TrapPanel,
  ParaPanel, RectPanel, SquarePanel, RhombusPanel, KitePanel,
  defaultParaState, defaultRectState, defaultSquareState,
  defaultRhombusState, defaultKiteState,
  defaultTrapIrregularState, defaultTrapRightState, defaultTrapIsoState,
  type ParaState, type RectState, type SquareState,
  type RhombusState, type KiteState, type TrapState,
} from './components/shapes/QuadShapes'

// Calculators
import {
  calcRight, calcGeneral, calcEquilateral, calcPara, calcRect, calcSquare, calcRhombus, calcKite, calcTrap, calcRegPolygonResults,
} from './hooks/useCalculator'
import type { CalcResults } from './types'

import {
  AcuteAngleSvg, RightAngleSvg, ObtuseAngleSvg,
  AnglePanel, defaultAngleState,
  ComplementaryAngleSvg, SupplementaryAngleSvg, AdjacentAnglePanel, defaultAdjacentAngleState,
  ParallelLinesSvg, ParallelLinesPanel, defaultParallelLinesState,
  SegmentSvg, SegmentMidpointSvg, SegmentPanel, defaultSegmentState,
  RaySvg, RayPanel, defaultRayState,
  type AngleState, type AdjacentAngleState, type ParallelLinesState, type SegmentState, type RayState,
} from './components/shapes/AnglesSegments'
import {
  RegPolygonSvg, RegPolygonPanel, defaultRegPolygonState,
  type RegPolygonState,
} from './components/shapes/RegPolygon'
import {
  CoordPlaneSvg, CoordPlanePanel, defaultCoordPlaneState,
  type CoordPlaneState,
} from './components/shapes/CoordPlane'
import styles from './App.module.css'

// ── Shape state union ─────────────────────────────────────────────────
type AnyState =
  | RightTriangleState | ThreeAngleTriState | EquilateralState
  | ParaState | RectState | SquareState | RhombusState | KiteState | TrapState
  | CoordPlaneState | RegPolygonState
  | AngleState | AdjacentAngleState | ParallelLinesState | SegmentState | RayState

function stateToVals(st: AnyState): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(st)) {
    if (v && typeof v === 'object' && 'val' in v) out[k] = (v as { val: string }).val
    else if (k === 'vertexName' && typeof v === 'string') out.vertexName = v
  }
  return out
}

export default function App() {
  const [shape, setShape] = useState<ShapeKey | null>(null)
  const [shapeState, setShapeState] = useState<AnyState | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const selectShape = useCallback((key: ShapeKey) => {
    setShape(key)
    switch (key) {
      case 'right':       setShapeState(defaultRightState()); break
      case 'acute':
      case 'obtuse':
      case 'scalene':
      case 'isosceles':   setShapeState(defaultThreeAngleState()); break
      case 'equilateral': setShapeState(defaultEquilateralState()); break
      case 'parallelogram': setShapeState(defaultParaState()); break
      case 'rectangle':   setShapeState(defaultRectState()); break
      case 'square':      setShapeState(defaultSquareState()); break
      case 'rhombus':     setShapeState(defaultRhombusState()); break
      case 'kite':        setShapeState(defaultKiteState()); break
      case 'trapezoid':         setShapeState(defaultTrapIrregularState()); break
      case 'trapezoid-right':   setShapeState(defaultTrapRightState()); break
      case 'trapezoid-iso':     setShapeState(defaultTrapIsoState()); break
      case 'coord-plane':       setShapeState(defaultCoordPlaneState()); break
      case 'reg-polygon':       setShapeState(defaultRegPolygonState()); break
      case 'angle-acute':
      case 'angle-right':
      case 'angle-obtuse':      setShapeState(defaultAngleState()); break
      case 'angle-complementary':
      case 'angle-supplementary': setShapeState(defaultAdjacentAngleState()); break
      case 'angle-parallel':    setShapeState(defaultParallelLinesState()); break
      case 'segment':
      case 'segment-midpoint':  setShapeState(defaultSegmentState()); break
      case 'ray':               setShapeState(defaultRayState()); break
    }
  }, [])

  // ── Calculator ──────────────────────────────────────────────────────
  const calcResult = (() => {
    if (!shape || !shapeState) return null
    if (shape === 'coord-plane') return null
    const vals = stateToVals(shapeState)
    switch (shape) {
      case 'right':       return calcRight(vals)
      case 'acute':       return calcGeneral(vals, true, false)
      case 'obtuse':      return calcGeneral(vals, false, false)
      case 'scalene':     return calcGeneral(vals, false, false)
      case 'isosceles':   return calcGeneral(vals, false, true)
      case 'equilateral': return calcEquilateral(vals)
      case 'parallelogram': return calcPara(vals)
      case 'rectangle':   return calcRect(vals)
      case 'square':      return calcSquare(vals)
      case 'rhombus':           return calcRhombus(vals)
      case 'kite':              return calcKite(vals)
      case 'trapezoid':
      case 'trapezoid-right':
      case 'trapezoid-iso': {
        const ts = shapeState as import('./components/shapes/QuadShapes').TrapState
        return calcTrap({ ...vals, h: ts.hVal })
      }
      case 'coord-plane':       return null
      case 'reg-polygon':       return calcRegPolygonResults(shapeState as RegPolygonState)
      case 'angle-acute':
      case 'angle-right':
      case 'angle-obtuse':
      case 'angle-complementary':
      case 'angle-supplementary':
      case 'angle-parallel':
      case 'segment':
      case 'segment-midpoint':
      case 'ray':               return null
      default:            return null
    }
  })()

  // ── Export ──────────────────────────────────────────────────────────
  const handleExportPng = () => {
    if (!svgRef.current) return
    const svg = svgRef.current

    // Clone and replace all foreignObject (KaTeX) nodes with plain SVG text
    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

    clone.querySelectorAll('foreignObject').forEach(fo => {
      const x = parseFloat(fo.getAttribute('x') || '0')
      const w = parseFloat(fo.getAttribute('width') || '120')
      const y = parseFloat(fo.getAttribute('y') || '0')
      const cx = x + w / 2
      const cy = y + 22

      // Read visible text from KaTeX — skip sr-only spans
      const div = fo.querySelector('div')
      let txt = ''
      if (div) {
        // Clone the div, remove all sr-only elements, then read text
        const divClone = div.cloneNode(true) as HTMLElement
        divClone.querySelectorAll('.katex-sr-only, [aria-hidden="false"]').forEach(el => el.remove())
        // Get text from the katex-html span only
        const katexHtml = divClone.querySelector('.katex-html')
        txt = katexHtml ? katexHtml.textContent?.trim() ?? '' : divClone.textContent?.trim() ?? ''
      }

      if (txt) {
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        t.setAttribute('x', String(cx))
        t.setAttribute('y', String(cy))
        t.setAttribute('text-anchor', 'middle')
        t.setAttribute('dominant-baseline', 'middle')
        t.setAttribute('font-size', '18')
        t.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
        t.setAttribute('fill', '#1a1a19')
        t.textContent = txt
        fo.parentNode?.replaceChild(t, fo)
      } else {
        fo.parentNode?.removeChild(fo)
      }
    })

    // Serialize and render to canvas
    const serialized = new XMLSerializer().serializeToString(clone)
    const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const scale = 3
    const W = svg.width.baseVal.value * scale
    const H = svg.height.baseVal.value * scale

    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)

    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, W, H)
      URL.revokeObjectURL(url)
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = `geosketch-${shape || 'diagram'}.png`
      a.click()
    }
    img.onerror = (e) => {
      console.error('SVG render failed', e)
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const handleCopySvg = async () => {
    if (!svgRef.current) return
    const markup = new XMLSerializer().serializeToString(svgRef.current)
    await navigator.clipboard.writeText(markup)
  }

  // ── Render SVG content ──────────────────────────────────────────────
  const renderSvg = () => {
    if (!shape || !shapeState) return null
    const st = shapeState as any
    switch (shape) {
      case 'right':         return <RightTriangleSvg st={st} />
      case 'acute':         return <AcuteTriangleSvg st={st} />
      case 'obtuse':        return <ObtuseTriangleSvg st={st} />
      case 'scalene':       return <ScaleneTriangleSvg st={st} />
      case 'isosceles':     return <IsoscelesTriangleSvg st={st} />
      case 'equilateral':   return <EquilateralTriangleSvg st={st} />
      case 'parallelogram': return <ParallelogramSvg st={st} />
      case 'rectangle':     return <RectangleSvg st={st} />
      case 'square':        return <SquareSvg st={st} />
      case 'rhombus':           return <RhombusSvg st={st} />
      case 'kite':              return <KiteSvg st={st} />
      case 'trapezoid':         return <TrapIrregularSvg st={st} />
      case 'trapezoid-right':   return <TrapRightSvg st={st} />
      case 'trapezoid-iso':     return <TrapIsoSvg st={st} />
      case 'coord-plane':       return <CoordPlaneSvg st={st as CoordPlaneState} />
      case 'reg-polygon':       return <RegPolygonSvg st={st as RegPolygonState} />
      case 'angle-acute':           return <AcuteAngleSvg st={st as AngleState} />
      case 'angle-right':           return <RightAngleSvg st={st as AngleState} />
      case 'angle-obtuse':          return <ObtuseAngleSvg st={st as AngleState} />
      case 'angle-complementary':   return <ComplementaryAngleSvg st={st as AdjacentAngleState} />
      case 'angle-supplementary':   return <SupplementaryAngleSvg st={st as AdjacentAngleState} />
      case 'angle-parallel':        return <ParallelLinesSvg st={st as ParallelLinesState} />
      case 'segment':           return <SegmentSvg st={st as SegmentState} />
      case 'segment-midpoint':  return <SegmentMidpointSvg st={st as SegmentState} />
      case 'ray':               return <RaySvg st={st as RayState} />
      default:              return null
    }
  }

  // ── Render label panel ──────────────────────────────────────────────
  const renderPanel = () => {
    if (!shape || !shapeState) return null
    const st = shapeState as any
    const ch = (next: AnyState) => setShapeState(next)
    switch (shape) {
      case 'right':         return <RightTrianglePanel st={st} onChange={ch} />
      case 'acute':         return <ThreeAngleTriPanel st={st} onChange={ch} showHeight />
      case 'obtuse':        return <ThreeAngleTriPanel st={st} onChange={ch} showHeight />
      case 'scalene':       return <ThreeAngleTriPanel st={st} onChange={ch} showHeight />
      case 'isosceles':     return <ThreeAngleTriPanel st={st} onChange={ch} showHeight />
      case 'equilateral':   return <EquilateralPanel st={st} onChange={ch} />
      case 'parallelogram': return <ParaPanel st={st} onChange={ch} />
      case 'rectangle':     return <RectPanel st={st} onChange={ch} />
      case 'square':        return <SquarePanel st={st} onChange={ch} />
      case 'rhombus':           return <RhombusPanel st={st} onChange={ch} />
      case 'kite':              return <KitePanel st={st} onChange={ch} />
      case 'trapezoid':
      case 'trapezoid-right':
      case 'trapezoid-iso':     return <TrapPanel st={st} onChange={ch} />
      case 'coord-plane':       return <CoordPlanePanel st={st as CoordPlaneState} onChange={ch} />
      case 'reg-polygon':       return <RegPolygonPanel st={st as RegPolygonState} onChange={ch} />
      case 'angle-acute':
      case 'angle-right':
      case 'angle-obtuse':          return <AnglePanel st={st as AngleState} onChange={ch} />
      case 'angle-complementary':   return <AdjacentAnglePanel st={st as AdjacentAngleState} onChange={ch} totalLabel="90°" />
      case 'angle-supplementary':   return <AdjacentAnglePanel st={st as AdjacentAngleState} onChange={ch} totalLabel="180°" />
      case 'angle-parallel':        return <ParallelLinesPanel st={st as ParallelLinesState} onChange={ch} />
      case 'segment':           return <SegmentPanel st={st as SegmentState} onChange={ch} />
      case 'segment-midpoint':  return <SegmentPanel st={st as SegmentState} onChange={ch} isMidpoint />
      case 'ray':               return <RayPanel st={st as RayState} onChange={ch} />
      default:              return null
    }
  }

  const shapeTitle = shape
    ? shape.charAt(0).toUpperCase() + shape.slice(1).replace(/([A-Z])/g, ' $1')
    : 'Select a shape'

  return (
    <div className={styles.app}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <span className={styles.logo}>GeoSketch</span>
          <span className={styles.badge}>{shapeTitle}</span>
        </div>
        <div className={styles.topbarRight}>
          <button className={styles.btn} onClick={handleExportPng} disabled={!shape}>↓ PNG</button>
          <button className={styles.btn} onClick={handleCopySvg} disabled={!shape}>⎘ Copy SVG</button>
        </div>
      </header>

      <div className={styles.main}>
        {/* Left panel */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarTitle}>
              {shape ? 'Labels' : 'Shape library'}
            </span>
            {shape && (
              <button className={styles.changeBtn} onClick={() => { setShape(null); setShapeState(null) }}>
                Change
              </button>
            )}
          </div>
          {shape && <InsertBar />}
          <div className={styles.sidebarBody}>
            {shape
              ? renderPanel()
              : <ShapeLibrary current={shape} onSelect={selectShape} />
            }
          </div>
        </aside>

        {/* Canvas + calc */}
        <div className={styles.canvasArea}>
          <div className={styles.canvasWrap}>
            <div className={styles.canvasInner}>
              <svg
                ref={svgRef}
                width={520}
                height={340}
                viewBox="0 0 520 340"
                style={{ display: 'block', overflow: 'visible' }}
              >
                {renderSvg()}
              </svg>
            </div>
          </div>

          {calcResult && (
            <CalcPanel
              results={calcResult.results}
              warning={calcResult.warning}
            />
          )}
        </div>
      </div>
    </div>
  )
}
