import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import PhaserGame from '../components/PhaserGame'
import VictoryPanel from '../components/VictoryPanel'
import { fetchLevelById } from '../services/levelService'
import { getTheme } from '../game/theme'
import { useAsync } from '../hooks/useAsync'
import { useRunSubmit } from '../hooks/useRunSubmit'

function LevelError({ message, mode }) {
  return (
    <div className="panel victory">
      <h1 style={{ fontSize: 34, background: 'none', color: 'var(--text)' }}>No se pudo abrir el nivel</h1>
      <p className="notice notice-error" style={{ margin: '18px 0' }} role="alert">{message}</p>
      <Link to={`/levels?mode=${mode}`} className="btn btn-primary">Volver a niveles</Link>
    </div>
  )
}

function GameHeader({ level, mode }) {
  const theme = getTheme(level.difficulty)
  return (
    <div className="game-header">
      <div>
        <h1>{level.title}</h1>
        <div className="meta" style={{ '--accent': theme.css }}>
          <span className="badge" style={{ '--accent': theme.css }}>{theme.label}</span>
          <span>{mode === 'coop' ? '👥 Cooperativo' : '👤 Un jugador'}</span>
        </div>
      </div>
      <Link to={`/levels?mode=${mode}`} className="btn btn-ghost btn-sm">← Salir al menú</Link>
    </div>
  )
}

// Partida de un nivel ya cargado: juego, resultado y reintento.
function GameSession({ level, mode }) {
  const [attempt, setAttempt] = useState(0)
  const run = useRunSubmit(level.id)
  const replay = () => {
    run.reset()
    setAttempt((a) => a + 1)
  }

  if (run.result) return <VictoryPanel level={level} mode={mode} run={run} onReplay={replay} />
  return (
    <div className="game-page">
      <GameHeader level={level} mode={mode} />
      <PhaserGame key={attempt} level={level.grid_json} difficulty={level.difficulty} mode={mode} onComplete={run.complete} />
    </div>
  )
}

export default function Game() {
  const [searchParams] = useSearchParams()
  const levelId = searchParams.get('level')
  const mode = searchParams.get('mode') === 'single' ? 'single' : 'coop'
  const loaded = useAsync(() => fetchLevelById(levelId), levelId, { enabled: Boolean(levelId), fallback: 'No se pudo cargar el nivel.' })

  // Sin ?level= no hay nada que jugar: vuelve a la selección.
  if (!levelId) return <Navigate to={`/levels?mode=${mode}`} replace />
  if (loaded.error) return <LevelError message={loaded.error} mode={mode} />
  if (!loaded.data?.level) return <div className="loader"><span className="spinner" /> Cargando nivel...</div>
  return <GameSession level={loaded.data.level} mode={mode} />
}
