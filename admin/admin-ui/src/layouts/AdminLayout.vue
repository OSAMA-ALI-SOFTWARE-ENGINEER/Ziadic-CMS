<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div class="w-64 bg-gray-900 text-white flex flex-col shadow-lg">
      <div class="p-6 border-b border-gray-800">
        <h1 class="text-xl font-bold">Kukaqka Admin</h1>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <RouterLink
          to="/admin"
          class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          :class="{ 'bg-primary': route.path === '/admin' }"
        >
          <span class="text-xl">📊</span>
          <span class="font-medium">Dashboard</span>
        </RouterLink>

        <div class="pt-2">
          <p class="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Content Management</p>
          <RouterLink
            to="/admin/content/library"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            :class="{ 'bg-primary': route.path.includes('/admin/content') }"
          >
            <span class="text-xl">📚</span>
            <span class="font-medium">Content Library</span>
          </RouterLink>

          <RouterLink
            to="/admin/blog-workflow"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            :class="{ 'bg-primary': route.path.includes('/admin/blog-workflow') }"
          >
            <span class="text-xl">📝</span>
            <span class="font-medium">Blog Workflow</span>
          </RouterLink>
        </div>
      </nav>

      <div class="border-t border-gray-800 p-4 space-y-2">
        <div class="px-4 py-2 text-sm">
          <p class="text-gray-400">Signed in as</p>
          <p class="font-semibold">{{ authStore.user?.name || 'Admin' }}</p>
        </div>
        <button
          @click="logout"
          class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Topbar -->
      <div class="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <h2 class="text-xl font-bold text-ink">{{ pageTitle }}</h2>
        <div class="text-sm text-gray-600">{{ currentTime }}</div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-auto p-8">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const currentTime = ref('')

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    'Dashboard': 'Dashboard',
    'ContentLibrary': 'Content Library',
    'PageEditor': 'Edit Page',
    'BlogWorkflow': 'Blog Publishing Workflow',
  }
  return titles[route.name as string] || 'Admin'
})

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

async function logout() {
  await authStore.logout()
  router.push('/admin/login')
}

onMounted(() => {
  updateTime()
  const interval = setInterval(updateTime, 1000)
  onUnmounted(() => clearInterval(interval))
})
</script>
