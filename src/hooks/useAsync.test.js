import { describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { apiError, useAsync } from './useAsync'

describe('apiError', () => {
  it('usa el mensaje del backend o el de respaldo', () => {
    expect(apiError({ response: { data: { message: 'Nivel no existe' } } }, 'x')).toBe('Nivel no existe')
    expect(apiError(new Error('red'), 'No se pudo')).toBe('No se pudo')
  })
})

describe('useAsync', () => {
  it('carga los datos y deja de estar cargando', async () => {
    const fn = vi.fn().mockResolvedValue({ ok: true })
    const { result } = renderHook(() => useAsync(fn, 'k'))
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual({ ok: true })
    expect(result.current.error).toBe('')
  })

  it('expone el mensaje del backend cuando falla', async () => {
    const fn = vi.fn().mockRejectedValue({ response: { data: { message: 'Prohibido' } } })
    const { result } = renderHook(() => useAsync(fn, 'k', { fallback: 'respaldo' }))
    await waitFor(() => expect(result.current.error).toBe('Prohibido'))
    expect(result.current.loading).toBe(false)
  })

  it('usa el mensaje de respaldo cuando el error no trae mensaje', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('x'))
    const { result } = renderHook(() => useAsync(fn, 'k', { fallback: 'No se pudo cargar.' }))
    await waitFor(() => expect(result.current.error).toBe('No se pudo cargar.'))
  })

  it('no ejecuta la petición si está deshabilitado', () => {
    const fn = vi.fn().mockResolvedValue(1)
    const { result } = renderHook(() => useAsync(fn, 'k', { enabled: false }))
    expect(fn).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeNull()
  })

  it('vuelve a pedir los datos cuando cambia la clave', async () => {
    const fn = vi.fn((id) => Promise.resolve(`dato-${id}`))
    const { result, rerender } = renderHook(({ id }) => useAsync(() => fn(id), id), { initialProps: { id: 1 } })
    await waitFor(() => expect(result.current.data).toBe('dato-1'))
    rerender({ id: 2 })
    await waitFor(() => expect(result.current.data).toBe('dato-2'))
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('reload repite la petición y keepData conserva el dato anterior', async () => {
    let n = 0
    const fn = vi.fn(() => Promise.resolve(++n))
    const { result } = renderHook(() => useAsync(fn, 'k', { keepData: true }))
    await waitFor(() => expect(result.current.data).toBe(1))
    act(() => result.current.reload())
    expect(result.current.data).toBe(1)
    await waitFor(() => expect(result.current.data).toBe(2))
  })

  it('ignora la respuesta de una petición cancelada al desmontar', async () => {
    let resolve
    const fn = vi.fn(() => new Promise((r) => { resolve = r }))
    const { unmount } = renderHook(() => useAsync(fn, 'k'))
    unmount()
    await act(async () => resolve('tarde'))
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
