import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './client'

const requestInterceptor = api.interceptors.request.handlers[0].fulfilled
const responseError = api.interceptors.response.handlers[0].rejected

describe('interceptor de petición', () => {
  it('agrega el token como Bearer cuando existe', () => {
    localStorage.setItem('auth-token', 'abc')
    const config = requestInterceptor({ headers: {} })
    expect(config.headers.Authorization).toBe('Bearer abc')
  })

  it('no agrega cabecera sin token', () => {
    const config = requestInterceptor({ headers: {} })
    expect(config.headers.Authorization).toBeUndefined()
  })
})

describe('interceptor de respuesta', () => {
  let location

  beforeEach(() => {
    location = { href: '/' }
    vi.stubGlobal('location', location)
    localStorage.setItem('auth-token', 'abc')
    localStorage.setItem('auth-storage', '{}')
  })

  it('un 401 fuera de /auth cierra la sesión y manda al login', async () => {
    const error = { response: { status: 401 }, config: { url: '/levels' } }
    await expect(responseError(error)).rejects.toBe(error)
    expect(localStorage.getItem('auth-token')).toBeNull()
    expect(localStorage.getItem('auth-storage')).toBeNull()
    expect(location.href).toBe('/login')
  })

  it('un 401 en /auth/* no recarga la página (credenciales inválidas)', async () => {
    const error = { response: { status: 401 }, config: { url: '/auth/login' } }
    await expect(responseError(error)).rejects.toBe(error)
    expect(localStorage.getItem('auth-token')).toBe('abc')
    expect(location.href).toBe('/')
  })

  it('otros errores se propagan sin tocar la sesión', async () => {
    const error = { response: { status: 500 }, config: { url: '/levels' } }
    await expect(responseError(error)).rejects.toBe(error)
    expect(localStorage.getItem('auth-token')).toBe('abc')
  })
})
