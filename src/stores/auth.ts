import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    session: null as Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'] | null
  }),
  actions: {
    async loadSession() {
      const { data } = await supabase.auth.getSession()
      this.session = data.session
    },
    async logout() {
      await supabase.auth.signOut()
      this.session = null
    }
  }
})