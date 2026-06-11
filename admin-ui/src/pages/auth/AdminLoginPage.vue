<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 space-y-6">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-ink">Kukaqka Admin</h1>
        <p class="text-gray-600 mt-2">Sign in to your account</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            placeholder="admin@kukaqka.com"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            placeholder="••••••••"
          />
        </div>

        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ error }}
        </div>

        <button
          :disabled="loading"
          type="submit"
          class="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 font-semibold transition-colors"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="border-t border-gray-200 pt-4 text-center text-sm text-gray-600">
        <p>Demo credentials:</p>
        <p class="text-xs mt-2">Email: <code class="bg-gray-100 px-2 py-1 rounded">admin@kukaqka.com</code></p>
        <p class="text-xs">Password: <code class="bg-gray-100 px-2 py-1 rounded">password</code></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    await authStore.login(email.value, password.value)
    router.push('/admin')
  } catch (err) {
    error.value = 'Invalid email or password'
  } finally {
    loading.value = false
  }
}
</script>
