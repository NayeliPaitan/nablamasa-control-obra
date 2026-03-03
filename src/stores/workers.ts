import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'
import type { Worker } from 'src/types/db'

export const useWorkersStore = defineStore('workers', {
  state: () => ({
    items: [] as Worker[],
    loading: false
  }),
  actions: {
    async fetchByProject(projectId: string) {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('workers')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
        if (error) throw error
        this.items = (data || []) as Worker[]
      } finally {
        this.loading = false
      }
    },

    async create(projectId: string, payload: { full_name: string; role?: string; daily_rate: number }) {
      const { error } = await supabase.from('workers').insert([{
        project_id: projectId,
        full_name: payload.full_name,
        role: payload.role || null,
        daily_rate: payload.daily_rate,
        active: true
      }])
      if (error) throw error
      await this.fetchByProject(projectId)
    }
  }
})