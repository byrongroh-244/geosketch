import { toPng } from 'html-to-image'

/**
 * Export the SVG element as a PNG using html-to-image,
 * which correctly handles foreignObject (KaTeX) elements.
 */
export async function exportPng(svgEl: SVGSVGElement): Promise<void> {
  // Wrap in a div so html-to-image can process it
  const wrapper = document.createElement('div')
  wrapper.style.background = '#ffffff'
  wrapper.style.display = 'inline-block'
  wrapper.style.padding = '32px'
  wrapper.appendChild(svgEl.cloneNode(true))
  document.body.appendChild(wrapper)

  try {
    const dataUrl = await toPng(wrapper, {
      quality: 1,
      pixelRatio: 3, // 3x resolution for print quality
      backgroundColor: '#ffffff',
    })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'geosketch.png'
    a.click()
  } finally {
    document.body.removeChild(wrapper)
  }
}

/**
 * Copy SVG markup to clipboard.
 */
export async function copySvg(svgEl: SVGSVGElement): Promise<void> {
  const markup = new XMLSerializer().serializeToString(svgEl)
  await navigator.clipboard.writeText(markup)
}
