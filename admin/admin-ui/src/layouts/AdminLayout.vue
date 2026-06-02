<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-ink text-white shadow-lg hidden md:flex flex-col">
      <div class="p-6 border-b border-gray-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold">Z</div>
          <div>
            <h1 class="font-bold text-lg font-display">Zaidic</h1>
            <p class="text-xs text-gray-400">Admin</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 p-4 space-y-2">
        <RouterLink
          to="/admin/dashboard"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800"
          :class="{ 'bg-primary': route.name === 'dashboard' }"
        >
          <i class="pi pi-home text-lg"></i>
          <span>Dashboard</span>
        </RouterLink>

        <button
          @click="showListingsMenu = !showListingsMenu"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800"
        >
          <i class="pi pi-list text-lg"></i>
          <span>Listings</span>
          <i :class="showListingsMenu ? 'pi-chevron-down' : 'pi-chevron-right'" class="pi ml-auto text-sm"></i>
        </button>

        <div v-show="showListingsMenu" class="ml-8 space-y-1">
          <RouterLink to="/admin/listings" class="block px-4 py-2 rounded transition-colors hover:bg-gray-800 text-sm">
            All Listings
          </RouterLink>
          <RouterLink to="/admin/listings/new" class="block px-4 py-2 rounded transition-colors hover:bg-gray-800 text-sm">
            New Listing
          </RouterLink>
        </div>

        <button
          @click="showContentMenu = !showContentMenu"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800"
        >
          <i class="pi pi-book text-lg"></i>
          <span>Content</span>
          <i :class="showContentMenu ? 'pi-chevron-down' : 'pi-chevron-right'" class="pi ml-auto text-sm"></i>
        </button>

        <div v-show="showContentMenu" class="ml-8 space-y-1">
          <RouterLink to="/admin/posts" class="block px-4 py-2 rounded transition-colors hover:bg-gray-800 text-sm">
            Blog Posts
          </RouterLink>
          <RouterLink to="/admin/pages" class="block px-4 py-2 rounded transition-colors hover:bg-gray-800 text-sm">
            Pages
          </RouterLink>
          <RouterLink to="/admin/categories" class="block px-4 py-2 rounded transition-colors hover:bg-gray-800 text-sm">
            Categories
          </RouterLink>
        </div>

        <RouterLink
          to="/admin/users"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800"
          :class="{ 'bg-primary': route.name === 'users' }"
        >
          <i class="pi pi-users text-lg"></i>
          <span>Users</span>
        </RouterLink>

        <RouterLink
          to="/admin/messages"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800"
          :class="{ 'bg-primary': route.name === 'messages' }"
        >
          <i class="pi pi-inbox text-lg"></i>
          <span>Messages</span>
        </RouterLink>

        <RouterLink
          to="/admin/settings"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800"
          :class="{ 'bg-primary': route.name === 'settings' }"
        >
          <i class="pi pi-cog text-lg"></i>
          <span>Settings</span>
        </RouterLink>
      </nav>

      <div class="border-t border-gray-700 p-4">
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors hover:bg-gray-800 text-sm"
        >
          <i class="pi pi-sign-out text-lg"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Topbar -->
      <header class="bg-white shadow">
        <div class="px-6 py-4 flex items-center justify-between">
          <h1 class="text-2xl font-bold text-ink">{{ pageTitle }}</h1>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600">{{ authStore.user?.name }}</span>
            <button
              @click="handleLogout"
              class="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const showListingsMenu = ref(false)
const showContentMenu = ref(false)

const pageTitle = computed(() => {
  return String(route.meta.title || 'Admin')
})

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>
