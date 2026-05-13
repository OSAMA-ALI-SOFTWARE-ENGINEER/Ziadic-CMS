<script setup lang="ts">
import { ref } from 'vue'
import AppModal from '@/components/AppModal.vue'
import DataTable from '@/components/DataTable.vue'
import ListingForm from '@/components/ListingForm.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import type { ListingRow } from '@/data/cms'
import { useCmsStore } from '@/stores/cms'
import { useUiStore } from '@/stores/ui'

const cms = useCmsStore()
const ui = useUiStore()
const isModalOpen = ref(false)
const editingListing = ref<ListingRow | null>(null)

const columns: Array<{ key: keyof ListingRow; label: string }> = [
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category' },
  { key: 'city', label: 'City' },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Status' },
  { key: 'updatedAt', label: 'Updated' },
]

function createListing() {
  editingListing.value = null
  isModalOpen.value = true
}

function editListing(listing: ListingRow) {
  editingListing.value = listing
  isModalOpen.value = true
}

function saveListing(listing: ListingRow, originalTitle?: string) {
  cms.upsertListing(listing, originalTitle)
  isModalOpen.value = false
  ui.pushToast('Listing saved successfully.', 'success')
}
</script>

<template>
  <section class="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
    <div class="cms-card p-5">
      <h2 class="m-0 text-base font-semibold text-[var(--admin-ink)]">Listings Management</h2>
      <p class="m-0 mt-1 text-sm text-[var(--admin-muted)]">Full CRUD, approval workflow, gallery upload, rich content, and SEO controls.</p>
      <div class="mt-5 grid gap-3">
        <button class="primary-action" type="button" @click="createListing"><i class="pi pi-plus"></i><span>Create listing</span></button>
        <RouterLink class="secondary-action no-underline" to="/approvals"><i class="pi pi-check-circle"></i><span>Review approvals</span></RouterLink>
        <RouterLink class="secondary-action no-underline" to="/categories"><i class="pi pi-tags"></i><span>Categories & tags</span></RouterLink>
      </div>
    </div>

    <div class="cms-card p-5">
      <h2 class="m-0 text-base font-semibold text-[var(--admin-ink)]">Workflow overview</h2>
      <div class="mt-5 grid gap-3 sm:grid-cols-3">
        <div class="rounded-lg bg-[var(--admin-soft)] p-4"><p class="m-0 text-sm text-[var(--admin-muted)]">Published</p><strong class="mt-2 block text-2xl">1,284</strong></div>
        <div class="rounded-lg bg-[var(--admin-soft)] p-4"><p class="m-0 text-sm text-[var(--admin-muted)]">Pending</p><strong class="mt-2 block text-2xl">42</strong></div>
        <div class="rounded-lg bg-[var(--admin-soft)] p-4"><p class="m-0 text-sm text-[var(--admin-muted)]">Rejected</p><strong class="mt-2 block text-2xl">7</strong></div>
      </div>
    </div>
  </section>

  <DataTable
    :rows="cms.listings"
    :columns="columns"
    :searchable-keys="['title', 'category', 'city', 'owner', 'status']"
    @edit="editListing"
    @delete="(listing) => { cms.deleteListing(listing.title); ui.pushToast('Listing deleted.', 'warning') }"
    @view="(listing) => ui.pushToast(`Viewing ${listing.title}`, 'info')"
  >
    <template #header>
      <div>
        <h2 class="m-0 text-base font-semibold">All listings</h2>
        <p class="m-0 mt-1 text-sm text-[var(--admin-muted)]">Search, sort, paginate, edit, and delete listings.</p>
      </div>
    </template>
    <template #cell-status="{ row }">
      <StatusBadge :label="row.status" :tone="row.tone" />
    </template>
  </DataTable>

  <AppModal :open="isModalOpen" :title="editingListing ? 'Edit listing' : 'Create listing'" @close="isModalOpen = false">
    <ListingForm :listing="editingListing" @save="saveListing" @cancel="isModalOpen = false" />
  </AppModal>
</template>
