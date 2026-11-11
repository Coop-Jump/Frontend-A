import { describe, expect, it, vi } from 'vitest'
import { drawLevelPreview } from './drawLevelPreview'

function fakeCanvas() {
  const calls = []
  const handler = {
    get(target, prop) {
      if (prop === 'createLinearGradient') return () => ({ addColorStop: vi.fn() })
      if (prop in target) return target[prop]
      return (...args) => calls.push([prop, ...args])
    },
    set(target, prop, value) {
      target[prop] = value
      return true
    },
  }
  const ctx = new Proxy({}, handler)
  return { canvas: { getContext: () => ctx }, calls }
}

const GRID = {
  grid_width: 20, grid_height: 10,
  spawn_j1: { x: 1, y: 8 }, spawn_j2: { x: 18, y: 8 }, goal: { x: 10, y: 1 },
  platforms: [{ x: 0, y: 9, width: 20, height: 1, type: 'ground' }, { x: 5, y: 6, width: 3, height: 1, type: 'moving' }],
  hazards: [{ x: 8, y: 8, width: 2, height: 1, type: 'spikes' }, { x: 12, y: 9, width: 2, height: 1, type: 'lava' }],
  collectibles: [{ x: 3, y: 5, type: 'gem' }],
}
const OPTIONS = { difficulty: 'easy', width: 280, height: 160 }

describe('drawLevelPreview', () => {
  it('dibuja plataformas, peligros, tesoros, meta y spawns', () => {
    const { canvas, calls } = fakeCanvas()
    drawLevelPreview(canvas, GRID, OPTIONS)
    expect(canvas.width).toBeGreaterThan(0)
    const names = calls.map((c) => c[0])
    expect(names).toContain('fillRect')
    expect(names).toContain('arc') // tesoros y spawns
    expect(names).toContain('stroke') // borde de los spawns
    expect(names).not.toContain('fillText')
  })

  it('muestra "Sin vista previa" si el nivel no tiene tamaño', () => {
    const { canvas, calls } = fakeCanvas()
    drawLevelPreview(canvas, {}, OPTIONS)
    expect(calls.find((c) => c[0] === 'fillText')[1]).toBe('Sin vista previa')
  })

  it('no falla si el navegador no ofrece contexto 2D', () => {
    expect(() => drawLevelPreview({ getContext: () => null }, GRID, OPTIONS)).not.toThrow()
  })

  it('tolera niveles sin listas opcionales', () => {
    const { canvas } = fakeCanvas()
    expect(() => drawLevelPreview(canvas, { grid_width: 5, grid_height: 5 }, OPTIONS)).not.toThrow()
  })
})
