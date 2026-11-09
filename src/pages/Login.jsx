import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { loginUser, saveAuthSession } from '../services/authService'
import { useAuth } from '../hooks/useAuth'
import Logo from '../components/Logo'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const redirectTo = location.state?.from || '/dashboard'

  if (isAuthenticated && !loading) return <Navigate to={redirectTo} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await loginUser({ username: username.trim(), password })
      saveAuthSession({ token: response.token || response.accessToken, user: response.user })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const message = err?.response?.data?.message || 'No se pudo conectar con el servidor. El backend no está en ejecución.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-wrap"><Logo size={64} to="/" stacked /></div>
        <h1>Iniciar sesión</h1>
        <p className="subtitle">Entra al mundo de Coop Jump</p>

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="field">
            <label htmlFor="username">Usuario</label>
            <input id="username" className="input" type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="tu_usuario" required />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input id="password" className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p className="notice notice-error" role="alert">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-links">
          <p>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
          <Link to="/">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}
