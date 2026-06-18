<template>
  <div class="subscriptions-container">
    <!-- Header -->
    <div class="subscriptions-header">
      <div>
        <h1 class="subscriptions-title">Newsletter Subscriptions</h1>
        <p class="subscriptions-subtitle">Manage newsletter subscribers and email subscribers</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="pi pi-users"></i>
        </div>
        <div class="stat-info">
          <p class="stat-label">Total Subscribers</p>
          <p class="stat-value">{{ total }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon confirmed">
          <i class="pi pi-check"></i>
        </div>
        <div class="stat-info">
          <p class="stat-label">Confirmed</p>
          <p class="stat-value">{{ confirmedCount }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon pending">
          <i class="pi pi-clock"></i>
        </div>
        <div class="stat-info">
          <p class="stat-label">Pending</p>
          <p class="stat-value">{{ pendingCount }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon unsubscribed">
          <i class="pi pi-times"></i>
        </div>
        <div class="stat-info">
          <p class="stat-label">Unsubscribed</p>
          <p class="stat-value">{{ unsubscribedCount }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="subscriptions-content">
      <!-- Loading State -->
      <div v-if="loading && rows.length === 0" class="subscriptions-loading">
        <SkeletonCard type="table-row" :count="8" />
      </div>

      <!-- Subscriptions Table -->
      <div v-else class="subscriptions-table-wrapper">
        <!-- Search & Filter -->
        <div class="search-bar">
          <input
            v-model="search"
            type="text"
            placeholder="Search by email..."
            class="search-input"
            @keyup.enter="fetchSubscribers"
          />
          <select v-model="sourceFilter" class="filter-select" @change="fetchSubscribers">
            <option value="">All Sources</option>
            <option value="sticky-bar">Sticky Bar</option>
            <option value="footer">Footer</option>
            <option value="other">Other</option>
          </select>
          <button class="search-button" @click="fetchSubscribers">
            <i class="pi pi-search"></i>
          </button>
        </div>

        <table class="subscriptions-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Source</th>
              <th>Status</th>
              <th>Subscribed At</th>
              <th>Confirmed At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id" class="subscription-row">
              <td class="cell-email">
                <div class="email-cell">
                  <div class="email-avatar">{{ row.email.charAt(0) }}</div>
                  <code class="email-address">{{ row.email }}</code>
                </div>
              </td>
              <td class="cell-source">
                <span class="source-chip">{{ sourceLabel(row.source) }}</span>
              </td>
              <td class="cell-status">
                <span :class="['status-badge', `status-${row.status.toLowerCase()}`]">
                  {{ row.status }}
                </span>
              </td>
              <td class="cell-date">
                {{ formatDate(row.subscribed_at) }}
              </td>
              <td class="cell-date">
                {{ formatDate(row.confirmation_sent_at) }}
              </td>
              <td class="cell-actions">
                <div class="action-buttons">
                  <button
                    class="action-btn delete-btn"
                    :disabled="deletingId === row.id"
                    @click="deleteSubscriber(row)"
                    title="Delete subscriber"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="rows.length === 0" class="empty-state">
          <i class="pi pi-inbox"></i>
          <h3>No subscribers yet</h3>
          <p>Newsletter subscribers will appear here</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="rows.length > 0" class="pagination">
        <span class="pagination-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <div class="pagination-buttons">
          <button
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="prevPage"
          >
            <i class="pi pi-chevron-left"></i>
            Previous
          </button>
          <button
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            Next
            <i class="pi pi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { api } from '@/services/api'
import SkeletonCard from '@/components/SkeletonCard.vue'

type SubscriberRow = {
  id: number
  email: string
  status: string
  source: string
  subscribed_at: string | null
  confirmation_sent_at: string | null
  created_at: string
}

const rows = ref<SubscriberRow[]>([])
const loading = ref(false)
const search = ref('')
const sourceFilter = ref('')
const currentPage = ref(1)
const perPage = ref(20)
const total = ref(0)
const deletingId = ref<number | null>(null)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)))

const confirmedCount = computed(() =>
  rows.value.filter(r => r.status === 'confirmed').length
)

const pendingCount = computed(() =>
  rows.value.filter(r => r.status === 'pending').length
)

const unsubscribedCount = computed(() =>
  rows.value.filter(r => r.status === 'unsubscribed').length
)

function formatDate(value: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function sourceLabel(value: string) {
  if (value === 'sticky-bar') return 'Sticky Bar'
  if (value === 'footer') return 'Footer'
  return value
}

async function fetchSubscribers() {
  loading.value = true
  try {
    const response = await api.get('/newsletter-subscribers', {
      params: {
        page: currentPage.value,
        per_page: perPage.value,
        ...(search.value && { search: search.value }),
        ...(sourceFilter.value && { source: sourceFilter.value }),
      },
    })

    const data = response.data.data || response.data

    rows.value = Array.isArray(data) ? data : data.data || []
    total.value = response.data.total || 0
    currentPage.value = response.data.current_page || 1
    perPage.value = response.data.per_page || 20
  } catch (error) {
    console.error('Unable to load subscriptions:', error)
    rows.value = []
  } finally {
    loading.value = false
  }
}

async function deleteSubscriber(row: SubscriberRow) {
  const ok = window.confirm(`Delete ${row.email}? This cannot be undone.`)
  if (!ok) return

  deletingId.value = row.id

  try {
    await api.delete(`/newsletter-subscribers/${row.id}`)

    if (rows.value.length === 1 && currentPage.value > 1) {
      currentPage.value -= 1
    }

    await fetchSubscribers()
  } catch (error: any) {
    console.error('Failed to delete subscriber:', error)
    alert(error.response?.data?.message || 'Failed to delete subscriber.')
  } finally {
    deletingId.value = null
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1
    fetchSubscribers()
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value -= 1
    fetchSubscribers()
  }
}

onMounted(fetchSubscribers)
</script>

<style scoped>
.subscriptions-container {
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%);
}

/* Header */
.subscriptions-header {
  margin-bottom: 2rem;
}

.subscriptions-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.subscriptions-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  font-size: 1.25rem;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #0369a1;
  flex-shrink: 0;
}

