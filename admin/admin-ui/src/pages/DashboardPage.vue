<template>
  <div class="space-y-6">
    <h2 class="text-3xl font-bold text-ink">Dashboard</h2>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Stat Cards -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm mb-1">Total Listings</p>
            <p class="text-4xl font-bold text-ink">{{ stats.total_listings }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="pi pi-list text-2xl text-blue-600"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm mb-1">Published</p>
            <p class="text-4xl font-bold text-ink">{{ stats.published_listings }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <i class="pi pi-check text-2xl text-green-600"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm mb-1">Pending Approval</p>
            <p class="text-4xl font-bold text-ink">{{ stats.pending_approvals }}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <i class="pi pi-hourglass text-2xl text-yellow-600"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm mb-1">Total Users</p>
            <p class="text-4xl font-bold text-ink">{{ stats.total_users }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <i class="pi pi-users text-2xl text-purple-600"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm mb-1">Blog Posts</p>
            <p class="text-4xl font-bold text-ink">{{ stats.total_posts }}</p>
          </div>
          <div class="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
            <i class="pi pi-book text-2xl text-pink-600"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm mb-1">Unread Messages</p>
            <p class="text-4xl font-bold text-ink">{{ stats.unread_messages }}</p>
          </div>
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <i class="pi pi-inbox text-2xl text-orange-600"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Listings Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-xl font-bold text-ink">Recent Listings</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">City</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Featured</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="listing in stats.recent_listings" :key="listing.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div>
                  <p class="font-medium text-ink">{{ listing.title }}</p>
                  <p class="text-xs text-gray-500">{{ listing.business_name }}</p>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ listing.city?.name }}</td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex px-3 py-1 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-green-100 text-green-700': listing.status === 'published',
                    'bg-yellow-100 text-yellow-700': listing.status === 'pending',
                    'bg-gray-100 text-gray-700': listing.status === 'draft',
                  }"
                >
                  {{ listing.status }}
                </span>
              </td>
              <td class="px-6 py-4">
                <i
                  :class="listing.is_featured ? 'pi-check text-green-600' : 'pi-times text-gray-400'"
                  class="pi text-lg"
                ></i>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(listing.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

interface Stat {
  total_listings: number
  published_listings: number
  pending_approvals: number
  total_users: number
  total_posts: number
  unread_messages: number
  recent_listings: Array<{
    id: number
    title: string
    business_name: string
    status: string
    is_featured: boolean
    city?: { id: number; name: string }
    created_at: string
  }>
}

const authStore = useAuthStore()
const loading = ref(true)
const stats = ref<Stat>({
  total_listings: 0,
  published_listings: 0,
  pending_approvals: 0,
  total_users: 0,
  total_posts: 0,
  unread_messages: 0,
  recent_listings: [],
})

async function loadStats() {
  try {
    const response = await fetch('http://localhost:8000/api/v1/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    })

    if (response.ok) {
      stats.value = await response.json()
    }
  } catch (err) {
    console.error('Failed to load dashboard stats:', err)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(loadStats)
</script>
