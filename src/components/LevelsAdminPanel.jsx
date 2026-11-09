import { useState, useEffect, useCallback } from 'react'
import { fetchLevels, createLevel, updateLevel, deleteLevel } from '../services/levelService'

const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert']

const TEMPLATE = {
  grid_width: 20,
  grid_height: 15,
  cell_size: 32,
  spawn_j1: { x: 1, y: 13 },
  spawn_j2: { x: 18, y: 13 },
  goal: { x: 10, y: 1 },
  platforms: [{ x: 0, y: 14, width: 20, height: 1, type: 'ground' }],
}

const EMPTY_FORM = { title: '', difficulty: 'easy', gridText: JSON.stringify(TEMPLATE, null, 2) }

const card = { background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 10px 30px rgba(249,115,22,0.1)', border: '2px solid #ffedd5' }
const input = { padding: 12, borderRadius: 10, border: '2px solid #ffedd5', background: '#fff7ed', color: '#1a202c', fontSize: 15, width: '100%', boxSizing: 'border-box' }
const label = { fontSize: 14, fontWeight: 600, color: '#c2410c' }
const btn = (bg) => ({ padding: '8px 16px', background: bg, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' })

function parseGrid(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    return { error: 'El grid_json no es un JSON válido.' }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { error: 'El grid_json debe ser un objeto JSON.' }
  }
  return { value: parsed }
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

  const reset = () => { setEditingId(null); setForm(EMPTY_FORM) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    const title = form.title.trim()
    if (!title) return setError('El título es obligatorio.')
    const { value: grid_json, error: gridError } = parseGrid(form.gridText)
    if (gridError) return setError(gridError)

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
    <section style={{ marginTop: 30 }}>
      <h2 style={{ color: '#f97316', fontWeight: 800, marginBottom: 14 }}>Gestión de niveles</h2>

      {error && <p role="alert" style={{ color: '#e53e3e', fontWeight: 600 }}>{error}</p>}
      {notice && <p role="status" style={{ color: '#15803d', fontWeight: 600 }}>{notice}</p>}

      <form onSubmit={handleSubmit} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        <h3 style={{ color: '#f97316', margin: 0 }}>{editingId ? 'Editar nivel' : 'Nuevo nivel'}</h3>
        <label htmlFor="lvl-title" style={label}>Título</label>
        <input id="lvl-title" style={input} value={form.title} maxLength={100} required
          onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <label htmlFor="lvl-diff" style={label}>Dificultad</label>
        <select id="lvl-diff" style={input} value={form.difficulty}
          onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
          {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <label htmlFor="lvl-grid" style={label}>grid_json</label>
        <textarea id="lvl-grid" style={{ ...input, fontFamily: 'monospace', minHeight: 220 }} value={form.gridText}
          spellCheck={false} onChange={(e) => setForm({ ...form, gridText: e.target.value })} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={saving} style={btn('#f97316')}>
            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear nivel'}
          </button>
          {editingId && <button type="button" onClick={reset} style={btn('#9ca3af')}>Cancelar</button>}
        </div>
      </form>

      {loading ? (
        <p style={{ color: '#f97316', fontWeight: 600 }}>Cargando niveles...</p>
      ) : levels.length === 0 ? (
        <p style={{ color: '#c2410c' }}>No hay niveles creados.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {levels.map((level) => (
            <div key={level.id} style={{ ...card, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <strong style={{ color: '#7c2d12' }}>{level.title}</strong>
                <span style={{ marginLeft: 10, color: '#c2410c', fontSize: 14 }}>{level.difficulty || 'N/D'}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleEdit(level)} style={btn('#f97316')}>Editar</button>
                <button onClick={() => handleDelete(level)} style={btn('#dc2626')}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
