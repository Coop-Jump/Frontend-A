import { useRef } from 'react'
import { getTheme, isPlayableLevel } from '../game/theme'
import { usePhaserGame } from '../hooks/usePhaserGame'
import GameHud from './GameHud'
import GameControls from './GameControls'

function InvalidLevel() {
  return (
    <div className="panel notice notice-error">
      Este nivel no tiene un formato válido (faltan <code>grid_width</code>, <code>grid_height</code>, <code>spawn_j1</code> o{' '}
      <code>goal</code>), así que no se puede jugar.
    </div>
  )
}

function GameToolbar({ paused, onPause, onRestart }) {
  return (
    <div className="game-toolbar">
      <button type="button" className="btn btn-ghost btn-sm" onClick={onPause}>
        {paused ? '▶ Continuar' : '⏸ Pausa (P)'}
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onRestart}>↻ Reiniciar (R)</button>
    </div>
  )
}

export default function PhaserGame({ level, difficulty, mode = 'coop', onComplete }) {
  const containerRef = useRef(null)
  const playable = isPlayableLevel(level)
  const game = usePhaserGame({ containerRef, level, mode, difficulty, playable, onComplete })

  if (!playable) return <InvalidLevel />

  return (
    <div className="game-shell" style={{ '--accent': getTheme(difficulty).css }}>
      <GameHud hud={game.hud} mode={mode} />
      <div className="game-stage">
        <div ref={containerRef} className="game-canvas" />
        <GameToolbar paused={game.paused} onPause={game.togglePause} onRestart={game.restart} />
      </div>
      <GameControls mode={mode} />
    </div>
  )
}
