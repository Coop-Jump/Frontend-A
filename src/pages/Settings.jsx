import { Link } from 'react-router-dom'

export default function Settings() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff 0%, #fff5eb 100%)', padding: 30 }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: 36, color: '#f97316', fontWeight: 900, marginBottom: 10 }}>Settings</h1>
        <p style={{ color: '#c2410c', marginBottom: 30, fontWeight: 500 }}>Configuración de tu cuenta y juego.</p>

        <div style={{ background: '#fff', padding: 28, borderRadius: 16, boxShadow: '0 10px 30px rgba(249,115,22,0.1)', border: '2px solid #ffedd5', marginBottom: 20 }}>
          <h3 style={{ color: '#f97316', marginBottom: 14, fontWeight: 800, fontSize: 20 }}>Cuenta</h3>
          <p style={{ color: '#7c2d12', fontSize: 15, marginBottom: 4 }}><strong>Nombre:</strong> Usuario Demo</p>
          <p style={{ color: '#7c2d12', fontSize: 15, marginBottom: 12 }}><strong>Email:</strong> demo@coopjump.com</p>
          <button style={{ padding: '10px 20px', background: '#f97316', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 6px 15px rgba(249,115,22,0.2)' }} onClick={() => alert('Sesión cerrada (demo)')}>Cerrar sesión</button>
        </div>

        <div style={{ background: '#fff', padding: 28, borderRadius: 16, boxShadow: '0 10px 30px rgba(249,115,22,0.1)', border: '2px solid #ffedd5', marginBottom: 20 }}>
          <h3 style={{ color: '#f97316', marginBottom: 14, fontWeight: 800, fontSize: 20 }}>Juego</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#1a202c', fontSize: 15, marginBottom: 10, cursor: 'pointer' }}><input type="checkbox" defaultChecked style={{ width: 20, height: 20, accentColor: '#f97316' }} /> Sonido activado</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#1a202c', fontSize: 15, cursor: 'pointer' }}><input type="checkbox" style={{ width: 20, height: 20, accentColor: '#f97316' }} /> Modo oscuro</label>
        </div>

        <Link to="/dashboard" style={{ display: 'inline-block', padding: '12px 30px', background: '#f97316', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: 16, boxShadow: '0 6px 20px rgba(249,115,22,0.3)' }}>Ir al Dashboard</Link>
      </div>
    </div>
  )
}
