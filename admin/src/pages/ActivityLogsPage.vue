<template>
  <div class="activity-logs-container">
    <!-- Header -->
    <div class="logs-header">
      <div>
        <h1 class="logs-title">Activity Logs</h1>
        <p class="logs-subtitle">Track all actions and changes across the system</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="logs-content">
      <!-- Loading State -->
      <div v-if="logs.length === 0" class="logs-loading">
        <SkeletonCard type="table-row" :count="8" />
      </div>

      <!-- Logs Table -->
      <div v-else class="logs-table-wrapper">
        <table class="logs-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Action</th>
              <th>User</th>
              <th>Related</th>
              <th>IP Address</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id" class="log-row">
              <td class="cell-date">
                <div class="date-badge">
                  <i class="pi pi-calendar text-blue-500"></i>
                  {{ formatDate(log.created_at) }}
                </div>
              </td>
              <td class="cell-action">
                <span :class="['action-badge', badgeClass(log)]">
                  {{ displayAction(log) }}
                </span>
              </td>
              <td class="cell-user">
                <div class="user-info">
                  <div class="user-avatar">{{ displayUser(log).charAt(0) }}</div>
                  <div class="user-details">
                    <div class="user-name">{{ displayUser(log) }}</div>
                  </div>
                </div>
              </td>
              <td class="cell-related">
                <span class="related-badge">{{ displayRelated(log) || '-' }}</span>
              </td>
              <td class="cell-ip">
                <code class="ip-code">{{ log.ip_address || log.ip || '-' }}</code>
              </td>
              <td class="cell-details">
                <button
                  class="preview-button"
                  @click="select(log)"
                  title="View full details"
                >
                  <i class="pi pi-eye"></i>
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="selected" class="modal-overlay" @click="selected = null">
      <div class="modal-container" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header">
          <div>
            <h2 class="modal-title">Activity Details</h2>
            <div class="modal-subtitle">
              <span :class="['action-badge', badgeClass(selected)]">
                {{ displayAction(selected) }}
              </span>
            </div>
          </div>
          <button class="modal-close" @click="selected = null">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <!-- Summary Section -->
          <div class="summary-grid">
            <div class="summary-item">
              <label class="summary-label">Date & Time</label>
              <p class="summary-value">{{ new Date(selected.created_at).toLocaleString() }}</p>
            </div>
            <div class="summary-item">
              <label class="summary-label">User</label>
              <p class="summary-value">{{ displayUser(selected) }}</p>
            </div>
            <div class="summary-item">
              <label class="summary-label">IP Address</label>
              <p class="summary-value"><code>{{ selected.ip_address || selected.ip || '-' }}</code></p>
            </div>
            <div class="summary-item">
              <label class="summary-label">Related Entity</label>
              <p class="summary-value">{{ displayRelated(selected) || '-' }}</p>
            </div>
          </div>

          <!-- JSON Details Section -->
          <div class="details-section">
            <h3 class="section-title">Full Details</h3>
            <div class="json-viewer">
              <pre>{{ pretty(selected) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { api } from '@/services/api'
import SkeletonCard from '@/components/SkeletonCard.vue'


const logs = ref([])
const selected = ref(null)

function select(l) { selected.value = l }

let pollInterval

async function load() {
  try {
    const useDebug = import.meta.env.DEV
    const path = useDebug ? '/api/admin/debug/activity-logs' : '/api/v1/admin/activity-logs'
    const res = await axios.get(apiBase() + path)
    logs.value = res.data.data ?? res.data
  } catch (e) {
    console.error('Failed to load activity logs', e)
    logs.value = []
  }
}

onMounted(() => {
  load()
  pollInterval = setInterval(load, 10000)
  trySubscribeRealtime(load)
})

onBeforeUnmount(() => {
  if (pollInterval) clearInterval(pollInterval)
})

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function pretty(l: any) {
  try {
    if (l.old_value || l.new_value) return JSON.stringify({ old: l.old_value, new: l.new_value }, null, 2)
    if (l.properties) return JSON.stringify(typeof l.properties === 'string' ? JSON.parse(l.properties) : l.properties, null, 2)
    return JSON.stringify(l, null, 2)
  } catch (e) { return '' }
}

function displayAction(l: any) {
  return l.action || l.event || '(unknown)'
}

function displayUser(l: any) {
  const name = l.user_name || (l.properties && (l.properties.causer_name || (typeof l.properties === 'string' ? (JSON.parse(l.properties).causer_name || null) : null)))
  const role = l.user_role || (l.properties && (l.properties.causer_role || null))
  return (name ? name : 'System') + (role ? ` (${role})` : '')
}

function displayRelated(l: any) {
  const type = l.related_type || l.subject_type || ''
  const id = l.related_id || l.subject_id || ''
  return `${type ? type : '#'} ${id ? `#${id}` : ''}`.trim()
}

function badgeClass(l: any) {
  const action = (l.action || l.event || '').toLowerCase()
  if (action.includes('created') || action.includes('submitted') || action.includes('uploaded')) {
    return 'success'
  }
  if (action.includes('deleted') || action.includes('rejected')) {
    return 'danger'
  }
  if (action.includes('approved') || action.includes('published')) {
    return 'primary'
  }
  if (action.includes('login') || action.includes('logout')) {
    return 'warning'
  }
  return 'muted'
}

// realtime subscription helper for the other SPA (Echo optional)
let echo2: any
async function trySubscribeRealtime(loadFn: () => void) {
  try {
    if (!window.Echo) {
      const Echo = (await import('laravel-echo')).default
      const Pusher = (await import('pusher-js')).default
      echo2 = new Echo({ broadcaster: 'pusher', key: import.meta.env.VITE_PUSHER_KEY || 'local', wsHost: import.meta.env.VITE_ECHO_HOST || window.location.hostname, wsPort: import.meta.env.VITE_ECHO_PORT || 6001, forceTLS: false, disableStats: true, enabledTransports: ['ws', 'wss'], client: Pusher })
      window.Echo = echo2
    }
    window.Echo.channel('activity-logs').listen('ActivityLogged', (e: any) => loadFn())
  } catch (e) {}
}
</script>

<style scoped>
.activity-logs-container {
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%);
}

/* Header */
.logs-header {
  margin-bottom: 2rem;
}

.logs-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.logs-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

/* Main Content Area */
.logs-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.logs-loading {
  padding: 2rem;
}

/* Table Wrapper and Styles */
.logs-table-wrapper {
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.logs-table thead {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 2px solid #e5e7eb;
}

.logs-table thead th {
  padding: 1rem 1.25rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.025em;
  white-space: nowrap;
  user-select: none;
}

.logs-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.15s ease;
}

.logs-table tbody tr:hover {
  background-color: #f9fafb;
}

.logs-table tbody td {
  padding: 1rem 1.25rem;
  vertical-align: middle;
}

/* Cell Specific Styles */
.cell-date {
  min-width: 150px;
}

.date-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;
  font-size: 0.85rem;
  font-weight: 500;
}

