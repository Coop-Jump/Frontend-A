import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import PhaserGame from '../components/PhaserGame'

export default function Singleplayer() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  if (!isAuthenticated) { navigate('/'); return null }
  return (
    <div className="page">
      <h1 style={{ fontSize: 32, color: '#f97316', marginBottom: 10 }}>Singleplayer</h1>
      <p style={{ color: '#cbd5e0', marginBottom: 20 }}>Juega solo y completa los niveles.</p>
      <PhaserGame />
      <Link to="/dashboard" style={{ display: 'inline-block', marginTop: 16, padding: '10px 24px', background: '#f97316', color: '#fff', borderRadius: 8, textDecoration: 'none' }}>← Volver</Link>
    </div>
  )
}
