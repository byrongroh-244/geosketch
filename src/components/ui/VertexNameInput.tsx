import React from 'react'

interface Props {
  value: string
  n: number          // number of vertices expected
  onChange: (v: string) => void
  placeholder?: string
}

export default function VertexNameInput({ value, n, onChange, placeholder }: Props) {
  const ph = placeholder ?? Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i)).join('')
  const chars = Array.from({ length: n }, (_, i) => value.trim()[i] ?? '')

  return (
    <div style={{
      background: 'var(--bg)', border: '0.5px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '8px 10px', marginBottom: 6,
    }}>
      <input
        type="text"
        value={value}
        placeholder={ph}
        maxLength={n + 4}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', fontSize: 16, fontWeight: 600,
          padding: '5px 8px', border: '0.5px solid var(--border)',
          borderRadius: 5, background: 'var(--bg2)', color: 'var(--blue)',
          outline: 'none', letterSpacing: '0.12em', textAlign: 'center',
          fontFamily: 'var(--font)',
        }}
      />
      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 5, textAlign: 'center' }}>
        {!value.trim()
          ? `Type ${n} characters, e.g. ${ph}`
          : chars.map((c, i) => `${String.fromCharCode(65 + i)}=${c || '?'}`).join('  ')}
      </div>
    </div>
  )
}
