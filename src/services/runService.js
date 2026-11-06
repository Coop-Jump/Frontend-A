import api from '../api/client'

// El token de sesión se adjunta automáticamente (Authorization: Bearer) en api/client.js.
// Ruta real del backend: POST /levels/runs
export async function submitRun({ levelId, completionTimeMs, deaths }) {
  const { data } = await api.post('/levels/runs', {
    level_id: levelId,
    completion_time_ms: Math.round(completionTimeMs),
    deaths,
  })
  return data.run
}

// GET /levels/:id/runs -> top 10 de un nivel, ordenado por tiempo
export async function fetchLevelRuns(levelId) {
  const { data } = await api.get(`/levels/${levelId}/runs`)
  return data.runs
}

// GET /levels/users/me/runs -> historial de partidas del usuario autenticado
export async function fetchMyRuns() {
  const { data } = await api.get('/levels/users/me/runs')
  return data.runs
}
