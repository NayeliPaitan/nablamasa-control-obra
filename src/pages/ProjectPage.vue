<script setup lang="ts">

//IMPORTS
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from 'src/boot/supabase'
import type { Project, Worker } from 'src/types/db'

import { useWorkersStore } from 'src/stores/workers'
import { useAttendanceStore } from 'src/stores/attendance'
import { useAdvancesStore } from 'src/stores/advances'
import { useCashStore } from 'src/stores/cash'

import WorkerFormDialog from 'src/components/workers/WorkerFormDialog.vue'
import AdvanceFormDialog from 'src/components/advances/AdvanceFormDialog.vue'
import CashFormDialog from 'src/components/cash/CashFormDialog.vue'

import WeeklyPayrollCard from 'src/components/payroll/WeeklyPayrollCard.vue'

//const
const route = useRoute()
const projectId = computed(() => String(route.params.id))

const workersStore = useWorkersStore()
const attendanceStore = useAttendanceStore()
const advancesStore = useAdvancesStore()
const cashStore = useCashStore()

const project = ref<Project | null>(null)
const loadingProject = ref(false)

const tab = ref<'workers' | 'attendance' | 'advances' | 'cash' | 'payroll'>('workers')

const openWorker = ref(false)
const openAdvance = ref(false)
const openCash = ref(false)

const todayISO = () => new Date().toISOString().slice(0, 10)
const selectedDate = ref<string>(todayISO())

const workers = computed(() => workersStore.items)
const activeWorkers = computed(() => workers.value.filter(w => w.active))

const attendanceByWorkerId = computed<Record<string, boolean>>(() => {
  const map: Record<string, boolean> = {}
  for (const row of attendanceStore.items) {
    map[row.worker_id] = row.present
  }
  return map
})

const getPresent = (workerId: string) => {
  // si no existe registro, asumimos presente (puedes cambiarlo)
  return attendanceByWorkerId.value[workerId] ?? true
}

const setPresent = async (workerId: string, present: boolean) => {
  await attendanceStore.upsert(projectId.value, workerId, selectedDate.value, present)
  // Refrescamos solo la fecha actual para mantener consistencia
  await attendanceStore.fetch(projectId.value, selectedDate.value)
}

const loadProject = async () => {
  loadingProject.value = true
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId.value)
      .single()

    if (error) throw error
    project.value = data as Project
  } finally {
    loadingProject.value = false
  }
}

const refreshAll = async () => {
  await Promise.all([
    workersStore.fetchByProject(projectId.value),
    advancesStore.fetchByProject(projectId.value),
    cashStore.fetchByProject(projectId.value),
    attendanceStore.fetch(projectId.value, selectedDate.value),
  ])
}

onMounted(async () => {
  await loadProject()
  await refreshAll()
})

watch(selectedDate, async () => {
  await attendanceStore.fetch(projectId.value, selectedDate.value)
})

