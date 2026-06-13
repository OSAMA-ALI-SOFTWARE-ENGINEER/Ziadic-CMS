<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import { api } from '@/services/api'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const toast = useToast()
const confirm = useConfirm()

const submissions = ref<any[]>([])
const cities = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(false)
const statusFilter = ref('')
const searchQuery = ref('')
const selectedSubmission = ref<any>(null)
const selectedSubmissions = ref<any[]>([])
const editingSubmission = ref<any>(null)
const showDetails = ref(false)
const isEditMode = ref(false)
const showRejectModal = ref(false)
const rejectionReason = ref('')
const isSaving = ref(false)

const statusOptions = [
  { label: 'All Status', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

const filteredSubmissions = computed(() => {
  return submissions.value.filter(submission => {
    const matchesStatus = !statusFilter.value || submission.status === statusFilter.value
    const matchesSearch = !searchQuery.value ||
      submission.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (submission.contact_email || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesStatus && matchesSearch
  })
})

async function loadSubmissions() {
  try {
    loading.value = true
    const params = new URLSearchParams()
    if (statusFilter.value) params.append('status', statusFilter.value)
    if (searchQuery.value) params.append('search', searchQuery.value)
    const url = `/submissions${params.toString() ? '?' + params.toString() : ''}`
    const response = await api.get(url)
    submissions.value = response.data.data || response.data || []
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || 'Failed to load submissions'
    toast.add({ severity: 'error', summary: 'Error', detail: errorMsg })
  } finally {
    loading.value = false
  }
}

async function loadCitiesAndCategories() {
  try {
    const [citiesRes, categoriesRes] = await Promise.all([
      api.get('/cities'),
      api.get('/categories')
    ])
    cities.value = citiesRes.data?.data || []
    categories.value = categoriesRes.data?.data || []
  } catch (error) {
    console.warn('Could not load cities/categories', error)
  }
}

function notifyPendingUpdated() {
  window.dispatchEvent(new CustomEvent('pending-count-updated'))
}

async function viewDetails(submission: any) {
  try {
    const response = await api.get(`/submissions/${submission.id}`)
    selectedSubmission.value = response.data
    showDetails.value = true
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load submission details' })
  }
}

function confirmApprove(submission: any) {
  confirm.require({
    message: `Approve "${submission.title}"?`,
    header: 'Confirm Approval',
    icon: 'pi pi-check',
    accept: async () => {
      try {
        await api.patch(`/submissions/${submission.id}/approve`)
        toast.add({ severity: 'success', summary: 'Success', detail: 'Submission approved' })
        showDetails.value = false
        await loadSubmissions()
        notifyPendingUpdated()
      } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to approve' })
      }
    },
  })
}

function confirmReject(submission: any) {
  rejectionReason.value = ''
  selectedSubmission.value = submission
  showRejectModal.value = true
}

async function submitRejection() {
  if (!rejectionReason.value.trim()) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please provide a rejection reason' })
    return
  }
  try {
    await api.patch(`/submissions/${selectedSubmission.value.id}/reject`, { reason: rejectionReason.value })
    toast.add({ severity: 'success', summary: 'Success', detail: 'Submission rejected' })
    showRejectModal.value = false
    showDetails.value = false
    await loadSubmissions()
    notifyPendingUpdated()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to reject' })
  }
}

function confirmDelete(submission: any) {
  confirm.require({
    message: `Delete "${submission.title}"?`,
    header: 'Confirm Deletion',
    icon: 'pi pi-trash',
    accept: async () => {
      try {
        await api.delete(`/submissions/${submission.id}`)
        toast.add({ severity: 'success', summary: 'Success', detail: 'Submission deleted' })
        await loadSubmissions()
        notifyPendingUpdated()
      } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' })
      }
    },
  })
}

function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'badge-warning',
    approved: 'badge-info',
    rejected: 'badge-danger',
  }
  return statusMap[status] || 'badge-secondary'
}

