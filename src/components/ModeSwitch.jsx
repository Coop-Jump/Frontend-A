const MODES = [
  { id: 'single', label: '👤 Un jugador' },
  { id: 'coop', label: '👥 Cooperativo' },
]

export default function ModeSwitch({ mode, onChange }) {
  return (
    <div className="mode-switch" role="tablist" aria-label="Modo de juego">
      {MODES.map((m) => (
        <button key={m.id} type="button" role="tab" aria-selected={mode === m.id}
          className={mode === m.id ? 'active' : ''} onClick={() => onChange(m.id)}>
          {m.label}
        </button>
      ))}
    </div>
  )
}
