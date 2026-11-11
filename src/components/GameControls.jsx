import { CHARACTERS } from '../game/theme'

function ControlCard({ color, title, children }) {
  return (
    <div className="control-card" style={color ? { '--c': color } : undefined}>
      <strong>{title}</strong>
      <span>{children}</span>
    </div>
  )
}

function CoopControls() {
  return (
    <>
      <ControlCard color={CHARACTERS[0].color} title={`${CHARACTERS[0].name} · Jugador 1`}>
        <kbd>A</kbd> <kbd>D</kbd> mover · <kbd>W</kbd> saltar
      </ControlCard>
      <ControlCard color={CHARACTERS[1].color} title={`${CHARACTERS[1].name} · Jugador 2`}>
        <kbd>←</kbd> <kbd>→</kbd> mover · <kbd>↑</kbd> saltar
      </ControlCard>
    </>
  )
}

function SingleControls() {
  return (
    <ControlCard color={CHARACTERS[0].color} title={CHARACTERS[0].name}>
      <kbd>A</kbd> <kbd>D</kbd> o <kbd>←</kbd> <kbd>→</kbd> mover · <kbd>W</kbd> <kbd>↑</kbd> <kbd>Espacio</kbd> saltar
    </ControlCard>
  )
}

export default function GameControls({ mode }) {
  const coop = mode === 'coop'
  return (
    <div className="controls panel">
      <h3>Controles</h3>
      <div className="controls-grid">
        {coop ? <CoopControls /> : <SingleControls />}
        <ControlCard title="Objetivo">
          {coop ? 'Los dos personajes deben llegar a la bandera. ' : 'Llega a la bandera. '}
          Evita pinchos y lava, junta tesoros.
        </ControlCard>
      </div>
    </div>
  )
}
