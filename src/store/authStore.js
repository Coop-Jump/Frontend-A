import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const STORAGE_KEY = 'auth-token'

const createAuthStore = (set) => ({
  token: null,
  user: null,

  login: (token, user) => {
    localStorage.setItem(STORAGE_KEY, token)
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ token: null, user: null })
  },

  setUser: (user) => set({ user }),
})

export const useAuthStore = create(
  persist(createAuthStore, {
    name: STORAGE_KEY,
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ token: state.token, user: state.user }),
  }),
)