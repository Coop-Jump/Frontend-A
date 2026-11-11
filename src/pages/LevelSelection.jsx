import { Link, useSearchParams } from 'react-router-dom'
import { fetchLevels } from '../services/levelService'
import { useAsync } from '../hooks/useAsync'
import LevelCard from '../components/LevelCard'
import ModeSwitch from '../components/ModeSwitch'

const LOAD_ERROR = 'No se pudieron cargar los niveles. Revisa que el backend esté en ejecución.'

function NoLevels() {
  return (
    <div className="panel empty">
      <strong>Todavía no hay niveles</strong>
      Crea el primero desde el <Link to="/admin">editor de niveles</Link>.
    </div>
  )
}

function LevelsGrid({ levels, mode }) {
  if (levels.length === 0) return <NoLevels />
  return (
    <div className="levels-grid">
      {levels.map((level, i) => <LevelCard key={level.id} level={level} index={i} mode={mode} />)}
    </div>
  )
}

function LevelsContent({ state, mode }) {
  if (state.error) return <p className="notice notice-error" role="alert">{state.error}</p>
  if (state.loading) return <div className="loader"><span className="spinner" /> Cargando niveles...</div>
  return <LevelsGrid levels={state.data?.levels || []} mode={mode} />
}

export default function LevelSelection() {
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = searchParams.get('mode') === 'single' ? 'single' : 'coop'
  const levels = useAsync(fetchLevels, 'levels', { fallback: LOAD_ERROR })

  return (
    <>
      <div className="page-header">
        <p className="eyebrow">Mapas</p>
        <h1>Selecciona un nivel</h1>
        <p>Elige el modo de juego y el mapa que quieres superar.</p>
      </div>
      <ModeSwitch mode={mode} onChange={(id) => setSearchParams({ mode: id }, { replace: true })} />
      <LevelsContent state={levels} mode={mode} />
    </>
  )
}
