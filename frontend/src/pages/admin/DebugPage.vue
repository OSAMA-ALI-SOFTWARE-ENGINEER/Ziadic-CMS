<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const stats = ref({
  submissions: 0,
  media: 0,
  listings: 0,
  categories: 0,
  cities: 0,
  countries: 0,
})

const submissionsList = ref<any[]>([])
const apiErrors = ref<string[]>([])
const loading = ref(true)

async function checkSubmissions() {
  try {
    const response = await fetch('/api/v1/admin/submissions')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const data = await response.json()
    stats.value.submissions = data.data?.length || 0
    submissionsList.value = data.data || []
  } catch (error) {
    apiErrors.value.push(`Submissions API: ${error}`)
  }
}

async function checkDatabase() {
  try {
    const response = await fetch('/api/v1/test/submissions')
    if (response.ok) {
      const data = await response.json()
      console.log('Database submissions:', data)
    }
  } catch (error) {
    console.log('Test endpoint not available')
  }
}

async function testSubmit() {
  try {
    const formData = new FormData()
    formData.append('title', 'Test Listing ' + Date.now())
    formData.append('business_name', 'Test Business')
    formData.append('description', 'This is a test listing submission')
    formData.append('category_id', '1')
    formData.append('city_id', '1')
    formData.append('contact_name', 'Test User')
    formData.append('contact_email', 'test@example.com')
    formData.append('contact_phone', '123456789')
    formData.append('website', 'https://example.com')

    // Create a simple test image
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    canvas.toBlob((blob) => {
      if (blob) {
        formData.append('image', blob, 'test.png')
        submitTestForm(formData)
      }
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: String(error),
    })
  }
}

async function submitTestForm(formData: FormData) {
  try {
    const response = await fetch('/api/v1/public/listings/submit', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    if (response.ok) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Test submission created! Check the submissions list below.',
      })
      await checkSubmissions()
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: data.message || 'Submission failed',
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: String(error),
    })
  }
}

async function loadStats() {
  try {
    // This would require creating a stats endpoint
    // For now, check submissions which we know exists
    await checkSubmissions()
    await checkDatabase()
    loading.value = false
  } catch (error) {
    console.error('Error loading stats:', error)
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>

<template>
  <div class="debug-page">
    <Toast />

    <h1>🔧 Debug & Testing</h1>
    <p>Use this page to test if the submission system is working correctly.</p>

    <Card class="mb-4">
      <template #title>
        <h3>Quick Test</h3>
      </template>
      <template #content>
        <div class="button-group">
          <Button
            label="Create Test Submission"
            icon="pi pi-plus"
            @click="testSubmit"
            class="p-button-success"
          />
          <Button
            label="Refresh Stats"
            icon="pi pi-refresh"
            @click="loadStats"
          />
        </div>
      </template>
    </Card>

    <Card class="mb-4">
      <template #title>
        <h3>API Status</h3>
      </template>
      <template #content>
        <div v-if="apiErrors.length > 0" class="error-list">
          <h4>API Errors:</h4>
          <ul>
            <li v-for="(error, i) in apiErrors" :key="i" class="error-item">
              {{ error }}
            </li>
          </ul>
        </div>
        <div v-else class="success-message">
          <i class="pi pi-check-circle"></i> APIs responding correctly
        </div>
      </template>
    </Card>

    <Card class="mb-4">
      <template #title>
        <h3>Submissions in Database</h3>
      </template>
      <template #content>
        <div v-if="loading" class="loading">
          Loading submissions...
        </div>
        <div v-else-if="submissionsList.length === 0" class="empty-state">
          <i class="pi pi-inbox"></i>
          <p>No submissions yet</p>
          <p class="hint">Click "Create Test Submission" above to add one</p>
        </div>
        <div v-else class="submissions-list">
          <p><strong>Total Submissions: {{ stats.submissions }}</strong></p>
          <table class="debug-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sub in submissionsList" :key="sub.id">
                <td>{{ sub.id }}</td>
                <td>{{ sub.title }}</td>
                <td>{{ sub.contact_email }}</td>
                <td>
                  <span class="badge" :class="`badge-${sub.status}`">
                    {{ sub.status }}
                  </span>
                </td>
                <td>{{ new Date(sub.created_at).toLocaleDateString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </Card>

    <Card>
      <template #title>
        <h3>Testing Checklist</h3>
      </template>
      <template #content>
        <ul class="checklist">
          <li>
            <input type="checkbox" id="check1" />
            <label for="check1">Frontend form loads at /add-listing</label>
          </li>
          <li>
            <input type="checkbox" id="check2" />
            <label for="check2">Can submit test form without errors</label>
          </li>
          <li>
            <input type="checkbox" id="check3" />
            <label for="check3">Submission appears in database</label>
          </li>
          <li>
            <input type="checkbox" id="check4" />
            <label for="check4">Admin can view submissions</label>
          </li>
          <li>
            <input type="checkbox" id="check5" />
            <label for="check5">Admin can approve submissions</label>
          </li>
          <li>
            <input type="checkbox" id="check6" />
            <label for="check6">Admin can reject submissions</label>
          </li>
          <li>
            <input type="checkbox" id="check7" />
            <label for="check7">Activity logs track changes</label>
          </li>
        </ul>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.debug-page {
  padding: 1.5rem;
}

h1 {
  color: #1f2937;
  margin-bottom: 0.5rem;
}

p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.error-list {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 6px;
  padding: 1rem;
}

.error-list h4 {
  color: #c41e3a;
  margin-top: 0;
}

.error-item {
  color: #991b1b;
  margin: 0.5rem 0;
  font-family: monospace;
  font-size: 0.9rem;
}

.success-message {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 1rem;
  color: #166534;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.empty-state .hint {
  font-size: 0.9rem;
}

.submissions-list {
  background: #f9fafb;
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
}

.debug-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 6px;
  overflow: hidden;
}

.debug-table thead {
  background: #f3f4f6;
}

.debug-table th,
.debug-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.debug-table th {
  font-weight: 600;
  color: #374151;
}

.debug-table tbody tr:hover {
  background: #f9fafb;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge-pending {
  background: #fef08a;
  color: #92400e;
}

.badge-approved {
  background: #bfdbfe;
  color: #1e40af;
}

.badge-rejected {
  background: #fecaca;
  color: #991b1b;
}

.checklist {
  list-style: none;
  padding: 0;
  margin: 0;
}

.checklist li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.checklist li:last-child {
  border-bottom: none;
}

.checklist input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checklist label {
  cursor: pointer;
  flex: 1;
}
</style>
