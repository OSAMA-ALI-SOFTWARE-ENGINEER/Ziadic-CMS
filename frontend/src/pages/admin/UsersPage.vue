<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const adminStore = useAdminStore()
const toast = useToast()

const roleOptions = [
  { label: 'Super Admin', value: 'super-admin' },
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'User', value: 'user' },
]

onMounted(() => {
  adminStore.loadUsers()
})

async function updateRole(userId: number, role: string) {
  try {
    await adminStore.assignRole(userId, role)
    toast.add({ severity: 'success', summary: 'Success', detail: 'Role updated' })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update role' })
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

</script>

<template>
  <div class="users-manager">
    <h1 class="page-title">Users Management</h1>

    <Toast />

    <Card class="users-card">
      <template #content>
        <DataTable
          :value="adminStore.users"
          :loading="adminStore.usersLoading"
          striped-rows
          responsive-layout="scroll"
          class="p-datatable-striped"
        >
          <Column field="name" header="Name" style="width: 25%">
            <template #body="{ data }">
              <div class="user-cell">
                <h4 class="user-name">{{ data.name }}</h4>
                <p class="user-email">{{ data.email }}</p>
              </div>
            </template>
          </Column>

          <Column field="phone" header="Phone" style="width: 20%">
            <template #body="{ data }">
              {{ data.phone || '—' }}
            </template>
          </Column>

          <Column field="roles" header="Role" style="width: 25%">
            <template #body="{ data }">
              <Dropdown
                :model-value="data.roles[0] || 'user'"
                :options="roleOptions"
                option-label="label"
                option-value="value"
                @change="(e: any) => updateRole(data.id, e.value)"
                class="role-dropdown"
              />
            </template>
          </Column>

          <Column field="created_at" header="Joined" style="width: 20%">
            <template #body="{ data }">
              {{ formatDate(data.created_at) }}
            </template>
          </Column>

          <Column header="Actions" style="width: 10%">
            <template #body>
              <Button
                icon="pi pi-eye"
                rounded
                text
                class="action-btn"
                v-tooltip="'View Details'"
                disabled
              />
            </template>
          </Column>

          <template #empty>
            <div class="empty-state">
              <p>No users found</p>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.users-manager {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2rem;
}

.users-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: none;
}

:deep(.p-datatable) {
  font-size: 0.95rem;
}

:deep(.p-datatable-thead) {
  background-color: #f8f9fa;
}

:deep(.p-datatable-thead > tr > th) {
  padding: 1rem;
  font-weight: 600;
  color: #666;
  border-bottom: 2px solid #e0e0e0;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: #f8f9fa;
}

.user-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.user-email {
  margin: 0;
  font-size: 0.875rem;
  color: #999;
}

.role-dropdown {
  width: 100%;
  font-size: 0.95rem;
}

:deep(.p-dropdown) {
  border: 1px solid #ddd;
  border-radius: 4px;
}

.action-btn {
  color: #666;
  transition: color 0.2s;
}

.action-btn:hover {
  color: #c41e3a;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #999;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  :deep(.p-datatable) {
    font-size: 0.85rem;
  }
}
</style>
