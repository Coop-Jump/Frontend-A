import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchLevels, createLevel, updateLevel, deleteLevel } from '../services/levelService'
import { getTheme, isPlayableLevel } from '../game/theme'
import LevelPreview from './LevelPreview'

const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert']

const TEMPLATE = {
  grid_width: 20,
  grid_height: 15,
  cell_size: 32,
  spawn_j1: { x: 1, y: 13 },
  spawn_j2: { x: 18, y: 13 },
  goal: { x: 10, y: 1 },
  platforms: [
    { x: 0, y: 14, width: 20, height: 1, type: 'ground' },
    { x: 4, y: 11, width: 4, height: 1, type: 'platform' },
    { x: 12, y: 8, width: 4, height: 1, type: 'platform' },
    { x: 9, y: 2, width: 3, height: 1, type: 'goal_platform' },
  ],
  hazards: [],
  collectibles: [{ x: 5, y: 10, type: 'coin' }],
}

const EMPTY_FORM = { title: '', difficulty: 'easy', gridText: JSON.stringify(TEMPLATE, null, 2) }

const isObject = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v)

// Si se pegó el nivel completo ({ title, difficulty, grid_json: {...} }),
// el tablero es lo que está dentro de `grid_json`.
function unwrapLevel(parsed) {
  return isObject(parsed) && isObject(parsed.grid_json) ? parsed.grid_json : parsed
}

function parseGrid(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    return { error: 'El grid_json no es un JSON válido.' }
  }
  if (!isObject(parsed)) {
    return { error: 'El grid_json debe ser un objeto JSON.' }
  }
  return { value: unwrapLevel(parsed) }
}

export default function LevelsAdminPanel() {
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const load = useCallback(async () => {
    try {
      const data = await fetchLevels()
      setLevels(data.levels || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudieron cargar los niveles.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Vista previa en vivo del JSON que se está escribiendo
  const livePreview = useMemo(() => parseGrid(form.gridText), [form.gridText])

  // Al pegar un nivel completo, se completan título y dificultad y queda solo el tablero.
  const handleGridChange = (text) => {
    try {
      const parsed = JSON.parse(text)
      if (isObject(parsed) && isObject(parsed.grid_json)) {
        setForm((f) => ({
          title: f.title.trim() ? f.title : String(parsed.title ?? '').slice(0, 100),
          difficulty: DIFFICULTIES.includes(parsed.difficulty) ? parsed.difficulty : f.difficulty,
          gridText: JSON.stringify(parsed.grid_json, null, 2),
        }))
        return
      }
    } catch {
      // todavía se está escribiendo: se deja el texto tal cual
    }
    setForm((f) => ({ ...f, gridText: text }))
  }

  const reset = () => { setEditingId(null); setForm(EMPTY_FORM) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    const title = form.title.trim()
    if (!title) return setError('El título es obligatorio.')
    const { value: grid_json, error: gridError } = parseGrid(form.gridText)
    if (gridError) return setError(gridError)
    if (!isPlayableLevel(grid_json)) {
      return setError('El nivel necesita grid_width, grid_height, spawn_j1 y goal (con x e y) para poder jugarse.')
    }

    const payload = { title, difficulty: form.difficulty, grid_json }
    setSaving(true)
    try {
      if (editingId) {
        await updateLevel(editingId, payload)
        setNotice('Nivel actualizado.')
      } else {
        await createLevel(payload)
        setNotice('Nivel creado.')
      }
      reset()
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo guardar el nivel.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (level) => {
    setError('')
    setNotice('')
    setEditingId(level.id)
    setForm({
      title: level.title,
      difficulty: level.difficulty || 'easy',
      gridText: JSON.stringify(level.grid_json, null, 2),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (level) => {
    if (!window.confirm(`¿Eliminar el nivel "${level.title}"? Esta acción no se puede deshacer.`)) return
    setError('')
    setNotice('')
    try {
      await deleteLevel(level.id)
      if (editingId === level.id) reset()
      setNotice('Nivel eliminado.')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo eliminar el nivel.')
    }
  }

  return (
    <section aria-labelledby="levels-admin-title">
      <h2 id="levels-admin-title" style={{ fontSize: 26, marginBottom: 14 }}>Gestión de niveles</h2>

      {error && <p role="alert" className="notice notice-error" style={{ marginBottom: 14 }}>{error}</p>}
      {notice && <p role="status" className="notice notice-success" style={{ marginBottom: 14 }}>{notice}</p>}

      <div className="admin-layout">
        <form onSubmit={handleSubmit} className="panel form-stack">
          <h3>{editingId ? '✏️ Editar nivel' : '➕ Nuevo nivel'}</h3>

          <div className="field">
            <label htmlFor="lvl-title">Título</label>
            <input id="lvl-title" className="input" value={form.title} maxLength={100} required
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="lvl-diff">Dificultad</label>
            <select id="lvl-diff" className="input" value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{getTheme(d).label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="lvl-grid">grid_json</label>
            <textarea id="lvl-grid" className="input" rows={14} value={form.gridText}
              spellCheck={false} onChange={(e) => handleGridChange(e.target.value)} />
            <small style={{ color: 'var(--text-faint)' }}>
              Puedes pegar solo el tablero o el nivel completo (con título y dificultad): se separa solo.
            </small>
          </div>

          <div className="field">
            <label>Vista previa</label>
            {livePreview.value ? (
              <LevelPreview grid={livePreview.value} difficulty={form.difficulty} />
            ) : (
              <p className="notice notice-error">{livePreview.error}</p>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear nivel'}
            </button>
            {editingId && <button type="button" onClick={reset} className="btn btn-ghost">Cancelar</button>}
          </div>
        </form>

        <div>
          {loading ? (
            <div className="loader"><span className="spinner" /> Cargando niveles...</div>
          ) : levels.length === 0 ? (
            <div className="panel empty"><strong>No hay niveles creados</strong>Usa el formulario para crear el primero.</div>
          ) : (
            <div className="admin-list">
              {levels.map((level) => {
                const theme = getTheme(level.difficulty)
                return (
                  <div key={level.id} className={`admin-level ${editingId === level.id ? 'editing' : ''}`} style={{ '--accent': theme.css }}>
                    <div className="thumb"><LevelPreview grid={level.grid_json} difficulty={level.difficulty} width={220} height={124} /></div>
                    <div className="info">
                      <strong title={level.title}>{level.title}</strong>
                      <span className="badge">{theme.label}</span>
                    </div>
                    <div className="actions">
                      <button type="button" onClick={() => handleEdit(level)} className="btn btn-ghost btn-sm">Editar</button>
                      <button type="button" onClick={() => handleDelete(level)} className="btn btn-danger btn-sm">Eliminar</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
