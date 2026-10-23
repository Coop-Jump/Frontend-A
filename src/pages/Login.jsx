import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <div className="page">
      <h1>Iniciar Sesión</h1>
      <form>
        <label>Correo electrónico</label>
        <input type="email" placeholder="tu@correo.com" />
        <label>Contraseña</label>
        <input type="password" placeholder="••••••••" />
        <button type="submit">Entrar</button>
      </form>
      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
      <Link to="/">Volver al inicio</Link>
    </div>
  )
}