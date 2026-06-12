<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { api } from '@/services/api'
import { useRoute, useRouter } from 'vue-router'
import BgSwitcher from '@/components/BgSwitcher.vue'
import GlobalSearch from '@/components/GlobalSearch.vue'
import ToastStack from '@/components/ToastStack.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const isSidebarOpen = ref(false)
const isCollapsed = ref(false)
const isDark = ref(false)
const isUserMenuOpen = ref(false)
const isNotificationsOpen = ref(false)
const pendingCount = ref(0)
const isMobileSearchOpen = ref(false)
const searchQuery = ref('')
const isSearchOpen = ref(false)

const navigationGroups = [
  {
    label: 'Core',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: 'pi pi-home' },
      { label: 'Listings', to: '/listings', icon: 'pi pi-building' },
      { label: 'Approvals', to: '/approvals', icon: 'pi pi-check-circle' },
      { label: 'Submitted Listings', to: '/submissions', icon: 'pi pi-inbox' },
      { label: 'Categories', to: '/categories', icon: 'pi pi-tags' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Content', to: '/content', icon: 'pi pi-file-edit' },
      { label: 'Blog Articles', to: '/blog-articles', icon: 'pi pi-book' },
      { label: 'Media', to: '/media', icon: 'pi pi-images' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { label: 'Payments', to: '/payments', icon: 'pi pi-credit-card' },
      { label: 'Subscriptions', to: '/subscriptions', icon: 'pi pi-envelope' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Users', to: '/users', icon: 'pi pi-users' },
      { label: 'Roles', to: '/roles', icon: 'pi pi-shield' },
      { label: 'Settings', to: '/settings', icon: 'pi pi-cog' },
      { label: 'Activity Logs', to: '/activity-logs', icon: 'pi pi-list' },
    ],
  },
]

const pageTitle = computed(() => String(route.meta.title || 'Dashboard').replace(' | Kukaqka CMS', ''))

function openSearch() {
  isSearchOpen.value = true
}

function closeSearch() {
  isSearchOpen.value = false
  searchQuery.value = ''
}

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
  startPendingPoll()
})

onBeforeUnmount(() => {
  closeSearch()
  stopPendingPoll()
})

let pollTimer: any = null
function startPendingPoll() {
  fetchPendingCount()
  pollTimer = setInterval(fetchPendingCount, 10000)
}
function stopPendingPoll() {
  if (pollTimer) clearInterval(pollTimer)
}
async function fetchPendingCount() {
  try {
    const res = await api.get('/submissions/count')
    pendingCount.value = res.data.count || 0
  } catch (e) {
    // ignore
  }
}

// Listen for optimistic update events from pages to refresh immediately
window.addEventListener('pending-count-updated', () => {
  fetchPendingCount()
})
</script>

