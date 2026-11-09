import { useState, useCallback, useEffect } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import PhaserGame from '../components/PhaserGame'
import { fetchLevelById } from '../services/levelService'
import { submitRun } from '../services/runService'
import { getTheme } from '../game/theme'
import { formatTime } from '../utils/format'

export default function Game() {
  const [searchParams] = useSearchParams()
  const levelId = searchParams.get('level')
  const mode = searchParams.get('mode') === 'single' ? 'single' : 'coop'

  const [level, setLevel] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [result, setResult] = useState(null) // { completionTimeMs, deaths, score, coins, coinsTotal }
  const [status, setStatus] = useState('idle') // idle | sending | saved | error
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!levelId) return
    let cancelled = false
    setLevel(null)
    setLoadError('')
    fetchLevelById(levelId)
      .then((data) => !cancelled && setLevel(data.level))
      .catch((err) => {
        if (!cancelled) setLoadError(err?.response?.data?.message || 'No se pudo cargar el nivel.')
      })
    return () => {
      cancelled = true
    }
  }, [levelId])

  const send = useCallback(
    async (res) => {
      setStatus('sending')
      setError('')
      try {
        await submitRun({ levelId, completionTimeMs: res.completionTimeMs, deaths: res.deaths })
        setStatus('saved')
      } catch (err) {
        setError(err?.response?.data?.message || 'No se pudo guardar la partida.')
        setStatus('error')
      }
    },
    [levelId],
  )

  const handleComplete = useCallback(
    (res) => {
      setResult(res)
      send(res)
    },
    [send],
  )

  const replay = () => {
    setResult(null)
    setStatus('idle')
    setAttempt((a) => a + 1)
  }

  // Sin ?level= no hay nada que jugar: vuelve a la selección.
  if (!levelId) return <Navigate to={`/levels?mode=${mode}`} replace />

  if (loadError) {
    return (
      <div className="panel victory">
        <h1 style={{ fontSize: 34, background: 'none', color: 'var(--text)' }}>No se pudo abrir el nivel</h1>
        <p className="notice notice-error" style={{ margin: '18px 0' }} role="alert">{loadError}</p>
        <Link to={`/levels?mode=${mode}`} className="btn btn-primary">Volver a niveles</Link>
      </div>
    )
  }

  if (!level) {
    return <div className="loader"><span className="spinner" /> Cargando nivel...</div>
  }

  const theme = getTheme(level.difficulty)

  if (result) {
    return (
      <div className="panel victory" style={{ '--accent': theme.css }}>
        <span className="trophy" aria-hidden="true">🏆</span>
        <h1>¡Nivel completado!</h1>
        <p style={{ color: 'var(--text-dim)' }}>{level.title}</p>

        <div className="stats">
          <div className="stat"><span>Tiempo</span><strong>{formatTime(result.completionTimeMs)}</strong></div>
          <div className="stat"><span>Muertes</span><strong>{result.deaths}</strong></div>
          <div className="stat"><span>Tesoros</span><strong>{result.coins}/{result.coinsTotal}</strong></div>
          <div className="stat"><span>Puntos</span><strong>{result.score}</strong></div>
        </div>

        {status === 'sending' && <p className="notice notice-info">Guardando partida...</p>}
        {status === 'saved' && <p className="notice notice-success">Partida guardada en el ranking.</p>}
        {status === 'error' && (
          <p className="notice notice-error" role="alert">
            {error}{' '}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => send(result)}>Reintentar</button>
          </p>
        )}

        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={replay}>↻ Jugar de nuevo</button>
          <Link to="/leaderboard" className="btn btn-secondary">🏆 Ver ranking</Link>
          <Link to={`/levels?mode=${mode}`} className="btn btn-ghost">Niveles</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="game-page">
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
      <PhaserGame key={attempt} level={level.grid_json} difficulty={level.difficulty} mode={mode} onComplete={handleComplete} />
    </div>
  )
}
