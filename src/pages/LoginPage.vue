<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from 'src/boot/supabase'


const email = ref('')
const password = ref('')
const router = useRouter()

const onLogin = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (error) {
    alert(error.message)
    return
  }

  await router.push('/app')
}
</script>

<template>
  <q-page class="flex flex-center">
    <q-card style="width: 380px; max-width: 92vw">
      <q-card-section>
        <div class="text-h6">NABLAMA S.A </div>
        <div class="text-caption text-grey-7">Control de Obra</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="email" outlined bg-color="white" label="Email" />
        <q-input v-model="password" outlined bg-color="white" label="Contraseña" type="password" class="q-mt-md" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn color="primary" label="Ingresar" @click="onLogin" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>