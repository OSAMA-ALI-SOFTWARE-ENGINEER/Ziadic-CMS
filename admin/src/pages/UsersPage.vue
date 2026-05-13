<script setup lang="ts">
import { reactive, ref } from 'vue'
import AppModal from '@/components/AppModal.vue'
import DataTable from '@/components/DataTable.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import type { UserRow } from '@/stores/cms'
import { useCmsStore } from '@/stores/cms'
import { useUiStore } from '@/stores/ui'

const cms = useCmsStore()
const ui = useUiStore()
const isModalOpen = ref(false)
const form = reactive<UserRow>({ id: 0, name: '', email: '', role: 'client', status: 'Active', tone: 'success' })

const columns: Array<{ key: keyof UserRow; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
]

function openUser(user?: UserRow) {
  Object.assign(form, user || { id: 0, name: '', email: '', role: 'client', status: 'Active', tone: 'success' })
  isModalOpen.value = true
}

function saveUser() {
  form.tone = form.status === 'Active' ? 'success' : 'warning'
  cms.upsertUser({ ...form })
  isModalOpen.value = false
  ui.pushToast('User saved.', 'success')
}
</script>

<template>
  <DataTable
    :rows="cms.users"
    :columns="columns"
    :searchable-keys="['name', 'email', 'role', 'status']"
    @edit="openUser"
    @delete="(user) => { cms.deleteUser(user.id); ui.pushToast('User deleted.', 'warning') }"
    @view="(user) => ui.pushToast(`Viewing ${user.name}`, 'info')"
  >
    <template #header>
      <div>
        <h2 class="m-0 text-base font-semibold">Users & Roles</h2>
        <p class="m-0 mt-1 text-sm text-[var(--admin-muted)]">Create users and assign Spatie roles.</p>
      </div>
      <button class="primary-action" type="button" @click="openUser()"><i class="pi pi-user-plus"></i><span>Add user</span></button>
    </template>
    <template #cell-status="{ row }">
      <StatusBadge :label="row.status" :tone="row.tone" />
    </template>
  </DataTable>

  <AppModal :open="isModalOpen" title="User" @close="isModalOpen = false">
    <form class="grid gap-4" @submit.prevent="saveUser">
      <label class="grid gap-2 text-sm font-medium">Name <input v-model="form.name" class="cms-input" /></label>
      <label class="grid gap-2 text-sm font-medium">Email <input v-model="form.email" class="cms-input" type="email" /></label>
      <label class="grid gap-2 text-sm font-medium">Role <select v-model="form.role" class="cms-input"><option>super-admin</option><option>admin</option><option>staff</option><option>client</option></select></label>
      <label class="grid gap-2 text-sm font-medium">Status <select v-model="form.status" class="cms-input"><option>Active</option><option>Pending</option><option>Suspended</option></select></label>
      <button class="primary-action justify-self-end" type="submit">Save user</button>
    </form>
  </AppModal>
</template>
