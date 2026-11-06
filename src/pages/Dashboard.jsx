import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  if (!isAuthenticated) {
    navigate('/')
    return null
  }
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff 0%, #fff5eb 60%, #ffe4cc 100%)', padding: 30 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ fontSize: 42, color: '#f97316', fontWeight: 900, marginBottom: 4, letterSpacing: '-1px' }}>Dashboard</h1>
        <p style={{ color: '#c2410c', marginBottom: 30, fontSize: 16, fontWeight: 500 }}>Selecciona tu modo de juego</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 30 }}>
          <Link to="/singleplayer" style={{ background: '#fff', borderRadius: 20, padding: 30, textDecoration: 'none', color: '#1a202c', boxShadow: '0 15px 40px rgba(249,115,22,0.15)', border: '2px solid #ffedd5', transition: 'all 0.2s', display: 'block' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 25px 50px rgba(249,115,22,0.25)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(249,115,22,0.15)'; }}>
            <h2 style={{ fontSize: 28, color: '#f97316', fontWeight: 800, marginBottom: 10 }}>Singleplayer</h2>
            <p style={{ color: '#7c2d12', fontSize: 15, lineHeight: 1.5 }}>Juega solo, completa niveles y mejora tu puntuación personal. Modo individual.</p>
          </Link>

          <Link to="/two-player" style={{ background: '#fff', borderRadius: 20, padding: 30, textDecoration: 'none', color: '#1a202c', boxShadow: '0 15px 40px rgba(249,115,22,0.15)', border: '2px solid #ffedd5', transition: 'all 0.2s', display: 'block' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 25px 50px rgba(249,115,22,0.25)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(249,115,22,0.15)'; }}>
            <h2 style={{ fontSize: 28, color: '#f97316', fontWeight: 800, marginBottom: 10 }}>Two Player</h2>
            <p style={{ color: '#7c2d12', fontSize: 15, lineHeight: 1.5 }}>Modo cooperativo: WASD + Flechas. Juega con un amigo y lleguen juntos a la meta.</p>
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <Link to="/leaderboard" style={{ flex: 1, minWidth: 250, background: '#fff', borderRadius: 16, padding: 25, textDecoration: 'none', color: '#1a202c', boxShadow: '0 10px 30px rgba(249,115,22,0.1)', border: '2px solid #ffedd5', transition: 'transform 0.2s', display: 'block' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <h3 style={{ fontSize: 22, color: '#f97316', fontWeight: 800, marginBottom: 10 }}>Leaderboard</h3>
            <p style={{ color: '#9a3412', fontSize: 14 }}>Ver las mejores puntuaciones.</p>
          </Link>
          <Link to="/settings" style={{ flex: 1, minWidth: 250, background: '#fff', borderRadius: 16, padding: 25, textDecoration: 'none', color: '#1a202c', boxShadow: '0 10px 30px rgba(249,115,22,0.1)', border: '2px solid #ffedd5', transition: 'transform 0.2s', display: 'block' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <h3 style={{ fontSize: 22, color: '#f97316', fontWeight: 800, marginBottom: 10 }}>Settings</h3>
            <p style={{ color: '#9a3412', fontSize: 14 }}>Ajusta tu cuenta y preferencias.</p>
          </Link>
        </div>

        <div style={{ marginTop: 30, textAlign: 'center' }}>
          <Link to="/levels" style={{ display: 'inline-block', padding: '12px 30px', background: '#f97316', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: 16, boxShadow: '0 6px 20px rgba(249,115,22,0.3)' }}>Ver Niveles</Link>
          <Link to="/admin" style={{ display: 'inline-block', padding: '12px 30px', marginLeft: 10, background: '#fff', color: '#f97316', border: '2px solid #f97316', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: 16 }}>Admin</Link>
        </div>
      </div>
    </div>
  )
}
