<script setup lang="ts">
import type { Metric } from '@/data/cms'
import StatusBadge from './StatusBadge.vue'

defineProps<{
  metric: Metric
}>()
</script>

<template>
  <article class="cms-card p-5">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="m-0 text-sm font-medium text-[var(--admin-muted)]">{{ metric.label }}</p>
        <strong class="mt-3 block text-3xl font-semibold tracking-normal text-[var(--admin-ink)]">
          {{ metric.value }}
        </strong>
      </div>
      <span class="grid h-11 w-11 place-items-center rounded-lg bg-[var(--admin-soft)] text-lg text-[var(--admin-primary)]">
        <i :class="metric.icon" aria-hidden="true"></i>
      </span>
    </div>
    <div class="mt-5">
      <StatusBadge :label="metric.delta" :tone="metric.tone" />
    </div>
  </article>
</template>
