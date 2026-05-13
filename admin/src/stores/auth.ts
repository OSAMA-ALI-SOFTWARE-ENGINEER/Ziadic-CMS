import { defineStore } from 'pinia'
import { api } from '@/services/api'

export type AuthUser = {
  id: number
  name: string
  email: string
  role: string
}

type LoginPayload = {
  email: string
  password: string
}

export const staticCredentials = [
  {
    label: 'Super Admin',
    email: 'superadmin@kukaqka.com',
    password: 'password',
    user: { id: 1, name: 'Super Admin', email: 'superadmin@kukaqka.com', role: 'super-admin' },
  },
  {
    label: 'Admin',
    email: 'admin@kukaqka.com',
    password: 'password',
    user: { id: 2, name: 'Admin User', email: 'admin@kukaqka.com', role: 'admin' },
  },
  {
    label: 'Staff',
    email: 'staff@kukaqka.com',
    password: 'password',
    user: { id: 3, name: 'Staff Editor', email: 'staff@kukaqka.com', role: 'staff' },
  },
  {
    label: 'Client',
    email: 'client@kukaqka.com',
    password: 'password',
    user: { id: 4, name: 'Client Account', email: 'client@kukaqka.com', role: 'client' },
  },
] satisfies Array<{ label: string; email: string; password: string; user: AuthUser }>

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('cms-token') || '',
    user: JSON.parse(localStorage.getItem('cms-user') || 'null') as AuthUser | null,
    isLoading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
  },
  actions: {
    async login(payload: LoginPayload) {
      this.isLoading = true

      try {
        const { data } = await api.post('/auth/login', payload)
        this.setSession(data.token, data.user)
      } catch {
        const credential = staticCredentials.find(
          (item) => item.email === payload.email && item.password === payload.password,
        )

        if (!credential) {
          throw new Error('Invalid static credentials for preview mode.')
        }

        this.setSession(`local-preview-token-${credential.user.role}`, credential.user)
      } finally {
        this.isLoading = false
      }
    },
    async logout() {
      const shouldCallApi = this.token && !this.token.startsWith('local-preview-token-')

      try {
        if (shouldCallApi) {
          await api.post('/auth/logout', undefined, {
            headers: {
              'X-Silent-Error': '1',
            },
          })
        }
      } catch {
        // Local logout must still succeed when the backend route is unavailable.
      } finally {
        this.clearSession()
      }
    },
    setSession(token: string, user: AuthUser) {
      this.token = token
      this.user = user
      localStorage.setItem('cms-token', token)
      localStorage.setItem('cms-user', JSON.stringify(user))
    },
    clearSession() {
      this.token = ''
      this.user = null
      localStorage.removeItem('cms-token')
      localStorage.removeItem('cms-user')
    },
  },
})
