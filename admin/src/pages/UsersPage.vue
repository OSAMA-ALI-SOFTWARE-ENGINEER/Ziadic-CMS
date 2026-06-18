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
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="user-row"
              draggable="true"
              @dragstart="dragStart($event, user)"
              @dragover="dragOver"
              @drop="dropUser($event, user)"
              @dragend="dragEnd"
              :class="{ 'dragging': draggedUser?.id === user.id }"
            >
              <td class="cell-name">
                <div class="user-cell">
                  <div class="drag-handle" title="Drag to reorder">
                    <i class="pi pi-bars"></i>
                  </div>
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
                  <button
                    class="action-btn delete-btn"
                    @click="deleteUser(user)"
                    title="Delete user"
                    :disabled="user.role === 'super-admin'"
                    :class="{ 'disabled': user.role === 'super-admin' }"
                  >
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

          <div class="form-group">
            <label class="form-label">Password {{ selectedUser.id ? '(leave blank to keep current)' : '*' }}</label>
            <input
              v-model="selectedUser.password"
              type="password"
              class="form-input"
              placeholder="••••••••"
              :required="!selectedUser.id"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Role *</label>
              <select v-model="selectedUser.role" class="form-input" required :disabled="rolesLoading">
                <option value="">{{ rolesLoading ? 'Loading roles...' : 'Select role' }}</option>
                <option v-for="role in roles" :key="role.id" :value="role.name">
                  {{ role.label }}
                </option>
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
import { useUiStore } from '@/stores/ui'
import SkeletonCard from '@/components/SkeletonCard.vue'

const ui = useUiStore()

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
  created_at: string
  password?: string
}

const users = ref<User[]>([])
const selectedUser = ref<User | null>(null)
const loading = ref(false)
const isSaving = ref(false)
const searchQuery = ref('')
const draggedUser = ref<User | null>(null)
const roles = ref<Array<{ id: number; name: string; label: string }>>([])
const rolesLoading = ref(false)

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
    let usersData = response.data.data || response.data
    if (!Array.isArray(usersData)) {
      usersData = []
    }
    users.value = usersData
  } catch (error: any) {
    users.value = []
  } finally {
    loading.value = false
  }
}

async function loadRoles() {
  rolesLoading.value = true
  try {
    const response = await api.get('/roles-list')
    let rolesData = response.data || []
    if (!Array.isArray(rolesData)) {
      rolesData = []
    }
    roles.value = rolesData
  } catch (error: any) {
    roles.value = []
  } finally {
    rolesLoading.value = false
  }
}

function openUser(user?: User) {
  selectedUser.value = user
    ? { ...user, password: '' }
    : { id: 0, name: '', email: '', password: '', role: 'client', status: 'active', created_at: new Date().toISOString() }
}

async function saveUser() {
  if (!selectedUser.value) return
  isSaving.value = true

  try {
    const isNew = !selectedUser.value.id
    const payload = isNew
      ? {
          name: selectedUser.value.name,
          email: selectedUser.value.email,
          password: selectedUser.value.password || undefined,
          role: selectedUser.value.role,
          status: selectedUser.value.status,
        }
      : {
          name: selectedUser.value.name,
          email: selectedUser.value.email,
          role: selectedUser.value.role,
          status: selectedUser.value.status,
          ...(selectedUser.value.password && { password: selectedUser.value.password }),
        }

    if (isNew) {
      await api.post('/users', payload)
      ui.pushToast('User created successfully', 'success')
    } else {
      await api.put(`/users/${selectedUser.value.id}`, payload)
      ui.pushToast('User updated successfully', 'success')
    }
    selectedUser.value = null
    await loadUsers()
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.response?.data?.errors?.role?.[0] || 'Failed to save user'
    ui.pushToast(errorMessage, 'danger')
  } finally {
    isSaving.value = false
  }
}

async function deleteUser(user: User) {
  if (user.role === 'super-admin') {
    ui.pushToast('Cannot delete super admin users', 'warning')
    return
  }
  if (!confirm(`Delete user ${user.name}? This cannot be undone.`)) return

  try {
    await api.delete(`/users/${user.id}`)
    ui.pushToast('User deleted successfully', 'success')
    await loadUsers()
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to delete user'
    ui.pushToast(errorMessage, 'danger')
  }
}

