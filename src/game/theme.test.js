import { describe, expect, it } from 'vitest'
import { CHARACTERS, getTheme, isPlayableLevel } from './theme'

const GRID = { grid_width: 20, grid_height: 15, spawn_j1: { x: 1, y: 2 }, goal: { x: 3, y: 4 } }

describe('getTheme', () => {
  it('devuelve el tema de cada dificultad', () => {
    expect(getTheme('hard').label).toBe('Difícil')
    expect(getTheme('expert').id).toBe('expert')
  })

  it('usa el tema fácil cuando la dificultad no existe', () => {
    expect(getTheme('inventada').id).toBe('easy')
    expect(getTheme(undefined).id).toBe('easy')
  })
})

describe('isPlayableLevel', () => {
  it('acepta un nivel con tamaño, spawn y meta', () => {
    expect(isPlayableLevel(GRID)).toBe(true)
  })

  it('rechaza niveles vacíos o incompletos', () => {
    expect(isPlayableLevel(null)).toBe(false)
    expect(isPlayableLevel({})).toBe(false)
    expect(isPlayableLevel({ ...GRID, goal: undefined })).toBe(false)
    expect(isPlayableLevel({ ...GRID, spawn_j1: { x: 1 } })).toBe(false)
    expect(isPlayableLevel({ ...GRID, grid_width: '20' })).toBe(false)
  })
})

describe('CHARACTERS', () => {
  it('define los dos personajes del juego', () => {
    expect(CHARACTERS.map((c) => c.id)).toEqual(['fox', 'blu'])
  })
})
