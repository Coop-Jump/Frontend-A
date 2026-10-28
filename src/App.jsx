import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Game from './pages/Game'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'
import LevelSelection from './pages/LevelSelection'
import { useAuth } from './hooks/useAuth'

export default function App() {
  const { token, user, login, logout, isAuthenticated } = useAuth()

  return (
    <BrowserRouter>
      <nav className="main-nav">
        <Link to="/" className="logo">Frontend-A</Link>
        <ul>
          <li><NavLink to="/" className={({isActive}) => isActive ? 'active' : ''} end>Inicio</NavLink></li>
          <li><NavLink to="/login" className={({isActive}) => isActive ? 'active' : ''}>Login</NavLink></li>
          <li><NavLink to="/register" className={({isActive}) => isActive ? 'active' : ''}>Registro</NavLink></li>
          <li><NavLink to="/game" className={({isActive}) => isActive ? 'active' : ''}>Juego</NavLink></li>
          <li><NavLink to="/leaderboard" className={({isActive}) => isActive ? 'active' : ''}>Leaderboard</NavLink></li>
          <li><NavLink to="/levels" className={({isActive}) => isActive ? 'active' : ''}>Niveles</NavLink></li>
          <li><NavLink to="/admin" className={({isActive}) => isActive ? 'active' : ''}>Admin</NavLink></li>
        </ul>

        {isAuthenticated ? (
          <div className="auth-buttons">
            <span>Bienvenido, {user?.email || user?.name || 'Usuario'}</span>
            <button onClick={logout} className="btn-logout">Cerrar sesión</button>
          </div>
        ) : (
          <div className="auth-buttons">
            <button onClick={() => login('token-prueba', { name: 'Usuario', email: 'test@test.com' })} className="btn-login">Login</button>
            <button onClick={() => login('token-prueba-2', { name: 'Otro', email: 'otro@test.com' })} className="btn-register">Registro</button>
          </div>
        )}
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/game" element={<Game />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/levels" element={<LevelSelection />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}