<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PasswordField from '@/components/PasswordField.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { api } from '@/services/api'

const auth = useAuthStore()
const router = useRouter()
const ui = useUiStore()
const baseUrl = import.meta.env.BASE_URL

const form = reactive({
  email: 'admin@kukaqka.com',
  password: 'password',
})

const credentials = ref([
  { label: 'Super Admin', email: 'superadmin@kukaqka.com', password: 'password' },
  { label: 'Admin', email: 'admin@kukaqka.com', password: 'password' },
  { label: 'Staff', email: 'staff@kukaqka.com', password: 'password' },
  { label: 'Client', email: 'client@kukaqka.com', password: 'password' },
])

async function submit() {
  try {
    await auth.login(form)
    ui.pushToast('Welcome back to Kukaqka CMS.', 'success')
    await router.push('/dashboard')
  } catch (error) {
    ui.pushToast(error instanceof Error ? error.message : 'Unable to sign in.', 'danger')
  }
}

function useCredential(email: string, password: string) {
  form.email = email
  form.password = password
}

function handleGoogleSignUp() {
  try {
    // Redirect to Google OAuth endpoint
    window.location.href = '/api/v1/auth/google/redirect'
  } catch (error) {
    ui.pushToast('Failed to initiate Google OAuth', 'danger')
  }
}

function handleFacebookSignUp() {
  try {
    // Redirect to Facebook OAuth endpoint
    window.location.href = '/api/v1/auth/facebook/redirect'
  } catch (error) {
    ui.pushToast('Failed to initiate Facebook OAuth', 'danger')
  }
}

onMounted(() => {
  // Optionally fetch OAuth settings to show if OAuth is enabled
  // This is not required for the OAuth flow to work
})
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <h1 class="sign-content-title">Sign In to Your Account</h1>
    <div class="sign-content-details">Don't have an account? <RouterLink class="sign" to="/signup">Sign Up</RouterLink></div>

    <div class="play-store-wrap">
      <button class="player-link" type="button" @click="handleGoogleSignUp">
        <img :src="`${baseUrl}images/Google.svg`" alt="Google logo" />
        <span class="player-link-icom-text">Sign Up with Google</span>
      </button>
      <button class="player-link" type="button" @click="handleFacebookSignUp">
        <img :src="`${baseUrl}images/Facebook.svg`" alt="Facebook logo" />
        <span class="player-link-icom-text">Sign Up with Facebook</span>
      </button>
    </div>

    <div class="sign-border-wrap">
      <div class="sign-border"></div>
      <div class="sign-border-text">or continue with</div>
      <div class="sign-border"></div>
    </div>

    <div class="form-block">
      <label>
        <span class="sr-only">Email</span>
        <input v-model="form.email" class="sign-field" type="email" autocomplete="email" placeholder="Your Email *" />
      </label>
      <PasswordField v-model="form.password" label="Password" autocomplete="current-password" />

      <div class="check-box-aria">
        <label class="checkbox-field">
          <input type="checkbox" checked />
          <span class="checkbox-label form">Remember Me</span>
        </label>
        <RouterLink class="forgot-password-text" to="/forgot-password">Forgot Password?</RouterLink>
      </div>
    </div>

    <button class="submit-button" type="submit" :disabled="auth.isLoading">
      {{ auth.isLoading ? 'Signing in...' : 'Sign In' }}
    </button>

    <!-- Demo Credentials Section -->
    <div class="demo-credentials-box">
      <p class="demo-title">🧪 Demo Credentials</p>
      <small class="demo-hint">Click any credential to auto-fill the form (development only)</small>
      <div class="demo-credentials-grid">
        <button
          v-for="cred in credentials"
          :key="cred.email"
          type="button"
          class="demo-credential-btn"
          @click="useCredential(cred.email, cred.password)"
        >
          <span>
            <strong>{{ cred.label }}</strong>
            <small>{{ cred.email }}</small>
          </span>
          <code>{{ cred.password }}</code>
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.demo-credentials-box {
  border: 2px solid #fbbf24;
  background: linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%);
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin-top: 1.5rem;
}

.demo-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #92400e;
  margin: 0 0 0.5rem 0;
}

.demo-hint {
  font-size: 0.8rem;
  color: #b45309;
  display: block;
  margin-bottom: 1rem;
}

.demo-credentials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}

.demo-credential-btn {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #fcd34d;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-size: 0.8rem;
}

.demo-credential-btn:hover {
  background: #fef3c7;
  border-color: #f59e0b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.demo-credential-btn strong {
  color: #92400e;
  font-size: 0.875rem;
}

.demo-credential-btn small {
  color: #b45309;
  font-size: 0.75rem;
}

.demo-credential-btn code {
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  background: #fef9e7;
  padding: 0.25rem 0.375rem;
  border-radius: 0.25rem;
  color: #92400e;
  font-size: 0.75rem;
}

@media (max-width: 640px) {
  .demo-credentials-box {
    padding: 1rem;
  }

  .demo-credentials-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .demo-title {
    font-size: 0.9rem;
  }
}
</style>
