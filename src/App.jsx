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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/levels" element={<LevelSelection />} />
            <Route path="/game" element={<Game />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>

        {/* Rutas antiguas: ahora el modo se elige en la selección de nivel */}
        <Route path="/singleplayer" element={<Navigate to="/levels?mode=single" replace />} />
        <Route path="/two-player" element={<Navigate to="/levels?mode=coop" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
