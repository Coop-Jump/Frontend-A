export function formatTime(ms) {
  const n = Math.max(0, Number(ms) || 0)
  const total = Math.floor(n / 1000)
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  const cs = String(Math.floor((n % 1000) / 10)).padStart(2, '0')
  return `${m}:${s}.${cs}`
}

export function formatDate(iso) {
  return iso ? new Date(iso).toLocaleString() : '-'
}
