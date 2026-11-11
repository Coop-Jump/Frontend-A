import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('./LevelPreview', () => ({ default: () => <div data-testid="preview" /> }))

import Podium from './Podium'
import RunsTable from './RunsTable'
import ModeSwitch from './ModeSwitch'
import LevelCard from './LevelCard'
import VictoryPanel from './VictoryPanel'
import GameHud from './GameHud'
import GameControls from './GameControls'
import AuthCard, { Field } from './AuthCard'
import ProtectedRoute from './ProtectedRoute'
import { rankingColumns, historyColumns } from './runColumns'
import { useAuthStore } from '../store/authStore'

const inRouter = (ui, path = '/') => render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>)

describe('Podium', () => {
  const rows = [
    { id: 1, username: 'ana', formattedTime: '00:10.00', deaths: 0 },
    { id: 2, username: 'beto', formattedTime: '00:12.00', deaths: 1 },
    { id: 3, username: null, formattedTime: '00:15.00', deaths: 2 },
  ]

  it('no muestra nada sin partidas', () => {
    const { container } = render(<Podium rows={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('muestra los tres primeros con su tiempo y muertes', () => {
    render(<Podium rows={rows} />)
    expect(screen.getByText('ana')).toBeInTheDocument()
    expect(screen.getByText('00:12.00')).toBeInTheDocument()
    expect(screen.getByText('2 muertes')).toBeInTheDocument()
    expect(screen.getByText('Anónimo')).toBeInTheDocument()
  })

  it('con un solo corredor muestra solo el primer puesto', () => {
    render(<Podium rows={rows.slice(0, 1)} />)
    expect(screen.getAllByText(/muertes/)).toHaveLength(1)
  })
})

describe('RunsTable', () => {
  const run = { id: 'r1', username: 'ana', completion_time_ms: '12500', deaths: 2, created_at: '2026-11-06T12:00:00Z', level_title: 'Primeros Pasos' }

  it('muestra el mensaje cuando no hay datos', () => {
    render(<RunsTable columns={rankingColumns} rows={[]} empty="Nadie todavía" />)
    expect(screen.getByText('Sin datos todavía')).toBeInTheDocument()
    expect(screen.getByText(/Nadie todavía/)).toBeInTheDocument()
  })

  it('arma la tabla de ranking con medalla, jugador y tiempo', () => {
    render(<RunsTable columns={rankingColumns} rows={[run]} empty="" />)
    expect(screen.getByText('🥇')).toBeInTheDocument()
    expect(screen.getByText('ana')).toBeInTheDocument()
    expect(screen.getByText('00:12.50')).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Pos', 'Jugador', 'Tiempo', 'Muertes', 'Fecha'])
  })

  it('arma la tabla de historial con el nombre del nivel', () => {
    render(<RunsTable columns={historyColumns} rows={[run, { ...run, id: 'r2', level_title: null }]} empty="" />)
    expect(screen.getByText('Primeros Pasos')).toBeInTheDocument()
    expect(screen.getByText('Nivel eliminado')).toBeInTheDocument()
  })

  it('numera las posiciones después del podio', () => {
    const rows = [1, 2, 3, 4].map((n) => ({ ...run, id: `r${n}` }))
    render(<RunsTable columns={rankingColumns} rows={rows} empty="" />)
    expect(screen.getByText('4')).toBeInTheDocument()
  })
})

describe('ModeSwitch', () => {
  it('marca el modo activo y avisa el cambio', () => {
    const onChange = vi.fn()
    render(<ModeSwitch mode="coop" onChange={onChange} />)
    expect(screen.getByRole('tab', { name: /Cooperativo/ })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(screen.getByRole('tab', { name: /Un jugador/ }))
    expect(onChange).toHaveBeenCalledWith('single')
  })
})

describe('LevelCard', () => {
  const level = {
    id: 'abc',
    title: 'El Ascenso',
    difficulty: 'medium',
    grid_json: { grid_width: 44, grid_height: 16, collectibles: [1, 2, 3], hazards: [1] },
  }

  it('muestra título, estadísticas y el enlace para jugar según el modo', () => {
    inRouter(<LevelCard level={level} index={1} mode="single" />)
    expect(screen.getByText('El Ascenso')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText(/44×16/)).toBeInTheDocument()
    expect(screen.getByText(/3 tesoros/)).toBeInTheDocument()
    expect(screen.getByText(/1 peligros/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Jugar/ })).toHaveAttribute('href', '/game?level=abc&mode=single')
  })

  it('tolera un nivel sin grid_json', () => {
    inRouter(<LevelCard level={{ id: 'x', title: 'Vacío' }} index={0} mode="coop" />)
    expect(screen.getByText(/\?×\?/)).toBeInTheDocument()
    expect(screen.getByText(/0 tesoros/)).toBeInTheDocument()
  })
})

describe('VictoryPanel', () => {
  const level = { id: 'abc', title: 'Primeros Pasos', difficulty: 'easy' }
  const result = { completionTimeMs: 12500, deaths: 2, score: 30, coins: 3, coinsTotal: 10 }
  const baseRun = { result, status: 'saved', error: '', retry: vi.fn() }

  it('muestra las estadísticas y que la partida se guardó', () => {
    inRouter(<VictoryPanel level={level} mode="coop" run={baseRun} onReplay={vi.fn()} />)
    expect(screen.getByText('¡Nivel completado!')).toBeInTheDocument()
    expect(screen.getByText('00:12.50')).toBeInTheDocument()
    expect(screen.getByText('3/10')).toBeInTheDocument()
    expect(screen.getByText('Partida guardada en el ranking.')).toBeInTheDocument()
  })

  it('avisa mientras guarda', () => {
    inRouter(<VictoryPanel level={level} mode="coop" run={{ ...baseRun, status: 'sending' }} onReplay={vi.fn()} />)
    expect(screen.getByText('Guardando partida...')).toBeInTheDocument()
  })

  it('muestra el error y permite reintentar', () => {
    const retry = vi.fn()
    const run = { ...baseRun, status: 'error', error: 'Sin conexión', retry }
    inRouter(<VictoryPanel level={level} mode="coop" run={run} onReplay={vi.fn()} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Sin conexión')
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(retry).toHaveBeenCalled()
  })

  it('permite jugar de nuevo y volver a los niveles del mismo modo', () => {
    const onReplay = vi.fn()
    inRouter(<VictoryPanel level={level} mode="single" run={baseRun} onReplay={onReplay} />)
    fireEvent.click(screen.getByRole('button', { name: /Jugar de nuevo/ }))
    expect(onReplay).toHaveBeenCalled()
    expect(screen.getByRole('link', { name: 'Niveles' })).toHaveAttribute('href', '/levels?mode=single')
    expect(screen.getByRole('link', { name: /Ver ranking/ })).toHaveAttribute('href', '/leaderboard')
  })
})

describe('GameHud', () => {
  const hud = {
    elapsed: 65430, deaths: 3, score: 120, coins: 2, coinsTotal: 5,
    players: [{ charId: 'fox', reached: true }, { charId: 'blu', reached: false }],
  }

  it('muestra tiempo, muertes, tesoros y puntos', () => {
    render(<GameHud hud={hud} mode="single" />)
    expect(screen.getByText('01:05.43')).toBeInTheDocument()
    expect(screen.getByText(/💀 3/)).toBeInTheDocument()
    expect(screen.getByText(/2\/5/)).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
  })

  it('en cooperativo muestra el estado de cada personaje', () => {
    render(<GameHud hud={hud} mode="coop" />)
    expect(screen.getByText(/Fénix ✓/)).toBeInTheDocument()
    expect(screen.getByText('Blu')).toBeInTheDocument()
  })

  it('en un jugador no muestra a los personajes', () => {
    render(<GameHud hud={hud} mode="single" />)
    expect(screen.queryByText(/Fénix/)).not.toBeInTheDocument()
  })
})

describe('GameControls', () => {
  it('explica los controles de cada modo', () => {
    const { rerender } = render(<GameControls mode="coop" />)
    expect(screen.getByText(/Jugador 1/)).toBeInTheDocument()
    expect(screen.getByText(/Los dos personajes/)).toBeInTheDocument()
    rerender(<GameControls mode="single" />)
    expect(screen.queryByText(/Jugador 1/)).not.toBeInTheDocument()
    expect(screen.getByText(/Llega a la bandera/)).toBeInTheDocument()
  })
})

describe('AuthCard y Field', () => {
  it('muestra título, subtítulo, contenido y pie', () => {
    inRouter(<AuthCard title="Entrar" subtitle="Bienvenido" footer={<p>pie</p>}><span>contenido</span></AuthCard>)
    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.getByText('Bienvenido')).toBeInTheDocument()
    expect(screen.getByText('contenido')).toBeInTheDocument()
    expect(screen.getByText('pie')).toBeInTheDocument()
  })

  it('Field asocia la etiqueta con el input', () => {
    render(<Field id="usuario" label="Usuario" type="text" defaultValue="ana" />)
    expect(screen.getByLabelText('Usuario')).toHaveValue('ana')
  })
})

describe('ProtectedRoute', () => {
  const app = (
    <Routes>
      <Route element={<ProtectedRoute />}><Route path="/privada" element={<p>zona privada</p>} /></Route>
      <Route path="/login" element={<p>pantalla de login</p>} />
    </Routes>
  )

  it('sin sesión redirige al login', () => {
    useAuthStore.setState({ token: null, user: null })
    inRouter(app, '/privada')
    expect(screen.getByText('pantalla de login')).toBeInTheDocument()
  })

  it('con sesión muestra la ruta', () => {
    useAuthStore.setState({ token: 'tok', user: { username: 'ana' } })
    inRouter(app, '/privada')
    expect(screen.getByText('zona privada')).toBeInTheDocument()
  })
})
