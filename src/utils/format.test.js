import { describe, expect, it } from 'vitest'
import { formatDate, formatTime } from './format'

describe('formatTime', () => {
  it('formatea milisegundos como mm:ss.cc', () => {
    expect(formatTime(0)).toBe('00:00.00')
    expect(formatTime(12500)).toBe('00:12.50')
    expect(formatTime(65430)).toBe('01:05.43')
  })

  it('acepta el tiempo como texto (BIGINT del backend)', () => {
    expect(formatTime('12500')).toBe('00:12.50')
  })

  it('trata valores inválidos o negativos como cero', () => {
    expect(formatTime(undefined)).toBe('00:00.00')
    expect(formatTime('abc')).toBe('00:00.00')
    expect(formatTime(-500)).toBe('00:00.00')
  })
})

describe('formatDate', () => {
  it('devuelve un guion cuando no hay fecha', () => {
    expect(formatDate(null)).toBe('-')
    expect(formatDate('')).toBe('-')
  })

  it('formatea una fecha ISO', () => {
    expect(formatDate('2026-11-06T12:00:00.000Z')).toBe(new Date('2026-11-06T12:00:00.000Z').toLocaleString())
  })
})
