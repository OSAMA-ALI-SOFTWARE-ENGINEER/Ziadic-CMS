<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BgSwitcher from '@/components/BgSwitcher.vue'
import ToastStack from '@/components/ToastStack.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const isSidebarOpen = ref(false)
const isDark = ref(false)
const isUserMenuOpen = ref(false)
const isNotificationsOpen = ref(false)
const searchQuery = ref('')

const navigation = [
  { label: 'Dashboard', to: '/dashboard', icon: 'pi pi-home' },
  { label: 'Listings', to: '/listings', icon: 'pi pi-building' },
  { label: 'Approvals', to: '/approvals', icon: 'pi pi-check-circle' },
  { label: 'Categories', to: '/categories', icon: 'pi pi-tags' },
  { label: 'Content', to: '/content', icon: 'pi pi-file-edit' },
  { label: 'Media', to: '/media', icon: 'pi pi-images' },
  { label: 'Payments', to: '/payments', icon: 'pi pi-credit-card' },
  { label: 'Users', to: '/users', icon: 'pi pi-users' },
  { label: 'Roles', to: '/roles', icon: 'pi pi-shield' },
  { label: 'Settings', to: '/settings', icon: 'pi pi-cog' },
]

const pageTitle = computed(() => String(route.meta.title || 'Dashboard').replace(' | Kukaqka CMS', ''))

function applyTheme() {
  document.documentElement.classList.toggle('admin-dark', isDark.value)
  localStorage.setItem('cms-theme', isDark.value ? 'dark' : 'light')
}

function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme()
}

async function logout() {
  await auth.logout()
  isUserMenuOpen.value = false
  ui.pushToast('Signed out successfully.', 'success')
  await router.push('/login')
}

onMounted(() => {
  isDark.value = localStorage.getItem('cms-theme') === 'dark'
  applyTheme()
})
</script>

<template>
  <div class="min-h-screen bg-[var(--admin-bg)] text-[var(--admin-ink)]">
    <button
      v-if="isSidebarOpen"
      class="fixed inset-0 z-30 border-0 bg-black/30 lg:hidden"
      type="button"
      aria-label="Close sidebar"
      @click="isSidebarOpen = false"
    ></button>

    <aside class="cms-sidebar" :class="{ 'cms-sidebar--open': isSidebarOpen }">
      <div class="flex h-16 items-center justify-between px-5">
        <RouterLink class="flex items-center gap-3 no-underline" to="/dashboard" @click="isSidebarOpen = false">
          <span class="grid h-10 w-10 place-items-center rounded-lg bg-[var(--admin-primary)] text-lg font-bold text-white">
            K
          </span>
          <span>
            <strong class="block text-base font-semibold text-[var(--admin-ink)]">Kukaqka CMS</strong>
            <span class="block text-xs text-[var(--admin-muted)]">Backend Control</span>
          </span>
        </RouterLink>
        <button class="icon-button lg:hidden" type="button" aria-label="Close sidebar" @click="isSidebarOpen = false">
          <i class="pi pi-times" aria-hidden="true"></i>
        </button>
      </div>

      <nav class="mt-4 grid gap-1 px-3" aria-label="CMS navigation">
        <RouterLink
          v-for="item in navigation"
          :key="item.label"
          :to="item.to"
          class="cms-nav-link"
          active-class="cms-nav-link--active"
          @click="isSidebarOpen = false"
        >
          <i :class="item.icon" aria-hidden="true"></i>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="mx-4 mt-auto rounded-lg border border-[var(--admin-border)] bg-[var(--admin-soft)] p-4">
        <p class="m-0 text-sm font-semibold text-[var(--admin-ink)]">API status</p>
        <p class="m-0 mt-1 text-xs text-[var(--admin-muted)]">Laravel 13 backend ready for CMS routes.</p>
      </div>
    </aside>

    <div class="lg:pl-[280px]">
      <header class="cms-topbar">
        <div class="flex min-w-0 items-center gap-3">
          <button class="icon-button lg:hidden" type="button" aria-label="Open sidebar" @click="isSidebarOpen = true">
            <i class="pi pi-bars" aria-hidden="true"></i>
          </button>
          <div class="min-w-0">
            <p class="m-0 text-xs font-semibold uppercase text-[var(--admin-muted)]">Admin CMS</p>
            <h1 class="m-0 truncate text-xl font-semibold text-[var(--admin-ink)]">{{ pageTitle }}</h1>
          </div>
        </div>

        <label class="relative hidden w-full max-w-[360px] md:block">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]" aria-hidden="true"></i>
          <input v-model="searchQuery" class="cms-input pl-10" placeholder="Search listings, users, content..." />
        </label>

        <div class="relative flex items-center gap-3">
          <BgSwitcher :is-dark="isDark" @toggle="toggleTheme" />
          <button class="icon-button hidden sm:inline-grid" type="button" aria-label="Notifications" @click="isNotificationsOpen = !isNotificationsOpen">
            <i class="pi pi-bell" aria-hidden="true"></i>
          </button>
          <button class="user-button" type="button" aria-label="Open user menu" @click="isUserMenuOpen = !isUserMenuOpen">
            <span class="grid h-9 w-9 place-items-center rounded-lg bg-[var(--admin-soft)] font-semibold text-[var(--admin-primary)]">
              {{ auth.user?.name?.charAt(0) || 'A' }}
            </span>
            <span class="hidden text-left sm:block">
              <strong class="block text-sm">{{ auth.user?.name || 'Admin' }}</strong>
              <span class="block text-xs text-[var(--admin-muted)]">{{ auth.user?.role || 'super-admin' }}</span>
            </span>
          </button>

          <div v-if="isNotificationsOpen" class="dropdown-panel right-16">
            <strong class="block px-4 py-3 text-sm">Notifications</strong>
            <button class="dropdown-item" type="button">New listing awaiting approval</button>
            <button class="dropdown-item" type="button">Payment captured for Premium plan</button>
            <button class="dropdown-item" type="button">Media optimization completed</button>
          </div>

          <div v-if="isUserMenuOpen" class="dropdown-panel right-0">
            <RouterLink class="dropdown-item no-underline" to="/settings">Profile settings</RouterLink>
            <button class="dropdown-item" type="button" @click="logout">Sign out</button>
          </div>
        </div>
      </header>

      <main class="mx-auto grid max-w-[1440px] gap-6 p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>
    </div>

    <ToastStack />
  </div>
</template>
