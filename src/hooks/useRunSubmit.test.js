import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

vi.mock('../services/runService', () => ({ submitRun: vi.fn() }))

import { submitRun } from '../services/runService'
import { useRunSubmit } from './useRunSubmit'

const RESULT = { completionTimeMs: 12500, deaths: 2, score: 30, coins: 3, coinsTotal: 5 }

beforeEach(() => vi.clearAllMocks())

describe('useRunSubmit', () => {
  it('empieza sin resultado', () => {
    const { result } = renderHook(() => useRunSubmit('lvl'))
    expect(result.current.result).toBeNull()
    expect(result.current.status).toBe('idle')
  })

  it('guarda la partida al completar el nivel', async () => {
    submitRun.mockResolvedValue({ id: 'r1' })
    const { result } = renderHook(() => useRunSubmit('lvl'))
    await act(async () => {
      result.current.complete(RESULT)
    })
    expect(result.current.result).toEqual(RESULT)
    await waitFor(() => expect(result.current.status).toBe('saved'))
    expect(submitRun).toHaveBeenCalledWith({ levelId: 'lvl', completionTimeMs: 12500, deaths: 2 })
  })

  it('informa el error y permite reintentar', async () => {
    submitRun.mockRejectedValueOnce({ response: { data: { message: 'Sin conexión' } } })
    submitRun.mockResolvedValueOnce({ id: 'r1' })
    const { result } = renderHook(() => useRunSubmit('lvl'))
    await act(async () => {
      result.current.complete(RESULT)
    })
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error).toBe('Sin conexión')

    await act(async () => {
      result.current.retry()
    })
    await waitFor(() => expect(result.current.status).toBe('saved'))
    expect(submitRun).toHaveBeenCalledTimes(2)
  })

  it('reset vuelve al estado inicial para jugar de nuevo', async () => {
    submitRun.mockResolvedValue({})
    const { result } = renderHook(() => useRunSubmit('lvl'))
    await act(async () => {
      result.current.complete(RESULT)
    })
    await waitFor(() => expect(result.current.status).toBe('saved'))
    act(() => result.current.reset())
    expect(result.current.result).toBeNull()
    expect(result.current.status).toBe('idle')
  })
})
