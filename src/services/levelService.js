import api from '../api/client'

export async function fetchLevels() {
  const { data } = await api.get('/levels')
  return data
}

export async function fetchLevelById(id) {
  const { data } = await api.get(`/levels/${id}`)
  return data
}

export async function createLevel(payload) {
  const { data } = await api.post('/levels', payload)
  return data
}

export async function updateLevel(id, payload) {
  const { data } = await api.put(`/levels/${id}`, payload)
  return data
}

export async function deleteLevel(id) {
  const { data } = await api.delete(`/levels/${id}`)
  return data
}