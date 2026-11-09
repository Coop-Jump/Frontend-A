import { useEffect, useState } from 'react'
import { fetchLevels } from '../services/levelService'
import { fetchLevelRuns, fetchMyRuns } from '../services/runService'
import { formatDate, formatTime } from '../utils/format'

const MEDALS = ['🥇', '🥈', '🥉']

function Podium({ rows }) {
  if (rows.length === 0) return null
  // Orden visual: 2.º, 1.º, 3.º
  const order = [1, 0, 2].filter((i) => rows[i])
  return (
    <div className="podium" aria-label="Podio">
      {order.map((i) => (
        <div key={rows[i].id} className={`podium-step p${i + 1}`}>
          <div className="medal">{MEDALS[i]}</div>
          <div className="name">{rows[i].username || 'Anónimo'}</div>
          <div className="time">{formatTime(rows[i].completion_time_ms)}</div>
          <div className="sub">{rows[i].deaths} muertes</div>
        </div>
      ))}
    </div>
  )
}

function RunsTable({ columns, rows, empty }) {
  if (rows.length === 0) {
    return (
      <div className="panel empty">
        <strong>Sin datos todavía</strong>
        {empty}
      </div>
    )
  }
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.label} className={c.right ? 'right' : ''}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id}>
              {columns.map((c) => (
                <td key={c.label} className={`${c.right ? 'right' : ''} ${c.className || ''}`}>{c.render(row, i)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const rankingColumns = [
  { label: 'Pos', className: 'rank', render: (_r, i) => MEDALS[i] || i + 1 },
  { label: 'Jugador', render: (r) => <strong>{r.username || 'Anónimo'}</strong> },
  { label: 'Tiempo', className: 'time', render: (r) => formatTime(r.completion_time_ms) },
  { label: 'Muertes', className: 'num', render: (r) => r.deaths },
  { label: 'Fecha', right: true, render: (r) => formatDate(r.created_at) },
]

const historyColumns = [
  { label: 'Nivel', render: (r) => <strong>{r.level_title || 'Nivel eliminado'}</strong> },
  { label: 'Tiempo', className: 'time', render: (r) => formatTime(r.completion_time_ms) },
  { label: 'Muertes', className: 'num', render: (r) => r.deaths },
  { label: 'Fecha', right: true, render: (r) => formatDate(r.created_at) },
]

export default function Leaderboard() {
  const [tab, setTab] = useState('ranking')
  const [levels, setLevels] = useState([])
  const [levelId, setLevelId] = useState('')
  const [ranking, setRanking] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const errMsg = (err, fallback) => err?.response?.data?.message || fallback

  // Niveles disponibles (selecciona el primero por defecto)
  useEffect(() => {
    fetchLevels()
      .then((data) => {
        setLevels(data.levels || [])
        setLevelId(data.levels?.[0]?.id || '')
        if (!data.levels?.length) setLoading(false)
      })
      .catch((err) => {
        setError(errMsg(err, 'No se pudieron cargar los niveles.'))
        setLoading(false)
      })
  }, [])

  // GET /levels/:id/runs al cambiar de nivel
  useEffect(() => {
    if (!levelId) return
    let cancelled = false
    setLoading(true)
    setError('')
    fetchLevelRuns(levelId)
      .then((runs) => !cancelled && setRanking(runs))
      .catch((err) => !cancelled && setError(errMsg(err, 'No se pudo cargar el ranking.')))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [levelId])

  // GET /levels/users/me/runs al abrir la pestaña de historial
  useEffect(() => {
    if (tab !== 'history') return
    let cancelled = false
    setLoading(true)
    setError('')
    fetchMyRuns()
      .then((runs) => !cancelled && setHistory(runs))
      .catch((err) => !cancelled && setError(errMsg(err, 'No se pudo cargar tu historial.')))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [tab])

  return (
    <>
      <div className="page-header">
        <p className="eyebrow">Competencia</p>
        <h1>Ranking</h1>
        <p>Mejores tiempos por nivel e historial de tus partidas.</p>
      </div>

      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'ranking'} className={tab === 'ranking' ? 'active' : ''} onClick={() => setTab('ranking')}>🏆 Ranking</button>
        <button type="button" role="tab" aria-selected={tab === 'history'} className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>📜 Mis partidas</button>
      </div>

      {tab === 'ranking' && levels.length > 0 && (
        <div className="toolbar">
          <label htmlFor="level" style={{ fontWeight: 600, color: 'var(--text-dim)' }}>Nivel</label>
          <select id="level" className="input" value={levelId} onChange={(e) => setLevelId(e.target.value)}>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>{l.title} ({l.difficulty})</option>
            ))}
          </select>
        </div>
      )}

      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {loading && !error && <div className="loader"><span className="spinner" /> Cargando...</div>}

      {!loading && !error && tab === 'ranking' && (
        <>
          <Podium rows={ranking} />
          <RunsTable columns={rankingColumns} rows={ranking} empty="Todavía nadie completó este nivel. ¡Sé el primero!" />
        </>
      )}
      {!loading && !error && tab === 'history' && (
        <RunsTable columns={historyColumns} rows={history} empty="Todavía no completaste ninguna partida." />
      )}
    </>
  )
}
