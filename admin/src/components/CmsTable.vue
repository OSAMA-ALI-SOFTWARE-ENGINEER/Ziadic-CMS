<script setup lang="ts">
import StatusBadge from './StatusBadge.vue'
import type { ContentRow, ListingRow } from '@/data/cms'

defineProps<{
  title: string
  description: string
  rows: Array<ListingRow | ContentRow>
  mode: 'listings' | 'content'
}>()
</script>

<template>
  <section class="cms-card overflow-hidden">
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4">
      <div>
        <h2 class="m-0 text-base font-semibold text-[var(--admin-ink)]">{{ title }}</h2>
        <p class="m-0 mt-1 text-sm text-[var(--admin-muted)]">{{ description }}</p>
      </div>
      <button class="icon-button" type="button" aria-label="Open table filters">
        <i class="pi pi-filter" aria-hidden="true"></i>
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr class="bg-[var(--admin-table-head)] text-xs uppercase text-[var(--admin-muted)]">
            <th class="px-5 py-3 font-semibold">Title</th>
            <th class="px-5 py-3 font-semibold">{{ mode === 'listings' ? 'Category' : 'Type' }}</th>
            <th class="px-5 py-3 font-semibold">{{ mode === 'listings' ? 'City' : 'Author' }}</th>
            <th class="px-5 py-3 font-semibold">Status</th>
            <th class="px-5 py-3 font-semibold">Updated</th>
            <th class="px-5 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.title" class="border-t border-[var(--admin-border)]">
            <td class="px-5 py-4 font-medium text-[var(--admin-ink)]">{{ row.title }}</td>
            <td class="px-5 py-4 text-[var(--admin-muted)]">
              {{ mode === 'listings' ? (row as ListingRow).category : (row as ContentRow).type }}
            </td>
            <td class="px-5 py-4 text-[var(--admin-muted)]">
              {{ mode === 'listings' ? (row as ListingRow).city : (row as ContentRow).author }}
            </td>
            <td class="px-5 py-4">
              <StatusBadge :label="row.status" :tone="row.tone" />
            </td>
            <td class="px-5 py-4 text-[var(--admin-muted)]">{{ row.updatedAt }}</td>
            <td class="px-5 py-4">
              <div class="flex justify-end gap-2">
                <button class="icon-button icon-button--sm" type="button" aria-label="Edit item">
                  <i class="pi pi-pencil" aria-hidden="true"></i>
                </button>
                <button class="icon-button icon-button--sm" type="button" aria-label="View item">
                  <i class="pi pi-eye" aria-hidden="true"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
