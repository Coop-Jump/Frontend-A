import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchLevels } from '../services/levelService'
import { getTheme } from '../game/theme'
import LevelPreview from '../components/LevelPreview'

const MODES = [
  { id: 'single', label: '👤 Un jugador' },
  { id: 'coop', label: '👥 Cooperativo' },
]

export default function LevelSelection() {
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = searchParams.get('mode') === 'single' ? 'single' : 'coop'

  useEffect(() => {
    let cancelled = false
    fetchLevels()
      .then((data) => !cancelled && setLevels(data.levels || []))
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || 'No se pudieron cargar los niveles. Revisa que el backend esté en ejecución.')
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <div className="page-header">
        <p className="eyebrow">Mapas</p>
        <h1>Selecciona un nivel</h1>
        <p>Elige el modo de juego y el mapa que quieres superar.</p>
      </div>

      <div className="mode-switch" role="tablist" aria-label="Modo de juego">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            className={mode === m.id ? 'active' : ''}
            onClick={() => setSearchParams({ mode: m.id }, { replace: true })}
          >
            {m.label}
          </button>
        ))}
      </div>

      {loading && <div className="loader"><span className="spinner" /> Cargando niveles...</div>}
      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {!loading && !error && levels.length === 0 && (
        <div className="panel empty">
          <strong>Todavía no hay niveles</strong>
          Crea el primero desde el <Link to="/admin">editor de niveles</Link>.
        </div>
      )}

      {!loading && !error && levels.length > 0 && (
        <div className="levels-grid">
          {levels.map((level, i) => {
            const theme = getTheme(level.difficulty)
            const grid = level.grid_json || {}
            const treasures = (grid.collectibles || []).length
            const hazards = (grid.hazards || []).length
            return (
              <article key={level.id} className="level-card" style={{ '--accent': theme.css }}>
                <div className="thumb">
                  <LevelPreview grid={grid} difficulty={level.difficulty} />
                  <span className="badge">{theme.label}</span>
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="body">
                  <h3>{level.title}</h3>
                  <div className="level-stats">
                    <span>📐 {grid.grid_width || '?'}×{grid.grid_height || '?'}</span>
                    <span>⭐ {treasures} tesoros</span>
                    <span>⚠️ {hazards} peligros</span>
                  </div>
                  <Link to={`/game?level=${level.id}&mode=${mode}`} className="btn btn-primary btn-block">▶ Jugar</Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
