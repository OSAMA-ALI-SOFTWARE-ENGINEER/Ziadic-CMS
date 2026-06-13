<template>
  <div>
    <LegacyWebflowPage legacy-path="/legacy/detail_listings.html" loading-label="Loading Listing..." />
    <ListingDetailPopulator />
  </div>
</template>

<script setup lang="ts">
import LegacyWebflowPage from '@/components/legacy/LegacyWebflowPage.vue'
import ListingDetailPopulator from '@/components/sections/ListingDetailPopulator.vue'
</script>
