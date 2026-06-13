<template>
  <div>
    <LegacyWebflowPage legacy-path="/legacy/index.html" loading-label="Loading Home..." />
    <PopularListingsSection />
  </div>
</template>

<script setup lang="ts">
import LegacyWebflowPage from '@/components/legacy/LegacyWebflowPage.vue'
import PopularListingsSection from '@/components/sections/PopularListingsSection.vue'
</script>