function enableEditMode() {
  isEditMode.value = true
  editingSubmission.value = JSON.parse(JSON.stringify(selectedSubmission.value))
  loadCitiesAndCategories()
}

function cancelEdit() {
  isEditMode.value = false
  editingSubmission.value = null
}

async function saveSubmission() {
  if (!editingSubmission.value || !selectedSubmission.value) return
  try {
    isSaving.value = true
    await api.put(`/submissions/${selectedSubmission.value.id}`, {
      title: editingSubmission.value.title,
      business_name: editingSubmission.value.business_name,
      description: editingSubmission.value.description,
      category_id: editingSubmission.value.category_id,
      city_id: editingSubmission.value.city_id,
      contact_name: editingSubmission.value.contact_name,
      contact_email: editingSubmission.value.contact_email,
      contact_phone: editingSubmission.value.contact_phone,
      website: editingSubmission.value.website,
    })
    toast.add({ severity: 'success', summary: 'Success', detail: 'Submission updated' })
    Object.assign(selectedSubmission.value, editingSubmission.value)
    isEditMode.value = false
    editingSubmission.value = null
    await loadSubmissions()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update submission' })
  } finally {
    isSaving.value = false
  }
}

async function confirmPublish(submission: any) {
  confirm.require({
    message: `Publish "${submission.title}" to live listings?`,
    header: 'Publish to Listings',
    icon: 'pi pi-globe',
    accept: async () => {
      try {
        const response = await api.patch(`/submissions/${submission.id}/publish`)
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: response.data?.message || '🎉 Listing published successfully!',
          life: 3000,
        })
        showDetails.value = false
        selectedSubmissions.value = []
        await loadSubmissions()
        notifyPendingUpdated()
      } catch (error: any) {
        const errorMsg = error?.response?.data?.message || error?.message || 'Failed to publish submission'
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMsg,
          life: 4000,
        })
        console.error('Publish error:', error)
      }
    },
  })
}

// Bulk Actions
async function bulkApprove() {
  if (selectedSubmissions.value.length === 0) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Select submissions to approve' })
    return
  }
  confirm.require({
    message: `Approve ${selectedSubmissions.value.length} submission(s)?`,
    header: 'Bulk Approve',
    icon: 'pi pi-check',
    accept: async () => {
      try {
        await Promise.all(
          selectedSubmissions.value.map(s =>
            api.patch(`/submissions/${s.id}/approve`)
          )
        )
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: `Approved ${selectedSubmissions.value.length} submission(s)`,
        })
        selectedSubmissions.value = []
        await loadSubmissions()
        notifyPendingUpdated()
      } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to approve submissions' })
      }
    },
  })
}

async function bulkReject() {
  if (selectedSubmissions.value.length === 0) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Select submissions to reject' })
    return
  }
  const reason = prompt('Enter rejection reason:')
  if (!reason) return
  confirm.require({
    message: `Reject ${selectedSubmissions.value.length} submission(s)?`,
    header: 'Bulk Reject',
    icon: 'pi pi-times',
    accept: async () => {
      try {
        await Promise.all(
          selectedSubmissions.value.map(s =>
            api.patch(`/submissions/${s.id}/reject`, { reason })
          )
        )
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: `Rejected ${selectedSubmissions.value.length} submission(s)`,
        })
        selectedSubmissions.value = []
        await loadSubmissions()
        notifyPendingUpdated()
      } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to reject submissions' })
      }
    },
  })
}

