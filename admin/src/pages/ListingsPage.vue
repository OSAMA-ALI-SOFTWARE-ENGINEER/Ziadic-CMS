<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import AppModal from '@/components/AppModal.vue'
import DeleteConfirmModal from '@/components/DeleteConfirmModal.vue'
import DataTable from '@/components/DataTable.vue'
import ListingForm from '@/components/ListingFormExpanded.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import type { ListingRow } from '@/data/cms'
import { useCmsStore } from '@/stores/cms'
import { useUiStore } from '@/stores/ui'
import { api } from '@/services/api'

const cms = useCmsStore()
const ui = useUiStore()
const isModalOpen = ref(false)
const editingListing = ref<any | null>(null)
const listings = ref<ListingRow[]>([])
const fullListings = ref<Map<number, any>>(new Map()) // Store full listing objects
const loading = ref(false)
const selectedStatus = ref<string>('')
const pollInterval = ref<NodeJS.Timeout | null>(null)

// Delete modal state
const deleteModalOpen = ref(false)
const listingToDelete = ref<any | null>(null)
const isDeleting = ref(false)

const columns: Array<{ key: keyof ListingRow; label: string }> = [
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category' },
  { key: 'city', label: 'City' },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Status' },
  { key: 'updatedAt', label: 'Updated' },
]

// Compute workflow stats dynamically
const workflowStats = computed(() => {
  const published = listings.value.filter(l => l.status === 'Published').length
  const pending = listings.value.filter(l => l.status === 'Pending Review').length
  const rejected = listings.value.filter(l => l.status === 'Rejected').length
  return { published, pending, rejected }
})

// Filter listings by status
const filteredListings = computed(() => {
  if (!selectedStatus.value) return listings.value
  return listings.value.filter(l => l.status === selectedStatus.value)
})

async function loadListings() {
  try {
    loading.value = true
    const params = selectedStatus.value ? { status: selectedStatus.value } : {}
    const response = await api.get('/listings', { params })
    const data = response.data.data || response.data

    const allListings = Array.isArray(data) ? data : data.data || []

    // Clear previous data
    fullListings.value.clear()

    // Transform API response to ListingRow format and store full objects
    listings.value = allListings.map((listing: any) => {
      // Store full listing object by ID
      if (listing.id) {
        fullListings.value.set(listing.id, listing)
        console.log(`Cached listing ${listing.id}: ${listing.title} - mediaFiles:`, listing.mediaFiles?.length || 0)
      }

      return {
        id: listing.id, // Keep ID for reference
        title: listing.title || listing.business_name || '',
        category: listing.categories?.[0]?.name || 'Uncategorized',
        city: listing.city?.name || listing.address || 'N/A',
        owner: listing.owner?.name || 'Unknown',
        status: formatStatus(listing.status),
        tone: getStatusTone(listing.status),
        updatedAt: formatDate(listing.updated_at),
      }
    })
  } catch (err) {
    console.error('Failed to load listings:', err)
    ui.pushToast('Failed to load listings', 'danger')
  } finally {
    loading.value = false
  }
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'draft': 'Draft',
    'pending': 'Pending Review',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'published': 'Published',
  }
  return statusMap[status] || status
}

