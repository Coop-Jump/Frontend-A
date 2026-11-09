import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import CharacterAvatar from '../components/CharacterAvatar'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <>
      <div className="welcome">
        <span className="avatar" aria-hidden="true">{(user?.username || '?').charAt(0).toUpperCase()}</span>
        <div>
          <p className="eyebrow">Panel de juego</p>
          <h1 style={{ fontSize: 36 }}>¡Hola, {user?.username || 'jugador'}!</h1>
          <p style={{ color: 'var(--text-dim)' }}>Elige cómo quieres jugar hoy.</p>
        </div>
      </div>

      <div className="mode-grid">
        <Link to="/levels?mode=single" className="mode-card" style={{ '--c': '#f97316' }}>
          <div className="chars"><CharacterAvatar id="fox" /></div>
          <h2>Un jugador</h2>
          <p>Controla a Fénix, completa los niveles y mejora tu mejor tiempo.</p>
          <span className="cta">Elegir nivel →</span>
        </Link>

        <Link to="/levels?mode=coop" className="mode-card" style={{ '--c': '#3b82f6' }}>
          <div className="chars">
            <CharacterAvatar id="fox" />
            <CharacterAvatar id="blu" />
          </div>
          <h2>Cooperativo</h2>
          <p>Dos jugadores en el mismo teclado: Fénix con WASD y Blu con las flechas. Lleguen juntos a la meta.</p>
          <span className="cta">Elegir nivel →</span>
        </Link>
      </div>

      <div className="quick-grid">
        <Link to="/leaderboard" className="quick-card">
          <span className="icon">🏆</span>
          <div><strong>Ranking</strong><span>Mejores tiempos por nivel</span></div>
        </Link>
        <Link to="/levels" className="quick-card">
          <span className="icon">🗺️</span>
          <div><strong>Niveles</strong><span>Explora todos los mapas</span></div>
        </Link>
        <Link to="/admin" className="quick-card">
          <span className="icon">🛠️</span>
          <div><strong>Editor de niveles</strong><span>Crea, edita o elimina niveles</span></div>
        </Link>
        <Link to="/settings" className="quick-card">
          <span className="icon">⚙️</span>
          <div><strong>Ajustes</strong><span>Tu cuenta y los controles</span></div>
        </Link>
      </div>
    </>
  )
}
