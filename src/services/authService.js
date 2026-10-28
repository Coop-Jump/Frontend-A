import api from '../api/client'
import { useAuthStore } from '../store/authStore'

export async function registerUser({ email, password }) {
  const { data } = await api.post('/auth/register', { email, password })
  return data
}

export async function loginUser({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export function saveAuthSession({ token, user }) {
  useAuthStore.getState().login(token, user)
}

export function clearAuthSession() {
  useAuthStore.getState().logout()
}