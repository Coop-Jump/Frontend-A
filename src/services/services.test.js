import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

import api from '../api/client'
import { createLevel, deleteLevel, fetchLevelById, fetchLevels, updateLevel } from './levelService'
import { fetchLevelRuns, fetchMyRuns, submitRun } from './runService'
import { clearAuthSession, loginUser, registerUser, saveAuthSession } from './authService'
import { useAuthStore } from '../store/authStore'

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ token: null, user: null })
})

describe('levelService', () => {
  it('fetchLevels pide GET /levels', async () => {
    api.get.mockResolvedValue({ data: { levels: [{ id: 1 }] } })
    expect(await fetchLevels()).toEqual({ levels: [{ id: 1 }] })
    expect(api.get).toHaveBeenCalledWith('/levels')
  })

  it('fetchLevelById pide GET /levels/:id', async () => {
    api.get.mockResolvedValue({ data: { level: { id: 'abc' } } })
    expect(await fetchLevelById('abc')).toEqual({ level: { id: 'abc' } })
    expect(api.get).toHaveBeenCalledWith('/levels/abc')
  })

  it('createLevel, updateLevel y deleteLevel usan el verbo correcto', async () => {
    api.post.mockResolvedValue({ data: 'creado' })
    api.put.mockResolvedValue({ data: 'editado' })
    api.delete.mockResolvedValue({ data: 'borrado' })
    expect(await createLevel({ title: 'A' })).toBe('creado')
    expect(await updateLevel('7', { title: 'B' })).toBe('editado')
    expect(await deleteLevel('7')).toBe('borrado')
    expect(api.post).toHaveBeenCalledWith('/levels', { title: 'A' })
    expect(api.put).toHaveBeenCalledWith('/levels/7', { title: 'B' })
    expect(api.delete).toHaveBeenCalledWith('/levels/7')
  })

  it('propaga los errores de la API', async () => {
    api.get.mockRejectedValue(new Error('caído'))
    await expect(fetchLevels()).rejects.toThrow('caído')
  })
})

describe('runService', () => {
  it('submitRun envía POST /levels/runs con el formato del backend', async () => {
    api.post.mockResolvedValue({ data: { run: { id: 'r1' } } })
    const run = await submitRun({ levelId: 'lvl', completionTimeMs: 12499.6, deaths: 3 })
    expect(run).toEqual({ id: 'r1' })
    expect(api.post).toHaveBeenCalledWith('/levels/runs', { level_id: 'lvl', completion_time_ms: 12500, deaths: 3 })
  })

  it('fetchLevelRuns devuelve el ranking del nivel', async () => {
    api.get.mockResolvedValue({ data: { runs: [{ id: 1 }] } })
    expect(await fetchLevelRuns('lvl')).toEqual([{ id: 1 }])
    expect(api.get).toHaveBeenCalledWith('/levels/lvl/runs')
  })

  it('fetchMyRuns devuelve el historial propio', async () => {
    api.get.mockResolvedValue({ data: { runs: [{ id: 2 }] } })
    expect(await fetchMyRuns()).toEqual([{ id: 2 }])
    expect(api.get).toHaveBeenCalledWith('/levels/users/me/runs')
  })
})

describe('authService', () => {
  it('registerUser y loginUser envían username y password', async () => {
    api.post.mockResolvedValue({ data: { token: 't' } })
    await registerUser({ username: 'ana', password: 'pw' })
    await loginUser({ username: 'ana', password: 'pw' })
    expect(api.post).toHaveBeenNthCalledWith(1, '/auth/register', { username: 'ana', password: 'pw' })
    expect(api.post).toHaveBeenNthCalledWith(2, '/auth/login', { username: 'ana', password: 'pw' })
  })

  it('saveAuthSession y clearAuthSession actualizan el store', () => {
    saveAuthSession({ token: 'tok', user: { username: 'ana' } })
    expect(useAuthStore.getState()).toMatchObject({ token: 'tok', user: { username: 'ana' } })
    expect(localStorage.getItem('auth-token')).toBe('tok')

    clearAuthSession()
    expect(useAuthStore.getState()).toMatchObject({ token: null, user: null })
    expect(localStorage.getItem('auth-token')).toBeNull()
  })
})
