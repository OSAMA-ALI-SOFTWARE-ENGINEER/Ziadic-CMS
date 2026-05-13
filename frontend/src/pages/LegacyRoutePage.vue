<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LegacyWebflowPage from '@/components/legacy/LegacyWebflowPage.vue'

const route = useRoute()

const legacyPath = computed(() => String(route.meta.legacyPath || '/legacy/index.html'))
const loadingLabel = computed(() => String(route.meta.loadingLabel || 'Loading Zaidic...'))
const legacyPageKey = computed(() => `${route.fullPath}:${legacyPath.value}`)
</script>

<template>
  <LegacyWebflowPage :key="legacyPageKey" :legacy-path="legacyPath" :loading-label="loadingLabel" />
</template>
