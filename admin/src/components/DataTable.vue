<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed, ref } from 'vue'

const props = defineProps<{
  rows: T[]
  columns: Array<{ key: keyof T; label: string }>
  searchableKeys: Array<keyof T>
  pageSize?: number
}>()

const emit = defineEmits<{
  edit: [row: T]
  delete: [row: T]
  view: [row: T]
}>()

const search = ref('')
const sortKey = ref<keyof T>(props.columns[0]?.key)
const sortDirection = ref<'asc' | 'desc'>('asc')
const page = ref(1)

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return props.rows

  return props.rows.filter((row) =>
    props.searchableKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(query)),
  )
})

const sortedRows = computed(() => {
  return [...filteredRows.value].sort((a, b) => {
    const aValue = String(a[sortKey.value] ?? '')
    const bValue = String(b[sortKey.value] ?? '')
    return sortDirection.value === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
  })
})

const perPage = computed(() => props.pageSize || 6)
const totalPages = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / perPage.value)))
const paginatedRows = computed(() => sortedRows.value.slice((page.value - 1) * perPage.value, page.value * perPage.value))

function sortBy(key: keyof T) {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    return
  }

  sortKey.value = key
  sortDirection.value = 'asc'
}
</script>

<template>
  <section class="cms-card overflow-hidden">
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4">
      <slot name="header"></slot>
      <label class="relative block w-full max-w-[320px]">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]" aria-hidden="true"></i>
        <input v-model="search" class="cms-input pl-10" placeholder="Search..." @input="page = 1" />
      </label>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead class="bg-[var(--admin-table-head)] text-xs uppercase text-[var(--admin-muted)]">
          <tr>
            <th v-for="column in columns" :key="String(column.key)" class="px-5 py-3">
              <button class="inline-flex items-center gap-2 border-0 bg-transparent p-0 text-xs font-semibold uppercase text-inherit" type="button" @click="sortBy(column.key)">
                {{ column.label }}
                <i class="pi pi-sort-alt text-[10px]" aria-hidden="true"></i>
              </button>
            </th>
            <th class="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginatedRows" :key="JSON.stringify(row)" class="border-t border-[var(--admin-border)]">
            <td v-for="column in columns" :key="String(column.key)" class="px-5 py-4">
              <slot :name="`cell-${String(column.key)}`" :row="row" :value="row[column.key]">
                {{ row[column.key] }}
              </slot>
            </td>
            <td class="px-5 py-4">
              <div class="flex justify-end gap-2">
                <button class="icon-button icon-button--sm" type="button" aria-label="View" @click="emit('view', row)">
                  <i class="pi pi-eye" aria-hidden="true"></i>
                </button>
                <button class="icon-button icon-button--sm" type="button" aria-label="Edit" @click="emit('edit', row)">
                  <i class="pi pi-pencil" aria-hidden="true"></i>
                </button>
                <button class="icon-button icon-button--sm" type="button" aria-label="Delete" @click="emit('delete', row)">
                  <i class="pi pi-trash" aria-hidden="true"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between gap-4 border-t border-[var(--admin-border)] px-5 py-4 text-sm text-[var(--admin-muted)]">
      <span>Page {{ page }} of {{ totalPages }}</span>
      <div class="flex gap-2">
        <button class="secondary-action" type="button" :disabled="page === 1" @click="page--">Previous</button>
        <button class="secondary-action" type="button" :disabled="page === totalPages" @click="page++">Next</button>
      </div>
    </div>
  </section>
</template>
