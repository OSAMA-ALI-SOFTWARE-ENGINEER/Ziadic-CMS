<script setup lang="ts">
import { useRoute } from 'vue-router'
import SiteFooter from '@/components/organisms/SiteFooter.vue'
import SiteHeader from '@/components/organisms/SiteHeader.vue'

const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-[var(--body-background-color)]">
    <SiteHeader v-if="!route.meta.legacyFullPage" />
    <main>
      <RouterView />
    </main>
    <SiteFooter v-if="!route.meta.legacyFullPage" />
  </div>
</template>
