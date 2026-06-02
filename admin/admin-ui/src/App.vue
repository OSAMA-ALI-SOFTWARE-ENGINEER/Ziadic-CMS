<template>
  <RouterView />
</template>

<script setup lang="ts">
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(() => {
  if (authStore.token && !authStore.user) {
    authStore.fetchUser()
  }
})
</script>
