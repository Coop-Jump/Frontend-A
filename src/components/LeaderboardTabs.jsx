const TABS = [
  { id: 'ranking', label: '🏆 Ranking' },
  { id: 'history', label: '📜 Mis partidas' },
]

export function TabBar({ tab, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {TABS.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={tab === t.id}
          className={tab === t.id ? 'active' : ''} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function LevelPicker({ levels, value, onChange }) {
  if (levels.length === 0) return null
  return (
    <div className="toolbar">
      <label htmlFor="level" style={{ fontWeight: 600, color: 'var(--text-dim)' }}>Nivel</label>
      <select id="level" className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {levels.map((l) => <option key={l.id} value={l.id}>{l.title} ({l.difficulty})</option>)}
      </select>
    </div>
  )
}
