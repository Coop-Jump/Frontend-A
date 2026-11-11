import { Link } from 'react-router-dom'
import { getTheme } from '../game/theme'
import { formatTime } from '../utils/format'

function Stat({ label, value }) {
  return <div className="stat"><span>{label}</span><strong>{value}</strong></div>
}

function SaveStatus({ run }) {
  if (run.status === 'sending') return <p className="notice notice-info">Guardando partida...</p>
  if (run.status === 'saved') return <p className="notice notice-success">Partida guardada en el ranking.</p>
  if (run.status !== 'error') return null
  return (
    <p className="notice notice-error" role="alert">
      {run.error}{' '}
      <button type="button" className="btn btn-ghost btn-sm" onClick={run.retry}>Reintentar</button>
    </p>
  )
}

function ResultStats({ result }) {
  return (
    <div className="stats">
      <Stat label="Tiempo" value={formatTime(result.completionTimeMs)} />
      <Stat label="Muertes" value={result.deaths} />
      <Stat label="Tesoros" value={`${result.coins}/${result.coinsTotal}`} />
      <Stat label="Puntos" value={result.score} />
    </div>
  )
}

export default function VictoryPanel({ level, mode, run, onReplay }) {
  return (
    <div className="panel victory" style={{ '--accent': getTheme(level.difficulty).css }}>
      <span className="trophy" aria-hidden="true">🏆</span>
      <h1>¡Nivel completado!</h1>
      <p style={{ color: 'var(--text-dim)' }}>{level.title}</p>
      <ResultStats result={run.result} />
      <SaveStatus run={run} />
      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={onReplay}>↻ Jugar de nuevo</button>
        <Link to="/leaderboard" className="btn btn-secondary">🏆 Ver ranking</Link>
        <Link to={`/levels?mode=${mode}`} className="btn btn-ghost">Niveles</Link>
      </div>
    </div>
  )
}
