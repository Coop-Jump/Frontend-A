import { useSearchParams, Link } from 'react-router-dom'
import PhaserGame from '../components/PhaserGame'

export default function Game() {
  const [searchParams] = useSearchParams()
  const levelId = searchParams.get('level')

  return (
    <div className="page">
      <h1>Juego Cooperativo</h1>
      {levelId && <p>Nivel seleccionado: {levelId}</p>}
      <PhaserGame />
      <Link to="/levels" className="btn-back" style={{ display: 'inline-block', marginTop: '12px' }}>← Volver a niveles</Link>
    </div>
  )
}
