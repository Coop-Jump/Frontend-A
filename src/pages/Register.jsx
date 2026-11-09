import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/authService'
import Logo from '../components/Logo'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const redirectTimer = useRef(null)

  useEffect(() => () => clearTimeout(redirectTimer.current), [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      await registerUser({ username: username.trim(), password })
      setSuccess('Registro exitoso. Redirigiendo al login...')
      redirectTimer.current = setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      const message = err?.response?.data?.message || 'No se pudo registrar. El backend no está conectado.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-wrap"><Logo size={64} to="/" stacked /></div>
        <h1>Crear cuenta</h1>
        <p className="subtitle">Únete a Coop Jump</p>

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="field">
            <label htmlFor="username">Usuario</label>
            <input id="username" className="input" type="text" autoComplete="username" maxLength={50} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="tu_usuario" required />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input id="password" className="input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <div className="field">
            <label htmlFor="confirm">Confirmar contraseña</label>
            <input id="confirm" className="input" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p className="notice notice-error" role="alert">{error}</p>}
          {success && <p className="notice notice-success" role="status">{success}</p>}
          <button type="submit" disabled={loading || Boolean(success)} className="btn btn-primary btn-block btn-lg">
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <div className="auth-links">
          <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
          <Link to="/">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}
