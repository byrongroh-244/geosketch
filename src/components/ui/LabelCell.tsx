import React from 'react'
import type { LabelState } from '../../types'
import styles from './LabelCell.module.css'

interface Props {
  id: string
  label: string
  state: LabelState
  placeholder?: string
  hasTicks?: boolean
  isAngle?: boolean
  onChange: (next: Partial<LabelState>) => void
}

export default function LabelCell({
  id, label, state, placeholder = 'e.g. 5', hasTicks = false, isAngle = false, onChange,
}: Props) {
  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (!isAngle) return
    const v = e.target.value.trim()
    if (v && !v.endsWith('°') && !v.includes('circ') && !v.includes('\\')) {
      onChange({ val: v + '°' })
    }
  }

  return (
    <div className={styles.cell}>
      <div className={styles.header}>
        <span className={styles.id}>{label}</span>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={state.on}
            onChange={e => onChange({ on: e.target.checked })}
          />
          <span className={styles.slider} />
        </label>
      </div>

      <input
        className={styles.input}
        type="text"
        id={`inp-${id}`}
        placeholder={placeholder}
        value={state.val}
        onChange={e => onChange({ val: e.target.value })}
        onBlur={handleBlur}
      />

      {hasTicks && (
        <select
          className={styles.tickSel}
          value={state.ticks}
          onChange={e => onChange({ ticks: +e.target.value as 0 | 1 | 2 | 3 })}
        >
          <option value={0}>No marks</option>
          <option value={1}>| Single</option>
          <option value={2}>|| Double</option>
          <option value={3}>||| Triple</option>
        </select>
      )}
    </div>
  )
}
