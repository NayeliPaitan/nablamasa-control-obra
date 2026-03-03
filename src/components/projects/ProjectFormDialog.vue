<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProjectsStore } from 'src/stores/projects'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e:'update:modelValue', v:boolean): void; (e:'created'): void }>()

const store = useProjectsStore()

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const name = ref('')
const address = ref('')
const contract_total = ref(30000)
const advance_pct = ref(10)
const start_date = ref<string | null>(null)

const save = async () => {
  await store.create({
    name: name.value,
    address: address.value || null,
    contract_total: Number(contract_total.value),
    advance_pct: Number(advance_pct.value),
    start_date: start_date.value
  })
  emit('created')
  show.value = false
}
</script>

<template>
  <q-dialog v-model="show">
    <q-card style="width: 520px; max-width: 95vw">
      <q-card-section class="text-h6">Nueva obra</q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="name" label="Nombre de obra" filled />
        <q-input v-model="address" label="Dirección" filled />
        <q-input v-model.number="contract_total" type="number" label="Monto contrato" filled />
        <q-input v-model.number="advance_pct" type="number" label="% adelanto" filled />
        <q-input v-model="start_date" type="date" label="Fecha inicio" filled />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn color="primary" label="Guardar" :disable="!name" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>