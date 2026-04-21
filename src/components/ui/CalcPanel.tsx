import React from 'react'
import { formatValue, formatAngle } from '../../utils/math'
import type { CalcResults } from '../../types'
import styles from './CalcPanel.module.css'

interface Props {
  results: CalcResults
  warning?: string
}

export default function CalcPanel({ results, warning }: Props) {
  const entries = Object.entries(results)

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Calculator</span>
        {warning && <span className={styles.warning}>{warning}</span>}
      </div>
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${entries.length}, 1fr)` }}
      >
        {entries.map(([key, result]) => {
          const formatted = result.isAngle
            ? formatAngle(result.value)
            : formatValue(result.value)

          const primary = result.isAngle
            ? formatted
            : formatted
            ? (formatted as { primary: string }).primary
            : null

          const secondary =
            !result.isAngle && formatted
              ? (formatted as { secondary: string | null }).secondary
              : null

          return (
            <div
              key={key}
              className={`${styles.card} ${result.given ? styles.given : ''}`}
            >
              <div className={styles.cardLabel}>{result.label}</div>
              <div
                className={`${styles.cardVal} ${
                  primary === null
                    ? styles.unknown
                    : result.given
                    ? ''
                    : styles.derived
                }`}
              >
                {primary ?? '—'}
              </div>
              {secondary && (
                <div className={styles.cardSub}>{secondary}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
