<script setup lang="ts">
const points = [42, 58, 52, 72, 68, 88, 81, 94, 102, 118, 112, 128]
const max = Math.max(...points)
</script>

<template>
  <section class="cms-card p-5">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="m-0 text-base font-semibold">Listing growth</h2>
        <p class="m-0 mt-1 text-sm text-[var(--admin-muted)]">ApexCharts-ready analytics area</p>
      </div>
      <button class="icon-button" type="button" aria-label="Chart options"><i class="pi pi-ellipsis-h"></i></button>
    </div>
    <div class="mt-6 flex h-60 items-end gap-3">
      <div
        v-for="(point, index) in points"
        :key="index"
        class="flex flex-1 flex-col items-center gap-2"
      >
        <div class="w-full rounded-t-lg bg-[var(--admin-primary)] opacity-90 transition-all" :style="{ height: `${(point / max) * 190}px` }"></div>
        <span class="text-[10px] text-[var(--admin-muted)]">{{ index + 1 }}</span>
      </div>
    </div>
  </section>
</template>
