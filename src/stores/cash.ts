import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'
import type { CashTx } from 'src/types/db'

export const useCashStore = defineStore('cash', {
  state: () => ({
    items: [] as CashTx[],
    loading: false
  }),
  getters: {
    balance(state) {
      return state.items.reduce((acc, tx) => {
        if (tx.tx_type === 'IN') return acc + Number(tx.amount)
        return acc - Number(tx.amount)
      }, 0)
    }
  },
  actions: {
    async fetchByProject(projectId: string) {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('cash_transactions')
          .select('*')
          .eq('project_id', projectId)
          .order('tx_date', { ascending: false })
        if (error) throw error
        this.items = (data || []) as CashTx[]
      } finally {
        this.loading = false
      }
    },

    async create(projectId: string, payload: { tx_date: string; tx_type: 'IN'|'OUT'; category: string; amount: number; description?: string }) {
      const { error } = await supabase.from('cash_transactions').insert([{
        project_id: projectId,
        tx_date: payload.tx_date,
        tx_type: payload.tx_type,
        category: payload.category,
        amount: payload.amount,
        description: payload.description || null
      }])
      if (error) throw error
      await this.fetchByProject(projectId)
    }
  }
})