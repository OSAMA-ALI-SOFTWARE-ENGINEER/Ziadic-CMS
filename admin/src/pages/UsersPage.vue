<template>
  <div class="users-container">
    <!-- Header -->
    <div class="users-header">
      <div>
        <h1 class="users-title">Users Management</h1>
        <p class="users-subtitle">Manage team members and assign roles with Spatie permissions</p>
      </div>
      <button class="add-user-button" @click="openUser()">
        <i class="pi pi-user-plus"></i>
        Add User
      </button>
    </div>

    <!-- Main Content -->
    <div class="users-content">
      <!-- Loading State -->
      <div v-if="loading && users.length === 0" class="users-loading">
        <SkeletonCard type="table-row" :count="8" />
      </div>

      <!-- Users Table -->
      <div v-else class="users-table-wrapper">
        <!-- Search Bar -->
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name or email..."
            class="search-input"
            @keyup.enter="loadUsers"
          />
          <button class="search-button" @click="loadUsers">
            <i class="pi pi-search"></i>
          </button>
        </div>

        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
              <td class="cell-name">
                <div class="user-cell">
                  <div class="user-avatar">{{ user.name.charAt(0) }}</div>
                  <div class="user-info">
                    <div class="user-name">{{ user.name }}</div>
                  </div>
                </div>
              </td>
              <td class="cell-email">
                <code class="email-code">{{ user.email }}</code>
              </td>
              <td class="cell-role">
                <span class="role-badge">{{ user.role }}</span>
              </td>
              <td class="cell-status">
                <span :class="['status-badge', `status-${user.status.toLowerCase()}`]">
                  {{ user.status }}
                </span>
              </td>
              <td class="cell-date">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="cell-actions">
                <div class="action-buttons">
                  <button class="action-btn edit-btn" @click="openUser(user)" title="Edit user">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button class="action-btn delete-btn" @click="deleteUser(user)" title="Delete user">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="users.length === 0" class="empty-state">
          <i class="pi pi-users"></i>
          <h3>No users yet</h3>
          <p>Create your first user to get started</p>
        </div>
      </div>
    </div>

    <!-- User Modal -->
    <div v-if="selectedUser" class="modal-overlay" @click="selectedUser = null">
      <div class="modal-container" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header">
          <h2 class="modal-title">{{ selectedUser.id ? 'Edit User' : 'Create User' }}</h2>
          <button class="modal-close" @click="selectedUser = null">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <form class="modal-body" @submit.prevent="saveUser">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input
              v-model="selectedUser.name"
              type="text"
              class="form-input"
              placeholder="John Doe"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email *</label>
            <input
              v-model="selectedUser.email"
              type="email"
              class="form-input"
              placeholder="john@example.com"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Role *</label>
              <select v-model="selectedUser.role" class="form-input" required>
                <option value="">Select role</option>
                <option value="super-admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="client">Client</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Status *</label>
              <select v-model="selectedUser.status" class="form-input" required>
                <option value="">Select status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="selectedUser = null">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/api'
import SkeletonCard from '@/components/SkeletonCard.vue'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
  created_at: string
}

const users = ref<User[]>([])
const selectedUser = ref<User | null>(null)
const loading = ref(false)
const isSaving = ref(false)
const searchQuery = ref('')

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
})

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function loadUsers() {
  loading.value = true
  try {
    const response = await api.get('/users', {
      params: searchQuery.value ? { search: searchQuery.value } : {}
    })
    users.value = response.data.data || response.data || []
  } catch (error: any) {
    users.value = []
  } finally {
    loading.value = false
  }
}

function openUser(user?: User) {
  selectedUser.value = user
    ? { ...user }
    : { id: 0, name: '', email: '', role: 'client', status: 'active', created_at: new Date().toISOString() }
}

async function saveUser() {
  if (!selectedUser.value) return
  isSaving.value = true

  try {
    const isNew = !selectedUser.value.id
    if (isNew) {
      await api.post('/users', selectedUser.value)
    } else {
      await api.put(`/users/${selectedUser.value.id}`, selectedUser.value)
    }
    selectedUser.value = null
    await loadUsers()
  } catch (error: any) {
    selectedUser.value = null
  } finally {
    isSaving.value = false
  }
}

async function deleteUser(user: User) {
  if (!confirm(`Delete user ${user.name}? This cannot be undone.`)) return

  try {
    await api.delete(`/users/${user.id}`)
    await loadUsers()
  } catch (error: any) {
  }
}

onMounted(loadUsers)
</script>

<style scoped>
.users-container {
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%);
}

/* Header */
.users-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.users-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.users-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.add-user-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  white-space: nowrap;
}

.add-user-button:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

/* Content Area */
.users-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.users-loading {
  padding: 2rem;
}

/* Search Bar */
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

/* Table */
.users-table-wrapper {
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.users-table thead {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 2px solid #e5e7eb;
}

.users-table thead th {
  padding: 1rem 1.25rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.025em;
  white-space: nowrap;
  user-select: none;
}

.users-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.15s ease;
}

.users-table tbody tr:hover {
  background-color: #f9fafb;
}

.users-table tbody td {
  padding: 1rem 1.25rem;
  vertical-align: middle;
}

/* Table Cells */
.cell-name {
  min-width: 180px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
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

.user-info {
  min-width: 0;
}

.user-name {
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-email {
  min-width: 200px;
}

.email-code {
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

.cell-role {
  min-width: 110px;
}

.role-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
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

.status-active {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #065f46;
  border-color: #a7f3d0;
}

.status-pending {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: #92400e;
  border-color: #fde68a;
}

.status-suspended {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #7f1d1d;
  border-color: #fecaca;
}

.cell-date {
  min-width: 100px;
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

.edit-btn {
  background-color: #e0e7ff;
  color: #3730a3;
}

.edit-btn:hover {
  background-color: #c7d2fe;
  color: #1f2d47;
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

/* Modal */
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
  max-width: 28rem;
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

/* Form */
.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}

.form-input {
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

.btn-primary {
  padding: 0.625rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.625rem 1.5rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

/* Responsive */
@media (max-width: 768px) {
  .users-container {
    padding: 1rem;
  }

  .users-header {
    flex-direction: column;
    align-items: stretch;
  }

  .add-user-button {
    width: 100%;
    justify-content: center;
  }

  .users-table {
    font-size: 0.8rem;
  }

  .users-table thead th,
  .users-table tbody td {
    padding: 0.75rem 0.625rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .users-container {
    padding: 0.75rem;
  }

  .users-title {
    font-size: 1.5rem;
  }

  .search-bar {
    flex-direction: column;
  }

  .search-button {
    width: auto;
    padding: 0.625rem 1rem;
  }

  .users-table {
    font-size: 0.75rem;
  }

  .action-buttons {
    flex-wrap: wrap;
  }

  .action-btn {
    width: 1.75rem;
    height: 1.75rem;
  }
}

/* Scrollbar Styling */
.users-table-wrapper::-webkit-scrollbar {
  height: 6px;
}

.users-table-wrapper::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.users-table-wrapper::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.users-table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
