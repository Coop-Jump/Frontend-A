import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="page">
      <h1>Frontend-A</h1>
      <p>Bienvenido a la aplicación.</p>
      <nav>
        <Link to="/login">Ir a Login</Link>
        <Link to="/register">Registrarse</Link>
        <Link to="/game">Jugar</Link>
        <Link to="/leaderboard">Clasificación</Link>
        <Link to="/admin">Admin</Link>
      </nav>
    </div>
  )
}