<template>
  <div class="min-h-screen bg-(--admin-bg) text-(--admin-ink)" :class="{ 'sidebar-collapsed': isCollapsed }">
    <!-- Mobile Sidebar Overlay -->
    <button
      v-if="isSidebarOpen"
      class="fixed inset-0 z-30 border-0 bg-black/30 lg:hidden"
      type="button"
      aria-label="Close sidebar"
      @click="isSidebarOpen = false"
    ></button>

    <aside class="cms-sidebar" :class="{ 'cms-sidebar--open': isSidebarOpen, 'cms-sidebar--collapsed': isCollapsed }">
      <div class="flex h-16 items-center justify-between px-5">
        <RouterLink class="flex items-center gap-3 no-underline flex-1 min-w-0" to="/dashboard" @click="isSidebarOpen = false">
          <span class="grid h-10 w-10 place-items-center rounded-lg bg-linear-to-br from-(--admin-primary) to-(--admin-primary-strong) text-lg font-bold text-white shadow-md shrink-0">
            K
          </span>
          <span v-show="!isCollapsed" class="hidden sm:block min-w-0">
            <strong class="block text-base font-semibold text-(--admin-ink) truncate">Kukaqka CMS</strong>
            <span class="block text-xs text-(--admin-muted) truncate">Backend Control</span>
          </span>
        </RouterLink>
        <div class="flex gap-2 shrink-0">
          <!-- Collapse toggle (desktop only - lg and up) -->
          <button
            class="icon-button hidden lg:grid"
            type="button"
            :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
            @click="isCollapsed = !isCollapsed"
          >
            <i :class="isCollapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-left'" aria-hidden="true"></i>
          </button>
          <!-- Close button (mobile/tablet only - below lg) -->
          <button class="icon-button lg:hidden" type="button" aria-label="Close sidebar" @click="isSidebarOpen = false">
            <i class="pi pi-times" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <nav class="mt-4 grid gap-4 px-3" aria-label="CMS navigation">
        <div v-for="group in navigationGroups" :key="group.label" class="grid gap-1">
          <p v-show="!isCollapsed" class="cms-nav-group-label m-0 px-2 text-xs font-semibold uppercase tracking-wide text-(--admin-muted)">
            {{ group.label }}
          </p>
          <RouterLink
            v-for="item in group.items"
            :key="item.label"
            :to="item.to"
            class="cms-nav-link"
            :data-label="item.label"
            active-class="cms-nav-link--active"
            @click="isSidebarOpen = false"
          >
            <i :class="item.icon" aria-hidden="true"></i>
            <span v-show="!isCollapsed">{{ item.label }}</span>
            <span v-if="item.to === '/submissions' && pendingCount > 0" class="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">{{ pendingCount }}</span>
          </RouterLink>
        </div>
      </nav>

    
    </aside>

    <div :class="{ 'lg:pl-70': !isCollapsed, 'lg:pl-16': isCollapsed }">
      <header class="cms-topbar">
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <button class="icon-button lg:hidden" type="button" aria-label="Open sidebar" @click="isSidebarOpen = true">
            <i class="pi pi-bars" aria-hidden="true"></i>
          </button>
          <div class="min-w-0 max-w-60 xl:max-w-none">
            <p class="m-0 text-xs font-semibold uppercase text-(--admin-muted)">Admin CMS</p>
            <h1 class="m-0 truncate text-xl font-semibold text-(--admin-ink)" :title="pageTitle">{{ pageTitle }}</h1>
          </div>
        </div>

        <!-- Desktop Search (lg and up) -->
        <GlobalSearch
          v-model="searchQuery"
          :open="isSearchOpen"
          class="hidden lg:block"
          @open="openSearch"
          @close="closeSearch"
        />

        <!-- Mobile Search Button (below lg) -->
        <button
          class="icon-button lg:hidden"
          type="button"
          aria-label="Open search"
          @click="isMobileSearchOpen = !isMobileSearchOpen"
        >
          <i class="pi pi-search" aria-hidden="true"></i>
        </button>

        <div class="relative flex items-center gap-3">
          <BgSwitcher :is-dark="isDark" @toggle="toggleTheme" />
          <button class="icon-button hidden sm:inline-grid" type="button" aria-label="Notifications" @click="isNotificationsOpen = !isNotificationsOpen">
            <i class="pi pi-bell" aria-hidden="true"></i>
          </button>
          <button class="user-button" type="button" aria-label="Open user menu" @click="isUserMenuOpen = !isUserMenuOpen">
            <span class="grid h-9 w-9 place-items-center rounded-lg bg-linear-to-br from-(--admin-primary) to-(--admin-primary-strong) font-semibold text-white shadow-md">
              {{ auth.user?.name?.charAt(0) || 'A' }}
            </span>
            <span class="hidden text-left sm:block">
              <strong class="block text-sm">{{ auth.user?.name || 'Admin' }}</strong>
              <span class="block text-xs text-(--admin-muted)">{{ auth.user?.role || 'super-admin' }}</span>
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

      <!-- Mobile Search Bar (below lg) -->
      <Transition name="slide-down">
        <div v-if="isMobileSearchOpen" class="border-b border-(--admin-border) bg-(--admin-panel) p-4 lg:hidden">
          <GlobalSearch
            v-model="searchQuery"
            :open="true"
            @open="isMobileSearchOpen = true"
            @close="isMobileSearchOpen = false; closeSearch()"
          />
        </div>
      </Transition>

      <main class="mx-auto grid max-w-360 gap-6 p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>
    </div>

    <ToastStack />
  </div>
</template>
