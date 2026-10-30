import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Game from './pages/Game'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'
import LevelSelection from './pages/LevelSelection'
import Dashboard from './pages/Dashboard'
import Singleplayer from './pages/Singleplayer'
import TwoPlayer from './pages/TwoPlayer'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/game" element={<Game />} />
        <Route path="/singleplayer" element={<Singleplayer />} />
        <Route path="/two-player" element={<TwoPlayer />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/levels" element={<LevelSelection />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  )
}
