<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePayrollStore } from 'src/stores/payroll'

const props = defineProps<{ projectId: string }>()

const store = usePayrollStore()

// helper: sábado de la semana seleccionada
const toISO = (d: Date) => d.toISOString().slice(0, 10)

const getWeekRangeFromSaturday = (saturdayISO: string) => {
  const sat = new Date(saturdayISO + 'T00:00:00')
  const start = new Date(sat)
  start.setDate(sat.getDate() - 5) // lunes
  const end = new Date(sat) // sábado
  return { start: toISO(start), end: toISO(end) }
}

const saturday = ref<string>(toISO(new Date())) // puedes cambiarlo a "este sábado"
const range = computed(() => getWeekRangeFromSaturday(saturday.value))

watch(
  () => [props.projectId, range.value.start, range.value.end] as [string, string, string],
  ([pid, start, end]) => {
    if (!pid) return
    void store.buildWeekly(pid, start, end)
  },
  { immediate: true }
)
</script>

<template>
  <q-card>
    <q-card-section class="row items-center q-col-gutter-md">
      <div>
        <div class="text-subtitle1">Planilla semanal (Lun–Sáb)</div>
        <div class="text-caption text-grey-7">
          Semana: {{ range.start }} → {{ range.end }}
        </div>
      </div>

      <q-space />

      <q-input
        v-model="saturday"
        type="date"
        filled
        dense
        label="Sábado"
        style="max-width: 220px"
      />
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-table
        :rows="store.rows"
        :loading="store.loading"
        row-key="worker_id"
        :columns="[
          { name: 'worker_name', label: 'Trabajador', field: 'worker_name', align: 'left' },
          { name: 'daily_rate', label: 'Jornal', field: 'daily_rate', align: 'right' },
          { name: 'days_present', label: 'Días', field: 'days_present', align: 'right' },
          { name: 'gross', label: 'Bruto', field: 'gross', align: 'right' },
          { name: 'advances', label: 'Adelantos', field: 'advances', align: 'right' },
          { name: 'net', label: 'Neto', field: 'net', align: 'right' }
        ]"
      >
        <template #body-cell-daily_rate="p">
          <q-td align="right">S/ {{ Number(p.value).toFixed(2) }}</q-td>
        </template>
        <template #body-cell-gross="p">
          <q-td align="right">S/ {{ Number(p.value).toFixed(2) }}</q-td>
        </template>
        <template #body-cell-advances="p">
          <q-td align="right">S/ {{ Number(p.value).toFixed(2) }}</q-td>
        </template>
        <template #body-cell-net="p">
          <q-td align="right">
            <q-badge :color="Number(p.value) >= 0 ? 'green' : 'red'">
              S/ {{ Number(p.value).toFixed(2) }}
            </q-badge>
          </q-td>
        </template>
      </q-table>

      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12 col-md-4">
          <q-card bordered>
            <q-card-section>
              <div class="text-caption text-grey-7">Total bruto</div>
              <div class="text-h6">S/ {{ store.totalGross.toFixed(2) }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card bordered>
            <q-card-section>
              <div class="text-caption text-grey-7">Total adelantos</div>
              <div class="text-h6">S/ {{ store.totalAdvances.toFixed(2) }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card bordered>
            <q-card-section>
              <div class="text-caption text-grey-7">Total neto a pagar</div>
              <div class="text-h6">S/ {{ store.totalNet.toFixed(2) }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>