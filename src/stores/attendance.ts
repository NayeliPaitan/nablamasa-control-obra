import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'
import type { Attendance } from 'src/types/db'

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    items: [] as Attendance[],
    loading: false
  }),
  actions: {
    async fetch(projectId: string, workDate: string) {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('project_id', projectId)
          .eq('work_date', workDate)

        if (error) throw error
        this.items = (data || []) as Attendance[]
      } finally {
        this.loading = false
      }
    },

    async upsert(projectId: string, workerId: string, workDate: string, present: boolean) {
      const { error } = await supabase
        .from('attendance')
        .upsert(
          [
            {
              project_id: projectId,
              worker_id: workerId,
              work_date: workDate,
              present
            }
          ],
          { onConflict: 'worker_id,work_date' }
        )

      if (error) throw error
    }
  }
})