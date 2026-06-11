<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const toast = useToast()
const confirm = useConfirm()

const submissions = ref<any[]>([])
const loading = ref(false)
const statusFilter = ref('')
const searchQuery = ref('')
const selectedSubmission = ref<any>(null)
const showDetails = ref(false)

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

const filteredSubmissions = computed(() => {
  return submissions.value.filter(submission => {
    const matchesStatus = !statusFilter.value || submission.status === statusFilter.value
    const matchesSearch = !searchQuery.value ||
      submission.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      submission.contact_email.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesStatus && matchesSearch
  })
})

async function loadSubmissions() {
  try {
    loading.value = true
    const params = new URLSearchParams()
    if (statusFilter.value) params.append('status', statusFilter.value)
    if (searchQuery.value) params.append('search', searchQuery.value)

    const url = `/api/v1/admin/submissions${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url)
    const data = await response.json()
    submissions.value = data.data || []
  } catch (error) {
    console.error('Error loading submissions:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load submissions',
    })
  } finally {
    loading.value = false
  }
}

async function viewDetails(submission: any) {
  try {
    const response = await fetch(`/api/v1/admin/submissions/${submission.id}`)
    const data = await response.json()
    selectedSubmission.value = data
    showDetails.value = true
  } catch (error) {
    console.error('Error loading submission:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load submission details',
    })
  }
}

function confirmApprove(submission: any) {
  confirm.require({
    message: `Approve "${submission.title}"?`,
    header: 'Confirm Approval',
    icon: 'pi pi-check',
    accept: async () => {
      try {
        const response = await fetch(`/api/v1/admin/submissions/${submission.id}/approve`, {
          method: 'PATCH',
        })
        if (!response.ok) throw new Error('Failed to approve')
        toast.add({ severity: 'success', summary: 'Success', detail: 'Submission approved' })
        showDetails.value = false
        loadSubmissions()
      } catch (error) {
        console.error('Error approving:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to approve submission' })
      }
    },
  })
}

function confirmReject(submission: any) {
  confirm.require({
    message: `Reject "${submission.title}"?`,
    header: 'Confirm Rejection',
    icon: 'pi pi-times',
    accept: async () => {
      try {
        const response = await fetch(`/api/v1/admin/submissions/${submission.id}/reject`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rejection_reason: 'Rejected by admin' }),
        })
        if (!response.ok) throw new Error('Failed to reject')
        toast.add({ severity: 'success', summary: 'Success', detail: 'Submission rejected' })
        showDetails.value = false
        loadSubmissions()
      } catch (error) {
        console.error('Error rejecting:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to reject submission' })
      }
    },
  })
}

function confirmDelete(submission: any) {
  confirm.require({
    message: `Delete "${submission.title}"?`,
    header: 'Confirm Deletion',
    icon: 'pi pi-trash',
    accept: async () => {
      try {
        const response = await fetch(`/api/v1/admin/submissions/${submission.id}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Delete failed')
        toast.add({ severity: 'success', summary: 'Success', detail: 'Submission deleted' })
        loadSubmissions()
      } catch (error) {
        console.error('Error deleting:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete submission' })
      }
    },
  })
}

function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'warning',
    approved: 'info',
    rejected: 'danger',
  }
  return colorMap[status] || 'secondary'
}

onMounted(() => {
  loadSubmissions()
})
</script>

