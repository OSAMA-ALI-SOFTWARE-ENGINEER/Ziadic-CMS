<script setup lang="ts">
import CmsTable from '@/components/CmsTable.vue'
import ChartPanel from '@/components/ChartPanel.vue'
import StatCard from '@/components/StatCard.vue'
import { activityItems, contentRows, listingRows, metrics } from '@/data/cms'
</script>

<template>
  <section class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard v-for="metric in metrics" :key="metric.label" :metric="metric" />
  </section>

  <ChartPanel />

  <section class="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
    <CmsTable
      title="Recent listings"
      description="Approval workflow, city data, and featured listing status."
      :rows="listingRows"
      mode="listings"
    />

    <aside class="cms-card p-5">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="m-0 text-base font-semibold text-[var(--admin-ink)]">CMS activity</h2>
          <p class="m-0 mt-1 text-sm text-[var(--admin-muted)]">Latest admin actions</p>
        </div>
        <span class="grid h-10 w-10 place-items-center rounded-lg bg-[var(--admin-soft)] text-[var(--admin-primary)]">
          <i class="pi pi-history" aria-hidden="true"></i>
        </span>
      </div>
      <ol class="mt-5 grid gap-4 p-0">
        <li v-for="item in activityItems" :key="item" class="flex gap-3 text-sm text-[var(--admin-muted)]">
          <span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--admin-primary)]"></span>
          <span>{{ item }}</span>
        </li>
      </ol>
    </aside>
  </section>

  <CmsTable
    title="Content pipeline"
    description="Pages, services, and blog posts ready for publishing."
    :rows="contentRows"
    mode="content"
  />
</template>
