import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser, saveAuthSession } from '../services/authService'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

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
      const response = await registerUser({ email, password })
      setSuccess('Registro exitoso. Redirigiendo...')
      if (response.token || response.accessToken || response.user) {
        saveAuthSession({ token: response.token || response.accessToken, user: response.user })
        setTimeout(() => navigate('/game'), 1500)
      }
    } catch (err) {
      const message = err?.response?.data?.message || 'No se pudo registrar. Intenta más tarde.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1>Registrarse</h1>
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
        <label htmlFor="confirm">Confirmar contraseña</label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </form>
      <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
      <Link to="/">Volver al inicio</Link>
    </div>
  )
}