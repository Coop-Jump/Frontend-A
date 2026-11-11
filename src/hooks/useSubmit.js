import { useState } from 'react'
import { apiError } from './useAsync'

/** Estado de un formulario que envía una petición: { loading, error, setError, run }. */
export function useSubmit(fallback) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async (action) => {
    setError('')
    setLoading(true)
    try {
      await action()
    } catch (err) {
      setError(apiError(err, fallback))
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, setError, run }
}
