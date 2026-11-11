import { useState } from 'react'
import { fetchLevels } from '../services/levelService'
import { fetchLevelRuns, fetchMyRuns } from '../services/runService'
import { useAsync } from '../hooks/useAsync'
import { formatTime } from '../utils/format'
import Podium from '../components/Podium'
import RunsTable from '../components/RunsTable'
import { TabBar, LevelPicker } from '../components/LeaderboardTabs'
import { rankingColumns, historyColumns } from '../components/runColumns'

function RankingView({ rows }) {
  const withTime = rows.map((r) => ({ ...r, formattedTime: formatTime(r.completion_time_ms) }))
  return (
    <>
      <Podium rows={withTime} />
      <RunsTable columns={rankingColumns} rows={rows} empty="Todavía nadie completó este nivel. ¡Sé el primero!" />
    </>
  )
}

function HistoryView({ rows }) {
  return <RunsTable columns={historyColumns} rows={rows} empty="Todavía no completaste ninguna partida." />
}

function useLeaderboard() {
  const [tab, setTab] = useState('ranking')
  const [selected, setSelected] = useState('')
  const levels = useAsync(fetchLevels, 'levels', { fallback: 'No se pudieron cargar los niveles.' })
  const list = levels.data?.levels || []
  const levelId = selected || list[0]?.id || ''
  const ranking = useAsync(() => fetchLevelRuns(levelId), levelId, { enabled: Boolean(levelId), fallback: 'No se pudo cargar el ranking.' })
  const history = useAsync(fetchMyRuns, 'me', { enabled: tab === 'history', fallback: 'No se pudo cargar tu historial.' })
  const active = tab === 'ranking' ? ranking : history
  return { tab, setTab, list, levelId, setSelected, ranking, history, levels, active }
}

function Feedback({ error, loading }) {
  if (error) return <p className="notice notice-error" role="alert">{error}</p>
  if (loading) return <div className="loader"><span className="spinner" /> Cargando...</div>
  return null
}

function LeaderboardBody({ lb }) {
  const error = lb.levels.error || lb.active.error
  const loading = lb.levels.loading || lb.active.loading
  if (error || loading) return <Feedback error={error} loading={loading} />
  if (lb.tab === 'ranking') return <RankingView rows={lb.ranking.data || []} />
  return <HistoryView rows={lb.history.data || []} />
}

export default function Leaderboard() {
  const lb = useLeaderboard()

  return (
    <>
      <div className="page-header">
        <p className="eyebrow">Competencia</p>
        <h1>Ranking</h1>
        <p>Mejores tiempos por nivel e historial de tus partidas.</p>
      </div>
      <TabBar tab={lb.tab} onChange={lb.setTab} />
      {lb.tab === 'ranking' && <LevelPicker levels={lb.list} value={lb.levelId} onChange={lb.setSelected} />}
      <LeaderboardBody lb={lb} />
    </>
  )
}
