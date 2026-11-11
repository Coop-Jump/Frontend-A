import { useCallback, useEffect, useRef, useState } from 'react'

export const apiError = (err, fallback) => err?.response?.data?.message || fallback

// Cargando: en curso, o todavía sin dato ni error (antes de que arranque el efecto).
const isLoading = (state, enabled) => state.loading || (enabled && state.data === null && !state.error)

const DEFAULTS = { enabled: true, fallback: 'Ocurrió un error.', keepData: false }

/**
 * Ejecuta una petición asíncrona y expone { data, loading, error, reload }.
 * Se vuelve a ejecutar cuando cambia `key` o `enabled`.
 * Con `keepData` no se borra el dato anterior mientras recarga.
 */
export function useAsync(fn, key, options) {
  const { enabled, fallback, keepData } = { ...DEFAULTS, ...options }
  const [state, setState] = useState({ data: null, loading: enabled, error: '' })
  const [tick, setTick] = useState(0)
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    if (!enabled) return undefined
    let cancelled = false
    const settle = (next) => !cancelled && setState(next)
    setState((s) => ({ data: keepData ? s.data : null, loading: true, error: '' }))
    fnRef.current()
      .then((data) => settle({ data, loading: false, error: '' }))
      .catch((err) => settle((s) => ({ ...s, loading: false, error: apiError(err, fallback) })))
    return () => {
      cancelled = true
    }
  }, [key, enabled, tick, fallback, keepData])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { ...state, loading: isLoading(state, enabled), reload }
}
