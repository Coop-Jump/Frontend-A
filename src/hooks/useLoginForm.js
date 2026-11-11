import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loginUser, saveAuthSession } from '../services/authService'
import { useAuth } from './useAuth'
import { useSubmit } from './useSubmit'

const FALLBACK = 'No se pudo conectar con el servidor. El backend no está en ejecución.'

/** Estado y envío del formulario de inicio de sesión. */
export function useLoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { loading, error, run } = useSubmit(FALLBACK)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const redirectTo = useLocation().state?.from || '/dashboard'

  const submit = (e) => {
    e.preventDefault()
    run(async () => {
      const response = await loginUser({ username: username.trim(), password })
      saveAuthSession({ token: response.token || response.accessToken, user: response.user })
      navigate(redirectTo, { replace: true })
    })
  }

  return {
    username, setUsername, password, setPassword, loading, error, submit,
    alreadyLoggedIn: isAuthenticated && !loading,
    redirectTo,
  }
}
