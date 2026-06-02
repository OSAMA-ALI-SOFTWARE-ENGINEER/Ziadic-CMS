<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-yellow-50 py-12 px-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-center text-ink mb-2 font-display">Create Account</h1>
        <p class="text-center text-gray-600 mb-8">Join our community today</p>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="John Doe"
            />
          </div>

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
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
            <input
              v-model="form.phone"
              type="tel"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              v-model="form.password"
              type="password"
              required
              minlength="8"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="••••••••"
            />
            <p class="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              v-model="form.password_confirmation"
              type="password"
              required
              minlength="8"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full primary-button py-2 mt-6 disabled:opacity-50"
          >
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ error }}
        </div>

        <p class="text-center text-sm text-gray-600 mt-6">
          Already have an account?
          <RouterLink to="/login" class="text-primary font-semibold hover:underline">Sign in</RouterLink>
        </p>
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

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
})

const loading = ref(false)
const error = ref('')

async function handleRegister() {
  if (form.value.password !== form.value.password_confirmation) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.register(
      form.value.name,
      form.value.email,
      form.value.phone,
      form.value.password,
      form.value.password_confirmation
    )
    router.push('/')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