function dragStart(event: DragEvent, user: User) {
  draggedUser.value = user
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function dragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function dropUser(event: DragEvent, targetUser: User) {
  event.preventDefault()
  if (!draggedUser.value || draggedUser.value.id === targetUser.id) {
    draggedUser.value = null
    return
  }

  const usersCopy = [...users.value]
  const draggedIdx = usersCopy.findIndex(u => u.id === draggedUser.value!.id)
  const targetIdx = usersCopy.findIndex(u => u.id === targetUser.id)

  if (draggedIdx !== -1 && targetIdx !== -1) {
    [usersCopy[draggedIdx], usersCopy[targetIdx]] = [
      usersCopy[targetIdx],
      usersCopy[draggedIdx]
    ]
    users.value = usersCopy
  }

  draggedUser.value = null
}

function dragEnd() {
  draggedUser.value = null
}

onMounted(() => {
  loadUsers()
  loadRoles()
})
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

.users-table tbody tr[draggable="true"] {
  cursor: move;
}

.users-table tbody tr.dragging {
  opacity: 0.5;
  background-color: #f0f9ff;
}

.drag-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  color: #9ca3af;
  cursor: grab;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.drag-handle:hover {
  color: #6b7280;
}

.drag-handle:active {
  cursor: grabbing;
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

.delete-btn:hover:not(:disabled) {
  background-color: #fecaca;
  color: #7f1d1d;
}

.delete-btn:disabled,
.delete-btn.disabled {
  background-color: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.5;
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

/* Responsive Design */
@media (max-width: 1024px) {
  .users-container {
    padding: 1.25rem;
  }

  .users-header {
    gap: 0.875rem;
  }

  .users-title {
    font-size: 1.625rem;
  }

  .users-subtitle {
    font-size: 0.9rem;
  }

  .add-user-button {
    padding: 0.6rem 1.125rem;
    font-size: 0.85rem;
  }

  .users-table {
    font-size: 0.825rem;
  }

  .users-table thead th,
  .users-table tbody td {
    padding: 0.875rem 1rem;
  }

  .cell-name {
    min-width: 160px;
  }

  .cell-email {
    min-width: 180px;
  }

  .user-avatar {
    width: 2.25rem;
    height: 2.25rem;
  }

  .form-row {
    grid-template-columns: 1fr 1fr;
  }

  .modal-container {
    max-width: 26rem;
  }
}

@media (max-width: 768px) {
  .users-container {
    padding: 1rem;
  }

  .users-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .users-title {
    font-size: 1.375rem;
  }

  .users-subtitle {
    font-size: 0.85rem;
  }

  .add-user-button {
    width: 100%;
    justify-content: center;
    padding: 0.6rem 1rem;
    font-size: 0.875rem;
  }

  .search-bar {
    padding: 0.875rem 1rem;
  }

  .search-input {
    padding: 0.5rem 0.875rem;
    font-size: 0.8rem;
  }

  .search-button {
    width: 2.25rem;
    height: 2.25rem;
  }

  .users-table {
    font-size: 0.8rem;
  }

  .users-table thead th,
  .users-table tbody td {
    padding: 0.625rem 0.5rem;
  }

  .cell-name {
    min-width: 140px;
  }

  .cell-email {
    min-width: 150px;
    display: none;
  }

  .users-table thead th:nth-child(2),
  .users-table tbody td:nth-child(2) {
    display: none;
  }

  .cell-date {
    min-width: 80px;
    font-size: 0.75rem;
  }

  .cell-actions {
    min-width: 80px;
  }

  .action-btn {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.75rem;
  }

  .user-avatar {
    width: 2rem;
    height: 2rem;
    font-size: 0.8rem;
  }

  .email-code {
    font-size: 0.75rem;
  }

  .role-badge {
    font-size: 0.75rem;
    padding: 0.3rem 0.625rem;
  }

  .status-badge {
    font-size: 0.75rem;
    padding: 0.3rem 0.625rem;
  }

  .empty-state {
    padding: 2.5rem 1rem;
  }

  .empty-state i {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }

  .empty-state h3 {
    font-size: 1rem;
  }

  .empty-state p {
    font-size: 0.8rem;
  }

  .modal-container {
    max-width: 24rem;
  }

  .modal-header {
    padding: 1.25rem;
  }

  .modal-title {
    font-size: 1.125rem;
  }

  .modal-body {
    padding: 1.25rem;
    gap: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-label {
    font-size: 0.8rem;
  }

  .form-input {
    padding: 0.5rem 0.875rem;
    font-size: 0.8rem;
  }

  .form-actions {
    gap: 0.75rem;
    padding-top: 0.375rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.5rem 1.25rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 640px) {
  .users-container {
    padding: 0.75rem;
  }

  .users-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .users-title {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
  }

  .users-subtitle {
    font-size: 0.75rem;
    line-height: 1.3;
  }

  .add-user-button {
    width: 100%;
    justify-content: center;
    padding: 0.5rem 0.875rem;
    font-size: 0.8rem;
  }

  .users-content {
    border-radius: 0.5rem;
  }

  .search-bar {
    flex-direction: column;
    gap: 0.375rem;
    padding: 0.75rem;
  }

  .search-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

  .search-button {
    width: 100%;
    height: auto;
    padding: 0.5rem;
  }

  .users-table {
    font-size: 0.75rem;
  }

  .users-table thead {
    display: none;
  }

  .users-table tbody tr {
    display: block;
    margin-bottom: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    padding: 0.75rem;
    background: white;
  }

  .users-table tbody td {
    display: block;
    padding: 0.375rem 0;
    border: none;
    text-align: left;
  }

  .users-table tbody td::before {
    content: attr(data-label);
    font-weight: 600;
    margin-right: 0.5rem;
    display: inline;
  }

  .cell-name::before { content: "Name: "; }
  .cell-email::before { content: "Email: "; display: inline; }
  .cell-role::before { content: "Role: "; }
  .cell-status::before { content: "Status: "; }
  .cell-date::before { content: "Joined: "; }
  .cell-actions::before { content: ""; }

  .users-table tbody td:nth-child(2) {
    display: block;
  }

  .users-table tbody tr:hover {
    background-color: white;
  }

  .cell-name {
    min-width: auto;
    padding-bottom: 0.5rem;
    margin-bottom: 0.25rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .user-cell {
    gap: 0.5rem;
  }

  .user-avatar {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.7rem;
  }

  .user-name {
    font-size: 0.85rem;
  }

  .cell-email {
    padding: 0.5rem 0;
  }

  .email-code {
    padding: 0.25rem 0.375rem;
    font-size: 0.7rem;
  }

  .cell-role {
    min-width: auto;
    padding: 0.375rem 0;
  }

  .role-badge {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }

  .cell-status {
    min-width: auto;
    padding: 0.375rem 0;
  }

  .status-badge {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }

  .cell-date {
    min-width: auto;
    padding: 0.375rem 0;
    font-size: 0.75rem;
  }

  .cell-actions {
    min-width: auto;
    padding: 0.5rem 0;
    text-align: left;
    border-top: 1px solid #f0f0f0;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
  }

  .action-buttons {
    justify-content: flex-start;
    gap: 0.375rem;
  }

  .action-btn {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.65rem;
  }

  .empty-state {
    padding: 2rem 0.75rem;
  }

  .empty-state i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .empty-state h3 {
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
  }

  .empty-state p {
    font-size: 0.75rem;
  }

  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0.5rem;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-title {
    font-size: 1rem;
  }

  .modal-close {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 1.125rem;
  }

  .modal-body {
    padding: 1rem;
    gap: 0.75rem;
  }

  .form-group {
    gap: 0.375rem;
  }

  .form-row {
    gap: 0.75rem;
  }

  .form-label {
    font-size: 0.75rem;
    font-weight: 600;
  }

  .form-input {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
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
