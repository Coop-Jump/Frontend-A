import { getTheme } from '../game/theme'
import LevelPreview from './LevelPreview'

function AdminLevelItem({ level, editing, onEdit, onDelete }) {
  const theme = getTheme(level.difficulty)
  return (
    <div className={`admin-level ${editing ? 'editing' : ''}`} style={{ '--accent': theme.css }}>
      <div className="thumb"><LevelPreview grid={level.grid_json} difficulty={level.difficulty} width={220} height={124} /></div>
      <div className="info">
        <strong title={level.title}>{level.title}</strong>
        <span className="badge">{theme.label}</span>
      </div>
      <div className="actions">
        <button type="button" onClick={() => onEdit(level)} className="btn btn-ghost btn-sm">Editar</button>
        <button type="button" onClick={() => onDelete(level)} className="btn btn-danger btn-sm">Eliminar</button>
      </div>
    </div>
  )
}

export default function AdminLevelList({ admin }) {
  if (admin.loading) return <div className="loader"><span className="spinner" /> Cargando niveles...</div>
  if (admin.levels.length === 0) {
    return <div className="panel empty"><strong>No hay niveles creados</strong>Usa el formulario para crear el primero.</div>
  }
  return (
    <div className="admin-list">
      {admin.levels.map((level) => (
        <AdminLevelItem key={level.id} level={level} editing={admin.editingId === level.id}
          onEdit={admin.edit} onDelete={admin.remove} />
      ))}
    </div>
  )
}
