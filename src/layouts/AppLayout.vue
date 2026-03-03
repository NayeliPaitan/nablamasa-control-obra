<script setup lang="ts">
import { useRouter } from 'vue-router'
import { supabase } from 'src/boot/supabase'

const router = useRouter()

const logout = async () => {
  await supabase.auth.signOut()
  await router.push('/login')
}
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>NABLAMA S.A</q-toolbar-title>

        <q-btn flat icon="dashboard" to="/app" />
        <q-btn flat icon="construction" to="/app/projects" />

        <q-space />
        <q-btn flat icon="logout" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>