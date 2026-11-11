import { useCallback, useState } from 'react'
import { submitRun } from '../services/runService'
import { apiError } from './useAsync'

/** Guarda el resultado de la partida en el backend (POST /levels/runs). */
export function useRunSubmit(levelId) {
  const [result, setResult] = useState(null) // { completionTimeMs, deaths, score, coins, coinsTotal }
  const [save, setSave] = useState({ status: 'idle', error: '' }) // idle | sending | saved | error

  const send = useCallback(async (res) => {
    setSave({ status: 'sending', error: '' })
    try {
      await submitRun({ levelId, completionTimeMs: res.completionTimeMs, deaths: res.deaths })
      setSave({ status: 'saved', error: '' })
    } catch (err) {
      setSave({ status: 'error', error: apiError(err, 'No se pudo guardar la partida.') })
    }
  }, [levelId])

  const complete = useCallback((res) => {
    setResult(res)
    send(res)
  }, [send])

  const reset = useCallback(() => {
    setResult(null)
    setSave({ status: 'idle', error: '' })
  }, [])

  return { result, ...save, complete, retry: () => send(result), reset }
}
