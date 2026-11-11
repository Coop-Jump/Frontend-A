import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'

vi.mock('../services/levelService', () => ({
  fetchLevels: vi.fn(),
  createLevel: vi.fn(),
  updateLevel: vi.fn(),
  deleteLevel: vi.fn(),
}))
vi.mock('./LevelPreview', () => ({ default: () => <div data-testid="preview" /> }))

import LevelsAdminPanel from './LevelsAdminPanel'
import { createLevel, deleteLevel, fetchLevels, updateLevel } from '../services/levelService'

const GRID = { grid_width: 20, grid_height: 15, spawn_j1: { x: 1, y: 13 }, goal: { x: 10, y: 1 }, platforms: [] }
const LEVELS = [
  { id: 'l1', title: 'Primeros Pasos', difficulty: 'easy', grid_json: GRID },
  { id: 'l2', title: 'El Ascenso', difficulty: 'medium', grid_json: GRID },
]

beforeEach(() => {
  vi.clearAllMocks()
  window.scrollTo = vi.fn()
  fetchLevels.mockResolvedValue({ levels: LEVELS })
})

describe('LevelsAdminPanel', () => {
  it('lista los niveles existentes', async () => {
    render(<LevelsAdminPanel />)
    expect(await screen.findByText('Primeros Pasos')).toBeInTheDocument()
    expect(screen.getByText('El Ascenso')).toBeInTheDocument()
    expect(screen.getByText('➕ Nuevo nivel')).toBeInTheDocument()
  })

  it('avisa cuando no hay niveles', async () => {
    fetchLevels.mockResolvedValue({ levels: [] })
    render(<LevelsAdminPanel />)
    expect(await screen.findByText('No hay niveles creados')).toBeInTheDocument()
  })

  it('muestra el error si falla la carga', async () => {
    fetchLevels.mockRejectedValue(new Error('caído'))
    render(<LevelsAdminPanel />)
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los niveles.')
  })

  it('crea un nivel nuevo con la plantilla y recarga la lista', async () => {
    createLevel.mockResolvedValue({})
    render(<LevelsAdminPanel />)
    await screen.findByText('Primeros Pasos')
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Mi nivel' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear nivel' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Nivel creado.')
    const payload = createLevel.mock.calls[0][0]
    expect(payload).toMatchObject({ title: 'Mi nivel', difficulty: 'easy' })
    expect(payload.grid_json.grid_width).toBe(20)
    expect(fetchLevels).toHaveBeenCalledTimes(2)
  })

  it('valida que el JSON del tablero sea correcto', async () => {
    render(<LevelsAdminPanel />)
    await screen.findByText('Primeros Pasos')
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Roto' } })
    fireEvent.change(screen.getByLabelText('grid_json'), { target: { value: '{ no es json' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear nivel' }))
    expect((await screen.findAllByText(/no es un JSON válido/)).length).toBeGreaterThan(0)
    expect(createLevel).not.toHaveBeenCalled()
  })

  it('edita un nivel: carga el formulario y guarda con PUT', async () => {
    updateLevel.mockResolvedValue({})
    render(<LevelsAdminPanel />)
    await screen.findByText('El Ascenso')
    fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[1])

    expect(screen.getByText('✏️ Editar nivel')).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toHaveValue('El Ascenso')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Nivel actualizado.')
    expect(updateLevel).toHaveBeenCalledWith('l2', expect.objectContaining({ title: 'El Ascenso', difficulty: 'medium' }))
  })

  it('cancelar la edición vuelve al formulario vacío', async () => {
    render(<LevelsAdminPanel />)
    await screen.findByText('Primeros Pasos')
    fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByText('➕ Nuevo nivel')).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toHaveValue('')
  })

  it('elimina un nivel solo si se confirma', async () => {
    deleteLevel.mockResolvedValue({})
    const confirm = vi.spyOn(window, 'confirm')
    render(<LevelsAdminPanel />)
    await screen.findByText('Primeros Pasos')

    confirm.mockReturnValueOnce(false)
    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[0])
    expect(deleteLevel).not.toHaveBeenCalled()

    confirm.mockReturnValueOnce(true)
    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[0])
    await waitFor(() => expect(deleteLevel).toHaveBeenCalledWith('l1'))
    expect(await screen.findByText('Nivel eliminado.')).toBeInTheDocument()
    confirm.mockRestore()
  })

  it('muestra el error del backend al guardar', async () => {
    createLevel.mockRejectedValue({ response: { data: { message: 'title is required' } } })
    render(<LevelsAdminPanel />)
    await screen.findByText('Primeros Pasos')
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'X' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear nivel' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('title is required')
  })

  it('al pegar un nivel completo rellena título y dificultad', async () => {
    render(<LevelsAdminPanel />)
    await screen.findByText('Primeros Pasos')
    const full = JSON.stringify({ title: 'Importado', difficulty: 'hard', grid_json: GRID })
    fireEvent.change(screen.getByLabelText('grid_json'), { target: { value: full } })
    expect(screen.getByLabelText('Título')).toHaveValue('Importado')
    expect(within(screen.getByLabelText('Dificultad')).getByRole('option', { name: 'Difícil' }).selected).toBe(true)
  })
})
