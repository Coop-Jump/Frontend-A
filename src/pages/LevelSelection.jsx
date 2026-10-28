import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchLevels } from '../services/levelService'

export default function LevelSelection() {
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function loadLevels() {
      try {
        const data = await fetchLevels()
        setLevels(data)
      } catch (err) {
        const message = err?.response?.data?.message || 'No se pudieron cargar los niveles.'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    loadLevels()
  }, [])

  if (loading) {
    return (
      <div className="page">
        <h1>Cargando niveles...</h1>
        <p>Por favor, espera un momento.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <h1>Error</h1>
        <p>{error}</p>
        <Link to="/" className="btn-back">Volver al inicio</Link>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Seleccionar Nivel</h1>
      <p>Elige un nivel para jugar:</p>
      <div className="levels-grid">
        {levels.map((level) => (
          <div key={level.id} className="level-card">
            <h3>Nivel {level.number}</h3>
            <p>{level.description || 'Descripción no disponible'}</p>
            <button
              onClick={() => navigate(`/game?level=${level.id}`)}
              className="btn-play"
            >
              Jugar
            </button>
          </div>
        ))}
      </div>
      <Link to="/" className="btn-back">Volver al inicio</Link>
    </div>
  )
}