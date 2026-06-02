<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-yellow-50 py-12 px-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-center text-ink mb-2 font-display">Welcome Back</h1>
        <p class="text-center text-gray-600 mb-8">Sign in to your account</p>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              v-model="form.password"
              type="password"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full primary-button py-2 mt-6 disabled:opacity-50"
          >
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ error }}
        </div>

        <p class="text-center text-sm text-gray-600 mt-6">
          Don't have an account?
          <RouterLink to="/register" class="text-primary font-semibold hover:underline">Sign up</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    await authStore.login(form.value.email, form.value.password)
    const returnUrl = (route.query.returnUrl as string) || '/'
    router.push(returnUrl)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>
