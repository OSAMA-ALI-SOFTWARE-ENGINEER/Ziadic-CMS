<script setup lang="ts">
interface Props {
  type?: 'metric' | 'table-row' | 'chart' | 'text'
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'metric',
  count: 1,
})
</script>

<template>
  <!-- Metric Card Skeleton -->
  <div v-if="type === 'metric'" class="space-y-4">
    <div
      v-for="i in count"
      :key="i"
      class="rounded-lg p-6 shadow-sm border border-gray-100 bg-white animate-pulse"
    >
      <div class="flex items-start justify-between mb-4">
        <div class="w-full">
          <div class="h-4 w-24 bg-gray-200 rounded mb-2"></div>
          <div class="h-8 w-16 bg-gray-300 rounded"></div>
        </div>
        <div class="h-12 w-12 bg-gray-200 rounded-lg shrink-0"></div>
      </div>
      <div class="flex items-center gap-2">
        <div class="h-6 w-12 bg-gray-200 rounded"></div>
        <div class="h-4 w-20 bg-gray-100 rounded"></div>
      </div>
    </div>
  </div>

  <!-- Table Row Skeleton -->
  <div v-else-if="type === 'table-row'" class="space-y-2">
    <div
      v-for="i in count"
      :key="i"
      class="flex items-center gap-4 py-3 px-3 border-b border-gray-100 animate-pulse"
    >
      <div class="h-4 w-48 bg-gray-200 rounded flex-1"></div>
      <div class="h-4 w-24 bg-gray-200 rounded flex-1"></div>
      <div class="h-4 w-20 bg-gray-200 rounded flex-1"></div>
      <div class="h-6 w-16 bg-gray-300 rounded shrink-0"></div>
      <div class="h-4 w-16 bg-gray-200 rounded shrink-0"></div>
    </div>
  </div>

  <!-- Chart Skeleton -->
  <div v-else-if="type === 'chart'" class="rounded-lg p-6 shadow-sm border border-gray-100 bg-white animate-pulse">
    <div class="h-6 w-32 bg-gray-200 rounded mb-4"></div>
    <div class="h-4 w-48 bg-gray-100 rounded mb-6"></div>
    <div class="flex items-end justify-between h-48 gap-2">
      <div v-for="i in 12" :key="i" class="flex-1 bg-gray-300 rounded-t" :style="{ height: `${Math.random() * 60 + 40}%` }"></div>
    </div>
  </div>

  <!-- Text Skeleton -->
  <div v-else class="space-y-2">
    <div class="h-4 w-full bg-gray-200 rounded"></div>
    <div class="h-4 w-5/6 bg-gray-200 rounded"></div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
