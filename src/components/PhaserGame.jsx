import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import MainScene, { GRAVITY } from '../game/MainScene'
import { VIEW } from '../game/textures'
import { CHARACTERS, getTheme, isPlayableLevel } from '../game/theme'
import { formatTime } from '../utils/format'

const EMPTY_HUD = { elapsed: 0, deaths: 0, score: 0, coins: 0, coinsTotal: 0, players: [] }

function Hud({ hud, mode }) {
  return (
    <div className="hud" role="status" aria-live="off">
      <div className="hud-item hud-time">
        <span className="hud-label">Tiempo</span>
        <strong>{formatTime(hud.elapsed)}</strong>
      </div>
      <div className="hud-item">
        <span className="hud-label">Muertes</span>
        <strong>💀 {hud.deaths}</strong>
      </div>
      <div className="hud-item">
        <span className="hud-label">Tesoros</span>
        <strong>⭐ {hud.coins}/{hud.coinsTotal}</strong>
      </div>
      <div className="hud-item">
        <span className="hud-label">Puntos</span>
        <strong>{hud.score}</strong>
      </div>
      {mode === 'coop' && (
        <div className="hud-item hud-players">
          {hud.players.map((p, i) => (
            <span key={p.charId} className={`hud-player ${p.reached ? 'done' : ''}`} style={{ '--c': CHARACTERS[i]?.color }}>
              {CHARACTERS[i]?.name} {p.reached ? '✓' : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PhaserGame({ level, difficulty, mode = 'coop', onComplete }) {
  const containerRef = useRef(null)
  const gameRef = useRef(null)
  const onCompleteRef = useRef(onComplete)
  const [hud, setHud] = useState(EMPTY_HUD)
  const [paused, setPaused] = useState(false)
  const playable = isPlayableLevel(level)
  const theme = getTheme(difficulty)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!containerRef.current || !playable) return

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      backgroundColor: '#0f172a',
      parent: containerRef.current,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: VIEW.width, height: VIEW.height },
      physics: { default: 'arcade', arcade: { gravity: { y: GRAVITY }, debug: false } },
      scene: [],
    })
    gameRef.current = game
    game.scene.add('MainScene', MainScene, true, { level, mode, difficulty })
    game.events.on('hud', setHud)
    game.events.on('pause-changed', setPaused)
    game.events.on('run-complete', (result) => onCompleteRef.current?.(result))

    return () => {
      gameRef.current = null
      game.destroy(true)
    }
  }, [level, mode, difficulty, playable])

  const scene = () => gameRef.current?.scene.getScene('MainScene')

  if (!playable) {
    return (
      <div className="panel notice notice-error">
        Este nivel no tiene un formato válido (faltan <code>grid_width</code>, <code>grid_height</code>, <code>spawn_j1</code> o{' '}
        <code>goal</code>), así que no se puede jugar.
      </div>
    )
  }

  return (
    <div className="game-shell" style={{ '--accent': theme.css }}>
      <Hud hud={hud} mode={mode} />

      <div className="game-stage">
        <div ref={containerRef} className="game-canvas" />
        <div className="game-toolbar">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => scene()?.togglePause()}>
            {paused ? '▶ Continuar' : '⏸ Pausa (P)'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => scene()?.restartLevel()}>
            ↻ Reiniciar (R)
          </button>
        </div>
      </div>

      <div className="controls panel">
        <h3>Controles</h3>
        <div className="controls-grid">
          {mode === 'coop' ? (
            <>
              <div className="control-card" style={{ '--c': CHARACTERS[0].color }}>
                <strong>{CHARACTERS[0].name} · Jugador 1</strong>
                <span><kbd>A</kbd> <kbd>D</kbd> mover · <kbd>W</kbd> saltar</span>
              </div>
              <div className="control-card" style={{ '--c': CHARACTERS[1].color }}>
                <strong>{CHARACTERS[1].name} · Jugador 2</strong>
                <span><kbd>←</kbd> <kbd>→</kbd> mover · <kbd>↑</kbd> saltar</span>
              </div>
            </>
          ) : (
            <div className="control-card" style={{ '--c': CHARACTERS[0].color }}>
              <strong>{CHARACTERS[0].name}</strong>
              <span><kbd>A</kbd> <kbd>D</kbd> o <kbd>←</kbd> <kbd>→</kbd> mover · <kbd>W</kbd> <kbd>↑</kbd> <kbd>Espacio</kbd> saltar</span>
            </div>
          )}
          <div className="control-card">
            <strong>Objetivo</strong>
            <span>
              {mode === 'coop' ? 'Los dos personajes deben llegar a la bandera. ' : 'Llega a la bandera. '}
              Evita pinchos y lava, junta tesoros.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
