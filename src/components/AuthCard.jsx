import { Link } from 'react-router-dom'
import Logo from './Logo'

export function Field({ id, label, ...inputProps }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} className="input" {...inputProps} />
    </div>
  )
}

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-wrap"><Logo size={64} to="/" stacked /></div>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
        {children}
        <div className="auth-links">
          {footer}
          <Link to="/">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}
