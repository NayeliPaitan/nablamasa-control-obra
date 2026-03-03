<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWorkersStore } from 'src/stores/workers'

const props = defineProps<{ modelValue: boolean; projectId: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'created'): void }>()

const store = useWorkersStore()

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const full_name = ref('')
const role = ref('')
const daily_rate = ref<number>(80)

const save = async () => {
  const payload: { full_name: string; daily_rate: number; role?: string } = {
    full_name: full_name.value,
    daily_rate: Number(daily_rate.value)
  }

  if (role.value.trim()) payload.role = role.value.trim()

  await store.create(props.projectId, payload)

  full_name.value = ''
  role.value = ''
  daily_rate.value = 80

  emit('created')
  show.value = false
}
</script>

<template>
  <q-dialog v-model="show">
    <q-card style="width: 520px; max-width: 95vw">
      <q-card-section class="text-h6">Agregar trabajador</q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="full_name" label="Nombre completo" filled />
        <q-input v-model="role" label="Rol (opcional)" filled />
        <q-input v-model.number="daily_rate" type="number" label="Jornal diario (S/)" filled />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn color="primary" label="Guardar" :disable="!full_name" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>