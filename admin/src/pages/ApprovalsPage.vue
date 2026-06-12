<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { api } from '@/services/api'
import { useUiStore } from '@/stores/ui'

interface PendingListing {
  id: number
  title: string
  business_name?: string
  category_name: string
  city_name: string
  owner_name: string
  status: string
  created_at: string
  updated_at: string
}

const ui = useUiStore()
const pendingListings = ref<PendingListing[]>([])
const loading = ref(false)
const approvingId = ref<number | null>(null)
const rejectingId = ref<number | null>(null)
const searchQuery = ref('')
const pollInterval = ref<NodeJS.Timeout | null>(null)

const filteredListings = computed(() => {
  if (!searchQuery.value) return pendingListings.value
  const query = searchQuery.value.toLowerCase()
  return pendingListings.value.filter(
    (listing) =>
      listing.title.toLowerCase().includes(query) ||
      listing.category_name.toLowerCase().includes(query) ||
      listing.city_name.toLowerCase().includes(query) ||
      listing.owner_name.toLowerCase().includes(query)
  )
})

async function loadPendingListings() {
  try {
    loading.value = true
    const response = await api.get('/listings', {
      params: { status: 'pending', per_page: 100 },
    })
    const data = response.data.data || response.data

    pendingListings.value = (Array.isArray(data) ? data : data.data || []).map((listing: any) => ({
      id: listing.id,
      title: listing.title || listing.business_name || '',
      business_name: listing.business_name,
      category_name: listing.categories?.[0]?.name || 'Uncategorized',
      city_name: listing.city?.name || listing.address || 'N/A',
      owner_name: listing.owner?.name || 'Unknown',
      status: listing.status || 'pending',
      created_at: listing.created_at,
      updated_at: listing.updated_at,
    }))
  } catch (err) {
    console.error('Failed to load pending listings:', err)
    ui.pushToast('Failed to load pending listings', 'danger')
  } finally {
    loading.value = false
  }
}

async function approveListing(listing: PendingListing) {
  try {
    approvingId.value = listing.id

    // Call API to approve
    await api.patch(`/listings/${listing.id}/approve`)

    // Remove from pending list
    pendingListings.value = pendingListings.value.filter(l => l.id !== listing.id)

    ui.pushToast(`✓ ${listing.title} approved successfully`, 'success')
  } catch (err: any) {
    console.error('Failed to approve listing:', err)
    ui.pushToast(err.response?.data?.message || 'Failed to approve listing', 'danger')
  } finally {
    approvingId.value = null
  }
}

async function rejectListing(listing: PendingListing) {
  const reason = prompt('Enter rejection reason:')
  if (!reason) return

  try {
    rejectingId.value = listing.id

    // Call API to reject
    await api.patch(`/listings/${listing.id}/reject`, { reason })

    // Remove from pending list
    pendingListings.value = pendingListings.value.filter(l => l.id !== listing.id)

    ui.pushToast(`✗ ${listing.title} rejected`, 'warning')
  } catch (err: any) {
    console.error('Failed to reject listing:', err)
    ui.pushToast(err.response?.data?.message || 'Failed to reject listing', 'danger')
  } finally {
    rejectingId.value = null
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function startPolling() {
  pollInterval.value = setInterval(() => {
    loadPendingListings()
  }, 15000) // Poll every 15 seconds
}

function stopPolling() {
  if (pollInterval.value) {
    clearInterval(pollInterval.value)
    pollInterval.value = null
  }
}

onMounted(() => {
  loadPendingListings()
  startPolling()
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header with Refresh -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Approvals</h1>
        <p class="text-sm text-gray-600 mt-1">Review and approve pending listings</p>
      </div>
      <button
        @click="loadPendingListings"
        :disabled="loading"
        class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-200 font-medium"
      >
        <i :class="loading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"></i>
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <!-- Search Bar -->
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2">
        <i class="pi pi-search text-gray-400"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search listings, category, city, owner..."
          class="bg-transparent flex-1 outline-none text-sm text-gray-900 placeholder-gray-500"
        />
      </div>
    </div>

    <!-- Pending Count Card -->
    <div
      v-if="pendingListings.length > 0"
      class="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 flex items-center gap-4"
    >
      <i class="pi pi-exclamation-circle text-yellow-600 text-2xl"></i>
      <div>
        <p class="font-semibold text-yellow-900">{{ pendingListings.length }} listing(s) awaiting approval</p>
        <p class="text-sm text-yellow-800">Review and approve or reject to process</p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!loading && pendingListings.length === 0"
      class="bg-white rounded-lg border border-gray-200 p-12 text-center"
    >
      <i class="pi pi-inbox text-4xl text-gray-300 block mb-4"></i>
      <p class="text-gray-600 font-medium">No pending approvals</p>
      <p class="text-sm text-gray-500 mt-1">All listings have been reviewed</p>
    </div>

    <!-- Listings Table -->
    <div v-if="pendingListings.length > 0" class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left py-4 px-6 font-semibold text-gray-700">Listing</th>
              <th class="text-left py-4 px-6 font-semibold text-gray-700">Category</th>
              <th class="text-left py-4 px-6 font-semibold text-gray-700">Location</th>
              <th class="text-left py-4 px-6 font-semibold text-gray-700">Submitted By</th>
              <th class="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
              <th class="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="listing in filteredListings"
              :key="listing.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="py-4 px-6">
                <p class="font-medium text-gray-900">{{ listing.title }}</p>
                <p v-if="listing.business_name" class="text-xs text-gray-500">{{ listing.business_name }}</p>
              </td>
              <td class="py-4 px-6 text-gray-600">{{ listing.category_name }}</td>
              <td class="py-4 px-6 text-gray-600">{{ listing.city_name }}</td>
              <td class="py-4 px-6 text-gray-600">{{ listing.owner_name }}</td>
              <td class="py-4 px-6 text-gray-500 text-xs">{{ formatDate(listing.created_at) }}</td>
              <td class="py-4 px-6">
                <div class="flex items-center justify-center gap-2">
                  <!-- Approve Button -->
                  <button
                    @click="approveListing(listing)"
                    :disabled="approvingId === listing.id || rejectingId === listing.id"
                    class="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Approve"
                  >
                    <i :class="approvingId === listing.id ? 'pi pi-spin pi-spinner' : 'pi pi-check'"></i>
                  </button>

                  <!-- Reject Button -->
                  <button
                    @click="rejectListing(listing)"
                    :disabled="rejectingId === listing.id || approvingId === listing.id"
                    class="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Reject"
                  >
                    <i :class="rejectingId === listing.id ? 'pi pi-spin pi-spinner' : 'pi pi-times'"></i>
                  </button>

                  <!-- View Details -->
                  <button
                    class="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    title="View Details"
                  >
                    <i class="pi pi-eye"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- No Results -->
    <div
      v-if="!loading && pendingListings.length > 0 && filteredListings.length === 0"
      class="bg-white rounded-lg border border-gray-200 p-8 text-center"
    >
      <p class="text-gray-600">No listings match your search</p>
    </div>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
}
</style>
