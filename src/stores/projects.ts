import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'
import type { Project } from 'src/types/db'

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    items: [] as Project[],
    loading: false
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        this.items = (data || []) as Project[]
      } finally {
        this.loading = false
      }
    },

    async create(payload: Pick<Project, 'name' | 'address' | 'contract_total' | 'advance_pct' | 'start_date'>) {
      const { error } = await supabase.from('projects').insert([{
        name: payload.name,
        address: payload.address,
        contract_total: payload.contract_total,
        advance_pct: payload.advance_pct,
        start_date: payload.start_date,
        status: 'ACTIVE'
      }])
      if (error) throw error
      await this.fetchAll()
    }
  }
})