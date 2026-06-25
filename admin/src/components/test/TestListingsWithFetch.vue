<template>
  <div class="test-listings-container">
    <div class="card bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold mb-6">Paginated Listings Test</h2>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-4 text-gray-600">Loading listings...</span>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      >
        <h3 class="text-red-800 font-semibold mb-2">Error Loading Listings</h3>
        <p class="text-red-700 mb-4">{{ error.message }}</p>
        <button
          @click="handleRetry"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="items.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">No listings found</p>
      </div>

      <!-- Listings List -->
      <div v-else class="space-y-4 mb-8">
        <div
          v-for="listing in (items as Listing[])"
          :key="(listing as Listing).id"
          class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ (listing as Listing).title }}
              </h3>
              <p class="text-gray-600 mt-1">{{ (listing as Listing).excerpt }}</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <span
                  class="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                >
                  ID: {{ (listing as Listing).id }}
                </span>
                <span
                  :class="[
                    'inline-block px-3 py-1 text-sm rounded font-medium',
                    (listing as Listing).status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : (listing as Listing).status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800',
                  ]"
                >
                  {{ (listing as Listing).status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div
        v-if="items.length > 0"
        class="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div class="text-gray-600 text-sm">
          Page <span class="font-semibold">{{ currentPage }}</span> of
          <span class="font-semibold">{{ lastPage }}</span> | Total:
          <span class="font-semibold">{{ total }}</span> items
        </div>

        <div class="flex items-center gap-2">
          <!-- Previous Button -->
          <button
            @click="previousPage"
            :disabled="!canPreviousPage || loading"
            :class="[
              'px-4 py-2 rounded font-medium transition',
              canPreviousPage && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ]"
          >
            ← Previous
          </button>

          <!-- Page Input -->
          <div class="flex items-center gap-1">
            <input
              v-model.number="pageInput"
              type="number"
              :min="1"
              :max="lastPage"
              @keyup.enter="handleGoToPage"
              class="w-16 px-3 py-2 border border-gray-300 rounded text-center"
            />
            <button
              @click="handleGoToPage"
              :disabled="loading"
              class="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition disabled:bg-gray-400"
            >
              Go
            </button>
          </div>

          <!-- Next Button -->
          <button
            @click="nextPage"
            :disabled="!canNextPage || loading"
            :class="[
              'px-4 py-2 rounded font-medium transition',
              canNextPage && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ]"
          >
            Next →
          </button>
        </div>
      </div>

      <!-- Test Actions -->
      <div class="border-t mt-6 pt-6">
        <h3 class="text-sm font-semibold text-gray-600 mb-3">Test Actions</h3>
        <div class="flex flex-wrap gap-2">
          <button
            @click="handleLoad"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-blue-400"
          >
            Load Listings
          </button>
          <button
            @click="handleRefresh"
            :disabled="loading"
            class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:bg-purple-400"
          >
            Refresh
          </button>
          <button
            @click="handleTestError"
            :disabled="loading"
            class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition disabled:bg-orange-400"
          >
            Trigger Error
          </button>
        </div>
      </div>

      <!-- Debug Info -->
      <div class="border-t mt-6 pt-6 bg-gray-50 rounded p-4">
        <h3 class="text-sm font-semibold text-gray-600 mb-2">Debug Info</h3>
        <pre class="text-xs text-gray-700 overflow-auto">{{
          debugInfo
        }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePaginatedFetch } from '@/composables'

// Types
interface Listing {
  id: number
  title: string
  excerpt: string
  status: string
  slug: string
}

// Mock API function
async function mockFetchListings(page: number, perPage: number) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600))

  // Mock data
  const mockData: Listing[] = Array.from({ length: perPage }, (_, i) => ({
    id: (page - 1) * perPage + i + 1,
    title: `Listing ${(page - 1) * perPage + i + 1}`,
    excerpt: `This is a sample listing description for item #${(page - 1) * perPage + i + 1}`,
    status: i % 3 === 0 ? 'published' : i % 2 === 0 ? 'draft' : 'archived',
    slug: `listing-${(page - 1) * perPage + i + 1}`,
  }))

  return {
    data: mockData,
    meta: {
      current_page: page,
      per_page: perPage,
      total: 127,
      last_page: Math.ceil(127 / perPage),
    },
  }
}

// Setup composable
const { items, currentPage, total, lastPage, loading, error, canNextPage, canPreviousPage, fetchPage, nextPage, previousPage, goToPage } = usePaginatedFetch(mockFetchListings, {
  perPage: 10,
})

// Local state
const pageInput = ref(1)

// Computed
const debugInfo = computed(() => {
  return JSON.stringify(
    {
      isLoading: loading.value,
      hasError: !!error.value,
      errorMessage: error.value?.message,
      currentPage: currentPage.value,
      totalPages: lastPage.value,
      totalItems: total.value,
      itemsCount: items.value.length,
      canNavigate: {
        next: canNextPage.value,
        previous: canPreviousPage.value,
      },
    },
    null,
    2
  )
})

// Methods
async function handleLoad() {
  try {
    await fetchPage(1)
    pageInput.value = 1
  } catch (err) {
    console.error('Failed to load listings:', err)
  }
}

async function handleRefresh() {
  try {
    await fetchPage(currentPage.value)
  } catch (err) {
    console.error('Failed to refresh listings:', err)
  }
}

async function handleRetry() {
  try {
    await fetchPage(currentPage.value)
  } catch (err) {
    console.error('Failed to retry:', err)
  }
}

async function handleGoToPage() {
  if (pageInput.value >= 1 && pageInput.value <= lastPage.value) {
    try {
      await goToPage(pageInput.value)
    } catch (err) {
      console.error('Failed to go to page:', err)
    }
  }
}

async function handleTestError() {
  // Create a mock error by using an invalid API call
  try {
    throw new Error('Test error: Failed to fetch listings from API')
  } catch (err) {
    console.error('Simulated error:', err)
  }
}

// Lifecycle
onMounted(() => {
  handleLoad()
})
</script>

<style scoped>
.test-listings-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}
</style>
