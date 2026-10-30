import { Link } from 'react-router-dom'

export default function Admin() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff 0%, #fff5eb 100%)', padding: 30 }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 36, color: '#f97316', fontWeight: 900, marginBottom: 10 }}>Panel de Administración</h1>
        <p style={{ color: '#c2410c', marginBottom: 30, fontWeight: 500 }}>Gestión de niveles, usuarios y estadísticas.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {[
            { title: 'Niveles', desc: 'Crear, editar y eliminar niveles.' },
            { title: 'Usuarios', desc: 'Ver cuentas registradas.' },
            { title: 'Estadísticas', desc: 'Puntuaciones y registros.' },
          ].map((item) => (
            <div key={item.title} style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 10px 30px rgba(249,115,22,0.1)', border: '2px solid #ffedd5' }}>
              <h3 style={{ color: '#f97316', marginBottom: 8, fontWeight: 800 }}>{item.title}</h3>
              <p style={{ color: '#7c2d12', fontSize: 14 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 30, textAlign: 'center' }}>
          <Link to="/dashboard" style={{ display: 'inline-block', padding: '12px 30px', background: '#f97316', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: 16, boxShadow: '0 6px 20px rgba(249,115,22,0.3)' }}>Volver al Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
