<script setup lang="ts">
import { ref } from 'vue'
import { useUiStore } from '@/stores/ui'

const email = ref('admin@kukaqka.com')
const ui = useUiStore()

function submit() {
  ui.pushToast('Password reset link prepared for API integration.', 'info')
}
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <h1 class="sign-content-title">Forgot Password</h1>
    <div class="sign-content-details">Remember Password? <RouterLink class="sign" to="/login">Sign In</RouterLink></div>
    <div class="form-block">
      <label>
        <span class="sr-only">Email</span>
        <input v-model="email" class="sign-field" type="email" placeholder="Your Email *" />
      </label>
    </div>
    <button class="submit-button" type="submit">Submit</button>
  </form>
</template>
