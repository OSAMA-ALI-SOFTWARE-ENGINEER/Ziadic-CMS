<script setup lang="ts">
import SiteFooter from '@/components/organisms/SiteFooter.vue'
import SiteHeader from '@/components/organisms/SiteHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-(--body-background-color)">
    <SiteHeader />
    <main>
      <RouterView />
    </main>
    <SiteFooter />
  </div>
</template>
