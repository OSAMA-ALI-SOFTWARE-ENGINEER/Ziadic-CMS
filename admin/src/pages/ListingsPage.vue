<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Modal from '@/components/common/Modal.vue'
import Button from '@/components/common/Button.vue'
import DeleteConfirmModal from '@/components/DeleteConfirmModal.vue'
import DataTable from '@/components/DataTable.vue'
import ListingForm from '@/components/ListingFormExpanded.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import type { ListingRow } from '@/data/cms'
import { useUiStore } from '@/stores/ui'
import { listingsApi } from '@/services/api/listings.api'
import { useFetch } from '@/composables/useFetch'

const ui = useUiStore()
const isModalOpen = ref(false)
const editingListing = ref<any | null>(null)
const listings = ref<ListingRow[]>([])
const fullListings = ref<Map<number, any>>(new Map())
const selectedStatus = ref<string>('')
const pollInterval = ref<ReturnType<typeof setInterval> | null>(null)

// Delete modal state
const deleteModalOpen = ref(false)
const listingToDelete = ref<any | null>(null)

// Use fetch composable for loading listings
const { loading, execute: loadListingsRequest } = useFetch(
  async () => {
    const filters = selectedStatus.value ? { status: selectedStatus.value } : {}
    return await listingsApi.getListings(filters)
  },
  { showErrorToast: false }
)

// Delete operation
const { loading: isDeleting, execute: deleteListingRequest } = useFetch(
  async () => {
    if (!listingToDelete.value) throw new Error('No listing selected')
    return await listingsApi.deleteListing(listingToDelete.value.id)
  },
  { showErrorToast: false }
)

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

async function loadListings() {
  try {
    const response = await loadListingsRequest()
    const allListings = response.data || []

    fullListings.value.clear()

    listings.value = allListings.map((listing: any) => {
      if (listing.id) {
        fullListings.value.set(listing.id, listing)
      }

      return {
        id: listing.id,
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
    ui.pushToast('Failed to load listings', 'danger')
  }
}

function createListing() {
  editingListing.value = null
  isModalOpen.value = true
}

function editListing(listingRow: any) {
  try {
    const fullListing = listingRow.id ? fullListings.value.get(listingRow.id) : null

    if (!fullListing) {
      ui.pushToast('Failed to load listing', 'danger')
      return
    }

    editingListing.value = fullListing
    isModalOpen.value = true
  } catch (err) {
    ui.pushToast('Failed to open listing editor', 'danger')
  }
}

function saveListing(listing: any, originalTitle?: string) {
  isModalOpen.value = false
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
    const listingId = (listingToDelete.value as any).id
    const listingTitle = listingToDelete.value.title

    await deleteListingRequest()

    fullListings.value.delete(listingId)
    listings.value = listings.value.filter((l: any) => l.id !== listingId)

    ui.pushToast(`"${listingTitle}" deleted successfully`, 'success')

    deleteModalOpen.value = false
    listingToDelete.value = null

    await loadListings()
  } catch (err: any) {
    ui.pushToast(err.message || 'Failed to delete listing', 'danger')
  }
}

function cancelDelete() {
  deleteModalOpen.value = false
  listingToDelete.value = null
}

function startPolling() {
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
      <Button
        @click="loadListings"
        :disabled="loading"
        :is-loading="loading"
        variant="primary"
        size="md"
      >
        <i :class="['pi', loading ? 'pi-spin pi-spinner' : 'pi-refresh']"></i>
        <span>{{ loading ? 'Loading...' : 'Refresh' }}</span>
      </Button>
    </div>

    <!-- Stats Cards -->
    <section v-if="loading && listings.length === 0" class="grid gap-4 md:grid-cols-3">
      <SkeletonCard type="metric" :count="3" />
    </section>

    <section v-else class="grid gap-4 md:grid-cols-3">
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
      <Button variant="primary" size="md" @click="createListing">
        <i class="pi pi-plus"></i>
        <span>Create listing</span>
      </Button>
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
    <div v-if="loading && listings.length === 0" class="cms-card p-6">
      <div class="mb-6">
        <h2 class="m-0 text-lg font-semibold">All listings</h2>
      </div>
      <SkeletonCard type="table-row" :count="10" />
    </div>

    <div v-else-if="!loading && listings.length === 0" class="cms-card p-6">
      <div class="mb-6">
        <h2 class="m-0 text-lg font-semibold">All listings</h2>
      </div>
      <div class="text-center py-8">
        <i class="pi pi-inbox text-4xl opacity-30 block mb-3"></i>
        <p class="text-(--admin-muted)">No listings found</p>
      </div>
    </div>

    <DataTable
      v-else
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
    </DataTable>

    <!-- Create/Edit Modal -->
    <Modal :is-open="isModalOpen" :title="editingListing ? 'Edit listing' : 'Create listing'" @close="isModalOpen = false">
      <ListingForm :listing="editingListing" @save="saveListing" @cancel="isModalOpen = false" />
    </Modal>

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
  max-width: 100%;
}

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
  white-space: nowrap;
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

/* Responsive Design */
@media (max-width: 1024px) {
  .listings-page {
    padding: 1.5rem;
  }

  .secondary-action {
    padding: 0.625rem 1.25rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 768px) {
  .listings-page {
    padding: 1rem;
  }

  :deep(.flex.items-center.justify-between) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  :deep(h1.text-2xl) {
    font-size: 1.5rem;
  }

  :deep(p.text-sm.text---admin-muted) {
    font-size: 0.875rem;
  }

  /* Stats cards responsive */
  :deep(.grid.gap-4.md\:grid-cols-3) {
    grid-template-columns: repeat(2, 1fr);
  }

  .secondary-action {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    gap: 0.375rem;
  }

  .secondary-action i {
    font-size: 0.95rem;
  }

  :deep(.space-y-6 > section:nth-child(4) .flex.gap-2) {
    gap: 0.5rem;
  }

  :deep(.space-y-6 > section:nth-child(4) button) {
    padding: 0.5rem 0.875rem;
    font-size: 0.825rem;
  }
}

@media (max-width: 640px) {
  .listings-page {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }

  :deep(.flex.items-center.justify-between) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  :deep(h1.text-2xl) {
    font-size: 1.25rem;
  }

  :deep(p.text-sm.text---admin-muted) {
    font-size: 0.8rem;
  }

  /* Stats cards full width on mobile */
  :deep(.grid.gap-4.md\:grid-cols-3) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  :deep(.cms-card.p-6.border-l-4) {
    padding: 1rem !important;
  }

  :deep(.cms-card.p-6.border-l-4 .text-3xl) {
    font-size: 1.875rem;
  }

  :deep(.cms-card.p-6.border-l-4 .text-4xl) {
    font-size: 2rem;
  }

  :deep(.flex.gap-3.flex-wrap) {
    flex-direction: column;
    gap: 0.5rem;
  }

  .secondary-action {
    width: 100%;
    justify-content: center;
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }

  .secondary-action i {
    font-size: 0.9rem;
  }

  :deep(.space-y-6 > section:nth-child(4)) {
    padding: 1rem !important;
  }

  :deep(.space-y-6 > section:nth-child(4) .flex.gap-2) {
    gap: 0.375rem;
    grid-template-columns: 1fr;
  }

  :deep(.space-y-6 > section:nth-child(4) button) {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    flex: 1;
    min-width: 0;
  }
}
</style>
