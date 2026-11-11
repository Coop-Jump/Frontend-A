import { Link } from 'react-router-dom'
import { getTheme } from '../game/theme'
import LevelPreview from './LevelPreview'

const count = (list) => (list || []).length

export default function LevelCard({ level, index, mode }) {
  const theme = getTheme(level.difficulty)
  const grid = level.grid_json || {}
  return (
    <article className="level-card" style={{ '--accent': theme.css }}>
      <div className="thumb">
        <LevelPreview grid={grid} difficulty={level.difficulty} />
        <span className="badge">{theme.label}</span>
        <span className="num">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="body">
        <h3>{level.title}</h3>
        <div className="level-stats">
          <span>📐 {grid.grid_width || '?'}×{grid.grid_height || '?'}</span>
          <span>⭐ {count(grid.collectibles)} tesoros</span>
          <span>⚠️ {count(grid.hazards)} peligros</span>
        </div>
        <Link to={`/game?level=${level.id}&mode=${mode}`} className="btn btn-primary btn-block">▶ Jugar</Link>
      </div>
    </article>
  )
}
