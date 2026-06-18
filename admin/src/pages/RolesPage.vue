<template>
  <div class="roles-container">
    <!-- Header -->
    <div class="roles-header">
      <div>
        <h1 class="roles-title">Roles & Permissions</h1>
        <p class="roles-subtitle">Manage user roles and assign Spatie permissions</p>
      </div>
      <button class="add-role-button" @click="openRole()">
        <i class="pi pi-plus"></i>
        Add Role
      </button>
    </div>

    <div class="roles-content">
      <!-- Main Content -->
      <div class="roles-main">
        <!-- Loading State -->
        <div v-if="loading && roles.length === 0" class="roles-loading">
          <SkeletonCard type="table-row" :count="8" />
        </div>

        <!-- Roles Table -->
        <div v-else class="roles-table-wrapper">
          <!-- Search Bar -->
          <div class="search-bar">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by role name or status..."
              class="search-input"
              @keyup.enter="loadRoles"
            />
            <button class="search-button" @click="loadRoles">
              <i class="pi pi-search"></i>
            </button>
          </div>

          <table class="roles-table">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Users</th>
                <th>Permissions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="role in filteredRoles" :key="role.id" class="role-row">
                <td class="cell-name">
                  <div class="role-name-cell">
                    <div class="role-icon">
                      <i class="pi pi-shield"></i>
                    </div>
                    <div class="role-text">
                      <div class="role-title">{{ role.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="cell-users">
                  <span class="user-count">{{ role.user_count || 0 }}</span>
                </td>
                <td class="cell-permissions">
                  <span class="permission-chip">{{ (role.permissions || '').split(',').length }} permissions</span>
                </td>
                <td class="cell-status">
                  <span :class="['status-badge', `status-${(role.status || 'active').toLowerCase()}`]">
                    {{ role.status || 'active' }}
                  </span>
                </td>
                <td class="cell-actions">
                  <div class="action-buttons">
                    <button class="action-btn edit-btn" @click="openRole(role)" title="Edit role">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button class="action-btn delete-btn" @click="deleteRole(role)" title="Delete role">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="roles.length === 0" class="empty-state">
            <i class="pi pi-shield"></i>
            <h3>No roles yet</h3>
            <p>Create your first role to get started</p>
          </div>
        </div>
      </div>

      <!-- Permissions Sidebar -->
      <aside class="permissions-sidebar">
        <div class="sidebar-card">
          <h3 class="sidebar-title">
            <i class="pi pi-key"></i>
            Permission Groups
          </h3>
          <p class="sidebar-subtitle">Available permissions for role assignment</p>

          <div class="permissions-list">
            <div v-for="group in permissionGroups" :key="group" class="permission-item">
              <i class="pi pi-check-circle"></i>
              <span>{{ group }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Role Modal -->
    <div v-if="selectedRole" class="modal-overlay" @click="selectedRole = null">
      <div class="modal-container" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header">
          <h2 class="modal-title">{{ selectedRole.id ? 'Edit Role' : 'Create Role' }}</h2>
          <button class="modal-close" @click="selectedRole = null">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <form class="modal-body" @submit.prevent="saveRole">
          <div class="form-group">
            <label class="form-label">Role Name *</label>
            <input
              v-model="selectedRole.name"
              type="text"
              class="form-input"
              placeholder="e.g., Editor, Moderator"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Permissions</label>
            <textarea
              v-model="selectedRole.permissions"
              class="form-input form-textarea"
              placeholder="List permissions (comma-separated)"
              rows="6"
            ></textarea>
            <p class="form-hint">e.g., users.view,users.create,users.update,listings.approve</p>
          </div>

          <div class="form-group">
            <label class="form-label">Status *</label>
            <select v-model="selectedRole.status" class="form-input" required>
              <option value="">Select status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="system">System (Protected)</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="selectedRole = null">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Role' }}
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

interface Role {
  id: number
  name: string
  user_count?: number
  permissions: string
  status: string
}

const roles = ref<Role[]>([])
const selectedRole = ref<Role | null>(null)
const loading = ref(false)
const isSaving = ref(false)
const searchQuery = ref('')

const permissionGroups = [
  'users.view',
  'users.create',
  'users.update',
  'users.delete',
  'roles.manage',
  'listings.view',
  'listings.create',
  'listings.update',
  'listings.delete',
  'listings.approve',
  'listings.publish',
  'categories.manage',
  'content.manage',
  'blog.manage',
  'media.manage',
  'payments.view',
  'payments.refund',
  'settings.manage',
  'activity-logs.view',
]

const filteredRoles = computed(() => {
  if (!searchQuery.value) return roles.value
  const query = searchQuery.value.toLowerCase()
  return roles.value.filter(r => r.name.toLowerCase().includes(query))
})

async function loadRoles() {
  loading.value = true
  try {
    const response = await api.get('/roles', {
      params: searchQuery.value ? { search: searchQuery.value } : {}
    })
    console.log('[RolesPage] API Response:', response.data)
    // Handle paginated response: response.data.data contains the roles array
    let rolesData = response.data.data || response.data
    console.log('[RolesPage] Extracted roles data:', rolesData)
    // Ensure we have an array
    if (!Array.isArray(rolesData)) {
      console.warn('[RolesPage] Response is not an array, setting to empty')
      rolesData = []
    }
    // Filter out any null/undefined items
    rolesData = rolesData.filter((role: any) => role && role.id)
    console.log('[RolesPage] Final roles after filtering:', rolesData)
    roles.value = rolesData
  } catch (error: any) {
    console.error('[RolesPage] Failed to load roles:', error)
    roles.value = []
  } finally {
    loading.value = false
  }
}

function openRole(role?: Role) {
  selectedRole.value = role
    ? { ...role }
    : { id: 0, name: '', permissions: '', status: 'active', user_count: 0 }
}

async function saveRole() {
  if (!selectedRole.value) return
  isSaving.value = true

  try {
    const isNew = !selectedRole.value.id
    if (isNew) {
      await api.post('/roles', selectedRole.value)
    } else {
      await api.put(`/roles/${selectedRole.value.id}`, selectedRole.value)
    }
    selectedRole.value = null
    await loadRoles()
  } catch (error: any) {
    selectedRole.value = null
  } finally {
    isSaving.value = false
  }
}

async function deleteRole(role: Role) {
  if (!confirm(`Delete role ${role.name}? This cannot be undone.`)) return

  try {
    await api.delete(`/roles/${role.id}`)
    await loadRoles()
  } catch (error: any) {
  }
}

onMounted(loadRoles)
</script>

<style scoped>
.roles-container {
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%);
}

/* Header */
.roles-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.roles-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.roles-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.add-role-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
  white-space: nowrap;
}

.add-role-button:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  transform: translateY(-2px);
}

