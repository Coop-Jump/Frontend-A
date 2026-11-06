import api from '../api/client'
import { useAuthStore } from '../store/authStore'

export async function registerUser({ username, password }) {
  const { data } = await api.post('/auth/register', { username, password })
  return data
}

export async function loginUser({ username, password }) {
  const { data } = await api.post('/auth/login', { username, password })
  return data
}

export function saveAuthSession({ token, user }) {
  useAuthStore.getState().login(token, user)
}

export function clearAuthSession() {
  useAuthStore.getState().logout()
}