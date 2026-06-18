<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { api } from '@/services/api'
import { useRoute, useRouter } from 'vue-router'
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
const isUserMenuOpen = ref(false)
const isNotificationsOpen = ref(false)
const pendingCount = ref(0)
const isMobileSearchOpen = ref(false)
const searchQuery = ref('')
const isSearchOpen = ref(false)
const activeProfileTab = ref('profile')
const sidebarWidth = ref(280)
const isDraggingSidebar = ref(false)
const hoveredNavItem = ref<string | null>(null)
let userMenuHoverTimer: any = null

// Load sidebar width from localStorage
onMounted(() => {
  const saved = localStorage.getItem('sidebar-width')
  if (saved) {
    sidebarWidth.value = parseInt(saved, 10)
  }
})

function handleSidebarDragStart() {
  isDraggingSidebar.value = true
  document.addEventListener('mousemove', handleSidebarDrag)
  document.addEventListener('mouseup', handleSidebarDragEnd)
}

function handleSidebarDrag(e: MouseEvent) {
  if (!isDraggingSidebar.value) return

  // Calculate new width based on mouse position
  const newWidth = Math.max(100, Math.min(400, e.clientX))

  if (newWidth < 150) {
    isCollapsed.value = true
    sidebarWidth.value = 80
  } else {
    isCollapsed.value = false
    sidebarWidth.value = newWidth
  }

  // Save to localStorage
  localStorage.setItem('sidebar-width', newWidth.toString())
}

function handleSidebarDragEnd() {
  isDraggingSidebar.value = false
  document.removeEventListener('mousemove', handleSidebarDrag)
  document.removeEventListener('mouseup', handleSidebarDragEnd)
}

function handleUserMenuHover() {
  if (userMenuHoverTimer) clearTimeout(userMenuHoverTimer)
  isUserMenuOpen.value = true
}

function handleUserMenuLeave() {
  userMenuHoverTimer = setTimeout(() => {
    isUserMenuOpen.value = false
  }, 5000)
}

// Define all navigation items with their required roles
const allNavigationGroups = [
  {
    label: 'Core',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: 'pi pi-home', roles: ['super-admin', 'admin', 'staff', 'client'] },
      { label: 'Listings', to: '/listings', icon: 'pi pi-building', roles: ['super-admin', 'admin', 'staff'] },
      { label: 'Approvals', to: '/approvals', icon: 'pi pi-check-circle', roles: ['super-admin', 'admin'] },
      { label: 'Submitted Listings', to: '/submissions', icon: 'pi pi-inbox', roles: ['super-admin', 'admin'] },
      { label: 'Categories', to: '/categories', icon: 'pi pi-tags', roles: ['super-admin', 'admin'] },
      { label: 'Location Management', to: '/location-management', icon: 'pi pi-map', roles: ['super-admin', 'admin'] },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Blog Articles', to: '/blog-articles', icon: 'pi pi-book', roles: ['super-admin', 'admin', 'staff'] },
      { label: 'Media', to: '/media', icon: 'pi pi-images', roles: ['super-admin', 'admin', 'staff'] },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { label: 'Payments', to: '/payments', icon: 'pi pi-credit-card', roles: ['super-admin', 'admin'] },
      { label: 'Subscriptions', to: '/subscriptions', icon: 'pi pi-envelope', roles: ['super-admin', 'admin'] },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Users', to: '/users', icon: 'pi pi-users', roles: ['super-admin', 'admin'] },
      { label: 'Roles', to: '/roles', icon: 'pi pi-shield', roles: ['super-admin'] },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        roles: ['super-admin', 'admin'],
        children: [
          { label: 'Profile', to: '/profile', icon: 'pi pi-user', roles: ['super-admin', 'admin', 'staff', 'client'] },
          { label: 'System Settings', to: '/settings', icon: 'pi pi-cog', roles: ['super-admin', 'admin'] },
        ],
      },
      { label: 'Activity Logs', to: '/activity-logs', icon: 'pi pi-list', roles: ['super-admin', 'admin'] },
    ],
  },
]

