import { Link } from 'react-router-dom'

export default function Register() {
  return (
    <div className="page">
      <h1>Registrarse</h1>
      <form>
        <label>Correo electrónico</label>
        <input type="email" placeholder="tu@correo.com" />
        <label>Contraseña</label>
        <input type="password" placeholder="••••••••" />
        <label>Confirmar contraseña</label>
        <input type="password" placeholder="••••••••" />
        <button type="submit">Registrarse</button>
      </form>
      <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
      <Link to="/">Volver al inicio</Link>
    </div>
  )
}