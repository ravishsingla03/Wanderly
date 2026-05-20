import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  signOut: async () => {
    set({ user: null, profile: null })
    try {
      await supabase.auth.signOut()
    } finally {
      // Always nuke the stored token so a page refresh never restores the session
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith('sb-'))
          .forEach((k) => localStorage.removeItem(k))
      } catch {
        // localStorage not available (SSR / private mode)
      }
    }
  },

  setLoading: (loading) => set({ loading }),
}))

export default useAuthStore
