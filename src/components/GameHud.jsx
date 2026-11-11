import { CHARACTERS } from '../game/theme'
import { formatTime } from '../utils/format'

function HudItem({ label, className = '', children }) {
  return (
    <div className={`hud-item ${className}`}>
      <span className="hud-label">{label}</span>
      <strong>{children}</strong>
    </div>
  )
}

function PlayerStatus({ player, index }) {
  const character = CHARACTERS[index]
  return (
    <span className={`hud-player ${player.reached ? 'done' : ''}`} style={{ '--c': character?.color }}>
      {character?.name} {player.reached ? '✓' : ''}
    </span>
  )
}

export default function GameHud({ hud, mode }) {
  return (
    <div className="hud" role="status" aria-live="off">
      <HudItem label="Tiempo" className="hud-time">{formatTime(hud.elapsed)}</HudItem>
      <HudItem label="Muertes">💀 {hud.deaths}</HudItem>
      <HudItem label="Tesoros">⭐ {hud.coins}/{hud.coinsTotal}</HudItem>
      <HudItem label="Puntos">{hud.score}</HudItem>
      {mode === 'coop' && (
        <div className="hud-item hud-players">
          {hud.players.map((p, i) => <PlayerStatus key={p.charId} player={p} index={i} />)}
        </div>
      )}
    </div>
  )
}
