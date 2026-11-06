import { Link } from 'react-router-dom'

export default function Leaderboard() {
  const scores = [
    { name: 'Alice', score: 1250, mode: 'Coop' },
    { name: 'Bob', score: 980, mode: 'Single' },
    { name: 'Charlie', score: 870, mode: 'Coop' },
    { name: 'Diana', score: 720, mode: 'Single' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff 0%, #fff5eb 100%)', padding: 30 }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 42, color: '#f97316', fontWeight: 900, marginBottom: 4 }}>Leaderboard</h1>
        <p style={{ color: '#c2410c', marginBottom: 30, fontWeight: 500 }}>Mejores puntuaciones</p>

        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 30px rgba(249,115,22,0.15)', border: '1px solid #ffedd5' }}>
          <thead style={{ background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)', color: '#fff' }}>
            <tr>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 16, fontWeight: 700 }}>Pos</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 16, fontWeight: 700 }}>Jugador</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 16, fontWeight: 700 }}>Modo</th>
              <th style={{ padding: 16, textAlign: 'right', fontSize: 16, fontWeight: 700 }}>Puntos</th>
            </tr>
          </thead>
          <tbody style={{ color: '#1a202c' }}>
            {scores.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #ffedd5', background: i % 2 === 0 ? '#fff' : '#fff7ed' }}>
                <td style={{ padding: 16, fontWeight: 'bold', color: '#f97316', fontSize: 18 }}>{i + 1}</td>
                <td style={{ padding: 16, fontWeight: 600 }}>{s.name}</td>
                <td style={{ padding: 16 }}><span style={{ padding: '4px 10px', background: s.mode === 'Coop' ? '#f97316' : '#fb923c', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#fff' }}>{s.mode}</span></td>
                <td style={{ padding: 16, textAlign: 'right', fontWeight: 800, fontSize: 20, color: '#c2410c' }}>{s.score}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 30, textAlign: 'center' }}>
          <Link to="/dashboard" style={{ display: 'inline-block', padding: '12px 30px', background: '#f97316', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: 16, boxShadow: '0 6px 20px rgba(249,115,22,0.3)' }}>Volver al Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
