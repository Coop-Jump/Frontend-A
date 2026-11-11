import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('../services/authService', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  saveAuthSession: vi.fn(),
  clearAuthSession: vi.fn(),
}))
vi.mock('../services/levelService', () => ({ fetchLevels: vi.fn() }))
vi.mock('../services/runService', () => ({ fetchLevelRuns: vi.fn(), fetchMyRuns: vi.fn() }))
vi.mock('../components/LevelPreview', () => ({ default: () => <div data-testid="preview" /> }))

import Login from './Login'
import Register from './Register'
import Leaderboard from './Leaderboard'
import LevelSelection from './LevelSelection'
import { loginUser, registerUser, saveAuthSession } from '../services/authService'
import { fetchLevels } from '../services/levelService'
import { fetchLevelRuns, fetchMyRuns } from '../services/runService'
import { useAuthStore } from '../store/authStore'

const LEVELS = [
  { id: 'l1', title: 'Primeros Pasos', difficulty: 'easy', grid_json: { grid_width: 40, grid_height: 16 } },
  { id: 'l2', title: 'El Ascenso', difficulty: 'medium', grid_json: { grid_width: 44, grid_height: 16 } },
]

const renderAt = (path, element, routePath = path.split('?')[0]) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePath} element={element} />
        <Route path="/dashboard" element={<p>panel</p>} />
        <Route path="/login" element={<p>pantalla de login</p>} />
      </Routes>
    </MemoryRouter>,
  )

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ token: null, user: null })
})

describe('Login', () => {
  it('inicia sesión con usuario y contraseña y va al panel', async () => {
    loginUser.mockResolvedValue({ token: 'tok', user: { username: 'ana' } })
    renderAt('/login', <Login />)
    type('Usuario', '  ana ')
    type('Contraseña', 'secreto')
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await screen.findByText('panel')
    expect(loginUser).toHaveBeenCalledWith({ username: 'ana', password: 'secreto' })
    expect(saveAuthSession).toHaveBeenCalledWith({ token: 'tok', user: { username: 'ana' } })
  })

  it('muestra el error del backend sin salir de la pantalla', async () => {
    loginUser.mockRejectedValue({ response: { data: { message: 'Invalid username or password' } } })
    renderAt('/login', <Login />)
    type('Usuario', 'ana')
    type('Contraseña', 'mala')
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password')
    expect(saveAuthSession).not.toHaveBeenCalled()
  })

  it('si ya hay sesión redirige directamente', () => {
    useAuthStore.setState({ token: 'tok', user: {} })
    renderAt('/login', <Login />)
    expect(screen.getByText('panel')).toBeInTheDocument()
  })
})

describe('Register', () => {
  it('valida que las contraseñas coincidan', () => {
    renderAt('/register', <Register />)
    type('Usuario', 'ana')
    type('Contraseña', 'uno')
    type('Confirmar contraseña', 'dos')
    fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Las contraseñas no coinciden.')
    expect(registerUser).not.toHaveBeenCalled()
  })

  it('registra al usuario y avisa que redirige al login', async () => {
    registerUser.mockResolvedValue({})
    renderAt('/register', <Register />)
    type('Usuario', ' ana ')
    type('Contraseña', 'secreto')
    type('Confirmar contraseña', 'secreto')
    fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Registro exitoso')
    expect(registerUser).toHaveBeenCalledWith({ username: 'ana', password: 'secreto' })
  })

  it('muestra el error si el usuario ya existe', async () => {
    registerUser.mockRejectedValue({ response: { data: { message: 'Username already exists' } } })
    renderAt('/register', <Register />)
    type('Usuario', 'ana')
    type('Contraseña', 'x')
    type('Confirmar contraseña', 'x')
    fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Username already exists')
  })
})

