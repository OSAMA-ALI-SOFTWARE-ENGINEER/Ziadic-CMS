<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const showUserMenu = ref(false)
const isMobileMenuOpen = ref(false)

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Listing', to: '/listings' },
  { label: 'Blogs', to: '/blogs' },
  { label: 'Contact Us', to: '/contact' },
]

function handleLogout() {
  authStore.logout()
  showUserMenu.value = false
  isMobileMenuOpen.value = false
}

watch(
  () => route.fullPath,
  () => {
    showUserMenu.value = false
    isMobileMenuOpen.value = false
  },
)

function getUserInitials() {
  return authStore.user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'
}
</script>

<template>
  <header class="site-header">
    <div class="container">
      <div class="site-header__inner">
        <RouterLink to="/" aria-label="Zaidic home" class="site-header__brand">
          <img src="/assets/images/logo_2.svg" alt="Zaidic" class="site-header__logo" />
        </RouterLink>

        <nav aria-label="Primary navigation" class="site-header__nav site-header__nav--desktop">
          <RouterLink
            v-for="item in navItems"
            :key="item.label"
            :to="item.to"
            class="site-header__nav-link"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <div class="site-header__actions">
          <div v-if="!authStore.isAuthenticated" class="site-header__guest-actions">
            <a href="/admin/login" class="style-button site-header__animated-button site-header__animated-button--login">
              <span class="style-button-text">Login</span>
              <span class="button-color"></span>
            </a>
            <a href="/admin/signup" class="primary-button site-header__animated-button site-header__animated-button--signup">
              <span class="style-button-text">Get Started</span>
              <span class="button-color"></span>
            </a>
          </div>

          <div v-else class="site-header__user-menu-wrap">
            <button
              @click="showUserMenu = !showUserMenu"
              class="site-header__avatar"
            >
              {{ getUserInitials() }}
            </button>

            <div v-show="showUserMenu" class="site-header__user-menu">
              <div class="site-header__user-meta">
                <p class="site-header__user-name">{{ authStore.user?.name }}</p>
                <p class="site-header__user-email">{{ authStore.user?.email }}</p>
              </div>

              <a
                v-if="authStore.isAdmin"
                href="http://localhost:5174/admin/dashboard"
                target="_blank"
                class="site-header__user-link"
              >
                📊 Admin Dashboard
              </a>

              <button @click="handleLogout" class="site-header__user-logout">
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <button
          class="site-header__menu-toggle"
          type="button"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          :aria-expanded="isMobileMenuOpen"
          aria-label="Open menu"
        >
          <i class="pi pi-bars" aria-hidden="true"></i>
        </button>
      </div>

      <div v-show="isMobileMenuOpen" class="site-header__mobile-menu">
        <nav aria-label="Mobile navigation" class="site-header__mobile-nav">
          <RouterLink
            v-for="item in navItems"
            :key="`mobile-${item.label}`"
            :to="item.to"
            class="site-header__mobile-link"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <div class="site-header__mobile-actions">
          <a v-if="!authStore.isAuthenticated" href="/admin/login" class="style-button site-header__animated-button site-header__animated-button--login site-header__mobile-login">
            <span class="style-button-text">Login</span>
            <span class="button-color"></span>
          </a>
          <a v-if="!authStore.isAuthenticated" href="/admin/signup" class="primary-button site-header__animated-button site-header__animated-button--signup site-header__mobile-cta">
            <span class="style-button-text">Get Started</span>
            <span class="button-color"></span>
          </a>
          <button v-else @click="handleLogout" class="site-header__mobile-logout">Sign Out</button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: relative;
  z-index: 50;
  background: #f2f2f2;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.site-header__inner {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 32px;
  min-height: 90px;
}

