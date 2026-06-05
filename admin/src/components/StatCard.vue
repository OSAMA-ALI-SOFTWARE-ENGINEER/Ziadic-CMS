<script setup lang="ts">
import StatusBadge from './StatusBadge.vue'

interface Metric {
  id: string
  label: string
  value: string | number
  delta: string
  tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  icon: string
  loading?: boolean
}

defineProps<{
  metric: Metric
  loading?: boolean
}>()

const isComingSoon = (value: string | number) => String(value) === 'Coming Soon'
</script>

<template>
  <article class="cms-card relative overflow-hidden p-5 transition-all" :class="{ 'opacity-60': loading }">
    <!-- Loading skeleton -->
    <div v-if="loading" class="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>

    <div class="flex items-start justify-between gap-4">
      <div class="flex-1">
        <p class="m-0 text-xs font-semibold uppercase tracking-wide text-(--admin-muted)">{{ metric.label }}</p>
        <strong
          class="mt-3 block font-semibold tracking-normal text-(--admin-ink)"
          :class="isComingSoon(metric.value) ? 'text-lg' : 'text-4xl'"
        >
          {{ metric.value }}
        </strong>
      </div>
      <span class="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-linear-to-br from-(--admin-primary) to-(--admin-primary-strong) text-lg text-white shadow-lg">
        <i :class="metric.icon" aria-hidden="true"></i>
      </span>
    </div>

    <!-- Delta section - hidden for Coming Soon -->
    <div v-if="!isComingSoon(metric.value) && metric.delta" class="mt-5 flex items-center gap-2">
      <StatusBadge :label="metric.delta" :tone="metric.tone" />
      <i
        :class="[
          metric.delta.startsWith('+') ? 'pi pi-arrow-up' : 'pi pi-arrow-down',
          'text-xs',
          { 'text-(--admin-primary)': metric.delta.startsWith('+'), 'text-red-500': metric.delta.startsWith('-') },
        ]"
        aria-hidden="true"
      ></i>
    </div>

    <!-- Coming Soon pill -->
    <div v-else-if="isComingSoon(metric.value)" class="mt-5">
      <span class="inline-flex items-center gap-1.5 rounded-full bg-(--admin-soft) px-3 py-1 text-xs font-medium text-(--admin-muted)">
        <i class="pi pi-clock" aria-hidden="true"></i>
        Feature coming soon
      </span>
    </div>
  </article>
</template>
