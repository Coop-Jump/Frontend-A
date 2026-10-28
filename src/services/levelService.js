import api from '../api/client'

export async function fetchLevels() {
  const { data } = await api.get('/levels')
  return data
}

export async function fetchLevelById(id) {
  const { data } = await api.get(`/levels/${id}`)
  return data
}