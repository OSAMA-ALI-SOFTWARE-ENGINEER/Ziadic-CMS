<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useApiClient } from '@/composables/useApiClient'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const api = useApiClient()
const toast = useToast()
const confirm = useConfirm()

const submissions = ref<any[]>([])
const loading = ref(false)
const statusFilter = ref('')
const searchQuery = ref('')
const selectedSubmission = ref<any>(null)
const showDetails = ref(false)
const rejectionReason = ref('')

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
    const response = await api.get('/api/v1/admin/submissions', {
      params: {
        status: statusFilter.value,
        search: searchQuery.value,
      },
    })
    submissions.value = response.data.data || []
  } catch (error) {
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
    const response = await api.get(`/api/v1/admin/submissions/${submission.id}`)
    selectedSubmission.value = response.data
    showDetails.value = true
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load submission details',
    })
  }
}

function confirmApprove(submission: any) {
  confirm.require({
    message: `Approve "${submission.title}" from ${submission.contact_name}?`,
    header: 'Confirm Approval',
    icon: 'pi pi-check',
    accept: async () => {
      try {
        await api.patch(`/api/v1/admin/submissions/${submission.id}/approve`)
        toast.add({ severity: 'success', summary: 'Success', detail: 'Submission approved' })
        showDetails.value = false
        loadSubmissions()
      } catch (error) {
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
    accept: () => {
      rejectionReason.value = ''
      // Show rejection reason dialog
      confirm.require({
        message: 'Provide a reason for rejection:',
        header: 'Rejection Reason',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          if (!rejectionReason.value.trim()) {
            toast.add({
              severity: 'warn',
              summary: 'Warning',
              detail: 'Please provide a rejection reason',
            })
            return
          }
          try {
            await api.patch(`/api/v1/admin/submissions/${submission.id}/reject`, {
              rejection_reason: rejectionReason.value,
            })
            toast.add({ severity: 'success', summary: 'Success', detail: 'Submission rejected' })
            showDetails.value = false
            loadSubmissions()
          } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to reject submission' })
          }
        },
      })
    },
  })
}

function confirmDelete(submission: any) {
  confirm.require({
    message: `Delete "${submission.title}" permanently?`,
    header: 'Confirm Deletion',
    icon: 'pi pi-trash',
    accept: async () => {
      try {
        await api.delete(`/api/v1/admin/submissions/${submission.id}`)
        toast.add({ severity: 'success', summary: 'Success', detail: 'Submission deleted' })
        loadSubmissions()
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete submission' })
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

onMounted(() => {
  loadSubmissions()
})
</script>

<template>
  <div class="submissions-page">
    <Toast />
    <ConfirmDialog />

    <Card class="mb-4">
      <template #title>
        <h1>Listing Submissions</h1>
      </template>
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
          <Column field="contact_email" header="Email" sortable />
          <Column field="city" header="City" />
          <Column field="category" header="Category" />
          <Column field="created_at" header="Submitted" sortable />
          <Column field="status" header="Status">
            <template #body="{ data }">
              <span :class="['badge', getStatusBadgeClass(data.status)]">
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

    <!-- Details Dialog -->
    <Dialog
      v-model:visible="showDetails"
      :header="`Submission: ${selectedSubmission?.title}`"
      :modal="true"
      :style="{ width: '90vw' }"
      :maximizable="true"
    >
      <div v-if="selectedSubmission" class="submission-details">
        <!-- Image Preview -->
        <div v-if="selectedSubmission.image_url" class="image-preview mb-4">
          <img :src="selectedSubmission.image_url" :alt="selectedSubmission.title" />
        </div>

        <!-- Basic Information -->
        <div class="details-section mb-4">
          <h3>Basic Information</h3>
          <div class="details-grid">
            <div>
              <label>Title:</label>
              <p>{{ selectedSubmission.title }}</p>
            </div>
            <div>
              <label>Business Name:</label>
              <p>{{ selectedSubmission.business_name || 'N/A' }}</p>
            </div>
            <div>
              <label>Category:</label>
              <p>{{ selectedSubmission.category || 'N/A' }}</p>
            </div>
            <div>
              <label>City:</label>
              <p>{{ selectedSubmission.city || 'N/A' }}</p>
            </div>
            <div>
              <label>Website:</label>
              <p>
                <a v-if="selectedSubmission.website" :href="selectedSubmission.website" target="_blank">
                  {{ selectedSubmission.website }}
                </a>
                <span v-else>N/A</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="details-section mb-4">
          <h3>Contact Information</h3>
          <div class="details-grid">
            <div>
              <label>Name:</label>
              <p>{{ selectedSubmission.contact_name }}</p>
            </div>
            <div>
              <label>Email:</label>
              <p>
                <a :href="`mailto:${selectedSubmission.contact_email}`">
                  {{ selectedSubmission.contact_email }}
                </a>
              </p>
            </div>
            <div>
              <label>Phone:</label>
              <p>{{ selectedSubmission.contact_phone || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="details-section mb-4">
          <h3>Description</h3>
          <div class="description-text">
            {{ selectedSubmission.description }}
          </div>
        </div>

        <!-- Submission Status -->
        <div class="details-section mb-4">
          <h3>Submission Status</h3>
          <div class="details-grid">
            <div>
              <label>Status:</label>
              <p>
                <span :class="['badge', getStatusBadgeClass(selectedSubmission.status)]">
                  {{ selectedSubmission.status }}
                </span>
              </p>
            </div>
            <div v-if="selectedSubmission.reviewed_at">
              <label>Reviewed At:</label>
              <p>{{ new Date(selectedSubmission.reviewed_at).toLocaleDateString() }}</p>
            </div>
            <div v-if="selectedSubmission.reviewer">
              <label>Reviewed By:</label>
              <p>{{ selectedSubmission.reviewer.name }}</p>
            </div>
            <div v-if="selectedSubmission.rejection_reason">
              <label>Rejection Reason:</label>
              <p>{{ selectedSubmission.rejection_reason }}</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="actions mt-4">
          <Button
            v-if="selectedSubmission.status === 'pending'"
            label="Approve"
            icon="pi pi-check"
            class="p-button-success mr-2"
            @click="confirmApprove(selectedSubmission)"
          />
          <Button
            v-if="selectedSubmission.status === 'pending'"
            label="Reject"
            icon="pi pi-times"
            class="p-button-danger mr-2"
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

.filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
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

.badge-secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.submission-details {
  padding: 1.5rem 0;
}

.image-preview {
  max-width: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.details-section {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1.5rem;
}

.details-section h3 {
  margin-bottom: 1rem;
  color: #374151;
  font-weight: 600;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.details-grid label {
  display: block;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.details-grid p {
  color: #1f2937;
  margin: 0;
  line-height: 1.5;
}

.details-grid a {
  color: #3b82f6;
  text-decoration: none;
}

.details-grid a:hover {
  text-decoration: underline;
}

.description-text {
  color: #1f2937;
  line-height: 1.6;
  white-space: pre-wrap;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
