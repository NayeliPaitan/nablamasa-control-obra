import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'
import type { WorkerAdvance } from 'src/types/db'

export const useAdvancesStore = defineStore('advances', {
  state: () => ({
    items: [] as WorkerAdvance[],
    loading: false
  }),
  actions: {
    async fetchByProject(projectId: string) {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('worker_advances')
          .select('*')
          .eq('project_id', projectId)
          .order('adv_date', { ascending: false })
        if (error) throw error
        this.items = (data || []) as WorkerAdvance[]
      } finally {
        this.loading = false
      }
    },

    async create(projectId: string, payload: { worker_id: string; adv_date: string; amount: number; reason?: string }) {
      const { error } = await supabase.from('worker_advances').insert([{
        project_id: projectId,
        worker_id: payload.worker_id,
        adv_date: payload.adv_date,
        amount: payload.amount,
        reason: payload.reason || null
      }])
      if (error) throw error
      await this.fetchByProject(projectId)
    }
  }
})