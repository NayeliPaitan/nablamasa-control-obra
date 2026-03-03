<script setup lang="ts">
import { onMounted } from 'vue'
import { useProfileStore } from 'src/stores/profile'

const profileStore = useProfileStore()

onMounted(async () => {
  await profileStore.loadMyProfile()
})
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h6">Dashboard</div>

    <q-card class="q-mt-md">
      <q-card-section>
        <div><b>Usuario:</b> {{ profileStore.profile?.full_name || '-' }}</div>
        <div><b>Rol:</b> {{ profileStore.profile?.role || '-' }}</div>
        <div><b>Company:</b> {{ profileStore.profile?.company_id || '-' }}</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>