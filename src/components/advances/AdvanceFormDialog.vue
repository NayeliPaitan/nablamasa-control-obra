<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAdvancesStore } from 'src/stores/advances'

type WorkerOption = { label: string; value: string }

const props = defineProps<{
  modelValue: boolean
  projectId: string
  workerOptions: WorkerOption[]
}>()

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'created'): void }>()

const store = useAdvancesStore()

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const worker_id = ref<string | null>(null)
const adv_date = ref<string>(new Date().toISOString().slice(0, 10))
const amount = ref<number>(50)
const reason = ref('')

const save = async () => {
  if (!worker_id.value) return

  const payload: { worker_id: string; adv_date: string; amount: number; reason?: string } = {
    worker_id: worker_id.value,
    adv_date: adv_date.value,
    amount: Number(amount.value)
  }

  if (reason.value.trim()) payload.reason = reason.value.trim()

  await store.create(props.projectId, payload)

  worker_id.value = null
  adv_date.value = new Date().toISOString().slice(0, 10)
  amount.value = 50
  reason.value = ''

  emit('created')
  show.value = false
}
</script>

<template>
  <q-dialog v-model="show">
    <q-card style="width: 560px; max-width: 95vw">
      <q-card-section class="text-h6">Registrar adelanto</q-card-section>

      <q-card-section class="q-gutter-md">
        <q-select
          v-model="worker_id"
          :options="workerOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          label="Trabajador"
          filled
        />

        <q-input v-model="adv_date" type="date" label="Fecha" filled />
        <q-input v-model.number="amount" type="number" label="Monto (S/)" filled />
        <q-input v-model="reason" label="Motivo (opcional)" filled />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn color="primary" label="Guardar" :disable="!worker_id" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>