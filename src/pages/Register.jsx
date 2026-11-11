import { Link } from 'react-router-dom'
import { useRegisterForm } from '../hooks/useRegisterForm'
import AuthCard, { Field } from '../components/AuthCard'

export default function Register() {
  const form = useRegisterForm()

  return (
    <AuthCard title="Crear cuenta" subtitle="Únete a Coop Jump"
      footer={<p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>}>
      <form onSubmit={form.submit} className="form-stack">
        <Field id="username" label="Usuario" type="text" autoComplete="username" maxLength={50}
          placeholder="tu_usuario" required {...form.bind('username')} />
        <Field id="password" label="Contraseña" type="password" autoComplete="new-password"
          placeholder="••••••••" required {...form.bind('password')} />
        <Field id="confirm" label="Confirmar contraseña" type="password" autoComplete="new-password"
          placeholder="••••••••" required {...form.bind('confirm')} />
        {form.error && <p className="notice notice-error" role="alert">{form.error}</p>}
        {form.success && <p className="notice notice-success" role="status">{form.success}</p>}
        <button type="submit" disabled={form.loading || Boolean(form.success)} className="btn btn-primary btn-block btn-lg">
          {form.loading ? 'Creando cuenta...' : 'Registrarme'}
        </button>
      </form>
    </AuthCard>
  )
}
