import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: number
  name: string
  email: string
  roles?: string[]
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.roles?.includes('admin') || false)

  async function login(email: string, password: string) {
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) throw new Error('Login failed')

      const data = await response.json()
      token.value = data.token
      user.value = data.user
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    } catch (err) {
      console.error('Login error:', err)
      throw err
    }
  }

  async function logout() {
    try {
      await fetch('http://localhost:8000/api/v1/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` },
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }

  async function fetchUser() {
    if (!token.value) return

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` },
      })

      if (!response.ok) throw new Error('Failed to fetch user')

      const data = await response.json()
      user.value = data.user || data
    } catch (err) {
      console.error('Fetch user error:', err)
      token.value = null
      localStorage.removeItem('auth_token')
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    fetchUser,
  }
})
