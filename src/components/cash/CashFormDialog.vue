<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCashStore } from 'src/stores/cash'

const props = defineProps<{ modelValue: boolean; projectId: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'created'): void }>()

const store = useCashStore()

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const tx_date = ref<string>(new Date().toISOString().slice(0, 10))
const tx_type = ref<'IN' | 'OUT'>('IN')
const category = ref('CLIENT_PAYMENT')
const amount = ref<number>(0)
const description = ref('')

const categories = [
  { label: 'Pago cliente', value: 'CLIENT_PAYMENT' },
  { label: 'Materiales', value: 'MATERIALS' },
  { label: 'Mano de obra', value: 'LABOR' },
  { label: 'Transporte', value: 'TRANSPORT' },
  { label: 'Otros', value: 'OTHER' }
]

const save = async () => {
  const payload: {
    tx_date: string
    tx_type: 'IN' | 'OUT'
    category: string
    amount: number
    description?: string
  } = {
    tx_date: tx_date.value,
    tx_type: tx_type.value,
    category: category.value,
    amount: Number(amount.value)
  }

  if (description.value.trim()) payload.description = description.value.trim()

  await store.create(props.projectId, payload)

  tx_date.value = new Date().toISOString().slice(0, 10)
  tx_type.value = 'IN'
  category.value = 'CLIENT_PAYMENT'
  amount.value = 0
  description.value = ''

  emit('created')
  show.value = false
}
</script>

<template>
  <q-dialog v-model="show">
    <q-card style="width: 560px; max-width: 95vw">
      <q-card-section class="text-h6">Movimiento de caja</q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="tx_date" type="date" label="Fecha" filled />

        <q-select
          v-model="tx_type"
          :options="[
            { label: 'Ingreso', value: 'IN' },
            { label: 'Egreso', value: 'OUT' }
          ]"
          emit-value
          map-options
          label="Tipo"
          filled
        />

        <q-select
          v-model="category"
          :options="categories"
          emit-value
          map-options
          label="Categoría"
          filled
        />

        <q-input v-model.number="amount" type="number" label="Monto (S/)" filled />
        <q-input v-model="description" label="Detalle (opcional)" filled />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn color="primary" label="Guardar" :disable="amount <= 0" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>