// Filter navigation based on user role
function getFilteredNavigation() {
  const userRole = auth.user?.role || 'client'

  return allNavigationGroups.map(group => ({
    ...group,
    items: group.items
      .filter(item => !item.roles || item.roles.includes(userRole))
      .map(item => ({
        ...item,
        children: item.children
          ? item.children.filter(child => !child.roles || child.roles.includes(userRole))
          : undefined,
      })),
  })).filter(group => group.items.length > 0)
}

const navigationGroups = computed(() => getFilteredNavigation())

const pageTitle = computed(() => String(route.meta.title || 'Dashboard').replace(' | Kukaqka CMS', ''))

function openSearch() {
  isSearchOpen.value = true
}

function closeSearch() {
  isSearchOpen.value = false
  searchQuery.value = ''
}

async function logout() {
  await auth.logout()
  isUserMenuOpen.value = false
  ui.pushToast('Signed out successfully.', 'success')
  await router.push('/login')
}

onMounted(() => {
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
      class="fixed inset-0 z-30 border-0 bg-black/30 xl:hidden!"
      type="button"
      aria-label="Close sidebar"
      @click="isSidebarOpen = false"
    ></button>

    <aside
      class="cms-sidebar relative transition-all duration-200"
      :class="{ 'cms-sidebar--open': isSidebarOpen, 'cms-sidebar--collapsed': isCollapsed }"
      :style="{ width: isCollapsed ? '80px' : `${sidebarWidth}px` }"
    >
      <!-- Draggable resize handle -->
      <div
        class="absolute right-0 top-0 h-full w-1 bg-transparent hover:bg-blue-500 cursor-col-resize transition-colors z-40"
        @mousedown="handleSidebarDragStart"
        :class="{ 'bg-blue-500': isDraggingSidebar }"
      ></div>
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
          <!-- Collapse toggle (large screens only - xl and up) -->
          <button
            class="icon-button hidden! xl:grid!"
            type="button"
            :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
            @click="isCollapsed = !isCollapsed"
          >
            <i :class="isCollapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-left'" aria-hidden="true"></i>
          </button>
          <!-- Close button (mobile and tablet only - below xl) -->
          <button class="icon-button xl:hidden!" type="button" aria-label="Close sidebar" @click="isSidebarOpen = false">
            <i class="pi pi-times" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <nav class="mt-4 grid gap-4 px-3" aria-label="CMS navigation">
        <div v-for="group in navigationGroups" :key="group.label" class="grid gap-1">
          <p v-show="!isCollapsed" class="cms-nav-group-label m-0 px-2 text-xs font-semibold uppercase tracking-wide text-(--admin-muted)">
            {{ group.label }}
          </p>
          <div v-for="item in group.items" :key="item.label" class="grid gap-0.5">
            <!-- Parent item with children -->
            <div v-if="item.children && item.children.length > 0" class="grid gap-0.5">
              <div :class="['cms-nav-link flex items-center cursor-default text-(--admin-muted) relative group', isCollapsed ? 'justify-center px-3 py-2' : 'gap-3 px-2 py-2']" :title="isCollapsed ? item.label : undefined">
                <i :class="item.icon" aria-hidden="true"></i>
                <span v-show="!isCollapsed" class="text-sm font-semibold">{{ item.label }}</span>
                <!-- Tooltip on hover when collapsed -->
                <span v-if="isCollapsed" class="absolute left-full ml-3 px-3 py-2 bg-linear-to-r from-gray-900 to-gray-800 text-white text-xs rounded-lg shadow-lg font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-gray-700">
                  {{ item.label }}
                </span>
              </div>
              <!-- Child items -->
              <RouterLink
                v-for="child in item.children"
                :key="child.label"
                :to="child.to"
                :class="['cms-nav-link relative group', isCollapsed ? 'ml-0 justify-center px-3 py-2 flex items-center' : 'ml-8 flex items-center gap-3 px-2 py-2']"
                :data-label="child.label"
                active-class="cms-nav-link--active"
                @click="isSidebarOpen = false"
                :title="isCollapsed ? child.label : undefined"
              >
                <i :class="child.icon" aria-hidden="true"></i>
                <span v-show="!isCollapsed" class="text-sm">{{ child.label }}</span>
                <!-- Tooltip on hover when collapsed -->
                <span v-if="isCollapsed" class="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {{ child.label }}
                </span>
              </RouterLink>
            </div>
            <!-- Regular item without children -->
            <RouterLink
              v-else
              :to="item.to"
              :class="['cms-nav-link relative group flex items-center', isCollapsed ? 'justify-center px-3 py-2' : 'gap-3 px-2 py-2']"
              :data-label="item.label"
              active-class="cms-nav-link--active"
              @click="isSidebarOpen = false"
              :title="isCollapsed ? item.label : undefined"
            >
              <i :class="item.icon" aria-hidden="true"></i>
              <span v-show="!isCollapsed">{{ item.label }}</span>
              <!-- Tooltip on hover when collapsed -->
              <span v-if="isCollapsed" class="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {{ item.label }}
              </span>
              <span v-if="item.to === '/submissions' && pendingCount > 0" class="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">{{ pendingCount }}</span>
            </RouterLink>
          </div>
        </div>
      </nav>

    
    </aside>

    <div :style="{ paddingLeft: isCollapsed ? '80px' : `${sidebarWidth}px` }" class="transition-all duration-200">
      <header class="cms-topbar">
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <button class="icon-button xl:hidden!" type="button" aria-label="Open sidebar" @click="isSidebarOpen = true">
            <i class="pi pi-bars" aria-hidden="true"></i>
          </button>
          <div class="min-w-0 max-w-60 xl:max-w-none">
            <p class="m-0 text-xs font-semibold uppercase text-(--admin-muted)">Admin CMS</p>
            <h1 class="m-0 truncate text-xl font-semibold text-(--admin-ink)" :title="pageTitle">{{ pageTitle }}</h1>
          </div>
        </div>

        <!-- Desktop Search (xl and up) -->
        <GlobalSearch
          v-model="searchQuery"
          :open="isSearchOpen"
          class="hidden! xl:block!"
          @open="openSearch"
          @close="closeSearch"
        />

        <!-- Mobile Search Button (below xl) -->
        <button
          class="icon-button xl:hidden!"
          type="button"
          aria-label="Open search"
          @click="isMobileSearchOpen = !isMobileSearchOpen"
        >
          <i class="pi pi-search" aria-hidden="true"></i>
        </button>

        <div class="relative flex items-center gap-3">
          <button class="icon-button hidden sm:inline-grid" type="button" aria-label="Notifications" @click="isNotificationsOpen = !isNotificationsOpen">
            <i class="pi pi-bell" aria-hidden="true"></i>
          </button>
          <div class="relative group" @mouseenter="handleUserMenuHover" @mouseleave="handleUserMenuLeave">
            <button class="user-button" type="button" aria-label="Open user menu" @click="isUserMenuOpen = !isUserMenuOpen">
              <span class="grid h-9 w-9 place-items-center rounded-lg bg-linear-to-br from-(--admin-primary) to-(--admin-primary-strong) font-semibold text-white shadow-md overflow-hidden">
                <img
                  v-if="auth.user?.profile_picture"
                  :src="auth.user.profile_picture"
                  :alt="auth.user?.name"
                  class="w-full h-full object-cover"
                />
                <span v-else>{{ auth.user?.name?.charAt(0) || 'A' }}</span>
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

            <div v-if="isUserMenuOpen" class="dropdown-panel right-0 w-48 p-1 shadow-lg rounded-lg overflow-hidden absolute top-full mt-2 z-50 bg-white border border-gray-200">
              <!-- Standard Dropdown Menu Items -->
              <RouterLink
                to="/profile"
                class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 no-underline transition-colors"
              >
                <i class="pi pi-user text-base text-(--admin-primary)"></i>
                <span>Profile</span>
              </RouterLink>

              <RouterLink
                to="/settings"
                class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 no-underline transition-colors border-t border-gray-100"
              >
                <i class="pi pi-cog text-base text-(--admin-primary)"></i>
                <span>Settings</span>
              </RouterLink>

              <button
                @click="logout"
                class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
              >
                <i class="pi pi-sign-out text-base"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Mobile Search Bar (below xl) -->
      <Transition name="slide-down">
        <div v-if="isMobileSearchOpen" class="border-b border-(--admin-border) bg-(--admin-panel) p-4 xl:hidden!">
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
