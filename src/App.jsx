import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Game from './pages/Game'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'
import LevelSelection from './pages/LevelSelection'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'

const PRIVATE_ROUTES = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/levels', element: <LevelSelection /> },
  { path: '/game', element: <Game /> },
  { path: '/leaderboard', element: <Leaderboard /> },
  { path: '/settings', element: <Settings /> },
  { path: '/admin', element: <Admin /> },
]

// Rutas antiguas: ahora el modo se elige en la selección de nivel
const LEGACY_REDIRECTS = [
  { path: '/singleplayer', to: '/levels?mode=single' },
  { path: '/two-player', to: '/levels?mode=coop' },
]

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Zona privada: exige sesión y comparte barra de navegación */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {PRIVATE_ROUTES.map((r) => <Route key={r.path} path={r.path} element={r.element} />)}
          </Route>
        </Route>

        {LEGACY_REDIRECTS.map((r) => <Route key={r.path} path={r.path} element={<Navigate to={r.to} replace />} />)}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
