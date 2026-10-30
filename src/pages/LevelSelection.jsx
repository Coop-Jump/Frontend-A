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
        setLevels(data || [])
      } catch (err) {
        const message = err?.response?.data?.message || 'No se pudieron cargar los niveles. El backend no está conectado.'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    loadLevels()
  }, [])

  return (
    <div className="page" style={{ maxWidth: 1000, margin: '0 auto', padding: 30 }}>
      <h1 style={{ fontSize: 36, color: '#f97316', fontWeight: 800, marginBottom: 4 }}>Seleccionar Nivel</h1>
      <p style={{ color: '#c2410c', marginBottom: 30, fontWeight: 500 }}>Elige un nivel para jugar.</p>

      {loading && <p style={{ color: '#f97316', fontSize: 18, fontWeight: 600 }}>Cargando niveles...</p>}
      {error && (
        <div style={{ background: '#fff', border: '2px solid #f97316', borderRadius: 12, padding: 20, color: '#7c2d12', marginBottom: 20 }}>
          <strong style={{ color: '#f97316', fontSize: 20 }}>Conexión fallida</strong>
          <p style={{ margin: '8px 0 0' }}>{error}</p>
          <p style={{ fontSize: 14, color: '#fb923c', marginTop: 8 }}>Asegúrate de que el servidor esté corriendo.</p>
        </div>
      )}
      {!loading && !error && levels.length === 0 && (
        <p style={{ color: '#c2410c' }}>No hay niveles disponibles.</p>
      )}

      {!loading && !error && levels.length > 0 && (
        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {levels.map((level) => (
            <div key={level.id} style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fff 100%)', border: '2px solid #ffedd5', borderRadius: 16, padding: 24, color: '#1a202c', boxShadow: '0 8px 20px rgba(249,115,22,0.15)' }}>
              <h3 style={{ fontSize: 22, color: '#f97316', fontWeight: 800, marginBottom: 6 }}>{level.number ? `Nivel ${level.number}` : `Nivel ${level.id}`}</h3>
              <p style={{ color: '#7c2d12', fontSize: 15, marginBottom: 12 }}>{level.description || 'Sin descripción'}</p>
              <button
                onClick={() => navigate(`/game?level=${level.id}`)}
                style={{ width: '100%', padding: 12, background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
              >Jugar</button>
            </div>
          ))}
        </div>
      )}

      <Link to="/dashboard" style={{ display: 'inline-block', marginTop: 30, padding: '12px 30px', background: '#f97316', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 800, fontSize: 16 }}>← Volver al Dashboard</Link>
    </div>
  )
}
