<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { Card } from 'primevue/card'
import { DataTable } from 'primevue/datatable'
import { Column } from 'primevue/column'
import { Button } from 'primevue/button'
import { InputGroup } from 'primevue/inputgroup'
import { InputGroupAddon } from 'primevue/inputgroupaddon'
import { InputText } from 'primevue/inputtext'
import { Dropdown } from 'primevue/dropdown'
import { ConfirmDialog } from 'primevue/confirmdialog'
import { Toast } from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const adminStore = useAdminStore()
const toast = useToast()
const confirm = useConfirm()

const statusFilter = ref('')
const searchQuery = ref('')

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Published', value: 'published' },
  { label: 'Rejected', value: 'rejected' },
]

const filteredListings = computed(() => {
  return adminStore.listings.filter(listing => {
    const matchesStatus = !statusFilter.value || listing.status === statusFilter.value
    const matchesSearch = !searchQuery.value ||
      listing.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      listing.business_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesStatus && matchesSearch
  })
})

onMounted(() => {
  adminStore.loadListings()
})

function confirmApprove(listing: any) {
  confirm.require({
    message: `Approve "${listing.title}"?`,
    header: 'Confirm Approval',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await adminStore.approve(listing.id)
        toast.add({ severity: 'success', summary: 'Success', detail: 'Listing approved' })
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to approve listing' })
      }
    },
  })
}

function confirmReject(listing: any) {
  confirm.require({
    message: `Reject "${listing.title}"? This action cannot be undone.`,
    header: 'Confirm Rejection',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await adminStore.reject(listing.id)
        toast.add({ severity: 'success', summary: 'Success', detail: 'Listing rejected' })
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to reject listing' })
      }
    },
  })
}

function confirmPublish(listing: any) {
  confirm.require({
    message: `Publish "${listing.title}"?`,
    header: 'Confirm Publishing',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await adminStore.publish(listing.id)
        toast.add({ severity: 'success', summary: 'Success', detail: 'Listing published' })
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to publish listing' })
      }
    },
  })
}

function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'badge-warning',
    approved: 'badge-info',
    published: 'badge-success',
    draft: 'badge-secondary',
    rejected: 'badge-danger',
  }
  return statusMap[status] || 'badge-secondary'
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getActionButtons(listing: any): any[] {
  const buttons = []

  if (listing.status === 'pending') {
    buttons.push({
      label: 'Approve',
      icon: 'pi pi-check',
      onClick: () => confirmApprove(listing),
      severity: 'success',
    })
    buttons.push({
      label: 'Reject',
      icon: 'pi pi-times',
      onClick: () => confirmReject(listing),
      severity: 'danger',
    })
  }

  if (listing.status === 'approved') {
    buttons.push({
      label: 'Publish',
      icon: 'pi pi-send',
      onClick: () => confirmPublish(listing),
      severity: 'info',
    })
  }

  return buttons
}
</script>

<template>
  <div class="listings-manager">
    <h1 class="page-title">Listings Management</h1>

    <Toast />
    <ConfirmDialog />

    <!-- Filters -->
    <Card class="filters-card">
      <template #content>
        <div class="filters-grid">
          <div class="filter-group">
            <label>Status</label>
            <Dropdown
              v-model="statusFilter"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Filter by status"
              class="w-full"
            />
          </div>

          <div class="filter-group">
            <label>Search</label>
            <InputGroup>
              <InputGroupAddon>
                <i class="pi pi-search" />
              </InputGroupAddon>
              <InputText v-model="searchQuery" placeholder="Search by title or business name" />
            </InputGroup>
          </div>

          <div class="filter-group">
            <label>&nbsp;</label>
            <Button
              label="Refresh"
              icon="pi pi-refresh"
              @click="adminStore.loadListings()"
              severity="secondary"
              class="w-full"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Listings Table -->
    <Card class="listings-card">
      <template #content>
        <DataTable
          :value="filteredListings"
          :loading="adminStore.listingsLoading"
          striped-rows
          responsive-layout="scroll"
          class="p-datatable-striped"
        >
          <Column field="title" header="Title" style="width: 30%">
            <template #body="{ data }">
              <div class="listing-cell">
                <h4 class="listing-title">{{ data.title }}</h4>
                <p v-if="data.business_name" class="listing-business">{{ data.business_name }}</p>
              </div>
            </template>
          </Column>

          <Column field="status" header="Status" style="width: 15%">
            <template #body="{ data }">
              <span :class="['badge', getStatusBadgeClass(data.status)]">
                {{ data.status }}
              </span>
            </template>
          </Column>

          <Column field="city.name" header="City" style="width: 15%">
            <template #body="{ data }">
              {{ data.city?.name || '—' }}
            </template>
          </Column>

          <Column field="category.name" header="Category" style="width: 15%">
            <template #body="{ data }">
              {{ data.category?.name || '—' }}
            </template>
          </Column>

          <Column field="created_at" header="Created" style="width: 12%">
            <template #body="{ data }">
              {{ formatDate(data.created_at) }}
            </template>
          </Column>

          <Column header="Actions" style="width: 13%">
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  v-if="data.status === 'pending'"
                  icon="pi pi-check"
                  rounded
                  text
                  class="action-btn"
                  @click="confirmApprove(data)"
                  v-tooltip="'Approve'"
                />
                <Button
                  v-if="data.status === 'pending'"
                  icon="pi pi-times"
                  rounded
                  text
                  class="action-btn"
                  @click="confirmReject(data)"
                  v-tooltip="'Reject'"
                />
                <Button
                  v-if="data.status === 'approved'"
                  icon="pi pi-send"
                  rounded
                  text
                  class="action-btn"
                  @click="confirmPublish(data)"
                  v-tooltip="'Publish'"
                />
                <Button
                  icon="pi pi-eye"
                  rounded
                  text
                  class="action-btn"
                  @click="() => {}"
                  v-tooltip="'View'"
                />
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="empty-state">
              <p>No listings found</p>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.listings-manager {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2rem;
}

.filters-card {
  margin-bottom: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: none;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
}

.listings-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: none;
}

:deep(.p-datatable) {
  font-size: 0.95rem;
}

:deep(.p-datatable-thead) {
  background-color: #f8f9fa;
}

:deep(.p-datatable-thead > tr > th) {
  padding: 1rem;
  font-weight: 600;
  color: #666;
  border-bottom: 2px solid #e0e0e0;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: #f8f9fa;
}

.listing-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.listing-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.listing-business {
  margin: 0;
  font-size: 0.875rem;
  color: #999;
}

.badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-success {
  background-color: #d4edda;
  color: #155724;
}

.badge-warning {
  background-color: #fff3cd;
  color: #856404;
}

.badge-danger {
  background-color: #f8d7da;
  color: #721c24;
}

.badge-info {
  background-color: #d1ecf1;
  color: #0c5460;
}

.badge-secondary {
  background-color: #e2e3e5;
  color: #383d41;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  color: #666;
  transition: color 0.2s;
}

.action-btn:hover {
  color: #c41e3a;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #999;
}

.w-full {
  width: 100%;
}

:deep(.p-inputtext) {
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
}

:deep(.p-dropdown) {
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  :deep(.p-datatable) {
    font-size: 0.85rem;
  }

  .listing-title {
    font-size: 0.95rem;
  }

  .listing-business {
    font-size: 0.8rem;
  }
}
</style>
