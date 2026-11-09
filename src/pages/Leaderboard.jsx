import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchLevels } from '../services/levelService'
import { fetchLevelRuns, fetchMyRuns } from '../services/runService'

const th = { padding: 16, fontSize: 16, fontWeight: 700 }
const td = { padding: 16 }

function formatTime(ms) {
  const n = Number(ms)
  const total = Math.floor(n / 1000)
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  const cs = String(Math.floor((n % 1000) / 10)).padStart(2, '0')
  return `${m}:${s}.${cs}`
}

function formatDate(iso) {
  return iso ? new Date(iso).toLocaleString() : '-'
}

function RunsTable({ columns, rows, empty }) {
  if (rows.length === 0) return <p style={{ color: '#c2410c' }}>{empty}</p>
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 30px rgba(249,115,22,0.15)', border: '1px solid #ffedd5' }}>
      <thead style={{ background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)', color: '#fff' }}>
        <tr>
          {columns.map((c) => (
            <th key={c.label} style={{ ...th, textAlign: c.right ? 'right' : 'left' }}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody style={{ color: '#1a202c' }}>
        {rows.map((row, i) => (
          <tr key={row.id} style={{ borderBottom: '1px solid #ffedd5', background: i % 2 === 0 ? '#fff' : '#fff7ed' }}>
            {columns.map((c) => (
              <td key={c.label} style={{ ...td, textAlign: c.right ? 'right' : 'left', ...(c.style || {}) }}>
                {c.render(row, i)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const rankingColumns = [
  { label: 'Pos', render: (_r, i) => i + 1, style: { fontWeight: 'bold', color: '#f97316', fontSize: 18 } },
  { label: 'Jugador', render: (r) => r.username || 'Anónimo', style: { fontWeight: 600 } },
  { label: 'Tiempo', render: (r) => formatTime(r.completion_time_ms), style: { fontWeight: 800, color: '#c2410c' } },
  { label: 'Muertes', render: (r) => r.deaths },
  { label: 'Fecha', render: (r) => formatDate(r.created_at), right: true },
]

const historyColumns = [
  { label: 'Nivel', render: (r) => r.level_title || 'Nivel eliminado', style: { fontWeight: 600 } },
  { label: 'Tiempo', render: (r) => formatTime(r.completion_time_ms), style: { fontWeight: 800, color: '#c2410c' } },
  { label: 'Muertes', render: (r) => r.deaths },
  { label: 'Fecha', render: (r) => formatDate(r.created_at), right: true },
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
      })
      .catch((err) => setError(errMsg(err, 'No se pudieron cargar los niveles.')))
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

  const tabStyle = (active) => ({
    padding: '10px 22px',
    borderRadius: 10,
    border: '2px solid #f97316',
    background: active ? '#f97316' : '#fff',
    color: active ? '#fff' : '#f97316',
    fontWeight: 800,
    cursor: 'pointer',
  })

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff 0%, #fff5eb 100%)', padding: 30 }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 42, color: '#f97316', fontWeight: 900, marginBottom: 4 }}>Leaderboard</h1>
        <p style={{ color: '#c2410c', marginBottom: 20, fontWeight: 500 }}>Ranking por nivel e historial de tus partidas</p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button style={tabStyle(tab === 'ranking')} onClick={() => setTab('ranking')}>Ranking</button>
          <button style={tabStyle(tab === 'history')} onClick={() => setTab('history')}>Mis partidas</button>
        </div>

        {tab === 'ranking' && (
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="level" style={{ color: '#c2410c', fontWeight: 600, marginRight: 10 }}>Nivel:</label>
            <select
              id="level"
              value={levelId}
              onChange={(e) => setLevelId(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: '2px solid #ffedd5', background: '#fff7ed', color: '#1a202c', fontSize: 16 }}
            >
              {levels.map((l) => (
                <option key={l.id} value={l.id}>{l.title} ({l.difficulty})</option>
              ))}
            </select>
          </div>
        )}

        {error && <p style={{ color: '#e53e3e', fontWeight: 600 }}>{error}</p>}
        {loading && !error && <p style={{ color: '#f97316', fontWeight: 600 }}>Cargando...</p>}

        {!loading && !error && tab === 'ranking' && (
          <RunsTable columns={rankingColumns} rows={ranking} empty="Todavía nadie completó este nivel." />
        )}
        {!loading && !error && tab === 'history' && (
          <RunsTable columns={historyColumns} rows={history} empty="Todavía no completaste ninguna partida." />
        )}

        <div style={{ marginTop: 30, textAlign: 'center' }}>
          <Link to="/dashboard" style={{ display: 'inline-block', padding: '12px 30px', background: '#f97316', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: 16, boxShadow: '0 6px 20px rgba(249,115,22,0.3)' }}>Volver al Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