// helpers para selects (adelantos)
const workerOptions = computed(() =>
  activeWorkers.value.map((w: Worker) => ({
    label: `${w.full_name} (S/ ${w.daily_rate}/día)`,
    value: w.id
  }))
)
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-col-gutter-md">
      <div>
        <div class="text-h6">
          {{ project?.name || 'Obra' }}
        </div>
        <div class="text-caption text-grey-7">
          {{ project?.address || 'Sin dirección' }}
        </div>
      </div>

      <q-space />

      <q-btn flat icon="refresh" @click="refreshAll" />
    </div>

    <q-separator class="q-my-md" />

    <q-tabs v-model="tab" dense class="text-primary">
      <q-tab name="workers" label="Trabajadores" icon="groups" />
      <q-tab name="attendance" label="Asistencia" icon="checklist" />
      <q-tab name="advances" label="Adelantos" icon="payments" />
      <q-tab name="cash" label="Caja" icon="account_balance_wallet" />
      <q-tab name="payroll" label="Planilla" icon="receipt_long" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <!-- TAB: TRABAJADORES -->
      <q-tab-panel name="workers">
        <div class="row items-center q-col-gutter-md">
          <div class="text-subtitle1">Trabajadores</div>
          <q-space />
          <q-btn color="primary" icon="add" label="Agregar" @click="openWorker = true" />
        </div>

        <q-table
          class="q-mt-md"
          :rows="workersStore.items"
          :loading="workersStore.loading"
          row-key="id"
          :columns="[
            { name: 'full_name', label: 'Nombre', field: 'full_name', align: 'left' },
            { name: 'role', label: 'Rol', field: 'role', align: 'left' },
            { name: 'daily_rate', label: 'Jornal', field: 'daily_rate', align: 'right' },
            { name: 'active', label: 'Activo', field: 'active', align: 'center' }
          ]"
        >
          <template #body-cell-daily_rate="props">
            <q-td align="right">S/ {{ Number(props.row.daily_rate).toFixed(2) }}</q-td>
          </template>
          <template #body-cell-active="props">
            <q-td align="center">
              <q-badge :color="props.row.active ? 'green' : 'grey'">
                {{ props.row.active ? 'Sí' : 'No' }}
              </q-badge>
            </q-td>
          </template>
        </q-table>

        <WorkerFormDialog
          v-model="openWorker"
          :project-id="projectId"
          @created="workersStore.fetchByProject(projectId)"
        />
      </q-tab-panel>

      <!-- TAB: ASISTENCIA -->
      <q-tab-panel name="attendance">
        <div class="row items-center q-col-gutter-md">
          <div class="text-subtitle1">Asistencia</div>
          <q-space />

          <q-input
            v-model="selectedDate"
            type="date"
            filled
            dense
            label="Fecha"
            style="max-width: 220px"
          />
        </div>

        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-caption text-grey-7">
              Marca presente/ausente para cada trabajador en la fecha seleccionada.
            </div>
          </q-card-section>

          <q-separator />

          <q-list>
            <q-item v-for="w in activeWorkers" :key="w.id">
              <q-item-section>
                <q-item-label>{{ w.full_name }}</q-item-label>
                <q-item-label caption>Jornal: S/ {{ Number(w.daily_rate).toFixed(2) }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-toggle
                  :model-value="getPresent(w.id)"
                  label="Presente"
                  @update:model-value="(v) => setPresent(w.id, Boolean(v))"
                />
              </q-item-section>
            </q-item>

            <q-item v-if="activeWorkers.length === 0">
              <q-item-section>
                <q-item-label>No hay trabajadores activos en esta obra.</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </q-tab-panel>

      <!-- TAB: ADELANTOS -->
      <q-tab-panel name="advances">
        <div class="row items-center q-col-gutter-md">
          <div class="text-subtitle1">Adelantos</div>
          <q-space />
          <q-btn
            color="primary"
            icon="add"
            label="Registrar adelanto"
            :disable="workerOptions.length === 0"
            @click="openAdvance = true"
          />
        </div>

        <q-table
          class="q-mt-md"
          :rows="advancesStore.items"
          :loading="advancesStore.loading"
          row-key="id"
          :columns="[
            { name: 'adv_date', label: 'Fecha', field: 'adv_date', align: 'left' },
            { name: 'worker_id', label: 'Trabajador', field: 'worker_id', align: 'left' },
            { name: 'amount', label: 'Monto', field: 'amount', align: 'right' },
            { name: 'reason', label: 'Motivo', field: 'reason', align: 'left' }
          ]"
        >
          <template #body-cell-worker_id="props">
            <q-td>
              {{ workers.find(w => w.id === props.row.worker_id)?.full_name || props.row.worker_id }}
            </q-td>
          </template>

          <template #body-cell-amount="props">
            <q-td align="right">S/ {{ Number(props.row.amount).toFixed(2) }}</q-td>
          </template>
        </q-table>

        <q-banner v-if="workerOptions.length === 0" class="q-mt-md" rounded>
          Primero agrega trabajadores para registrar adelantos.
        </q-banner>

        <AdvanceFormDialog
          v-model="openAdvance"
          :project-id="projectId"
          :worker-options="workerOptions"
          @created="advancesStore.fetchByProject(projectId)"
        />
      </q-tab-panel>

      <!-- TAB: CAJA -->
      <q-tab-panel name="cash">
        <div class="row items-center q-col-gutter-md">
          <div class="text-subtitle1">Caja</div>

          <q-space />

          <q-badge color="primary" class="q-pa-sm">
            Saldo: S/ {{ cashStore.balance.toFixed(2) }}
          </q-badge>

          <q-btn color="primary" icon="add" label="Movimiento" @click="openCash = true" />
        </div>

        <q-table
          class="q-mt-md"
          :rows="cashStore.items"
          :loading="cashStore.loading"
          row-key="id"
          :columns="[
            { name: 'tx_date', label: 'Fecha', field: 'tx_date', align: 'left' },
            { name: 'tx_type', label: 'Tipo', field: 'tx_type', align: 'left' },
            { name: 'category', label: 'Categoría', field: 'category', align: 'left' },
            { name: 'amount', label: 'Monto', field: 'amount', align: 'right' },
            { name: 'description', label: 'Detalle', field: 'description', align: 'left' }
          ]"
        >
          <template #body-cell-tx_type="props">
            <q-td>
              <q-badge :color="props.row.tx_type === 'IN' ? 'green' : 'red'">
                {{ props.row.tx_type === 'IN' ? 'INGRESO' : 'EGRESO' }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-amount="props">
            <q-td align="right">
              S/ {{ Number(props.row.amount).toFixed(2) }}
            </q-td>
          </template>
        </q-table>

        <CashFormDialog
          v-model="openCash"
          :project-id="projectId"
          @created="cashStore.fetchByProject(projectId)"
        />
      </q-tab-panel>

      <!-- TAB: PLANILLA -->
      <q-tab-panel name="payroll">
        <WeeklyPayrollCard :project-id="projectId" />
      </q-tab-panel>
    </q-tab-panels>

    <q-inner-loading :showing="loadingProject">
      <q-spinner size="40px" />
    </q-inner-loading>
  </q-page>
</template>