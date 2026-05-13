<script setup lang="ts">
import { reactive, ref } from 'vue'
import AppModal from '@/components/AppModal.vue'
import DataTable from '@/components/DataTable.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import type { RoleRow } from '@/stores/cms'
import { useCmsStore } from '@/stores/cms'
import { useUiStore } from '@/stores/ui'

const cms = useCmsStore()
const ui = useUiStore()
const isModalOpen = ref(false)
const form = reactive<RoleRow>({
  id: 0,
  name: '',
  users: 0,
  permissions: '',
  status: 'Active',
  tone: 'success',
})

const columns: Array<{ key: keyof RoleRow; label: string }> = [
  { key: 'name', label: 'Role' },
  { key: 'users', label: 'Users' },
  { key: 'permissions', label: 'Permissions' },
  { key: 'status', label: 'Status' },
]

const permissionGroups = [
  'users.view/create/update/delete',
  'roles.view/create/update/delete',
  'listings.view/create/update/delete/approve/publish',
  'categories.manage',
  'posts.manage',
  'media.manage',
  'settings.manage',
  'payments.view/refund',
]

function openRole(role?: RoleRow) {
  Object.assign(
    form,
    role || {
      id: 0,
      name: '',
      users: 0,
      permissions: '',
      status: 'Active',
      tone: 'success',
    },
  )
  isModalOpen.value = true
}

function saveRole() {
  form.tone = form.status === 'System' ? 'info' : 'success'
  cms.upsertRole({ ...form })
  isModalOpen.value = false
  ui.pushToast('Role saved.', 'success')
}
</script>

<template>
  <section class="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
    <DataTable
      :rows="cms.roles"
      :columns="columns"
      :searchable-keys="['name', 'permissions', 'status']"
      @edit="openRole"
      @delete="(role) => { cms.deleteRole(role.id); ui.pushToast('Role deleted.', 'warning') }"
      @view="(role) => ui.pushToast(`Viewing ${role.name}`, 'info')"
    >
      <template #header>
        <div>
          <h2 class="m-0 text-base font-semibold">Roles & Permissions</h2>
          <p class="m-0 mt-1 text-sm text-[var(--admin-muted)]">Temporary UI for Spatie role planning and testing.</p>
        </div>
        <button class="primary-action" type="button" @click="openRole()">
          <i class="pi pi-plus"></i>
          <span>Add role</span>
        </button>
      </template>
      <template #cell-status="{ row }">
        <StatusBadge :label="row.status" :tone="row.tone" />
      </template>
    </DataTable>

    <aside class="cms-card p-5">
      <h2 class="m-0 text-base font-semibold">Permission groups</h2>
      <p class="m-0 mt-1 text-sm text-[var(--admin-muted)]">These match the Laravel seed permissions.</p>
      <div class="mt-5 grid gap-2">
        <span v-for="permission in permissionGroups" :key="permission" class="rounded-lg bg-[var(--admin-soft)] px-3 py-2 text-sm text-[var(--admin-muted)]">
          {{ permission }}
        </span>
      </div>
    </aside>
  </section>

  <AppModal :open="isModalOpen" title="Role" @close="isModalOpen = false">
    <form class="grid gap-4" @submit.prevent="saveRole">
      <label class="grid gap-2 text-sm font-medium">Role name <input v-model="form.name" class="cms-input" /></label>
      <label class="grid gap-2 text-sm font-medium">Users <input v-model.number="form.users" class="cms-input" type="number" min="0" /></label>
      <label class="grid gap-2 text-sm font-medium">Permissions <textarea v-model="form.permissions" class="cms-input min-h-28 py-3"></textarea></label>
      <label class="grid gap-2 text-sm font-medium">Status <select v-model="form.status" class="cms-input"><option>Active</option><option>System</option><option>Disabled</option></select></label>
      <button class="primary-action justify-self-end" type="submit">Save role</button>
    </form>
  </AppModal>
</template>
