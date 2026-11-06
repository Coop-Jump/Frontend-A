import { useState, useCallback, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PhaserGame from '../components/PhaserGame'
import { fetchLevelById } from '../services/levelService'
import { submitRun } from '../services/runService'

function formatTime(ms) {
  const total = Math.floor(ms / 1000)
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  const cs = String(Math.floor((ms % 1000) / 10)).padStart(2, '0')
  return `${m}:${s}.${cs}`
}

export default function Game() {
  const [searchParams] = useSearchParams()
  const levelId = searchParams.get('level')

  const [level, setLevel] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [result, setResult] = useState(null) // { completionTimeMs, deaths }
  const [status, setStatus] = useState('idle') // idle | sending | saved | error
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLevel(null)
    setLoadError('')
    fetchLevelById(levelId)
      .then((data) => {
        if (!cancelled) setLevel(data.level)
      })
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

  if (result) {
    return (
      <div className="page">
        <h1>¡Victoria!</h1>
        <p>Tiempo: <strong>{formatTime(result.completionTimeMs)}</strong></p>
        <p>Muertes: <strong>{result.deaths}</strong></p>

        {status === 'sending' && <p>Guardando partida...</p>}
        {status === 'saved' && <p>Partida guardada correctamente.</p>}
        {status === 'error' && (
          <p>
            {error} <button onClick={() => send(result)}>Reintentar</button>
          </p>
        )}

        <button onClick={replay}>Jugar de nuevo</button>{' '}
        <Link to="/leaderboard">Ver leaderboard</Link>{' '}
        <Link to="/levels">Niveles</Link>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="page">
        <h1>Error</h1>
        <p>{loadError}</p>
        <Link to="/levels">Volver a niveles</Link>
      </div>
    )
  }

  if (!level) {
    return (
      <div className="page">
        <h1>Cargando nivel...</h1>
      </div>
    )
  }

  return (
    <div className="page">
      <h2>{level.title}</h2>
      <p>Flechas / WASD para moverte, espacio para saltar. Evita lo rojo y llega a la meta verde.</p>
      <PhaserGame key={attempt} level={level.grid_json} onComplete={handleComplete} />
    </div>
  )
}
