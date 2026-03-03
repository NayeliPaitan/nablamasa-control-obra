import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'
import type { Worker, Attendance, WorkerAdvance } from 'src/types/db'

export type PayrollRow = {
  worker_id: string
  worker_name: string
  daily_rate: number
  days_present: number
  gross: number
  advances: number
  net: number
}

export const usePayrollStore = defineStore('payroll', {
  state: () => ({
    rows: [] as PayrollRow[],
    loading: false,
    weekStart: '' as string,
    weekEnd: '' as string
  }),
  getters: {
    totalGross: (s) => s.rows.reduce((a, r) => a + r.gross, 0),
    totalAdvances: (s) => s.rows.reduce((a, r) => a + r.advances, 0),
    totalNet: (s) => s.rows.reduce((a, r) => a + r.net, 0)
  },
  actions: {
    async buildWeekly(projectId: string, weekStart: string, weekEnd: string) {
      this.loading = true
      this.weekStart = weekStart
      this.weekEnd = weekEnd

      try {
        // 1) workers
        const { data: workersData, error: wErr } = await supabase
          .from('workers')
          .select('*')
          .eq('project_id', projectId)
          .eq('active', true)

        if (wErr) throw wErr
        const workers = (workersData || []) as Worker[]

        // 2) attendance in range (present only)
        const { data: attData, error: aErr } = await supabase
          .from('attendance')
          .select('*')
          .eq('project_id', projectId)
          .gte('work_date', weekStart)
          .lte('work_date', weekEnd)

        if (aErr) throw aErr
        const attendance = (attData || []) as Attendance[]

        // 3) advances in range
        const { data: advData, error: advErr } = await supabase
          .from('worker_advances')
          .select('*')
          .eq('project_id', projectId)
          .gte('adv_date', weekStart)
          .lte('adv_date', weekEnd)

        if (advErr) throw advErr
        const advances = (advData || []) as WorkerAdvance[]

        const presentCountByWorker: Record<string, number> = {}
        for (const row of attendance) {
          if (!row.present) continue
          presentCountByWorker[row.worker_id] = (presentCountByWorker[row.worker_id] || 0) + 1
        }

        const advancesSumByWorker: Record<string, number> = {}
        for (const adv of advances) {
          advancesSumByWorker[adv.worker_id] = (advancesSumByWorker[adv.worker_id] || 0) + Number(adv.amount)
        }

        this.rows = workers.map((w) => {
          const days = presentCountByWorker[w.id] || 0
          const gross = days * Number(w.daily_rate)
          const adv = advancesSumByWorker[w.id] || 0
          const net = gross - adv

          return {
            worker_id: w.id,
            worker_name: w.full_name,
            daily_rate: Number(w.daily_rate),
            days_present: days,
            gross,
            advances: adv,
            net
          }
        }).sort((a, b) => a.worker_name.localeCompare(b.worker_name))
      } finally {
        this.loading = false
      }
    }
  }
})