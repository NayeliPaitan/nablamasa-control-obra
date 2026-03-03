import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'
import type { Profile } from 'src/types/db'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null as Profile | null
  }),
  actions: {
    async loadMyProfile() {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user.id
      if (!uid) {
        this.profile = null
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, company_id, full_name, role')
        .eq('id', uid)
        .single()

      if (error) throw error
      this.profile = data as Profile
    }
  }
})