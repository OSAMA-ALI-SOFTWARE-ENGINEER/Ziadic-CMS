<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-bold text-ink">Content Library</h2>
      <div class="flex gap-3">
        <button class="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          + New Page
        </button>
        <button class="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          + New Post
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-gray-600 mb-1">Total Content</p>
        <p class="text-3xl font-bold text-ink">{{ stats.total_pages + stats.total_posts }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-gray-600 mb-1">Published</p>
        <p class="text-3xl font-bold text-primary">{{ stats.published_pages + stats.published_posts }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-gray-600 mb-1">Draft</p>
        <p class="text-3xl font-bold text-yellow-600">{{ stats.draft_pages + stats.draft_posts }}</p>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white rounded-lg shadow p-4 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search content..."
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        />
        <select
          v-model="filters.type"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        >
          <option value="all">All Types</option>
          <option value="pages">Pages</option>
          <option value="posts">Blog Posts</option>
          <option value="services">Services</option>
        </select>
        <select
          v-model="filters.status"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <button
          @click="loadContent"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </div>
    </div>

    <!-- Content Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="items.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Updated</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="item in items" :key="`${item.type}-${item.id}`" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <p class="font-medium text-ink">{{ item.title }}</p>
                <p class="text-xs text-gray-500">{{ item.slug }}</p>
              </td>
              <td class="px-6 py-4">
                <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  {{ item.type }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-green-100 text-green-700': item.status === 'published',
                    'bg-yellow-100 text-yellow-700': item.status === 'draft',
                  }"
                >
                  {{ item.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ formatDate(item.updated_at) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button
                    @click="editItem(item)"
                    class="text-primary hover:text-primary/80 text-sm font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    @click="previewItem(item)"
                    class="text-gray-600 hover:text-gray-800 text-sm font-semibold"
                  >
                    Preview
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center py-12 text-gray-600">
        No content found
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.last_page > 1" class="flex items-center justify-between">
      <p class="text-sm text-gray-600">
        Page {{ pagination.current_page }} of {{ pagination.last_page }}
      </p>
      <div class="flex gap-2">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          @click="currentPage++"
          :disabled="currentPage === pagination.last_page"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

interface ContentItem {
  id: number
  slug: string
  title: string
  type: string
  status: string
  updated_at: string
}

interface Pagination {
  total: number
  per_page: number
  current_page: number
  last_page: number
}

interface Stats {
  total_pages: number
  published_pages: number
  draft_pages: number
  total_posts: number
  published_posts: number
  draft_posts: number
  total_services: number
  published_services: number
}

const loading = ref(false)
const currentPage = ref(1)
const items = ref<ContentItem[]>([])
const pagination = ref<Pagination>({ total: 0, per_page: 20, current_page: 1, last_page: 1 })
const stats = ref<Stats>({
  total_pages: 0,
  published_pages: 0,
  draft_pages: 0,
  total_posts: 0,
  published_posts: 0,
  draft_posts: 0,
  total_services: 0,
  published_services: 0,
})

const filters = ref({
  search: '',
  type: 'all',
  status: '',
})

async function loadContent() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      per_page: '20',
      type: filters.value.type,
      search: filters.value.search,
      ...(filters.value.status && { status: filters.value.status }),
    })

    const response = await fetch(
      `http://localhost:8000/api/v1/admin/content-library?${params}`,
      {
        headers: { Authorization: `Bearer ${authStore.token}` },
      }
    )

    if (!response.ok) throw new Error('Failed to load content')

    const data = await response.json()
    items.value = data.data
    pagination.value = data.pagination
  } catch (err) {
    console.error('Error loading content:', err)
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const response = await fetch('http://localhost:8000/api/v1/admin/content-library/stats', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    })

    if (response.ok) {
      stats.value = await response.json()
    }
  } catch (err) {
    console.error('Error loading stats:', err)
  }
}

function editItem(item: ContentItem) {
  if (item.type === 'Page') {
    router.push(`/admin/content/pages/${item.slug}`)
  } else if (item.type === 'Blog Post') {
    router.push(`/admin/posts/${item.id}/edit`)
  } else if (item.type === 'Service') {
    router.push(`/admin/services/${item.id}/edit`)
  }
}

function previewItem(item: ContentItem) {
  const baseUrl = 'http://localhost:5173'
  if (item.type === 'Page') {
    window.open(`${baseUrl}/${item.slug}`, '_blank')
  } else if (item.type === 'Blog Post') {
    window.open(`${baseUrl}/blogs/${item.slug}`, '_blank')
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

watch([() => filters.value.search, () => filters.value.type, () => filters.value.status, currentPage], () => {
  currentPage.value = 1
  loadContent()
})

onMounted(() => {
  loadContent()
  loadStats()
})
</script>