<template>
  <div class="submissions-page">
    <Toast />
    <ConfirmDialog />

    <h1>Website Submissions</h1>
    <p class="subtitle">Manage listing submissions from the website</p>

    <Card class="mb-4">
      <template #content>
        <div class="filters mb-4">
          <div class="filter-row">
            <InputGroup>
              <InputGroupAddon>
                <i class="pi pi-search" />
              </InputGroupAddon>
              <InputText
                v-model="searchQuery"
                placeholder="Search by title or email..."
                @input="loadSubmissions"
              />
            </InputGroup>

            <Dropdown
              v-model="statusFilter"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Filter by status"
              @change="loadSubmissions"
              class="w-48"
            />
          </div>
        </div>

        <DataTable
          :value="filteredSubmissions"
          :loading="loading"
          striped-rows
          hover
          responsive-layout="scroll"
          :rows="10"
          paginator
          class="data-table"
        >
          <Column field="title" header="Title" sortable />
          <Column field="contact_email" header="Email" />
          <Column field="city" header="Location" />
          <Column field="category" header="Category" />
          <Column field="created_at" header="Submitted" sortable />
          <Column field="status" header="Status">
            <template #body="{ data }">
              <span class="badge" :class="`badge-${getStatusColor(data.status)}`">
                {{ data.status }}
              </span>
            </template>
          </Column>
          <Column header="Actions">
            <template #body="{ data }">
              <Button
                icon="pi pi-eye"
                class="p-button-rounded p-button-info mr-2"
                @click="viewDetails(data)"
                v-tooltip="'View Details'"
              />
              <Button
                v-if="data.status === 'pending'"
                icon="pi pi-check"
                class="p-button-rounded p-button-success mr-2"
                @click="confirmApprove(data)"
                v-tooltip="'Approve'"
              />
              <Button
                v-if="data.status === 'pending'"
                icon="pi pi-times"
                class="p-button-rounded p-button-danger mr-2"
                @click="confirmReject(data)"
                v-tooltip="'Reject'"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-text-danger"
                @click="confirmDelete(data)"
                v-tooltip="'Delete'"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Details Modal -->
    <Dialog
      v-model:visible="showDetails"
      :header="`Submission: ${selectedSubmission?.title}`"
      :modal="true"
      :style="{ width: '90vw', maxWidth: '900px' }"
    >
      <div v-if="selectedSubmission" class="submission-details">
        <div class="grid">
          <div class="col-12 md:col-6">
            <h4>Business Information</h4>
            <p><strong>Title:</strong> {{ selectedSubmission.title }}</p>
            <p><strong>Business Name:</strong> {{ selectedSubmission.business_name || 'N/A' }}</p>
            <p><strong>Category:</strong> {{ selectedSubmission.category || 'N/A' }}</p>
            <p><strong>City:</strong> {{ selectedSubmission.city || 'N/A' }}</p>
          </div>
          <div class="col-12 md:col-6">
            <h4>Contact Information</h4>
            <p><strong>Name:</strong> {{ selectedSubmission.contact_name }}</p>
            <p><strong>Email:</strong> {{ selectedSubmission.contact_email }}</p>
            <p><strong>Phone:</strong> {{ selectedSubmission.contact_phone || 'N/A' }}</p>
            <p><strong>Website:</strong> {{ selectedSubmission.website || 'N/A' }}</p>
          </div>
        </div>

        <div class="mt-4">
          <h4>Description</h4>
          <p>{{ selectedSubmission.description }}</p>
        </div>

        <div class="mt-4">
          <h4>Status</h4>
          <p>
            <span class="badge" :class="`badge-${getStatusColor(selectedSubmission.status)}`">
              {{ selectedSubmission.status }}
            </span>
          </p>
        </div>

        <div class="mt-4 flex gap-2">
          <Button
            v-if="selectedSubmission.status === 'pending'"
            label="Approve"
            icon="pi pi-check"
            class="p-button-success"
            @click="confirmApprove(selectedSubmission)"
          />
          <Button
            v-if="selectedSubmission.status === 'pending'"
            label="Reject"
            icon="pi pi-times"
            class="p-button-danger"
            @click="confirmReject(selectedSubmission)"
          />
          <Button
            label="Close"
            icon="pi pi-times"
            class="p-button-secondary"
            @click="showDetails = false"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.submissions-page {
  padding: 1.5rem;
}

h1 {
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.subtitle {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-row {
  display: flex;
  gap: 1rem;
  flex: 1;
  min-width: 300px;
  flex-wrap: wrap;
}

.data-table {
  font-size: 0.9rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge-warning {
  background-color: #fef08a;
  color: #92400e;
}

.badge-info {
  background-color: #bfdbfe;
  color: #1e40af;
}

.badge-danger {
  background-color: #fecaca;
  color: #991b1b;
}

.submission-details {
  padding: 1rem 0;
}

.submission-details h4 {
  margin-top: 1rem;
  margin-bottom: 0.75rem;
  color: #374151;
  font-weight: 600;
}

.submission-details p {
  margin: 0.5rem 0;
  color: #1f2937;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1rem;
}

.col-12 {
  grid-column: span 2;
}

.mt-4 {
  margin-top: 1.5rem;
}

.flex {
  display: flex;
}

.gap-2 {
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .col-12 {
    grid-column: span 1;
  }

  .col-12.md\:col-6 {
    grid-column: span 1;
  }

  .filter-row {
    flex-direction: column;
  }
}
</style>
