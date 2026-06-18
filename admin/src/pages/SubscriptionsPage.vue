<template>
  <div class="subscriptions-container">
    <!-- Header -->
    <div class="subscriptions-header">
      <div>
        <h1 class="subscriptions-title">Newsletter Subscriptions</h1>
        <p class="subscriptions-subtitle">Manage newsletter subscribers and email subscribers</p>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-label">Total Subscribers</p>
          <p class="stat-value">{{ total }}</p>
        </div>
        <div class="stat-icon default">
          <i class="pi pi-users"></i>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-label">Confirmed</p>
          <p class="stat-value">{{ confirmedCount }}</p>
        </div>
        <div class="stat-icon confirmed">
          <i class="pi pi-check"></i>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-label">Pending</p>
          <p class="stat-value">{{ pendingCount }}</p>
        </div>
        <div class="stat-icon pending">
          <i class="pi pi-clock"></i>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-label">Unsubscribed</p>
          <p class="stat-value">{{ unsubscribedCount }}</p>
        </div>
        <div class="stat-icon unsubscribed">
          <i class="pi pi-times"></i>
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
        <!-- Search & Filter Bar -->
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
          <button class="search-button" @click="fetchSubscribers" title="Search">
            <i class="pi pi-search"></i>
          </button>
        </div>

        <!-- Responsive Table -->
        <div class="table-scroll">
          <table class="subscriptions-table">
            <thead>
              <tr>
                <th>Email</th>
                <th class="hidden sm:table-cell">Source</th>
                <th>Status</th>
                <th class="hidden md:table-cell">Subscribed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id" class="subscription-row">
                <!-- Email Column -->
                <td class="cell-email">
                  <div class="email-cell">
                    <div class="email-avatar">{{ row.email.charAt(0).toUpperCase() }}</div>
                    <div class="email-info">
                      <code class="email-address">{{ row.email }}</code>
                      <p class="email-source sm:hidden">{{ row.source }}</p>
                    </div>
                  </div>
                </td>

                <!-- Source Column (hidden on mobile) -->
                <td class="cell-source hidden sm:table-cell">
                  <span class="source-badge">{{ row.source }}</span>
                </td>

                <!-- Status Column -->
                <td class="cell-status">
                  <span :class="['status-badge', `status-${row.status.toLowerCase()}`]">
                    {{ row.status }}
                  </span>
                </td>

                <!-- Subscribed Date (hidden on mobile) -->
                <td class="cell-date hidden md:table-cell">
                  <span class="date-text">{{ formatDate(row.subscribedAt) }}</span>
                </td>

                <!-- Actions Column -->
                <td class="cell-actions">
                  <div class="action-buttons">
                    <button
                      class="action-btn delete-btn"
                      @click="deleteSubscriber(row)"
                      title="Delete"
                    >
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="rows.length === 0" class="empty-state">
          <i class="pi pi-inbox"></i>
          <h3>No subscribers yet</h3>
          <p>Newsletter subscribers will appear here</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '@/services/api'
import SkeletonCard from '@/components/SkeletonCard.vue'

interface Subscriber {
  id: number
  email: string
  source: string
  status: string
  subscribedAt: string
  confirmedAt?: string
}

const rows = ref<Subscriber[]>([])
const loading = ref(false)
const search = ref('')
const sourceFilter = ref('')

const total = computed(() => rows.value.length)
const confirmedCount = computed(() => rows.value.filter(r => r.status === 'Confirmed').length)
const pendingCount = computed(() => rows.value.filter(r => r.status === 'Pending').length)
const unsubscribedCount = computed(() => rows.value.filter(r => r.status === 'Unsubscribed').length)

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function fetchSubscribers() {
  loading.value = true
  try {
    const params: any = {}
    if (search.value) params.search = search.value
    if (sourceFilter.value) params.source = sourceFilter.value

    const response = await api.get('/newsletter-subscribers', { params })
    rows.value = response.data.data || response.data || []
  } catch (error: any) {
    rows.value = []
  } finally {
    loading.value = false
  }
}

async function deleteSubscriber(subscriber: Subscriber) {
  if (!confirm(`Delete subscriber ${subscriber.email}? This cannot be undone.`)) return

  try {
    await api.delete(`/newsletter-subscribers/${subscriber.id}`)
    await fetchSubscribers()
  } catch (error: any) {
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
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0.5rem 0 0 0;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-left: 1rem;
}

.stat-icon.default {
  background: #eff6ff;
  color: #0369a1;
}

.stat-icon.confirmed {
  background: #ecfdf5;
  color: #065f46;
}

.stat-icon.pending {
  background: #fffbeb;
  color: #92400e;
}

.stat-icon.unsubscribed {
  background: #fef2f2;
  color: #7f1d1d;
}

/* Content Area */
.subscriptions-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.subscriptions-loading {
  padding: 2rem;
}

/* Search Bar */
.search-bar {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
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

/* Table Wrapper */
.table-scroll {
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

/* Email Column */
.cell-email {
  min-width: 200px;
}

.email-cell {
  display: flex;
  align-items: flex-start;
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

.email-info {
  min-width: 0;
  flex: 1;
}

.email-address {
  display: block;
  padding: 0.375rem 0.5rem;
  background-color: #f3f4f6;
  color: #374151;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email-source {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

/* Source Column */
.cell-source {
  min-width: 110px;
}

.source-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  color: #0369a1;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #bae6fd;
}

/* Status Column */
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
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #7f1d1d;
  border-color: #fecaca;
}

/* Date Column */
.cell-date {
  min-width: 100px;
}

.date-text {
  color: #6b7280;
  font-size: 0.8rem;
}

/* Actions Column */
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

.delete-btn {
  background-color: #fee2e2;
  color: #7f1d1d;
}

.delete-btn:hover {
  background-color: #fecaca;
  color: #7f1d1d;
}

/* Empty State */
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

/* Responsive Design */
@media (max-width: 768px) {
  .subscriptions-container {
    padding: 1rem;
  }

  .subscriptions-title {
    font-size: 1.5rem;
  }

  .subscriptions-subtitle {
    font-size: 0.85rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    flex-direction: column;
    gap: 1rem;
  }

  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    margin-left: 0;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .search-bar {
    padding: 0.75rem;
    gap: 0.375rem;
  }

  .search-input {
    min-width: 150px;
    font-size: 0.8rem;
  }

  .subscriptions-table thead th {
    padding: 0.75rem 0.625rem;
    font-size: 0.8rem;
  }

  .subscriptions-table tbody td {
    padding: 0.75rem 0.625rem;
    font-size: 0.8rem;
  }

  .search-button {
    width: 2.25rem;
    height: 2.25rem;
  }
}

@media (max-width: 640px) {
  .subscriptions-container {
    padding: 0.75rem;
  }

  .subscriptions-title {
    font-size: 1.25rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    gap: 0.75rem;
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .search-bar {
    padding: 0.5rem;
    flex-wrap: nowrap;
    gap: 0.25rem;
  }

  .search-input,
  .filter-select {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }

  .search-button {
    width: 2rem;
    height: 2rem;
  }

  .subscriptions-table {
    font-size: 0.75rem;
  }

  .subscriptions-table thead th {
    padding: 0.5rem 0.375rem;
  }

  .subscriptions-table tbody td {
    padding: 0.5rem 0.375rem;
  }

  .email-avatar {
    width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }

  .action-btn {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.7rem;
  }
}

/* Scrollbar Styling */
.table-scroll::-webkit-scrollbar {
  height: 6px;
}

.table-scroll::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.table-scroll::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.table-scroll::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
