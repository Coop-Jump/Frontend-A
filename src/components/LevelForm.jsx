import { useMemo } from 'react'
import { getTheme } from '../game/theme'
import { DIFFICULTIES, parseGrid } from '../utils/levelForm'
import LevelPreview from './LevelPreview'

function GridPreview({ gridText, difficulty }) {
  // Vista previa en vivo del JSON que se está escribiendo
  const preview = useMemo(() => parseGrid(gridText), [gridText])
  if (!preview.value) return <p className="notice notice-error">{preview.error}</p>
  return <LevelPreview grid={preview.value} difficulty={difficulty} />
}

function FormActions({ saving, editing, onCancel }) {
  return (
    <div className="form-actions">
      <button type="submit" disabled={saving} className="btn btn-primary">
        {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear nivel'}
      </button>
      {editing && <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>}
    </div>
  )
}

function TitleField({ value, onChange }) {
  return (
    <div className="field">
      <label htmlFor="lvl-title">Título</label>
      <input id="lvl-title" className="input" value={value} maxLength={100} required
        onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function DifficultyField({ value, onChange }) {
  return (
    <div className="field">
      <label htmlFor="lvl-diff">Dificultad</label>
      <select id="lvl-diff" className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {DIFFICULTIES.map((d) => <option key={d} value={d}>{getTheme(d).label}</option>)}
      </select>
    </div>
  )
}

function GridField({ value, onChange }) {
  return (
    <div className="field">
      <label htmlFor="lvl-grid">grid_json</label>
      <textarea id="lvl-grid" className="input" rows={14} value={value} spellCheck={false}
        onChange={(e) => onChange(e.target.value)} />
      <small style={{ color: 'var(--text-faint)' }}>
        Puedes pegar solo el tablero o el nivel completo (con título y dificultad): se separa solo.
      </small>
    </div>
  )
}

export default function LevelForm({ admin }) {
  const { form, editingId, saving } = admin
  const submit = (e) => {
    e.preventDefault()
    admin.submit()
  }

  return (
    <form onSubmit={submit} className="panel form-stack">
      <h3>{editingId ? '✏️ Editar nivel' : '➕ Nuevo nivel'}</h3>
      <TitleField value={form.title} onChange={admin.setTitle} />
      <DifficultyField value={form.difficulty} onChange={admin.setDifficulty} />
      <GridField value={form.gridText} onChange={admin.setGridText} />
      <div className="field">
        <label>Vista previa</label>
        <GridPreview gridText={form.gridText} difficulty={form.difficulty} />
      </div>
      <FormActions saving={saving} editing={Boolean(editingId)} onCancel={admin.reset} />
    </form>
  )
}
