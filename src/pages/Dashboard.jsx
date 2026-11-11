import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import CharacterAvatar from '../components/CharacterAvatar'

const QUICK_LINKS = [
  { to: '/leaderboard', icon: '🏆', title: 'Ranking', text: 'Mejores tiempos por nivel' },
  { to: '/levels', icon: '🗺️', title: 'Niveles', text: 'Explora todos los mapas' },
  { to: '/admin', icon: '🛠️', title: 'Editor de niveles', text: 'Crea, edita o elimina niveles' },
  { to: '/settings', icon: '⚙️', title: 'Ajustes', text: 'Tu cuenta y los controles' },
]

const MODES = [
  {
    to: '/levels?mode=single', color: '#f97316', title: 'Un jugador', avatars: ['fox'],
    text: 'Controla a Fénix, completa los niveles y mejora tu mejor tiempo.',
  },
  {
    to: '/levels?mode=coop', color: '#3b82f6', title: 'Cooperativo', avatars: ['fox', 'blu'],
    text: 'Dos jugadores en el mismo teclado: Fénix con WASD y Blu con las flechas. Lleguen juntos a la meta.',
  },
]

function Welcome({ username }) {
  return (
    <div className="welcome">
      <span className="avatar" aria-hidden="true">{(username || '?').charAt(0).toUpperCase()}</span>
      <div>
        <p className="eyebrow">Panel de juego</p>
        <h1 style={{ fontSize: 36 }}>¡Hola, {username || 'jugador'}!</h1>
        <p style={{ color: 'var(--text-dim)' }}>Elige cómo quieres jugar hoy.</p>
      </div>
    </div>
  )
}

function ModeCard({ mode }) {
  return (
    <Link to={mode.to} className="mode-card" style={{ '--c': mode.color }}>
      <div className="chars">{mode.avatars.map((id) => <CharacterAvatar key={id} id={id} />)}</div>
      <h2>{mode.title}</h2>
      <p>{mode.text}</p>
      <span className="cta">Elegir nivel →</span>
    </Link>
  )
}

function QuickCard({ link }) {
  return (
    <Link to={link.to} className="quick-card">
      <span className="icon">{link.icon}</span>
      <div><strong>{link.title}</strong><span>{link.text}</span></div>
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  return (
    <>
      <Welcome username={user?.username} />
      <div className="mode-grid">{MODES.map((m) => <ModeCard key={m.to} mode={m} />)}</div>
      <div className="quick-grid">{QUICK_LINKS.map((l) => <QuickCard key={l.to} link={l} />)}</div>
    </>
  )
}
