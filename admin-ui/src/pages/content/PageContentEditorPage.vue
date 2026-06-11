<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-bold text-ink">{{ pageData?.page_title || 'Loading...' }}</h2>
      <div class="flex gap-3">
        <button
          @click="savePage"
          :disabled="saving"
          class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
        <button
          v-if="pageData?.status === 'published'"
          @click="unpublishPage"
          class="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Unpublish
        </button>
        <button
          v-else
          @click="publishPage"
          class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Publish
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-lg shadow">
      <div class="flex border-b border-gray-200">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="{
            'border-b-2 border-primary text-primary': activeTab === tab.id,
            'text-gray-600 hover:text-gray-900': activeTab !== tab.id,
          }"
          class="px-6 py-4 font-medium transition-colors"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="p-6 space-y-6">
        <!-- Content Tab -->
        <div v-if="activeTab === 'content'" class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Page Title</label>
            <input
              v-model="pageData.page_title"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Page Type</label>
            <select v-model="pageData.page_type" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
              <option value="static">Static</option>
              <option value="landing">Landing</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Main Content</label>
            <textarea
              v-model="pageData.content.description"
              rows="8"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono text-sm"
              placeholder="Page content in JSON or plain text..."
            ></textarea>
          </div>
        </div>

        <!-- SEO Tab -->
        <div v-if="activeTab === 'seo'" class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">SEO Title</label>
            <input
              v-model="pageData.seo_fields.seo_title"
              type="text"
              maxlength="60"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Max 60 characters"
            />
            <p class="text-xs text-gray-500 mt-1">{{ pageData.seo_fields.seo_title?.length || 0 }}/60</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">SEO Description</label>
            <textarea
              v-model="pageData.seo_fields.seo_description"
              rows="3"
              maxlength="160"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Max 160 characters"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">{{ pageData.seo_fields.seo_description?.length || 0 }}/160</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Keywords</label>
            <input
              v-model="pageData.seo_fields.seo_keywords"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Comma-separated keywords"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">OG Image URL</label>
            <input
              v-model="pageData.seo_fields.og_image"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="https://..."
            />
          </div>
        </div>

        <!-- Meta Tab -->
        <div v-if="activeTab === 'meta'" class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Page Slug</label>
            <input
              v-model="pageData.page_slug"
              type="text"
              disabled
              class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              v-model="pageData.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Last Updated</label>
            <input
              :value="formatDate(pageData.updated_at)"
              type="text"
              disabled
              class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

interface PageData {
  page_slug: string
  page_title: string
  page_type: string
  content: { description: string }
  seo_fields: {
    seo_title: string
    seo_description: string
    seo_keywords: string
    og_image: string
  }
  meta: Record<string, any>
  status: string
  updated_at: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('content')
const saving = ref(false)
const successMessage = ref('')

const tabs = [
  { id: 'content', label: 'Content' },
  { id: 'seo', label: 'SEO' },
  { id: 'meta', label: 'Settings' },
]

const pageData = ref<PageData>({
  page_slug: '',
  page_title: '',
  page_type: 'static',
  content: { description: '' },
  seo_fields: {
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    og_image: '',
  },
  meta: {},
  status: 'draft',
  updated_at: '',
})

async function loadPageContent() {
  try {
    const slug = route.params.slug as string
    const response = await fetch(`http://localhost:8000/api/v1/admin/page-content/${slug}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    })

    if (!response.ok) throw new Error('Failed to load page')
    pageData.value = await response.json()
  } catch (err) {
    console.error('Error loading page:', err)
  }
}

async function savePage() {
  saving.value = true
  successMessage.value = ''

  try {
    const slug = route.params.slug as string
    const response = await fetch(`http://localhost:8000/api/v1/admin/page-content/${slug}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_title: pageData.value.page_title,
        page_type: pageData.value.page_type,
        content: pageData.value.content,
        seo_fields: pageData.value.seo_fields,
        status: pageData.value.status,
      }),
    })

    if (!response.ok) throw new Error('Failed to save page')

    successMessage.value = 'Page saved successfully!'
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (err) {
    console.error('Error saving page:', err)
    successMessage.value = 'Error saving page. Please try again.'
  } finally {
    saving.value = false
  }
}

async function publishPage() {
  try {
    const slug = route.params.slug as string
    await fetch(`http://localhost:8000/api/v1/admin/page-content/${slug}/publish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    pageData.value.status = 'published'
    successMessage.value = 'Page published successfully!'
  } catch (err) {
    console.error('Error publishing page:', err)
  }
}

async function unpublishPage() {
  try {
    const slug = route.params.slug as string
    await fetch(`http://localhost:8000/api/v1/admin/page-content/${slug}/unpublish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    pageData.value.status = 'draft'
    successMessage.value = 'Page unpublished successfully!'
  } catch (err) {
    console.error('Error unpublishing page:', err)
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return 'Never'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(loadPageContent)
</script>