.stat-icon.confirmed {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #16a34a;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.stat-icon.unsubscribed {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0.25rem 0 0 0;
}

/* Main Content */
.subscriptions-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.subscriptions-loading {
  padding: 2rem;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.search-input {
  flex: 1;
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select {
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: #f0f0f0;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-button:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.subscriptions-table-wrapper {
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
}

.subscriptions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.subscriptions-table thead {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 2px solid #e5e7eb;
}

.subscriptions-table thead th {
  padding: 1rem 1.25rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.025em;
  white-space: nowrap;
  user-select: none;
}

.subscriptions-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.15s ease;
}

.subscriptions-table tbody tr:hover {
  background-color: #f9fafb;
}

.subscriptions-table tbody td {
  padding: 1rem 1.25rem;
  vertical-align: middle;
}

.cell-email {
  min-width: 220px;
}

.email-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.email-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.email-address {
  padding: 0.375rem 0.5rem;
  background: #f3f4f6;
  color: #374151;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-source {
  min-width: 120px;
}

.source-chip {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: #f0f9ff;
  color: #0369a1;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #bae6fd;
  text-transform: capitalize;
}

.cell-status {
  min-width: 110px;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  border: 1px solid;
}

.status-confirmed {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #065f46;
  border-color: #a7f3d0;
}

.status-pending {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: #92400e;
  border-color: #fde68a;
}

.status-unsubscribed {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  border-color: #d1d5db;
}

.cell-date {
  min-width: 120px;
  color: #6b7280;
  font-size: 0.8rem;
}

.cell-actions {
  min-width: 80px;
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-btn {
  background-color: #fee2e2;
  color: #7f1d1d;
}

.delete-btn:hover:not(:disabled) {
  background-color: #fecaca;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  color: #6b7280;
}

.empty-state i {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.empty-state p {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: #9ca3af;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-buttons {
  display: flex;
  gap: 0.5rem;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #1f2937;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .subscriptions-container {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .search-bar {
    flex-direction: column;
  }

  .filter-select,
  .search-input {
    width: 100%;
  }

  .search-button {
    width: auto;
    padding: 0.625rem 1rem;
  }

  .subscriptions-table {
    font-size: 0.8rem;
  }

  .subscriptions-table thead th,
  .subscriptions-table tbody td {
    padding: 0.75rem 0.625rem;
  }

  .pagination {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

@media (max-width: 640px) {
  .subscriptions-container {
    padding: 0.75rem;
  }

  .subscriptions-title {
    font-size: 1.5rem;
  }

  .subscriptions-table {
    font-size: 0.75rem;
  }

  .action-btn {
    width: 1.75rem;
    height: 1.75rem;
  }
}

/* Scrollbar Styling */
.subscriptions-table-wrapper::-webkit-scrollbar {
  height: 6px;
}

.subscriptions-table-wrapper::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.subscriptions-table-wrapper::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.subscriptions-table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
