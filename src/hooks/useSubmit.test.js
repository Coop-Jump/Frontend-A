import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useSubmit } from './useSubmit'

describe('useSubmit', () => {
  it('ejecuta la acción y termina sin error', async () => {
    const { result } = renderHook(() => useSubmit('respaldo'))
    let ran = false
    await act(() => result.current.run(async () => { ran = true }))
    expect(ran).toBe(true)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('')
  })

  it('captura el error de la acción', async () => {
    const { result } = renderHook(() => useSubmit('No se pudo enviar.'))
    await act(() => result.current.run(async () => { throw new Error('x') }))
    expect(result.current.error).toBe('No se pudo enviar.')
    expect(result.current.loading).toBe(false)
  })

  it('limpia el error anterior al reintentar', async () => {
    const { result } = renderHook(() => useSubmit('falló'))
    await act(() => result.current.run(async () => { throw new Error('x') }))
    await act(() => result.current.run(async () => {}))
    expect(result.current.error).toBe('')
  })

  it('permite fijar un error manualmente', () => {
    const { result } = renderHook(() => useSubmit('falló'))
    act(() => result.current.setError('Validación'))
    expect(result.current.error).toBe('Validación')
  })
})
