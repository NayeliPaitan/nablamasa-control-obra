<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useProjectsStore } from 'src/stores/projects'

import ProjectFormDialog from 'src/components/projects/ProjectFormDialog.vue'

const store = useProjectsStore()
const open = ref(false)

onMounted(async () => {
  await store.fetchAll()
})
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-col-gutter-md">
      <div class="text-h6">Obras</div>
      <q-space />
      <q-btn color="primary" icon="add" label="Nueva obra" @click="open = true" />
    </div>

    <q-table
      class="q-mt-md"
      :rows="store.items"
      :loading="store.loading"
      row-key="id"
      :columns="[
        { name: 'name', label: 'Obra', field: 'name', align: 'left' },
        { name: 'contract_total', label: 'Contrato', field: 'contract_total', align: 'right' },
        { name: 'advance_pct', label: '% Adelanto', field: 'advance_pct', align: 'right' },
        { name: 'status', label: 'Estado', field: 'status', align: 'left' },
        { name: 'actions', label: '', field: 'id', align: 'right' }
      ]"
    >
      <template #body-cell-actions="props">
        <q-td align="right">
          <q-btn flat icon="open_in_new" :to="`/app/projects/${props.row.id}`" />
        </q-td>
      </template>
    </q-table>

    <ProjectFormDialog v-model="open" @created="store.fetchAll()" />
  </q-page>
</template>