<script setup lang="ts">
const points = [42, 58, 52, 72, 68, 88, 81, 94, 102, 118, 112, 128]
const max = Math.max(...points)
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
</script>

<template>
  <section class="cms-card p-5">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="m-0 text-base font-semibold text-(--admin-ink)">Listing growth</h2>
        <p class="m-0 mt-1 text-sm text-(--admin-muted)">Last 12 months</p>
      </div>
      <button class="icon-button" type="button" aria-label="Chart options"><i class="pi pi-ellipsis-h"></i></button>
    </div>
    <div class="mt-8 flex h-60 items-end gap-2.5">
      <div
        v-for="(point, index) in points"
        :key="index"
        class="flex flex-1 flex-col items-center gap-2.5 group"
      >
        <div
          class="w-full rounded-t-md bg-linear-to-t from-(--admin-primary) to-(--admin-primary) opacity-80 transition-all duration-200 group-hover:opacity-100 group-hover:shadow-lg"
          :style="{ height: `${(point / max) * 190}px` }"
        ></div>
        <span class="text-xs font-medium text-(--admin-muted)">{{ months[index] }}</span>
      </div>
    </div>
  </section>
</template>