.site-header__brand {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.site-header__logo {
  display: block;
  width: auto;
  height: 74px;
}

.site-header__nav--desktop {
  display: none;
  align-items: center;
  gap: 36px;
  flex: 1;
  justify-content: center;
}

.site-header__nav-link {
  color: var(--primary-color-80);
  font-size: 17px;
  font-weight: 500;
  line-height: 1.2;
  transition: color 0.3s ease;
}

.site-header__nav-link:hover {
  color: var(--coral);
}

.site-header__actions {
  display: none;
  align-items: center;
}

.site-header__guest-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.site-header__guest-actions .style-button,
.site-header__guest-actions .primary-button {
  padding: 10px 22px;
  font-size: 15px;
}

.site-header__animated-button {
  position: relative;
  overflow: hidden;
}

.site-header__animated-button .style-button-text {
  position: relative;
  z-index: 2;
}

.site-header__animated-button .button-color {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 100%;
  z-index: 1;
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.site-header__animated-button:hover .button-color {
  width: 100%;
}

.site-header__animated-button--login {
  border-color: var(--primary-color);
  background: transparent;
  color: var(--primary-color);
}

.site-header__animated-button--login .button-color {
  background: var(--primary-color);
}

.site-header__animated-button--login:hover {
  color: var(--white);
  border-color: var(--primary-color);
  background: transparent;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(225, 26, 29, 0.25);
}

.site-header__animated-button--signup {
  border-color: var(--yellow);
  background: transparent;
  color: #532822;
}

.site-header__animated-button--signup .button-color {
  background: var(--yellow);
}

.site-header__animated-button--signup:hover {
  color: #532822;
  border-color: #ffc857;
  background: transparent;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 209, 95, 0.35);
}

.site-header__user-menu-wrap {
  position: relative;
}

.site-header__avatar {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 0;
  background: var(--primary-color);
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
}

.site-header__user-menu {
  position: absolute;
  right: 0;
  margin-top: 8px;
  width: 192px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
  padding: 8px 0;
  z-index: 60;
}

.site-header__user-meta {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.site-header__user-name {
  color: #111827;
  font-size: 14px;
  font-weight: 600;
}

.site-header__user-email {
  color: #6b7280;
  font-size: 12px;
}

.site-header__user-link,
.site-header__user-logout {
  width: 100%;
  display: block;
  border: 0;
  background: transparent;
  text-align: left;
  padding: 10px 16px;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
}

.site-header__user-link:hover,
.site-header__user-logout:hover {
  background: #f9fafb;
}

.site-header__user-logout {
  border-top: 1px solid #e5e7eb;
  margin-top: 6px;
}

.site-header__menu-toggle {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--primary-color);
}

.site-header__mobile-menu {
  display: grid;
  gap: 16px;
  padding: 0 0 16px;
}

.site-header__mobile-nav {
  display: grid;
  gap: 10px;
}

.site-header__mobile-link {
  color: var(--primary-color-80);
  font-size: 16px;
  font-weight: 500;
  line-height: 1.3;
  padding: 4px 0;
}

.site-header__mobile-actions {
  display: grid;
  gap: 10px;
}

.site-header__mobile-actions .style-button,
.site-header__mobile-actions .primary-button {
  padding: 11px 18px;
  font-size: 15px;
}

.site-header__mobile-login {
  width: 100%;
}

.site-header__mobile-cta {
  width: 100%;
}

.site-header__mobile-logout {
  width: 100%;
  padding: 12px 18px;
  border-radius: 8px;
  border: 1px solid var(--primary-color);
  background: transparent;
  color: var(--primary-color);
  font-size: 16px;
  font-weight: 500;
}

@media (min-width: 992px) {
  .site-header__nav--desktop {
    display: flex;
  }

  .site-header__actions {
    display: inline-flex;
  }

  .site-header__menu-toggle,
  .site-header__mobile-menu {
    display: none !important;
  }
}

@media (max-width: 991px) {
  .site-header__inner {
    min-height: 84px;
    gap: 16px;
  }

  .site-header__logo {
    height: 58px;
  }

  .site-header__mobile-actions .style-button,
  .site-header__mobile-actions .primary-button {
    width: 100%;
  }
}
</style>
