import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  status: string
  roles: string[]
}

function getApiBase(): string {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (backendUrl) return backendUrl
  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000'
  }
  return window.location.origin
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('admin_auth_token'))

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.roles.includes('super-admin') || user.value?.roles.includes('admin'))

  async function login(email: string, password: string) {
    const response = await fetch(`${getApiBase()}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Login failed')
    }

    const data = await response.json()
    token.value = data.token
    user.value = data.user
    localStorage.setItem('admin_auth_token', data.token)
  }

  async function logout() {
    if (!token.value) return

    try {
      await fetch(`${getApiBase()}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.error('Logout error:', error)
    }

    token.value = null
    user.value = null
    localStorage.removeItem('admin_auth_token')
  }

  async function fetchUser() {
    if (!token.value) return

    const response = await fetch(`${getApiBase()}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${token.value}` },
    })

    if (response.ok) {
      user.value = await response.json()
    } else if (response.status === 401) {
      logout()
    }
  }

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('admin_auth_token', newToken)
  }

  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem('admin_auth_token')
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    fetchUser,
    setToken,
    clearAuth,
  }
})
