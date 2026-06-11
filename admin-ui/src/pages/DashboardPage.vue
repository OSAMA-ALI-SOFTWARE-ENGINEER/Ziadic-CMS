<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-ink">Welcome back, {{ authStore.user?.name }}!</h1>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow p-6 space-y-2">
        <p class="text-sm text-gray-600">Total Content</p>
        <p class="text-4xl font-bold text-ink">{{ stats.total_content }}</p>
        <p class="text-xs text-gray-500">Pages & Posts</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6 space-y-2">
        <p class="text-sm text-gray-600">Published</p>
        <p class="text-4xl font-bold text-green-600">{{ stats.published }}</p>
        <p class="text-xs text-gray-500">Live content</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6 space-y-2">
        <p class="text-sm text-gray-600">Drafts</p>
        <p class="text-4xl font-bold text-yellow-600">{{ stats.drafts }}</p>
        <p class="text-xs text-gray-500">Work in progress</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6 space-y-2">
        <p class="text-sm text-gray-600">Pending Review</p>
        <p class="text-4xl font-bold text-blue-600">{{ stats.pending }}</p>
        <p class="text-xs text-gray-500">Awaiting approval</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-bold text-ink mb-4">Quick Actions</h3>
        <div class="space-y-2">
          <RouterLink
            to="/admin/content/library"
            class="block px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 text-center font-semibold transition-colors"
          >
            📚 Manage Content
          </RouterLink>
          <RouterLink
            to="/admin/blog-workflow"
            class="block px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-semibold transition-colors"
          >
            📝 Blog Workflow
          </RouterLink>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-bold text-ink mb-4">System Status</h3>
        <div class="space-y-2 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-gray-600">API Status</span>
            <span class="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">✓ Online</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Last Updated</span>
            <span class="text-gray-700 font-semibold">{{ lastUpdated }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Database</span>
            <span class="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">✓ Connected</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const stats = ref({
  total_content: 0,
  published: 0,
  drafts: 0,
  pending: 0,
})

const lastUpdated = ref(new Date().toLocaleTimeString())

async function loadStats() {
  try {
    const response = await fetch('http://localhost:8000/api/v1/admin/content-library/stats', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    })

    if (response.ok) {
      const data = await response.json()
      stats.value = {
        total_content: (data.total_pages || 0) + (data.total_posts || 0),
        published: (data.published_pages || 0) + (data.published_posts || 0),
        drafts: (data.draft_pages || 0) + (data.draft_posts || 0),
        pending: 0,
      }
      lastUpdated.value = new Date().toLocaleTimeString()
    }
  } catch (err) {
    console.error('Error loading stats:', err)
  }
}

onMounted(loadStats)
</script>
