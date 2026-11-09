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

export default function AppLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuthSession()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="navbar-inner">
          <Logo size={40} to="/dashboard" />
          <nav className="nav-links" aria-label="Principal">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="nav-user">
            <span className="avatar" aria-hidden="true">{(user?.username || '?').charAt(0).toUpperCase()}</span>
            <span className="nav-username">{user?.username || 'Jugador'}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>Salir</button>
          </div>
        </div>
      </header>
      <main className="page-container">
        <Outlet />
      </main>
      <footer className="footer">Coop Jump · juego cooperativo de plataformas</footer>
    </div>
  )
}
