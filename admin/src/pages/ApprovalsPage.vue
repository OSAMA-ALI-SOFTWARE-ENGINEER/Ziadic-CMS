<script setup lang="ts">
import DataTable from '@/components/DataTable.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import type { ListingRow } from '@/data/cms'
import { useCmsStore } from '@/stores/cms'
import { useUiStore } from '@/stores/ui'

const cms = useCmsStore()
const ui = useUiStore()

const columns: Array<{ key: keyof ListingRow; label: string }> = [
  { key: 'title', label: 'Listing' },
  { key: 'category', label: 'Category' },
  { key: 'owner', label: 'Submitted By' },
  { key: 'status', label: 'Status' },
]
</script>

<template>
  <DataTable
    :rows="cms.listings"
    :columns="columns"
    :searchable-keys="['title', 'category', 'owner', 'status']"
    @edit="(listing) => { cms.updateListingStatus(listing.title, 'Approved', 'success'); ui.pushToast('Listing approved.', 'success') }"
    @delete="(listing) => { cms.updateListingStatus(listing.title, 'Rejected', 'danger'); ui.pushToast('Listing rejected.', 'warning') }"
    @view="(listing) => ui.pushToast(`Reviewing ${listing.title}`, 'info')"
  >
    <template #header>
      <div>
        <h2 class="m-0 text-base font-semibold">Approvals</h2>
        <p class="m-0 mt-1 text-sm text-[var(--admin-muted)]">Approve or reject submitted listings.</p>
      </div>
    </template>
    <template #cell-status="{ row }">
      <StatusBadge :label="row.status" :tone="row.tone" />
    </template>
  </DataTable>
</template>
