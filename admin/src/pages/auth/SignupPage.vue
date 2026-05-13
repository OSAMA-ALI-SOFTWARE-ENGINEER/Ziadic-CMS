<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import PasswordField from '@/components/PasswordField.vue'
import { useCmsStore } from '@/stores/cms'
import { useUiStore } from '@/stores/ui'

const cms = useCmsStore()
const ui = useUiStore()
const router = useRouter()
const baseUrl = import.meta.env.BASE_URL

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

async function submit() {
  if (!form.name || !form.email || !form.password) {
    ui.pushToast('Please complete all required signup fields.', 'danger')
    return
  }

  if (form.password !== form.password_confirmation) {
    ui.pushToast('Password confirmation does not match.', 'danger')
    return
  }

  cms.upsertUser({
    id: Date.now(),
    name: form.name,
    email: form.email,
    role: 'client',
    status: 'Pending',
    tone: 'warning',
  })

  ui.pushToast('Signup submitted. Your account is pending admin approval.', 'warning')
  await router.push('/login')
}
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <h1 class="sign-content-title">Sign Up to Your Account</h1>
    <div class="sign-content-details">Already have an account? <RouterLink class="sign" to="/login">Sign In</RouterLink></div>

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
        <span class="sr-only">Name</span>
        <input v-model="form.name" class="sign-field" autocomplete="name" placeholder="Your Name *" />
      </label>
      <label>
        <span class="sr-only">Email</span>
        <input v-model="form.email" class="sign-field" type="email" autocomplete="email" placeholder="Your Email *" />
      </label>
      <PasswordField v-model="form.password" label="Password" autocomplete="new-password" />
      <PasswordField v-model="form.password_confirmation" label="Confirm password" autocomplete="new-password" />

      <div class="check-box-aria">
        <label class="checkbox-field">
          <input type="checkbox" checked required />
          <span class="checkbox-label form">I agree to all the <span class="color-span">Terms &amp; Conditions</span>.</span>
        </label>
      </div>
    </div>

    <div class="auth-pending-note">New users stay pending until an admin approves the account.</div>

    <button class="submit-button" type="submit">
      Sign Up
    </button>
  </form>
</template>
