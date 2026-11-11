import { describe, expect, it } from 'vitest'
import { EMPTY_FORM, applyGridText, buildPayload, formFromLevel, parseGrid } from './levelForm'

const GRID = {
  grid_width: 20,
  grid_height: 15,
  spawn_j1: { x: 1, y: 13 },
  goal: { x: 10, y: 1 },
  platforms: [],
}

describe('parseGrid', () => {
  it('rechaza JSON inválido', () => {
    expect(parseGrid('{no es json').error).toMatch(/no es un JSON válido/)
  })

  it('rechaza valores que no son un objeto', () => {
    expect(parseGrid('[1, 2]').error).toMatch(/debe ser un objeto/)
    expect(parseGrid('42').error).toMatch(/debe ser un objeto/)
  })

  it('devuelve el tablero tal cual', () => {
    expect(parseGrid(JSON.stringify(GRID)).value).toEqual(GRID)
  })

  it('desenvuelve un nivel completo pegado con grid_json', () => {
    const text = JSON.stringify({ title: 'X', difficulty: 'hard', grid_json: GRID })
    expect(parseGrid(text).value).toEqual(GRID)
  })
})

describe('applyGridText', () => {
  const form = { title: '', difficulty: 'easy', gridText: '' }

  it('solo actualiza el texto si no es un nivel completo', () => {
    expect(applyGridText(form, '{"a":1}')).toEqual({ ...form, gridText: '{"a":1}' })
    expect(applyGridText(form, '{ escribiendo')).toEqual({ ...form, gridText: '{ escribiendo' })
  })

  it('completa título y dificultad al pegar un nivel completo', () => {
    const text = JSON.stringify({ title: 'Mi nivel', difficulty: 'expert', grid_json: GRID })
    const next = applyGridText(form, text)
    expect(next.title).toBe('Mi nivel')
    expect(next.difficulty).toBe('expert')
    expect(JSON.parse(next.gridText)).toEqual(GRID)
  })

  it('no pisa el título ya escrito ni acepta dificultades inválidas', () => {
    const text = JSON.stringify({ title: 'Otro', difficulty: 'imposible', grid_json: GRID })
    const next = applyGridText({ ...form, title: 'Mío', difficulty: 'medium' }, text)
    expect(next.title).toBe('Mío')
    expect(next.difficulty).toBe('medium')
  })
})

describe('buildPayload', () => {
  const valid = { title: '  Nivel 1  ', difficulty: 'easy', gridText: JSON.stringify(GRID) }

  it('exige título', () => {
    expect(buildPayload({ ...valid, title: '   ' }).error).toMatch(/título es obligatorio/)
  })

  it('propaga los errores de JSON', () => {
    expect(buildPayload({ ...valid, gridText: '{' }).error).toMatch(/JSON válido/)
  })

  it('exige que el nivel sea jugable', () => {
    const incomplete = { ...valid, gridText: JSON.stringify({ grid_width: 5 }) }
    expect(buildPayload(incomplete).error).toMatch(/para poder jugarse/)
  })

  it('arma el payload con el título limpio', () => {
    expect(buildPayload(valid).payload).toEqual({ title: 'Nivel 1', difficulty: 'easy', grid_json: GRID })
  })
})

describe('formulario', () => {
  it('el formulario vacío trae una plantilla jugable', () => {
    expect(EMPTY_FORM.title).toBe('')
    expect(buildPayload({ ...EMPTY_FORM, title: 'Plantilla' }).payload).toBeDefined()
  })

  it('formFromLevel carga un nivel existente', () => {
    const form = formFromLevel({ title: 'A', difficulty: null, grid_json: GRID })
    expect(form.title).toBe('A')
    expect(form.difficulty).toBe('easy')
    expect(JSON.parse(form.gridText)).toEqual(GRID)
  })
})
