<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import PasswordField from '@/components/PasswordField.vue'
import { staticCredentials, useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const auth = useAuthStore()
const router = useRouter()
const ui = useUiStore()
const baseUrl = import.meta.env.BASE_URL

const form = reactive({
  email: 'superadmin@kukaqka.com',
  password: 'password',
})

function useCredential(email: string, password: string) {
  form.email = email
  form.password = password
}

async function submit() {
  try {
    await auth.login(form)
    ui.pushToast('Welcome back to Kukaqka CMS.', 'success')
    await router.push('/dashboard')
  } catch (error) {
    ui.pushToast(error instanceof Error ? error.message : 'Unable to sign in.', 'danger')
  }
}
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <h1 class="sign-content-title">Sign In to Your Account</h1>
    <div class="sign-content-details">Don't have an account? <RouterLink class="sign" to="/signup">Sign Up</RouterLink></div>

    <div class="play-store-wrap">
      <button class="player-link" type="button">
        <img :src="`${baseUrl}images/Google.svg`" alt="" />
        <span class="player-link-icom-text">Sign Up with Google</span>
      </button>
      <button class="player-link" type="button">
        <img :src="`${baseUrl}images/Facebook.svg`" alt="" />
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

    <div class="auth-static-box">
      <p>Temporary static logins</p>
      <small>Remove these once Laravel auth endpoints are final.</small>
      <div class="auth-static-grid">
        <button
          v-for="credential in staticCredentials"
          :key="credential.email"
          class="static-login-row"
          type="button"
          @click="useCredential(credential.email, credential.password)"
        >
          <span>
            <strong>{{ credential.label }}</strong>
            <small>{{ credential.email }}</small>
          </span>
          <code>{{ credential.password }}</code>
        </button>
      </div>
    </div>
  </form>
</template>
