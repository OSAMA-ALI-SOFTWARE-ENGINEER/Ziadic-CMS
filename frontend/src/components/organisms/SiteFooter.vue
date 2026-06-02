<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const isSubmitting = ref(false)
const feedback = ref('')
const feedbackTone = ref<'success' | 'danger'>('success')

function getApiBase(): string {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (backendUrl) return backendUrl

  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000'
  }

  return window.location.origin
}

async function submitNewsletter() {
  if (!email.value || isSubmitting.value) return

  isSubmitting.value = true
  feedback.value = ''

  try {
    const response = await fetch(`${getApiBase()}/api/v1/public/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        source: 'footer',
      }),
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(payload?.message || 'Subscription failed. Please try again.')
    }

    feedbackTone.value = 'success'
    feedback.value = payload?.message || 'Subscribed successfully.'
    email.value = ''
  } catch (error) {
    feedbackTone.value = 'danger'
    feedback.value = error instanceof Error ? error.message : 'Unable to subscribe at the moment.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <div class="site-footer__top">
        <form class="site-footer__newsletter" aria-label="Newsletter signup" @submit.prevent="submitNewsletter">
          <label for="footer-email" class="site-footer__label">Subscribe to our newsletter</label>
          <div class="site-footer__newsletter-row">
            <input
              id="footer-email"
              class="site-footer__input"
              type="email"
              placeholder="Enter your email"
              v-model="email"
              required
            />
            <button class="site-footer__submit" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Subscribing...' : 'Subscribe' }}
            </button>
          </div>
          <p v-if="feedback" class="site-footer__feedback" :class="`site-footer__feedback--${feedbackTone}`">{{ feedback }}</p>
        </form>

        <RouterLink to="/" aria-label="Zaidic home" class="site-footer__brand">
          <img src="/assets/images/Sign-Logo.svg" alt="Zaidic" class="site-footer__brand-logo" />
        </RouterLink>

        <div class="site-footer__social-block">
          <span class="site-footer__social-title">Follow Us</span>
          <a class="site-footer__social-link" href="https://www.facebook.com/" target="_blank" aria-label="Facebook">
            <i class="pi pi-facebook" aria-hidden="true"></i>
          </a>
          <a class="site-footer__social-link" href="https://twitter.com/" target="_blank" aria-label="Twitter">
            <i class="pi pi-twitter" aria-hidden="true"></i>
          </a>
          <a class="site-footer__social-link" href="https://www.instagram.com/" target="_blank" aria-label="Instagram">
            <i class="pi pi-instagram" aria-hidden="true"></i>
          </a>
        </div>

        <a class="site-footer__email" href="mailto:info@kukaqka.com">
          <img src="/assets/images/mail.svg" alt="" class="site-footer__email-icon" />
          <span class="site-footer__email-text">info@kukaqka.com</span>
        </a>
      </div>

      <div class="site-footer__bottom">
        <span>Copyright 2026 - kukaqka.com</span>
        <span>Made with</span>
        <img src="/assets/images/Design-ohne-Titel---2026-04-16T165756.855.png" alt="" class="site-footer__made-with" />
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--border-color);
  background: var(--primary-color);
  padding-top: 56px;
  color: #fff;
}

.site-footer__top {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center;
  gap: 24px;
  text-align: center;
}

.site-footer__newsletter {
  width: 100%;
  max-width: 570px;
}

.site-footer__label {
  display: block;
  margin-bottom: 8px;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 600;
  color: #fff;
}

.site-footer__newsletter-row {
  display: flex !important;
  flex-direction: column !important;
  gap: 12px;
}

.site-footer__input {
  height: 52px;
  min-width: 0;
  width: 100%;
  border: 0;
  border-radius: 8px;
  background: #fff;
  padding: 0 20px;
  color: var(--primary-color-80);
  font-size: 16px;
  outline: none;
}

.site-footer__submit {
  height: 52px;
  border: 0;
  border-radius: 8px;
  background: var(--yellow);
  color: #532822;
  padding: 0 28px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.site-footer__submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.site-footer__feedback {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.4;
}

.site-footer__feedback--success {
  color: #d9ffd6;
}

.site-footer__feedback--danger {
  color: #ffe1e1;
}

.site-footer__submit:hover {
  background: #ffc857;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 209, 95, 0.35);
}

.site-footer__brand {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.site-footer__brand-logo {
  width: 142px;
  height: auto;
  display: block;
}

.site-footer__social-block {
  display: inline-flex !important;
  align-items: center !important;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.site-footer__social-title {
  font-family: var(--marcellus-font-family);
  font-size: 24px;
  line-height: 1;
  color: #000;
}

.site-footer__social-link {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  color: #000;
  transition: all 0.3s ease;
}

.site-footer__social-link:hover {
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.site-footer__email {
  min-width: 0;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center;
  gap: 8px;
  color: #000;
  font-size: 16px;
}

.site-footer__email-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.site-footer__email-text {
  white-space: nowrap;
}

.site-footer__bottom {
  margin-top: 24px;
  border-top: 1px solid var(--border-color);
  padding: 12px 0;
  display: flex !important;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center !important;
  justify-content: center !important;
  text-align: center;
  color: #000;
  font-size: 12px;
  line-height: 1.4;
}

.site-footer__made-with {
  height: 32px;
  width: auto;
  max-width: 120px;
  object-fit: contain;
}

@media (min-width: 640px) {
  .site-footer__newsletter-row {
    flex-direction: row !important;
  }

  .site-footer__submit {
    flex-shrink: 0;
  }
}

@media (min-width: 992px) {
  .site-footer__top {
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between;
    text-align: left;
  }

  .site-footer__newsletter {
    flex: 1;
  }
}
</style>
