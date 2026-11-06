import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, saveAuthSession } from '../services/authService'
import { Link } from 'react-router-dom'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await loginUser({ username, password })
      saveAuthSession({ token: response.token || response.accessToken, user: response.user })
      navigate('/levels')
    } catch (err) {
      const message = err?.response?.data?.message || 'Credenciales inválidas. Intenta de nuevo.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Nombre de usuario</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="tu_usuario"
          required
        />
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
      <Link to="/">Volver al inicio</Link>
    </div>
  )
}