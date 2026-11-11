import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { clearAuthSession } from '../services/authService'
import Logo from './Logo'

const LINKS = [
  { to: '/dashboard', label: 'Inicio' },
  { to: '/levels', label: 'Niveles' },
  { to: '/leaderboard', label: 'Ranking' },
  { to: '/admin', label: 'Admin' },
  { to: '/settings', label: 'Ajustes' },
]

function NavLinks() {
  return (
    <nav className="nav-links" aria-label="Principal">
      {LINKS.map((l) => (
        <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}

function NavUser({ username, onLogout }) {
  return (
    <div className="nav-user">
      <span className="avatar" aria-hidden="true">{(username || '?').charAt(0).toUpperCase()}</span>
      <span className="nav-username">{username || 'Jugador'}</span>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onLogout}>Salir</button>
    </div>
  )
}

export default function AppLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const logout = () => {
    clearAuthSession()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="navbar-inner">
          <Logo size={40} to="/dashboard" />
          <NavLinks />
          <NavUser username={user?.username} onLogout={logout} />
        </div>
      </header>
      <main className="page-container"><Outlet /></main>
      <footer className="footer">Coop Jump · juego cooperativo de plataformas</footer>
    </div>
  )
}
