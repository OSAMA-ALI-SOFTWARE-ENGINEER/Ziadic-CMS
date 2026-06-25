<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Modal from '@/components/common/Modal.vue'
import Button from '@/components/common/Button.vue'
import Input from '@/components/common/Input.vue'
import Card from '@/components/common/Card.vue'
import DeleteConfirmModal from '@/components/DeleteConfirmModal.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import DataTable from '@/components/DataTable.vue'
import { usersApi } from '@/services/api/users.api'
import { useFetch, usePaginatedFetch } from '@/composables/useFetch'
import { useForm } from '@/composables/useForm'
import { useUiStore } from '@/stores/ui'
import type { User } from '@/types/user'

const ui = useUiStore()

// Modal states
const isEditModalOpen = ref(false)
const deleteModalOpen = ref(false)
const userToDelete = ref<any | null>(null)
const editingUser = ref<User | null>(null)

// Search
const searchQuery = ref('')

// Users list
const { items: users, loading: usersLoading, fetchPage: fetchUsers, currentPage } = usePaginatedFetch<User>(
  (page: number, perPage: number) => usersApi.getUsers({ page, per_page: perPage, search: searchQuery.value }),
  { perPage: 20 }
)

// Load roles
const { data: rolesData, loading: rolesLoading, execute: loadRoles } = useFetch(
  () => usersApi.getRoles(),
  { showErrorToast: false }
)

// Delete operation
const { loading: isDeleting, execute: deleteUserRequest } = useFetch(
  async () => {
    if (!userToDelete.value) throw new Error('No user selected')
    return await usersApi.deleteUser(userToDelete.value.id)
  },
  { showErrorToast: false }
)

// User form
const userForm = useForm<Partial<User>>({
  initialValues: {
    name: '',
    email: '',
    role: '',
    status: 'active',
  },
  onSubmit: async (data) => {
    if (!editingUser.value) return

    try {
      const isNew = !editingUser.value.id

      if (isNew) {
        await usersApi.createUser({
          ...data,
          password: (data as any).password,
        })
        ui.pushToast('User created successfully', 'success')
      } else {
        const updateData: any = {
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status,
        }

        // Only include password if provided
        if ((data as any).password) {
          updateData.password = (data as any).password
        }

        await usersApi.updateUser(editingUser.value.id, updateData)
        ui.pushToast('User updated successfully', 'success')
      }

      isEditModalOpen.value = false
      editingUser.value = null
      userForm.reset()
      await fetchUsers(currentPage.value)
    } catch (err: any) {
      const errorMessage = err.message || (err.response?.data?.message) || 'Failed to save user'
      ui.pushToast(errorMessage, 'danger')
    }
  },
})

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Joined' },
]

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(u =>
    u.name?.toLowerCase().includes(query) ||
    u.email?.toLowerCase().includes(query)
  )
})

const formattedUsers = computed(() => {
  return filteredUsers.value.map(user => ({
    ...user,
    created_at: formatDate(user.created_at),
    canDelete: user.role !== 'super-admin',
  }))
})

const rolesList = computed(() => {
  const roles = rolesData.value?.data || []
  return Array.isArray(roles) ? roles : []
})

function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'active': 'Active',
    'pending': 'Pending',
    'suspended': 'Suspended',
  }
  return statusMap[status] || status
}

function getStatusTone(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const toneMap: Record<string, any> = {
    'active': 'success',
    'pending': 'warning',
    'suspended': 'danger',
  }
  return toneMap[status] || 'neutral'
}

function openCreateUser() {
  editingUser.value = null
  userForm.reset()
  userForm.setField('status', 'active')
  isEditModalOpen.value = true
}

function editUser(userRow: any) {
  try {
    const user = users.value.find(u => u.id === userRow.id)
    if (!user) {
      ui.pushToast('Failed to load user', 'danger')
      return
    }

    editingUser.value = user
    userForm.setField('name', user.name || '')
    userForm.setField('email', user.email || '')
    userForm.setField('role', user.role || '')
    userForm.setField('status', user.status || 'active')
    userForm.setField('password', '')
    isEditModalOpen.value = true
  } catch (err) {
    ui.pushToast('Failed to open user editor', 'danger')
  }
}

function showDeleteModal(userRow: any) {
  const user = users.value.find(u => u.id === userRow.id)
  if (!user) {
    ui.pushToast('Unable to delete user', 'danger')
    return
  }

  if (user.role === 'super-admin') {
    ui.pushToast('Cannot delete super admin users', 'warning')
    return
  }

  userToDelete.value = user
  deleteModalOpen.value = true
}

