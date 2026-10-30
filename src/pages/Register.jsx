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
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    try {
      const response = await registerUser({ email, password })
      setSuccess('Registro exitoso. Redirigiendo...')
      if (response.token || response.accessToken || response.user) {
        saveAuthSession({ token: response.token || response.accessToken, user: response.user })
        setTimeout(() => navigate('/dashboard'), 1500)
      }
    } catch (err) {
      const message = err?.response?.data?.message || 'No se pudo registrar. El backend no está conectado.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff5eb 0%, #ffe4cc 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: 48, width: '100%', maxWidth: 420, boxShadow: '0 25px 60px rgba(249,115,22,0.2)', border: '2px solid #ffedd5' }}>
        <h1 style={{ fontSize: 36, color: '#f97316', fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>Registrarse</h1>
        <p style={{ color: '#fb923c', textAlign: 'center', marginBottom: 28, fontWeight: 500 }}>Únete a Coop Jump</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label htmlFor="email" style={{ fontSize: 14, fontWeight: 600, color: '#c2410c' }}>Correo</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" required style={{ padding: 14, borderRadius: 10, border: '2px solid #ffedd5', background: '#fff7ed', color: '#1a202c', fontSize: 16 }} />
          <label htmlFor="password" style={{ fontSize: 14, fontWeight: 600, color: '#c2410c', marginTop: 6 }}>Contraseña</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ padding: 14, borderRadius: 10, border: '2px solid #ffedd5', background: '#fff7ed', color: '#1a202c', fontSize: 16 }} />
          <label htmlFor="confirm" style={{ fontSize: 14, fontWeight: 600, color: '#c2410c', marginTop: 6 }}>Confirmar contraseña</label>
          <input id="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required style={{ padding: 14, borderRadius: 10, border: '2px solid #ffedd5', background: '#fff7ed', color: '#1a202c', fontSize: 16 }} />
          <button type="submit" disabled={loading} style={{ marginTop: 10, padding: 16, background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 18, cursor: 'pointer', boxShadow: '0 10px 20px rgba(249,115,22,0.3)' }}>
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>
        {success && <p style={{ color: '#16a34a', fontSize: 14, marginTop: 12, textAlign: 'center', fontWeight: 700 }}>{success}</p>}
        {error && <p style={{ color: '#e53e3e', fontSize: 14, marginTop: 12 }}>{error}</p>}
        <div style={{ textAlign: 'center', marginTop: 20, color: '#c2410c', fontSize: 14 }}>
          <p>¿Ya tienes cuenta? <Link to="/login" style={{ color: '#f97316', fontWeight: 700, textDecoration: 'underline' }}>Inicia sesión</Link></p>
        </div>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <Link to="/" style={{ color: '#fb923c', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>← Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}
