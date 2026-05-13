<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import PasswordField from '@/components/PasswordField.vue'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const ui = useUiStore()
const form = reactive({ email: '', password: '', password_confirmation: '' })

async function submit() {
  ui.pushToast('Password reset flow is ready for the Laravel endpoint.', 'success')
  await router.push('/login')
}
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <h1 class="sign-content-title">Sign Up to Your Account</h1>
    <div class="sign-content-details">No worries, enter the email address associated with your account and we'll send you instructions to reset your password.</div>
    <div class="form-block">
      <label>
        <span class="sr-only">Email</span>
        <input v-model="form.email" class="sign-field" type="email" autocomplete="email" placeholder="Your Email *" />
      </label>
      <PasswordField v-model="form.password" label="Password" autocomplete="new-password" />
      <PasswordField v-model="form.password_confirmation" label="Confirm password" autocomplete="new-password" />
    </div>
    <button class="submit-button" type="submit">Submit</button>
  </form>
</template>
