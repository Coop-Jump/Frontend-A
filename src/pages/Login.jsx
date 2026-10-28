import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, saveAuthSession } from '../services/authService'
import { Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await loginUser({ email, password })
      saveAuthSession({ token: response.token || response.accessToken, user: response.user })
      navigate('/game')
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
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
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