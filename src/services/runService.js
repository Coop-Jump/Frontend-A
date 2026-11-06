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
