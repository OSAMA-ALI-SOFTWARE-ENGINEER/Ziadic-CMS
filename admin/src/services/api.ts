import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

// Auto-detect API URL based on current environment
function getApiUrl(): string {
  // First priority: environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // Second priority: auto-detect from window location
  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location
    const port = window.location.port ? `:${window.location.port}` : ''

    // If running on localhost/127.0.0.1 on Vite dev (5173, 5174, etc), API is on port 8000
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && (window.location.port === '5173' || window.location.port === '5174')) {
      return `${protocol}//localhost:8000/api/v1/admin`
    }

    // Otherwise assume API is on same domain/host
    return `${protocol}//${hostname}${port}/api/v1/admin`
  }

  // Fallback
  return 'http://localhost:8000/api/v1/admin'
}

export const api = axios.create({
  baseURL: getApiUrl(),
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

  // Don't override Content-Type for FormData (file uploads)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  return config
})

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const status = error?.response?.status || 'unknown'
    const url = error?.config?.url || 'unknown'
    const method = error?.config?.method?.toUpperCase() || 'unknown'
    const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error'

    const isSilentError = error.config?.headers?.['X-Silent-Error'] === '1' || error.config?.headers?.get?.('X-Silent-Error') === '1'

    if (isSilentError) {
      return Promise.reject(error)
    }

    const url2 = error.config?.url || ''
    const isSettingsEndpoint = url2.includes('/admin/settings/') || url2.includes('/admin/upload')
    const is404 = error.response?.status === 404

    if (is404 && isSettingsEndpoint) {
      return Promise.reject(error)
    }

    const ui = useUiStore()

    if (error.response?.status === 401) {
      const auth = useAuthStore()
      auth.clearSession()
      ui.pushToast('Session expired. Please sign in again.', 'warning')
      if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/admin/login')) {
        window.location.href = '/admin/login'
      }
    } else if (error.response?.data?.message) {
      ui.pushToast(error.response.data.message, 'danger')
    }

    return Promise.reject(error)
  },
)
