import { formatDate, formatTime } from '../utils/format'

export const MEDALS = ['🥇', '🥈', '🥉']

const timeColumn = { label: 'Tiempo', className: 'time', render: (r) => formatTime(r.completion_time_ms) }
const deathsColumn = { label: 'Muertes', className: 'num', render: (r) => r.deaths }
const dateColumn = { label: 'Fecha', right: true, render: (r) => formatDate(r.created_at) }

export const rankingColumns = [
  { label: 'Pos', className: 'rank', render: (_r, i) => MEDALS[i] || i + 1 },
  { label: 'Jugador', render: (r) => <strong>{r.username || 'Anónimo'}</strong> },
  timeColumn,
  deathsColumn,
  dateColumn,
]

export const historyColumns = [
  { label: 'Nivel', render: (r) => <strong>{r.level_title || 'Nivel eliminado'}</strong> },
  timeColumn,
  deathsColumn,
  dateColumn,
]
