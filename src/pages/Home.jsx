import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff 0%, #ffe4cc 50%, #ffedd5 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      padding: 40, textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '72px', fontWeight: 900, color: '#f97316', letterSpacing: '-2px',
        background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text', marginBottom: 10
      }}>COOP JUMP</h1>
      <p style={{ fontSize: 22, color: '#c2410c', marginBottom: 50, fontWeight: 500 }}>Juego cooperativo de plataformas</p>

      <div style={{ display: 'flex', gap: 30, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
        <Link to="/login" style={{
          padding: '28px 60px', fontSize: 22, background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
          color: '#fff', borderRadius: 16, textDecoration: 'none', fontWeight: 800,
          boxShadow: '0 15px 40px rgba(249,115,22,0.35)', transition: 'all 0.2s', display: 'inline-block'
        }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 25px 50px rgba(249,115,22,0.5)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(249,115,22,0.35)'; }}>
          Iniciar Sesión
        </Link>
        <Link to="/register" style={{
          padding: '28px 60px', fontSize: 22, background: '#fff', color: '#f97316',
          borderRadius: 16, textDecoration: 'none', fontWeight: 800,
          border: '3px solid #f97316', transition: 'all 0.2s', display: 'inline-block'
        }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.background = '#fff8f0'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = '#fff'; }}>
          Registrarse
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/dashboard" style={{ padding: '14px 28px', background: 'rgba(249,115,22,0.1)', color: '#f97316', borderRadius: 10, textDecoration: 'none', fontWeight: 700, border: '2px solid #f97316' }}>Ir al Dashboard</Link>
        <Link to="/levels" style={{ padding: '14px 28px', background: '#f97316', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>Ver Niveles</Link>
      </div>
    </div>
  )
}
