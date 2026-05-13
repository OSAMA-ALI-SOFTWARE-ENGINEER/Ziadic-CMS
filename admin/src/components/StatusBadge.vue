<script setup lang="ts">
import type { StatusTone } from '@/data/cms'

defineProps<{
  label: string
  tone?: StatusTone
}>()
</script>

<template>
  <span class="status-badge" :class="`status-badge--${tone || 'neutral'}`">
    {{ label }}
  </span>
</template>
