import React from 'react'
import styles from './InsertBar.module.css'

const INSERTS = [
  { display: '√',  insert: '\\sqrt{}', cursor: 1 },
  { display: 'x²', insert: '^2',       cursor: 0 },
  { display: 'x³', insert: '^3',       cursor: 0 },
  { display: 'θ',  insert: '\\theta',  cursor: 0 },
  { display: 'π',  insert: '\\pi',     cursor: 0 },
] as const

/**
 * Sticky bar of quick-insert math buttons.
 * Inserts LaTeX at the cursor position of whichever <input> is currently focused.
 */
export default function InsertBar() {
  function insertIntoFocused(ins: string, cursorFromEnd: number) {
    const el = document.activeElement as HTMLInputElement | null
    if (!el || el.tagName !== 'INPUT' || el.type === 'number') return
    const start = el.selectionStart ?? el.value.length
    const end   = el.selectionEnd   ?? el.value.length
    const next  = el.value.slice(0, start) + ins + el.value.slice(end)
    // Dispatch a native input event so React state updates
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    )?.set
    nativeInputValueSetter?.call(el, next)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + ins.length - cursorFromEnd
      el.setSelectionRange(pos, pos)
    })
  }

  return (
    <div className={styles.bar}>
      <span className={styles.hint}>Insert:</span>
      {INSERTS.map(btn => (
        <button
          key={btn.display}
          className={styles.btn}
          type="button"
          tabIndex={-1}
          onMouseDown={e => {
            // Don't steal focus from the input
            e.preventDefault()
            insertIntoFocused(btn.insert, btn.cursor)
          }}
        >
          {btn.display}
        </button>
      ))}
    </div>
  )
}
