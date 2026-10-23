import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const setUser = useAuthStore((state) => state.setUser)

  const isAuthenticated = Boolean(token)

  return { token, user, login, logout, setUser, isAuthenticated }
}