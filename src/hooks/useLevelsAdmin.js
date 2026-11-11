import { useState } from 'react'
import { fetchLevels, createLevel, updateLevel, deleteLevel } from '../services/levelService'
import { apiError, useAsync } from './useAsync'
import { EMPTY_FORM, applyGridText, buildPayload, formFromLevel } from '../utils/levelForm'

const confirmDelete = (level) =>
  window.confirm(`¿Eliminar el nivel "${level.title}"? Esta acción no se puede deshacer.`)

function useMessages() {
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const clear = () => {
    setError('')
    setNotice('')
  }
  return { error, notice, setError, setNotice, clear }
}

function useLevelForm() {
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  return {
    editingId, form,
    reset: () => { setEditingId(null); setForm(EMPTY_FORM) },
    startEdit: (level) => { setEditingId(level.id); setForm(formFromLevel(level)) },
    setTitle: (title) => setForm({ ...form, title }),
    setDifficulty: (difficulty) => setForm({ ...form, difficulty }),
    setGridText: (text) => setForm(applyGridText(form, text)),
  }
}

/** Guardar (crear o actualizar) el nivel del formulario. */
function useSaveLevel({ editor, msg, list }) {
  const [saving, setSaving] = useState(false)

  const persist = async (payload) => {
    const { editingId } = editor
    await (editingId ? updateLevel(editingId, payload) : createLevel(payload))
    msg.setNotice(editingId ? 'Nivel actualizado.' : 'Nivel creado.')
    editor.reset()
    list.reload()
  }

  const submit = async () => {
    msg.clear()
    const { payload, error } = buildPayload(editor.form)
    if (error) return msg.setError(error)
    setSaving(true)
    try {
      await persist(payload)
    } catch (err) {
      msg.setError(apiError(err, 'No se pudo guardar el nivel.'))
    } finally {
      setSaving(false)
    }
    return undefined
  }
  return { saving, submit }
}

/** Eliminar un nivel (con confirmación). */
function useRemoveLevel({ editor, msg, list }) {
  return async (level) => {
    if (!confirmDelete(level)) return
    msg.clear()
    try {
      await deleteLevel(level.id)
      if (editor.editingId === level.id) editor.reset()
      msg.setNotice('Nivel eliminado.')
      list.reload()
    } catch (err) {
      msg.setError(apiError(err, 'No se pudo eliminar el nivel.'))
    }
  }
}

/** Estado y acciones del panel de administración de niveles. */
export function useLevelsAdmin() {
  const msg = useMessages()
  const editor = useLevelForm()
  const list = useAsync(fetchLevels, 'levels', { keepData: true, fallback: 'No se pudieron cargar los niveles.' })
  const deps = { editor, msg, list }
  const { saving, submit } = useSaveLevel(deps)
  const remove = useRemoveLevel(deps)

  const edit = (level) => {
    msg.clear()
    editor.startEdit(level)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
    ...editor, notice: msg.notice, error: msg.error || list.error, saving,
    levels: list.data?.levels || [],
    loading: list.loading && !list.data,
    submit, edit, remove,
  }
}
