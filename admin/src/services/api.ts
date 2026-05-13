import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cms-token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isSilentError = error.config?.headers?.['X-Silent-Error'] === '1' || error.config?.headers?.get?.('X-Silent-Error') === '1'

    if (isSilentError) {
      return Promise.reject(error)
    }

    const ui = useUiStore()

    if (error.response?.status === 401) {
      const auth = useAuthStore()
      auth.clearSession()
      ui.pushToast('Session expired. Please sign in again.', 'warning')
    } else if (error.response?.data?.message) {
      ui.pushToast(error.response.data.message, 'danger')
    }

    return Promise.reject(error)
  },
)