async function bulkPublish() {
  if (selectedSubmissions.value.length === 0) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Select submissions to publish' })
    return
  }
  const approvedCount = selectedSubmissions.value.filter(s => s.status === 'approved').length
  if (approvedCount === 0) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Only approved submissions can be published' })
    return
  }
  confirm.require({
    message: `Publish ${approvedCount} submission(s) to live listings?`,
    header: 'Bulk Publish',
    icon: 'pi pi-globe',
    accept: async () => {
      try {
        const results = await Promise.allSettled(
          selectedSubmissions.value
            .filter(s => s.status === 'approved')
            .map(s => api.patch(`/admin/submissions/${s.id}/publish`))
        )

        const successful = results.filter(r => r.status === 'fulfilled').length
        const failed = results.filter(r => r.status === 'rejected').length

        if (successful > 0) {
          toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Published ${successful} listing(s)${failed > 0 ? ` (${failed} failed)` : ''}`,
            life: 3000,
          })
        }

        if (failed > 0) {
          toast.add({
            severity: 'warn',
            summary: 'Partial Failure',
            detail: `Failed to publish ${failed} submission(s)`,
            life: 4000,
          })
        }

        selectedSubmissions.value = []
        await loadSubmissions()
        notifyPendingUpdated()
      } catch (error: any) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to publish submissions',
          life: 4000,
        })
      }
    },
  })
}

async function bulkDelete() {
  if (selectedSubmissions.value.length === 0) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Select submissions to delete' })
    return
  }
  confirm.require({
    message: `Delete ${selectedSubmissions.value.length} submission(s)?`,
    header: 'Bulk Delete',
    icon: 'pi pi-trash',
    accept: async () => {
      try {
        await Promise.all(
          selectedSubmissions.value.map(s =>
            api.delete(`/submissions/${s.id}`)
          )
        )
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: `Deleted ${selectedSubmissions.value.length} submission(s)`,
        })
        selectedSubmissions.value = []
        await loadSubmissions()
        notifyPendingUpdated()
      } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete submissions' })
      }
    },
  })
}

onMounted(async () => {
  await loadSubmissions()
  await loadCitiesAndCategories()
})
</script>

<template>
  <div class="submissions-page">
    <Toast />
    <ConfirmDialog />

    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Submissions</h1>
      <p class="text-gray-500">Manage and publish user listing submissions</p>
    </div>

    <!-- Search & Filter Section -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="flex-1 min-w-0">
        <div class="relative">
          <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by title or email..."
            class="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
            @input="loadSubmissions"
          />
        </div>
      </div>
      <div class="w-full sm:w-48 shrink-0">
        <select
          v-model="statusFilter"
          class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm bg-white"
          @change="loadSubmissions"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>

    <!-- Bulk Actions Toolbar -->
    <div
      v-if="selectedSubmissions.length > 0"
      class="mb-6 p-4 rounded-lg bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between gap-4"
    >
      <div class="flex items-center gap-3">
        <span class="text-sm font-semibold text-blue-900">
          {{ selectedSubmissions.length }} {{ selectedSubmissions.length === 1 ? 'item' : 'items' }} selected
        </span>
      </div>
      <div class="flex gap-2 flex-wrap">
        <Button
          label="Approve"
          icon="pi pi-check"
          class="p-button-success p-button-sm"
          @click="bulkApprove"
        />
        <Button
          label="Reject"
          icon="pi pi-times"
          class="p-button-danger p-button-sm"
          @click="bulkReject"
        />
        <Button
          label="Publish"
          icon="pi pi-globe"
          class="p-button-info p-button-sm"
          @click="bulkPublish"
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          class="p-button-danger p-button-text p-button-sm"
          @click="bulkDelete"
        />
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-x-auto">
      <DataTable
        :value="filteredSubmissions"
        v-model:selection="selectedSubmissions"
        :loading="loading"
        striped-rows
        hover
        :rows="15"
        paginator
        class="submissions-table w-full"
        responsive-layout="scroll"
      >
        <Column
          type="checkbox"
          header-style="width: 3rem; min-width: 3rem;"
          body-style="width: 3rem; min-width: 3rem; text-align: center;"
        ></Column>

        <Column field="title" header="Title" sortable header-style="min-width: 200px;" body-style="min-width: 200px;">
          <template #body="{ data }">
            <div class="font-medium text-gray-900 text-sm">{{ data.title }}</div>
          </template>
        </Column>

        <Column field="business_name" header="Business" header-style="min-width: 140px;" body-style="min-width: 140px;">
          <template #body="{ data }">
            <div class="text-gray-600 text-sm">{{ data.business_name || '-' }}</div>
          </template>
        </Column>

        <Column field="contact_email" header="Contact" sortable header-style="min-width: 180px;" body-style="min-width: 180px;">
          <template #body="{ data }">
            <div class="text-gray-600 text-sm truncate">{{ data.contact_email }}</div>
          </template>
        </Column>

        <Column field="city" header="City" header-style="min-width: 120px;" body-style="min-width: 120px;">
          <template #body="{ data }">
            <div class="text-gray-600 text-sm">{{ data.city || '-' }}</div>
          </template>
        </Column>

        <Column field="status" header="Status" header-style="min-width: 110px;" body-style="min-width: 110px;">
          <template #body="{ data }">
            <span :class="['badge', getStatusBadgeClass(data.status)]">
              {{ data.status }}
            </span>
          </template>
        </Column>

        <Column field="created_at" header="Date" sortable header-style="min-width: 110px;" body-style="min-width: 110px;">
          <template #body="{ data }">
            <div class="text-gray-600 text-sm">{{ new Date(data.created_at).toLocaleDateString() }}</div>
          </template>
        </Column>

        <Column header="Actions" header-style="min-width: 220px; text-align: center;" body-style="min-width: 220px; text-align: center;">
          <template #body="{ data }">
            <div class="flex justify-center gap-1 flex-wrap">
              <button
                @click="viewDetails(data)"
                class="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                title="View Details"
              >
                <i class="pi pi-eye text-lg"></i>
              </button>
              <button
                v-if="data.status === 'pending'"
                @click="confirmApprove(data)"
                class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                title="Approve"
              >
                <i class="pi pi-check text-lg"></i>
              </button>
              <button
                v-if="data.status === 'approved'"
                @click="confirmPublish(data)"
                class="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                title="Publish"
              >
                <i class="pi pi-globe text-lg"></i>
              </button>
              <button
                v-if="data.status === 'pending'"
                @click="confirmReject(data)"
                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Reject"
              >
                <i class="pi pi-times text-lg"></i>
              </button>
              <button
                @click="confirmDelete(data)"
                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete"
              >
                <i class="pi pi-trash text-lg"></i>
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Rejection Modal -->
    <Dialog v-model:visible="showRejectModal" header="Reject Submission" modal :style="{ width: '400px' }">
      <div class="space-y-4">
        <p class="text-gray-600">Provide a reason for rejection:</p>
        <Textarea
          v-model="rejectionReason"
          placeholder="Reason for rejection..."
          rows="4"
          class="w-full"
        />
        <div class="flex gap-2 justify-end">
          <Button label="Cancel" class="p-button-text" @click="showRejectModal = false" />
          <Button label="Reject" class="p-button-danger" @click="submitRejection" />
        </div>
      </div>
    </Dialog>

    <!-- Details Dialog -->
    <Dialog
      v-model:visible="showDetails"
      :header="isEditMode ? 'Edit Submission' : 'Submission Details'"
      modal
      :style="{ width: '90vw', maxWidth: '900px' }"
    >
      <div v-if="selectedSubmission" class="space-y-6">
        <!-- View Mode -->
        <div v-if="!isEditMode" class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">{{ selectedSubmission.title }}</h2>
            <span :class="['badge text-lg', getStatusBadgeClass(selectedSubmission.status)]">
              {{ selectedSubmission.status }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Business Name</label>
                <p class="text-gray-600">{{ selectedSubmission.business_name || 'N/A' }}</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <p class="text-gray-600">{{ selectedSubmission.category || 'N/A' }}</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">City</label>
                <p class="text-gray-600">{{ selectedSubmission.city || 'N/A' }}</p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Contact Name</label>
                <p class="text-gray-600">{{ selectedSubmission.contact_name }}</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <p class="text-gray-600 break-all">{{ selectedSubmission.contact_email }}</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                <p class="text-gray-600">{{ selectedSubmission.contact_phone || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <p class="text-gray-600 whitespace-pre-wrap">{{ selectedSubmission.description }}</p>
          </div>

          <div v-if="selectedSubmission.website">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Website</label>
            <p class="text-blue-600 break-all">{{ selectedSubmission.website }}</p>
          </div>
        </div>

        <!-- Edit Mode -->
        <TabView v-if="isEditMode && editingSubmission">
          <TabPanel header="Basic Information">
            <div class="space-y-4">
              <div>
                <label class="block font-semibold mb-2 text-gray-700">Title</label>
                <InputText v-model="editingSubmission.title" class="w-full" />
              </div>
              <div>
                <label class="block font-semibold mb-2 text-gray-700">Business Name</label>
                <InputText v-model="editingSubmission.business_name" class="w-full" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block font-semibold mb-2 text-gray-700">Category</label>
                  <Select
                    v-model="editingSubmission.category_id"
                    :options="categories"
                    option-label="name"
                    option-value="id"
                    placeholder="Select category"
                    class="w-full"
                  />
                </div>
                <div>
                  <label class="block font-semibold mb-2 text-gray-700">City</label>
                  <Select
                    v-model="editingSubmission.city_id"
                    :options="cities"
                    option-label="name"
                    option-value="id"
                    placeholder="Select city"
                    class="w-full"
                  />
                </div>
              </div>
              <div>
                <label class="block font-semibold mb-2 text-gray-700">Description</label>
                <Textarea
                  v-model="editingSubmission.description"
                  rows="6"
                  class="w-full"
                />
              </div>
            </div>
          </TabPanel>

          <TabPanel header="Contact Information">
            <div class="space-y-4">
              <div>
                <label class="block font-semibold mb-2 text-gray-700">Contact Name</label>
                <InputText v-model="editingSubmission.contact_name" class="w-full" />
              </div>
              <div>
                <label class="block font-semibold mb-2 text-gray-700">Email</label>
                <InputText
                  v-model="editingSubmission.contact_email"
                  type="email"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block font-semibold mb-2 text-gray-700">Phone</label>
                <InputText v-model="editingSubmission.contact_phone" class="w-full" />
              </div>
              <div>
                <label class="block font-semibold mb-2 text-gray-700">Website</label>
                <InputText v-model="editingSubmission.website" class="w-full" />
              </div>
            </div>
          </TabPanel>
        </TabView>

        <!-- Footer Actions -->
        <div class="flex gap-3 justify-end border-t pt-6">
          <template v-if="!isEditMode">
            <Button
              v-if="selectedSubmission.status === 'approved'"
              label="Publish"
              icon="pi pi-globe"
              class="p-button-success"
              @click="confirmPublish(selectedSubmission)"
            />
            <Button
              label="Edit"
              icon="pi pi-pencil"
              class="p-button-info"
              @click="enableEditMode"
            />
          </template>
          <template v-else>
            <Button
              label="Save"
              icon="pi pi-check"
              :loading="isSaving"
              class="p-button-success"
              @click="saveSubmission"
            />
            <Button
              label="Cancel"
              icon="pi pi-times"
              class="p-button-text"
              @click="cancelEdit"
            />
          </template>
          <Button
            label="Close"
            icon="pi pi-times"
            class="p-button-text"
            @click="showDetails = false"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.submissions-page {
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .submissions-page {
    font-size: 0.9rem;
  }

  .submissions-table :deep(.p-datatable .p-datatable-thead > tr > th) {
    padding: 0.5rem 0.25rem;
    font-size: 0.75rem;
  }

  .submissions-table :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.5rem 0.25rem;
  }
}

/* Badge Styling */
:deep(.badge) {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.5px;
}

:deep(.badge-warning) {
  background-color: #fef08a;
  color: #78350f;
}

:deep(.badge-info) {
  background-color: #bfdbfe;
  color: #1e40af;
}

:deep(.badge-danger) {
  background-color: #fecaca;
  color: #7f1d1d;
}

:deep(.badge-secondary) {
  background-color: #e5e7eb;
  color: #374151;
}

/* Input Styling */
:deep(.p-inputtext) {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.625rem 0.875rem;
  font-size: 0.95rem;
  transition: all 0.2s;
}

:deep(.p-inputtext:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

/* Textarea */
:deep(textarea) {
  border: 1px solid #d1d5db !important;
  border-radius: 6px;
  padding: 0.625rem 0.875rem;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  transition: all 0.2s;
}

:deep(textarea:focus) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

/* Button Styling */
:deep(.p-button) {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

:deep(.p-button.p-button-sm) {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

:deep(.p-button.p-button-rounded) {
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.p-button-success) {
  background-color: #10b981;
  border-color: #10b981;
}

:deep(.p-button-success:hover) {
  background-color: #059669;
  border-color: #059669;
}

:deep(.p-button-danger) {
  background-color: #ef4444;
  border-color: #ef4444;
}

:deep(.p-button-danger:hover) {
  background-color: #dc2626;
  border-color: #dc2626;
}

:deep(.p-button-info) {
  background-color: #06b6d4;
  border-color: #06b6d4;
}

:deep(.p-button-info:hover) {
  background-color: #0891b2;
  border-color: #0891b2;
}

:deep(.p-button-warning) {
  background-color: #f59e0b;
  border-color: #f59e0b;
}

:deep(.p-button-warning:hover) {
  background-color: #d97706;
  border-color: #d97706;
}

:deep(.p-button-text) {
  color: #6b7280;
}

:deep(.p-button-text:hover) {
  background-color: #f3f4f6;
}

:deep(.p-button-text.p-button-danger) {
  color: #ef4444;
}

/* Table Styling */
.submissions-table :deep(.p-datatable) {
  background-color: transparent;
  border: none;
  font-size: 0.95rem;
}

.submissions-table :deep(.p-datatable .p-datatable-wrapper) {
  overflow-x: auto;
}

.submissions-table :deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f9fafb;
  border-color: #e5e7eb;
  padding: 0.875rem;
  font-weight: 700;
  color: #374151;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left;
}

.submissions-table :deep(.p-datatable .p-datatable-tbody > tr > td) {
  border-color: #e5e7eb;
  padding: 0.875rem;
  font-size: 0.9rem;
  vertical-align: middle;
}

.submissions-table :deep(.p-datatable .p-datatable-tbody > tr) {
  border-bottom: 1px solid #e5e7eb;
}

.submissions-table :deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f9fafb;
}

.submissions-table :deep(.p-paginator) {
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
  background-color: #f9fafb;
}

/* Select Styling */
:deep(.p-select) {
  border-radius: 6px;
}

:deep(.p-select .p-select-label) {
  padding: 0.625rem 0.875rem;
}

:deep(.p-select .p-select-trigger) {
  width: auto;
  padding: 0 0.875rem;
}

/* Checkbox */
:deep(.p-checkbox .p-checkbox-box) {
  border-color: #d1d5db;
  border-radius: 4px;
  width: 1.25rem;
  height: 1.25rem;
}

:deep(.p-checkbox .p-checkbox-box.p-highlight) {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* Dialog */
:deep(.p-dialog .p-dialog-header) {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem;
}

:deep(.p-dialog .p-dialog-title) {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

:deep(.p-dialog-content) {
  padding: 1.5rem;
}

/* Tab Styling */
:deep(.p-tabview .p-tabview-nav) {
  background-color: transparent;
  border-bottom: 2px solid #e5e7eb;
}

:deep(.p-tabview .p-tabview-nav .p-tabview-nav-btn) {
  padding: 1rem 1.5rem;
  color: #6b7280;
  font-weight: 500;
}

:deep(.p-tabview .p-tabview-nav .p-tabview-nav-btn.p-highlight) {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

:deep(.p-tabview .p-tabview-panels) {
  background-color: transparent;
  padding: 1.5rem 0;
}
</style>
