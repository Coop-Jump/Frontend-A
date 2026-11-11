import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import CharacterAvatar from '../components/CharacterAvatar'
import Logo from '../components/Logo'

const FEATURES = [
  { icon: '🤝', title: 'Cooperativo', text: 'Dos personajes, un objetivo: lleguen juntos a la bandera.' },
  { icon: '🗺️', title: 'Niveles variados', text: 'Plataformas móviles, suelos que se rompen, pinchos y lava.' },
  { icon: '⏱️', title: 'Compite', text: 'Baja tu tiempo y sube en el ranking de cada nivel.' },
]

function HeroBackground() {
  return (
    <div className="hero-bg" aria-hidden="true">
      <span className="orb orb-1" />
      <span className="orb orb-2" />
      <span className="orb orb-3" />
    </div>
  )
}

function HeroTop({ isAuthenticated }) {
  return (
    <header className="hero-top">
      <Logo size={44} to="/" />
      <div className="actions">
        {isAuthenticated ? (
          <Link to="/dashboard" className="btn btn-ghost btn-sm">Ir al panel</Link>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Iniciar sesión</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Registrarse</Link>
          </>
        )}
      </div>
    </header>
  )
}

function HeroCta({ isAuthenticated, username }) {
  if (!isAuthenticated) {
    return (
      <div className="hero-cta">
        <Link to="/login" className="btn btn-primary btn-lg">▶ Iniciar sesión</Link>
        <Link to="/register" className="btn btn-secondary btn-lg">Crear cuenta</Link>
      </div>
    )
  }
  return (
    <div className="hero-cta">
      <Link to="/levels" className="btn btn-primary btn-lg">▶ Jugar{username ? `, ${username}` : ''}</Link>
      <Link to="/leaderboard" className="btn btn-ghost btn-lg">🏆 Ranking</Link>
    </div>
  )
}

function Features() {
  return (
    <div className="features">
      {FEATURES.map((f) => (
        <div key={f.title} className="feature">
          <div className="icon">{f.icon}</div>
          <h3>{f.title}</h3>
          <p>{f.text}</p>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="hero">
      <HeroBackground />
      <HeroTop isAuthenticated={isAuthenticated} />
      <main className="hero-main">
        <div>
          <div className="hero-chars">
            <CharacterAvatar id="fox" className="hero-char" />
            <CharacterAvatar id="blu" className="hero-char" />
          </div>
          <h1 className="hero-title">COOP <span>JUMP</span></h1>
          <p className="hero-tagline">
            Juego cooperativo de plataformas. Salta, esquiva y llega a la meta junto a tu compañero.
          </p>
          <HeroCta isAuthenticated={isAuthenticated} username={user?.username} />
          <Features />
        </div>
      </main>
    </div>
  )
}
