import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'
import Aura from '@primeuix/themes/aura'
import './style.css'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Optimize font loading strategy
const style = document.createElement('style')
style.textContent = `
  @font-face {
    font-family: 'primeicons';
    src: url('/assets/fonts/primeicons.woff2') format('woff2'),
         url('/assets/fonts/primeicons.woff') format('woff');
    font-display: swap;
    font-weight: 400;
  }
`
document.head.appendChild(style)

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ToastService)
app.use(ConfirmationService)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.admin-dark',
    },
  },
})
app.directive('tooltip', Tooltip)
app.mount('#app')

// Send cookies/auth credentials to the backend (Sanctum/session based auth)
axios.defaults.withCredentials = true

// Global axios response handler: redirect to backend login on 401 so session-based auth can be established
axios.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        if (import.meta.env.DEV) {
          router.push({ name: 'login' })
        } else {
          const backend = window.location.origin
          const loginUrl = backend.replace(/\/$/, '') + '/admin'
          window.location.href = loginUrl
        }
      } catch (e) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
