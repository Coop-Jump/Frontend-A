import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../services/authService'
import { useSubmit } from './useSubmit'

const MISMATCH = 'Las contraseñas no coinciden.'
const FALLBACK = 'No se pudo registrar. El backend no está conectado.'

/** Estado y envío del formulario de registro. */
export function useRegisterForm() {
  const [form, setForm] = useState({ username: '', password: '', confirm: '' })
  const [success, setSuccess] = useState('')
  const { loading, error, setError, run } = useSubmit(FALLBACK)
  const navigate = useNavigate()
  const redirectTimer = useRef(null)

  useEffect(() => () => clearTimeout(redirectTimer.current), [])

  const register = async () => {
    await registerUser({ username: form.username.trim(), password: form.password })
    setSuccess('Registro exitoso. Redirigiendo al login...')
    redirectTimer.current = setTimeout(() => navigate('/login'), 1500)
  }

  const submit = (e) => {
    e.preventDefault()
    setSuccess('')
    if (form.password !== form.confirm) return setError(MISMATCH)
    return run(register)
  }

  // Props de un campo controlado: { value, onChange }
  const bind = (name) => ({ value: form[name], onChange: (e) => setForm({ ...form, [name]: e.target.value }) })
  return { bind, loading, error, success, submit }
}
