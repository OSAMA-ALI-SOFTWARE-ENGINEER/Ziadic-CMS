/**
 * Configuration and environment detection
 */

export interface AppConfig {
  apiUrl: string
  isDevelopment: boolean
  isProduction: boolean
  environment: string
}

export function getAppConfig(): AppConfig {
  const isDevelopment = import.meta.env.MODE === 'development'
  const isProduction = import.meta.env.MODE === 'production'

  // Auto-detect API URL
  let apiUrl = import.meta.env.VITE_API_URL

  if (!apiUrl && typeof window !== 'undefined') {
    const { hostname, protocol } = window.location
    const port = window.location.port ? `:${window.location.port}` : ''

    // Vite dev server on port 5173 → API on port 8000
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && window.location.port === '5173') {
      apiUrl = `${protocol}//localhost:8000/api/v1`
    } else {
      // Same domain/host
      apiUrl = `${protocol}//${hostname}${port}/api/v1`
    }
  }

  // Fallback
  if (!apiUrl) {
    apiUrl = 'http://localhost:8000/api/v1'
  }

  const config: AppConfig = {
    apiUrl,
    isDevelopment,
    isProduction,
    environment: import.meta.env.MODE,
  }

  return config
}

export const appConfig = getAppConfig()