async function confirmDelete() {
  if (!userToDelete.value) return

  try {
    const userName = userToDelete.value.name
    await deleteUserRequest()

    users.value = users.value.filter((u: any) => u.id !== userToDelete.value.id)
    ui.pushToast(`"${userName}" deleted successfully`, 'success')

    deleteModalOpen.value = false
    userToDelete.value = null

    await fetchUsers(currentPage.value)
  } catch (err: any) {
    ui.pushToast(err.message || 'Failed to delete user', 'danger')
  }
}

function cancelDelete() {
  deleteModalOpen.value = false
  userToDelete.value = null
}

onMounted(async () => {
  await loadRoles()
  await fetchUsers(1)
})
</script>

<template>
  <div class="users-page space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-(--admin-ink)">Users Management</h1>
        <p class="text-sm text-(--admin-muted) mt-1">Manage team members and assign roles with Spatie permissions</p>
      </div>
      <Button
        @click="fetchUsers(1)"
        :disabled="usersLoading"
        :is-loading="usersLoading"
        variant="primary"
        size="md"
      >
        <i :class="['pi', usersLoading ? 'pi-spin pi-spinner' : 'pi-refresh']"></i>
        <span>{{ usersLoading ? 'Loading...' : 'Refresh' }}</span>
      </Button>
    </div>

    <!-- Action Buttons -->
    <section class="flex gap-3 flex-wrap">
      <Button variant="primary" size="md" @click="openCreateUser">
        <i class="pi pi-user-plus"></i>
        <span>Add User</span>
      </Button>
    </section>

    <!-- Search -->
    <Card class="p-4">
      <div class="flex gap-3">
        <div class="flex-1">
          <Input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name or email..."
            @keyup.enter="fetchUsers(1)"
          />
        </div>
        <Button size="md" variant="secondary" @click="fetchUsers(1)">
          <i class="pi pi-search"></i>
        </Button>
      </div>
    </Card>

    <!-- Users Table -->
    <div v-if="usersLoading && users.length === 0" class="cms-card p-6">
      <div class="mb-6">
        <h2 class="m-0 text-lg font-semibold">All users</h2>
      </div>
      <SkeletonCard type="table-row" :count="10" />
    </div>

    <div v-else-if="!usersLoading && users.length === 0" class="cms-card p-6">
      <div class="mb-6">
        <h2 class="m-0 text-lg font-semibold">All users</h2>
      </div>
      <div class="text-center py-8">
        <i class="pi pi-users text-4xl opacity-30 block mb-3"></i>
        <p class="text-(--admin-muted)">No users found</p>
      </div>
    </div>

    <DataTable
      v-else
      :rows="formattedUsers"
      :columns="columns"
      :searchable-keys="['name', 'email', 'role', 'status']"
      @edit="editUser"
      @delete="showDeleteModal"
    >
      <template #header>
        <div>
          <h2 class="m-0 text-lg font-semibold">All users</h2>
          <p class="m-0 mt-1 text-sm text-(--admin-muted)">
            Showing {{ formattedUsers.length }} users
          </p>
        </div>
      </template>
    </DataTable>

    <!-- Edit/Create Modal -->
    <Modal :is-open="isEditModalOpen" :title="editingUser ? 'Edit User' : 'Create User'" @close="isEditModalOpen = false">
      <form @submit.prevent="userForm.submit" class="space-y-4">
        <Input
          v-model="userForm.form.name"
          label="Full Name"
          type="text"
          placeholder="John Doe"
          required
        />

        <Input
          v-model="userForm.form.email"
          label="Email"
          type="email"
          placeholder="john@example.com"
          required
        />

        <Input
          v-model="(userForm.form as any).password"
          label="Password"
          type="password"
          placeholder="••••••••"
          :required="!editingUser"
          :hint="editingUser ? '(leave blank to keep current)' : ''"
        />

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-(--admin-ink) block mb-2">Role</label>
            <select
              v-model="userForm.form.role"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              required
              :disabled="rolesLoading"
            >
              <option value="">{{ rolesLoading ? 'Loading roles...' : 'Select role' }}</option>
              <option v-for="role in rolesList" :key="role.id" :value="role.name">
                {{ role.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="text-sm font-medium text-(--admin-ink) block mb-2">Status</label>
            <select
              v-model="userForm.form.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Select status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div class="flex gap-2 justify-end">
          <Button type="button" variant="secondary" @click="isEditModalOpen = false">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            :disabled="userForm.loading"
            :is-loading="userForm.loading"
          >
            {{ editingUser ? 'Update User' : 'Create User' }}
          </Button>
        </div>
      </form>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      :is-open="deleteModalOpen"
      :item-name="userToDelete?.name || ''"
      title="Delete User"
      message="Are you sure you want to delete"
      :is-loading="isDeleting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.users-page {
  padding: 2rem;
  max-width: 100%;
}

.cms-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.cms-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

@media (max-width: 1024px) {
  .users-page {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .users-page {
    padding: 1rem;
  }
}

@media (max-width: 640px) {
  .users-page {
    padding: 0.75rem;
  }
}
</style>