/* Content Grid */
.roles-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
}

.roles-main {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.roles-loading {
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
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
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
.roles-table-wrapper {
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
}

.roles-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.roles-table thead {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 2px solid #e5e7eb;
}

.roles-table thead th {
  padding: 1rem 1.25rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.025em;
  white-space: nowrap;
  user-select: none;
}

.roles-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.15s ease;
}

.roles-table tbody tr:hover {
  background-color: #f9fafb;
}

.roles-table tbody td {
  padding: 1rem 1.25rem;
  vertical-align: middle;
}

/* Table Cells */
.cell-name {
  min-width: 180px;
}

.role-name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.role-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.role-text {
  min-width: 0;
}

.role-title {
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-users {
  min-width: 100px;
  text-align: center;
}

.user-count {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: #f0f9ff;
  color: #0369a1;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.85rem;
}

.cell-permissions {
  min-width: 140px;
}

.permission-chip {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #065f46;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #a7f3d0;
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

.status-inactive {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  border-color: #d1d5db;
}

.status-system {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1e3a8a;
  border-color: #bfdbfe;
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
  color: #6366f1;
}

.edit-btn:hover {
  background-color: #c7d2fe;
}

.delete-btn {
  background-color: #fee2e2;
  color: #7f1d1d;
}

.delete-btn:hover {
  background-color: #fecaca;
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

/* Sidebar */
.permissions-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.sidebar-title i {
  color: #8b5cf6;
  font-size: 1.125rem;
}

.sidebar-subtitle {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  margin-bottom: 1rem;
}

.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: #4b5563;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.permission-item:hover {
  background-color: #f3f4f6;
}

.permission-item i {
  color: #8b5cf6;
  font-size: 0.9rem;
  flex-shrink: 0;
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
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 0.8rem;
}

.form-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

.btn-primary {
  padding: 0.625rem 1.5rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
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
@media (max-width: 1024px) {
  .roles-content {
    grid-template-columns: 1fr;
  }

  .permissions-sidebar {
    flex-direction: row;
  }

  .sidebar-card {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .roles-container {
    padding: 1rem;
  }

  .roles-header {
    flex-direction: column;
    align-items: stretch;
  }

  .add-role-button {
    width: 100%;
    justify-content: center;
  }

  .roles-table {
    font-size: 0.8rem;
  }

  .roles-table thead th,
  .roles-table tbody td {
    padding: 0.75rem 0.625rem;
  }

  .permissions-sidebar {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .roles-container {
    padding: 0.75rem;
  }

  .roles-title {
    font-size: 1.5rem;
  }

  .search-bar {
    flex-direction: column;
  }

  .search-button {
    width: auto;
    padding: 0.625rem 1rem;
  }

  .roles-table {
    font-size: 0.75rem;
  }

  .action-buttons {
    flex-wrap: wrap;
  }

  .action-btn {
    width: 1.75rem;
    height: 1.75rem;
  }

  .sidebar-card {
    padding: 1rem;
  }

  .permissions-list {
    gap: 0.5rem;
  }
}

/* Scrollbar Styling */
.roles-table-wrapper::-webkit-scrollbar {
  height: 6px;
}

.roles-table-wrapper::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.roles-table-wrapper::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.roles-table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
