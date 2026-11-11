import { Link, Navigate } from 'react-router-dom'
import { useLoginForm } from '../hooks/useLoginForm'
import AuthCard, { Field } from '../components/AuthCard'

export default function Login() {
  const form = useLoginForm()
  if (form.alreadyLoggedIn) return <Navigate to={form.redirectTo} replace />

  return (
    <AuthCard title="Iniciar sesión" subtitle="Entra al mundo de Coop Jump"
      footer={<p>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>}>
      <form onSubmit={form.submit} className="form-stack">
        <Field id="username" label="Usuario" type="text" autoComplete="username" placeholder="tu_usuario" required
          value={form.username} onChange={(e) => form.setUsername(e.target.value)} />
        <Field id="password" label="Contraseña" type="password" autoComplete="current-password" placeholder="••••••••" required
          value={form.password} onChange={(e) => form.setPassword(e.target.value)} />
        {form.error && <p className="notice notice-error" role="alert">{form.error}</p>}
        <button type="submit" disabled={form.loading} className="btn btn-primary btn-block btn-lg">
          {form.loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </AuthCard>
  )
}
