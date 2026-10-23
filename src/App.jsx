import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Game from './pages/Game'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'

export default function App() {
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
          <li><NavLink to="/admin" className={({isActive}) => isActive ? 'active' : ''}>Admin</NavLink></li>
        </ul>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/game" element={<Game />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}