function getStatusTone(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const toneMap: Record<string, any> = {
    'draft': 'neutral',
    'pending': 'warning',
    'approved': 'info',
    'rejected': 'danger',
    'published': 'success',
  }
  return toneMap[status] || 'neutral'
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function createListing() {
  editingListing.value = null
  isModalOpen.value = true
}

function editListing(listingRow: any) {
  try {
    // Get the full listing object from the map
    const fullListing = listingRow.id ? fullListings.value.get(listingRow.id) : null

    if (!fullListing) {
      console.error('Listing not found in cache')
      ui.pushToast('Failed to load listing', 'danger')
      return
    }

    editingListing.value = fullListing
    isModalOpen.value = true
  } catch (err) {
    console.error('Failed to open listing editor:', err)
    ui.pushToast('Failed to open listing editor', 'danger')
  }
}

function saveListing(listing: any, originalTitle?: string) {
  isModalOpen.value = false
  ui.pushToast('✓ Listing saved successfully', 'success')
  loadListings()
}

function showDeleteModal(listingRow: any) {
  if (!listingRow.id) {
    ui.pushToast('Unable to delete listing', 'danger')
    return
  }
  listingToDelete.value = listingRow
  deleteModalOpen.value = true
}

async function confirmDelete() {
  if (!listingToDelete.value) return

  try {
    isDeleting.value = true
    const listingId = listingToDelete.value.id
    const listingTitle = listingToDelete.value.title

    // Make API DELETE call
    await api.delete(`/listings/${listingId}`)

    // Remove from cache
    fullListings.value.delete(listingId)

    // Remove from local listings array
    listings.value = listings.value.filter(l => l.id !== listingId)

    ui.pushToast(`✓ "${listingTitle}" deleted successfully`, 'success')

    // Close modal
    deleteModalOpen.value = false
    listingToDelete.value = null

    // Refresh to sync with backend
    await loadListings()
  } catch (err: any) {
    console.error('Failed to delete listing:', err)
    ui.pushToast(err.response?.data?.message || 'Failed to delete listing', 'danger')
  } finally {
    isDeleting.value = false
  }
}

function cancelDelete() {
  deleteModalOpen.value = false
  listingToDelete.value = null
}

function refreshListings() {
  loadListings()
}

function startPolling() {
  // Poll for updates every 15 seconds
  pollInterval.value = setInterval(() => {
    loadListings()
  }, 15000)
}

function stopPolling() {
  if (pollInterval.value) {
    clearInterval(pollInterval.value)
    pollInterval.value = null
  }
}

onMounted(() => {
  loadListings()
  startPolling()
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>

<template>
  <div class="listings-page space-y-6">
    <!-- Header with refresh button -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-(--admin-ink)">Listings Management</h1>
        <p class="text-sm text-(--admin-muted) mt-1">Manage and approve business listings</p>
      </div>
      <button
        @click="refreshListings"
        :disabled="loading"
        class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-200"
      >
        <i :class="['pi', loading ? 'pi-spin pi-spinner' : 'pi-refresh']"></i>
        <span>{{ loading ? 'Loading...' : 'Refresh' }}</span>
      </button>
    </div>

    <!-- Stats Cards -->
    <section class="grid gap-4 md:grid-cols-3">
      <div class="cms-card p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-(--admin-muted) font-medium">Published</p>
            <p class="text-3xl font-bold text-green-600 mt-2">{{ workflowStats.published }}</p>
          </div>
          <i class="pi pi-check-circle text-green-500 text-4xl opacity-20"></i>
        </div>
      </div>

      <div class="cms-card p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-(--admin-muted) font-medium">Pending Review</p>
            <p class="text-3xl font-bold text-yellow-600 mt-2">{{ workflowStats.pending }}</p>
          </div>
          <i class="pi pi-clock text-yellow-500 text-4xl opacity-20"></i>
        </div>
      </div>

      <div class="cms-card p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-(--admin-muted) font-medium">Rejected</p>
            <p class="text-3xl font-bold text-red-600 mt-2">{{ workflowStats.rejected }}</p>
          </div>
          <i class="pi pi-times-circle text-red-500 text-4xl opacity-20"></i>
        </div>
      </div>
    </section>

    <!-- Action Buttons -->
    <section class="flex gap-3 flex-wrap">
      <button class="primary-action" type="button" @click="createListing">
        <i class="pi pi-plus"></i>
        <span>Create listing</span>
      </button>
      <RouterLink class="secondary-action no-underline" to="/approvals">
        <i class="pi pi-check-circle"></i>
        <span>Review approvals</span>
      </RouterLink>
      <RouterLink class="secondary-action no-underline" to="/categories">
        <i class="pi pi-tags"></i>
        <span>Categories & tags</span>
      </RouterLink>
    </section>

    <!-- Status Filter -->
    <section class="cms-card p-4">
      <label class="text-sm font-medium text-(--admin-ink) block mb-3">Filter by Status</label>
      <div class="flex gap-2 flex-wrap">
        <button
          @click="selectedStatus = ''"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            !selectedStatus
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          All
        </button>
        <button
          v-for="status in ['Draft', 'Pending Review', 'Approved', 'Published', 'Rejected']"
          :key="status"
          @click="selectedStatus = status"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            selectedStatus === status
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ status }}
        </button>
      </div>
    </section>

    <!-- Listings Table -->
    <DataTable
      :rows="filteredListings"
      :columns="columns"
      :searchable-keys="['title', 'category', 'city', 'owner', 'status']"
      @edit="editListing"
      @delete="showDeleteModal"
      @view="(listing) => ui.pushToast(`Viewing ${listing.title}`, 'info')"
    >
      <template #header>
        <div>
          <h2 class="m-0 text-lg font-semibold">All listings</h2>
          <p class="m-0 mt-1 text-sm text-(--admin-muted)">
            Showing {{ filteredListings.length }} of {{ listings.length }} listings
          </p>
        </div>
      </template>
      <template #cell-status="{ row }">
        <StatusBadge :label="row.status" :tone="row.tone" />
      </template>
      <template v-if="loading" #loading>
        <div class="flex justify-center items-center py-8">
          <i class="pi pi-spin pi-spinner text-2xl"></i>
        </div>
      </template>
      <template v-if="!loading && listings.length === 0" #empty>
        <div class="text-center py-8">
          <i class="pi pi-inbox text-4xl opacity-30 block mb-3"></i>
          <p class="text-(--admin-muted)">No listings found</p>
        </div>
      </template>
    </DataTable>

    <!-- Create/Edit Modal -->
    <AppModal :open="isModalOpen" :title="editingListing ? 'Edit listing' : 'Create listing'" @close="isModalOpen = false">
      <ListingForm :listing="editingListing" @save="saveListing" @cancel="isModalOpen = false" />
    </AppModal>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      :is-open="deleteModalOpen"
      :item-name="listingToDelete?.title || ''"
      title="Delete Listing"
      message="Are you sure you want to delete"
      :is-loading="isDeleting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.listings-page {
  padding: 2rem;
}

.primary-action,
.secondary-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.primary-action {
  background: #3b82f6;
  color: white;
}

.primary-action:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.secondary-action {
  background: var(--admin-soft);
  color: var(--admin-ink);
  text-decoration: none;
}

.secondary-action:hover {
  background: var(--admin-border);
  transform: translateY(-2px);
}

.cms-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.cms-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