.date-badge i {
  font-size: 0.875rem;
  opacity: 0.7;
}

.cell-action {
  min-width: 120px;
}

.action-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.action-badge.success {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.action-badge.danger {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #7f1d1d;
  border: 1px solid #fecaca;
}

.action-badge.primary {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1e3a8a;
  border: 1px solid #bfdbfe;
}

.action-badge.warning {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: #92400e;
  border: 1px solid #fde68a;
}

.action-badge.muted {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  border: 1px solid #d1d5db;
}

.cell-user {
  min-width: 160px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.user-details {
  min-width: 0;
}

.user-name {
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-related {
  min-width: 120px;
}

.related-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background-color: #f0f9ff;
  color: #0369a1;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #bae6fd;
  white-space: nowrap;
}

.cell-ip {
  min-width: 130px;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
}

.ip-code {
  display: block;
  padding: 0.375rem 0.5rem;
  background-color: #f3f4f6;
  color: #374151;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-details {
  min-width: 100px;
}

.preview-button {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
}

.preview-button:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

.preview-button:active {
  transform: translateY(0);
}

.preview-button i {
  font-size: 0.75rem;
}

/* Modal Overlay */
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: white;
  border-radius: 0.75rem;
  max-width: 42rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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

/* Modal Header */
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  gap: 1rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.modal-subtitle {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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
  transition: all 0.2s ease;
  border-radius: 0.375rem;
  flex-shrink: 0;
}

.modal-close:hover {
  background-color: #f0f0f0;
  color: #1f2937;
}

/* Modal Body */
.modal-body {
  padding: 1.5rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.summary-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  user-select: none;
}

.summary-value {
  font-size: 0.95rem;
  color: #1f2937;
  margin: 0;
  font-weight: 500;
  word-break: break-word;
}

.summary-value code {
  display: block;
  padding: 0.375rem 0.5rem;
  background-color: #f3f4f6;
  color: #374151;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  margin-top: 0.25rem;
  overflow-x: auto;
}

.details-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.json-viewer {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  border: 1px solid #374151;
}

.json-viewer pre {
  margin: 0;
  color: #f0f9ff;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Responsive */
@media (max-width: 768px) {
  .activity-logs-container {
    padding: 1rem;
  }

  .logs-title {
    font-size: 1.5rem;
  }

  .logs-table {
    font-size: 0.8rem;
  }

  .logs-table thead th,
  .logs-table tbody td {
    padding: 0.75rem 0.625rem;
  }

  .modal-container {
    max-height: 95vh;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .logs-table thead th:nth-child(n + 5),
  .logs-table tbody td:nth-child(n + 5) {
    font-size: 0.75rem;
  }
}

@media (max-width: 640px) {
  .activity-logs-container {
    padding: 0.75rem;
  }

  .logs-title {
    font-size: 1.25rem;
  }

  .logs-subtitle {
    font-size: 0.85rem;
  }

  .logs-table {
    font-size: 0.75rem;
  }

  .logs-table thead th,
  .logs-table tbody td {
    padding: 0.5rem 0.375rem;
  }

  .user-avatar {
    width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .summary-grid {
    gap: 1rem;
  }
}

/* Scrollbar Styling */
.logs-table-wrapper::-webkit-scrollbar {
  height: 6px;
}

.logs-table-wrapper::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.logs-table-wrapper::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.logs-table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.modal-container::-webkit-scrollbar {
  width: 6px;
}

.modal-container::-webkit-scrollbar-track {
  background: transparent;
}

.modal-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.modal-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.json-viewer::-webkit-scrollbar {
  height: 6px;
}

.json-viewer::-webkit-scrollbar-track {
  background: transparent;
}

.json-viewer::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 3px;
}

.json-viewer::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
