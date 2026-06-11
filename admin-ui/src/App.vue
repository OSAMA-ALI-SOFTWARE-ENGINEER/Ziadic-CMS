<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.fetchUser()
})
</script>

<style>
:root {
  --primary: #fbbf24;
  --primary-dark: #f59e0b;
  --ink: #1f2937;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif;
  color: var(--ink);
  background-color: #f9fafb;
}

#app {
  width: 100%;
  height: 100%;
}

.text-primary {
  color: var(--primary);
}

.bg-primary {
  background-color: var(--primary);
}

.text-ink {
  color: var(--ink);
}
</style>
