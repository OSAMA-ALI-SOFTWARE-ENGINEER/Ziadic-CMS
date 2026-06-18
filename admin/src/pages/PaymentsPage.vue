<template>
  <div class="payments-container">
    <!-- Coming Soon Banner (When Disabled) -->
    <div v-if="!paymentsEnabled" class="coming-soon-section">
      <div class="coming-soon-banner">
        <div class="banner-content">
          <div class="banner-icon">
            <i class="pi pi-rocket"></i>
          </div>
          <div class="banner-text">
            <h2 class="banner-title">Payment Integration Coming Soon</h2>
            <p class="banner-description">
              We're integrating advanced payment processing, invoicing, and subscription management.
              This feature will be available soon with support for multiple payment gateways.
            </p>
            <div class="banner-features">
              <span class="feature-tag">
                <i class="pi pi-check"></i>
                Payment Processing
              </span>
              <span class="feature-tag">
                <i class="pi pi-check"></i>
                Invoicing
              </span>
              <span class="feature-tag">
                <i class="pi pi-check"></i>
                Subscriptions
              </span>
              <span class="feature-tag">
                <i class="pi pi-check"></i>
                Refunds
              </span>
            </div>
            <p class="banner-info">
              <strong>To Enable:</strong> Go to Settings → System Settings and enable "Payment Integration"
            </p>
          </div>
          <div class="banner-decoration">
            <div class="decoration-circle circle-1"></div>
            <div class="decoration-circle circle-2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Full Payments Interface (When Enabled) -->
    <template v-else>
      <!-- Header -->
      <div class="payments-header">
        <div>
          <h1 class="payments-title">Payments & Transactions</h1>
          <p class="payments-subtitle">Manage payments, invoices, and transaction history</p>
        </div>
        <div class="header-actions">
          <button class="action-button export-btn" @click="exportPayments">
            <i class="pi pi-download"></i>
            Export
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon revenue">
            <i class="pi pi-dollar"></i>
          </div>
          <div class="stat-info">
            <p class="stat-label">Total Revenue</p>
            <p class="stat-value">{{ formatCurrency(totalRevenue) }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon completed">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="stat-info">
            <p class="stat-label">Completed</p>
            <p class="stat-value">{{ completedCount }}</p>
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
          <div class="stat-icon failed">
            <i class="pi pi-exclamation-circle"></i>
          </div>
          <div class="stat-info">
            <p class="stat-label">Failed</p>
            <p class="stat-value">{{ failedCount }}</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="payments-content">
        <!-- Loading State -->
        <div v-if="loading && payments.length === 0" class="payments-loading">
          <SkeletonCard type="table-row" :count="8" />
        </div>

        <!-- Payments Table -->
        <div v-else class="payments-table-wrapper">
          <!-- Search & Filter -->
          <div class="search-bar">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by transaction ID or customer..."
              class="search-input"
              @keyup.enter="loadPayments"
            />
            <select v-model="statusFilter" class="filter-select" @change="loadPayments">
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <button class="search-button" @click="loadPayments">
              <i class="pi pi-search"></i>
            </button>
          </div>

          <table class="payments-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in filteredPayments" :key="payment.id" class="payment-row">
                <td class="cell-id">
                  <code class="tx-id">{{ payment.transaction_id }}</code>
                </td>
                <td class="cell-customer">
                  <div class="customer-info">
                    <div class="customer-avatar">{{ payment.customer_name.charAt(0) }}</div>
                    <div class="customer-details">
                      <div class="customer-name">{{ payment.customer_name }}</div>
                      <div class="customer-email">{{ payment.customer_email }}</div>
                    </div>
                  </div>
                </td>
                <td class="cell-amount">
                  <span class="amount-badge">{{ formatCurrency(payment.amount) }}</span>
                </td>
                <td class="cell-method">
                  <span class="method-chip">{{ payment.payment_method }}</span>
                </td>
                <td class="cell-status">
                  <span :class="['status-badge', `status-${payment.status}`]">
                    {{ payment.status }}
                  </span>
                </td>
                <td class="cell-date">
                  {{ formatDate(payment.created_at) }}
                </td>
                <td class="cell-actions">
                  <div class="action-buttons">
                    <button class="action-btn view-btn" @click="viewPayment(payment)" title="View details">
                      <i class="pi pi-eye"></i>
                    </button>
                    <button v-if="payment.status === 'pending'" class="action-btn refund-btn" @click="refundPayment(payment)" title="Refund">
                      <i class="pi pi-undo"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="payments.length === 0" class="empty-state">
            <i class="pi pi-inbox"></i>
            <h3>No payments yet</h3>
            <p>Payment transactions will appear here</p>
          </div>
        </div>
      </div>

      <!-- Payment Detail Modal -->
      <div v-if="selectedPayment" class="modal-overlay" @click="selectedPayment = null">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Payment Details</h2>
            <button class="modal-close" @click="selectedPayment = null">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="detail-grid">
              <div class="detail-item">
                <label>Transaction ID</label>
                <code>{{ selectedPayment.transaction_id }}</code>
              </div>
              <div class="detail-item">
                <label>Status</label>
                <span :class="['status-badge', `status-${selectedPayment.status}`]">
                  {{ selectedPayment.status }}
                </span>
              </div>
              <div class="detail-item">
                <label>Customer</label>
                <p>{{ selectedPayment.customer_name }}</p>
              </div>
              <div class="detail-item">
                <label>Email</label>
                <p>{{ selectedPayment.customer_email }}</p>
              </div>
              <div class="detail-item">
                <label>Amount</label>
                <p class="amount-value">{{ formatCurrency(selectedPayment.amount) }}</p>
              </div>
              <div class="detail-item">
                <label>Payment Method</label>
                <p>{{ selectedPayment.payment_method }}</p>
              </div>
              <div class="detail-item">
                <label>Date</label>
                <p>{{ formatDate(selectedPayment.created_at) }}</p>
              </div>
              <div class="detail-item">
                <label>Description</label>
                <p>{{ selectedPayment.description || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import SkeletonCard from '@/components/SkeletonCard.vue'

interface Payment {
  id: number
  transaction_id: string
  customer_name: string
  customer_email: string
  amount: number
  payment_method: string
  status: string
  description?: string
  created_at: string
}

function apiBase() {
  const backend = import.meta.env.VITE_BACKEND_URL
  if (backend) return backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return 'http://127.0.0.1:8000'
  return window.location.origin
}

const payments = ref<Payment[]>([])
const selectedPayment = ref<Payment | null>(null)
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const paymentsEnabled = ref(false)

const totalRevenue = computed(() =>
  payments.value.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
)

const completedCount = computed(() =>
  payments.value.filter(p => p.status === 'completed').length
)

const pendingCount = computed(() =>
  payments.value.filter(p => p.status === 'pending').length
)

const failedCount = computed(() =>
  payments.value.filter(p => p.status === 'failed').length
)

const filteredPayments = computed(() => {
  let filtered = payments.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p =>
      p.transaction_id.toLowerCase().includes(query) ||
      p.customer_name.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(p => p.status === statusFilter.value)
  }

  return filtered
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function checkPaymentsEnabled() {
  try {
    const response = await axios.get(`${apiBase()}/api/v1/admin/settings/payments-enabled`)
    paymentsEnabled.value = response.data?.enabled || false
  } catch (error: any) {
    paymentsEnabled.value = false
  }
}

async function loadPayments() {
  if (!paymentsEnabled.value) return

  loading.value = true
  try {
    const response = await axios.get(`${apiBase()}/api/v1/admin/payments`, {
      params: {
        ...(searchQuery.value && { search: searchQuery.value }),
        ...(statusFilter.value && { status: statusFilter.value })
      }
    })
    payments.value = response.data.data || response.data || []
  } catch (error: any) {
    payments.value = []
  } finally {
    loading.value = false
  }
}

function viewPayment(payment: Payment) {
  selectedPayment.value = payment
}

async function refundPayment(payment: Payment) {
  if (!confirm(`Refund $${payment.amount.toFixed(2)} for transaction ${payment.transaction_id}?`)) return

  try {
    await axios.post(`${apiBase()}/api/v1/admin/payments/${payment.id}/refund`)
    selectedPayment.value = null
    await loadPayments()
    alert('Refund processed successfully')
  } catch (error: any) {
    console.error('Failed to refund:', error)
    alert(error.response?.data?.message || 'Failed to process refund')
  }
}

function exportPayments() {
  const csv = [
    ['Transaction ID', 'Customer', 'Amount', 'Method', 'Status', 'Date'],
    ...payments.value.map(p => [
      p.transaction_id,
      p.customer_name,
      p.amount,
      p.payment_method,
      p.status,
      new Date(p.created_at).toLocaleString()
    ])
  ]
    .map(row => row.join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

onMounted(async () => {
  await checkPaymentsEnabled()
  if (paymentsEnabled.value) {
    await loadPayments()
  }
})
</script>

<style scoped>
.payments-container {
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%);
}

/* Coming Soon Banner */
.coming-soon-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
}

.coming-soon-banner {
  position: relative;
  width: 100%;
  max-width: 720px;
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.banner-content {
  position: relative;
  padding: 3rem 2rem;
  text-align: center;
  z-index: 1;
}

.banner-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  margin: 0 auto 2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
  font-size: 2rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.banner-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
  letter-spacing: -0.025em;
}

.banner-description {
  font-size: 1.0625rem;
  color: #6b7280;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.banner-features {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.feature-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  color: #0369a1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid #bae6fd;
}

.feature-tag i {
  font-size: 0.9rem;
  color: #0369a1;
}

.banner-info {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 0.75rem;
  border-left: 4px solid #ec4899;
}

.banner-info strong {
  color: #1f2937;
  font-weight: 600;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  opacity: 0.1;
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -150px;
  right: -100px;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -100px;
  left: -80px;
}

/* Full Payments Interface */
.payments-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.payments-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.payments-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.export-btn {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.2);
}

.export-btn:hover {
  background: linear-gradient(135deg, #db2777 0%, #be185d 100%);
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
}

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
  flex-shrink: 0;
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #16a34a;
}

.stat-icon.completed {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #0369a1;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.stat-icon.failed {
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

.payments-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.payments-loading {
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
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
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
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
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

.payments-table-wrapper {
  overflow-x: auto;
}

.payments-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.payments-table thead {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 2px solid #e5e7eb;
}

.payments-table thead th {
  padding: 1rem 1.25rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.025em;
}

.payments-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.15s ease;
}

.payments-table tbody tr:hover {
  background-color: #f9fafb;
}

.payments-table tbody td {
  padding: 1rem 1.25rem;
  vertical-align: middle;
}

.cell-id {
  min-width: 140px;
}

.tx-id {
  padding: 0.375rem 0.5rem;
  background: #f3f4f6;
  color: #374151;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
}

.cell-customer {
  min-width: 200px;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.customer-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.customer-details {
  min-width: 0;
}

.customer-name {
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.customer-email {
  font-size: 0.8rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-amount {
  min-width: 120px;
}

.amount-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.85rem;
}

.amount-value {
  font-weight: 700;
  color: #16a34a;
  margin: 0;
}

.cell-method {
  min-width: 100px;
}

.method-chip {
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

.status-completed {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #065f46;
  border-color: #a7f3d0;
}

.status-pending {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: #92400e;
  border-color: #fde68a;
}

.status-failed {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #7f1d1d;
  border-color: #fecaca;
}

.cell-date {
  min-width: 120px;
  color: #6b7280;
  font-size: 0.8rem;
}

.cell-actions {
  min-width: 100px;
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

.view-btn {
  background-color: #e0e7ff;
  color: #6366f1;
}

.view-btn:hover {
  background-color: #c7d2fe;
}

.refund-btn {
  background-color: #fee2e2;
  color: #991b1b;
}

.refund-btn:hover {
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: 0.75rem;
  max-width: 32rem;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 1.25rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: #f0f0f0;
  color: #1f2937;
}

.modal-body {
  padding: 1.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item label {
  font-weight: 600;
  font-size: 0.8rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-item p,
.detail-item code {
  margin: 0;
  color: #1f2937;
  font-size: 0.9rem;
  word-break: break-word;
}

.detail-item code {
  display: block;
  padding: 0.375rem 0.5rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .payments-container {
    padding: 1rem;
  }

  .coming-soon-section {
    min-height: auto;
  }

  .banner-content {
    padding: 2rem 1.5rem;
  }

  .banner-title {
    font-size: 1.5rem;
  }

  .payments-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    width: 100%;
  }

  .action-button {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .search-bar {
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }

  .search-button {
    width: auto;
    padding: 0.625rem 1rem;
  }

  .payments-table {
    font-size: 0.8rem;
  }

  .payments-table thead th,
  .payments-table tbody td {
    padding: 0.75rem 0.625rem;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .payments-container {
    padding: 0.75rem;
  }

  .banner-title {
    font-size: 1.25rem;
  }

  .payments-title {
    font-size: 1.5rem;
  }

  .payments-table {
    font-size: 0.75rem;
  }

  .action-btn {
    width: 1.75rem;
    height: 1.75rem;
  }
}
</style>