describe('LevelSelection', () => {
  it('lista los niveles del backend', async () => {
    fetchLevels.mockResolvedValue({ levels: LEVELS })
    renderAt('/levels?mode=coop', <LevelSelection />, '/levels')
    expect(await screen.findByText('Primeros Pasos')).toBeInTheDocument()
    expect(screen.getByText('El Ascenso')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Jugar/ })[0]).toHaveAttribute('href', '/game?level=l1&mode=coop')
  })

  it('cambia el modo en los enlaces al elegir un jugador', async () => {
    fetchLevels.mockResolvedValue({ levels: LEVELS })
    renderAt('/levels?mode=coop', <LevelSelection />, '/levels')
    await screen.findByText('Primeros Pasos')
    fireEvent.click(screen.getByRole('tab', { name: /Un jugador/ }))
    await waitFor(() =>
      expect(screen.getAllByRole('link', { name: /Jugar/ })[0]).toHaveAttribute('href', '/game?level=l1&mode=single'),
    )
  })

  it('avisa cuando no hay niveles', async () => {
    fetchLevels.mockResolvedValue({ levels: [] })
    renderAt('/levels', <LevelSelection />)
    expect(await screen.findByText('Todavía no hay niveles')).toBeInTheDocument()
  })

  it('muestra el error si falla la carga', async () => {
    fetchLevels.mockRejectedValue(new Error('caído'))
    renderAt('/levels', <LevelSelection />)
    expect(await screen.findByRole('alert')).toHaveTextContent(/No se pudieron cargar los niveles/)
  })
})

describe('Leaderboard', () => {
  const run = (id, username, ms) => ({ id, username, completion_time_ms: String(ms), deaths: 0, created_at: '2026-11-06T12:00:00Z' })

  it('carga el ranking del primer nivel (GET /levels/:id/runs)', async () => {
    fetchLevels.mockResolvedValue({ levels: LEVELS })
    fetchLevelRuns.mockResolvedValue([run(1, 'ana', 10000), run(2, 'beto', 12000)])
    renderAt('/leaderboard', <Leaderboard />)
    expect(await screen.findAllByText('ana')).not.toHaveLength(0)
    expect(fetchLevelRuns).toHaveBeenCalledWith('l1')
    expect(fetchMyRuns).not.toHaveBeenCalled()
  })

  it('cambia de nivel con el selector', async () => {
    fetchLevels.mockResolvedValue({ levels: LEVELS })
    fetchLevelRuns.mockResolvedValue([])
    renderAt('/leaderboard', <Leaderboard />)
    await screen.findByLabelText('Nivel')
    fireEvent.change(screen.getByLabelText('Nivel'), { target: { value: 'l2' } })
    await waitFor(() => expect(fetchLevelRuns).toHaveBeenCalledWith('l2'))
  })

  it('muestra el historial propio (GET /levels/users/me/runs)', async () => {
    fetchLevels.mockResolvedValue({ levels: LEVELS })
    fetchLevelRuns.mockResolvedValue([])
    fetchMyRuns.mockResolvedValue([{ ...run(9, 'yo', 5000), level_title: 'Primeros Pasos' }])
    renderAt('/leaderboard', <Leaderboard />)
    await screen.findByLabelText('Nivel')
    fireEvent.click(screen.getByRole('tab', { name: /Mis partidas/ }))
    expect(await screen.findByText('00:05.00')).toBeInTheDocument()
    expect(fetchMyRuns).toHaveBeenCalled()
  })

  it('avisa cuando nadie completó el nivel', async () => {
    fetchLevels.mockResolvedValue({ levels: LEVELS })
    fetchLevelRuns.mockResolvedValue([])
    renderAt('/leaderboard', <Leaderboard />)
    expect(await screen.findByText(/Todavía nadie completó este nivel/)).toBeInTheDocument()
  })

  it('muestra el error de la API', async () => {
    fetchLevels.mockResolvedValue({ levels: LEVELS })
    fetchLevelRuns.mockRejectedValue({ response: { data: { message: 'Token inválido' } } })
    renderAt('/leaderboard', <Leaderboard />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Token inválido')
  })
})
