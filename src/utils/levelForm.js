import { isPlayableLevel } from '../game/theme'

export const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert']

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

export const EMPTY_FORM = { title: '', difficulty: 'easy', gridText: JSON.stringify(TEMPLATE, null, 2) }

const NOT_PLAYABLE = 'El nivel necesita grid_width, grid_height, spawn_j1 y goal (con x e y) para poder jugarse.'
const isObject = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v)
const isWrappedLevel = (parsed) => isObject(parsed) && isObject(parsed.grid_json)
const prettyJson = (value) => JSON.stringify(value, null, 2)

function tryParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

// Si se pegó el nivel completo ({ title, difficulty, grid_json: {...} }),
// el tablero es lo que está dentro de `grid_json`.
export function parseGrid(text) {
  const parsed = tryParse(text)
  if (parsed === undefined) return { error: 'El grid_json no es un JSON válido.' }
  if (!isObject(parsed)) return { error: 'El grid_json debe ser un objeto JSON.' }
  return { value: isWrappedLevel(parsed) ? parsed.grid_json : parsed }
}

/** Nuevo estado del formulario al editar el texto del grid (detecta niveles completos pegados). */
export function applyGridText(form, text) {
  const parsed = tryParse(text)
  if (!isWrappedLevel(parsed)) return { ...form, gridText: text }
  return {
    title: form.title.trim() ? form.title : String(parsed.title ?? '').slice(0, 100),
    difficulty: DIFFICULTIES.includes(parsed.difficulty) ? parsed.difficulty : form.difficulty,
    gridText: prettyJson(parsed.grid_json),
  }
}

export function formFromLevel(level) {
  return {
    title: level.title,
    difficulty: level.difficulty || 'easy',
    gridText: prettyJson(level.grid_json),
  }
}

/** Valida el formulario y devuelve { payload } o { error }. */
export function buildPayload(form) {
  const title = form.title.trim()
  if (!title) return { error: 'El título es obligatorio.' }
  const { value, error } = parseGrid(form.gridText)
  if (error) return { error }
  if (!isPlayableLevel(value)) return { error: NOT_PLAYABLE }
  return { payload: { title, difficulty: form.difficulty, grid_json: value } }
}
