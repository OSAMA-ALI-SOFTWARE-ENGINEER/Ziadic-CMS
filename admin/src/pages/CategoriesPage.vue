<script setup lang="ts">
import { reactive, ref } from 'vue'
import AppModal from '@/components/AppModal.vue'
import DataTable from '@/components/DataTable.vue'
import type { Category } from '@/stores/cms'
import { useCmsStore } from '@/stores/cms'
import { useUiStore } from '@/stores/ui'

const cms = useCmsStore()
const ui = useUiStore()
const isModalOpen = ref(false)
const form = reactive<Category>({ id: 0, name: '', slug: '', parent: '', status: 'Active' })

const columns: Array<{ key: keyof Category; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug' },
  { key: 'parent', label: 'Parent' },
  { key: 'status', label: 'Status' },
]

function openCategory(category?: Category) {
  Object.assign(form, category || { id: 0, name: '', slug: '', parent: '', status: 'Active' })
  isModalOpen.value = true
}

function saveCategory() {
  cms.upsertCategory({ ...form })
  isModalOpen.value = false
  ui.pushToast('Category saved.', 'success')
}
</script>

<template>
  <DataTable
    :rows="cms.categories"
    :columns="columns"
    :searchable-keys="['name', 'slug', 'parent', 'status']"
    @edit="openCategory"
    @delete="(category) => { cms.deleteCategory(category.id); ui.pushToast('Category deleted.', 'warning') }"
    @view="(category) => ui.pushToast(`Viewing ${category.name}`, 'info')"
  >
    <template #header>
      <div>
        <h2 class="m-0 text-base font-semibold">Categories & Subcategories</h2>
        <p class="m-0 mt-1 text-sm text-[var(--admin-muted)]">Manage listing taxonomy and nested category structure.</p>
      </div>
      <button class="primary-action" type="button" @click="openCategory()"><i class="pi pi-plus"></i><span>Add category</span></button>
    </template>
  </DataTable>

  <AppModal :open="isModalOpen" title="Category" @close="isModalOpen = false">
    <form class="grid gap-4" @submit.prevent="saveCategory">
      <label class="grid gap-2 text-sm font-medium">Name <input v-model="form.name" class="cms-input" /></label>
      <label class="grid gap-2 text-sm font-medium">Slug <input v-model="form.slug" class="cms-input" /></label>
      <label class="grid gap-2 text-sm font-medium">Parent <input v-model="form.parent" class="cms-input" /></label>
      <label class="grid gap-2 text-sm font-medium">Status <select v-model="form.status" class="cms-input"><option>Active</option><option>Inactive</option></select></label>
      <button class="primary-action justify-self-end" type="submit">Save category</button>
    </form>
  </AppModal>
</template>
