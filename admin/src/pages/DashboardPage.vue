<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import CmsTable from '@/components/CmsTable.vue'
import ChartPanel from '@/components/ChartPanel.vue'
import StatCard from '@/components/StatCard.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { activityItems, contentRows, listingRows } from '@/data/cms'

const dashboard = useDashboardStore()

// Initialize dashboard on mount
onMounted(() => {
  dashboard.initializeDashboard()
})

// Cleanup on unmount
onBeforeUnmount(() => {
  dashboard.stopAutoRefresh()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Dashboard Header with Last Updated & Refresh -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="m-0 text-2xl font-bold text-(--admin-ink)">Dashboard</h1>
        <p class="m-0 mt-1 text-sm text-(--admin-muted)">
          Last updated: <span class="font-medium">{{ dashboard.formattedLastUpdated }}</span>
        </p>
      </div>
      <button
        class="primary-action gap-2"
        type="button"
        :disabled="dashboard.isLoading"
        @click="dashboard.refreshDashboard"
      >
        <i :class="dashboard.isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" aria-hidden="true"></i>
        {{ dashboard.isLoading ? 'Refreshing...' : 'Refresh' }}
      </button>
    </div>

    <!-- Metrics Grid -->
    <section class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        v-for="metric in dashboard.metrics"
        :key="metric.id"
        :metric="metric"
        :loading="dashboard.isLoading"
      />
    </section>

    <!-- Chart Panel -->
    <ChartPanel />

    <!-- Recent Listings & Activity -->
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
            <h2 class="m-0 text-base font-semibold text-(--admin-ink)">CMS activity</h2>
            <p class="m-0 mt-1 text-sm text-(--admin-muted)">Latest admin actions</p>
          </div>
          <span class="grid h-10 w-10 place-items-center rounded-lg bg-(--admin-soft) text-(--admin-primary)">
            <i class="pi pi-history" aria-hidden="true"></i>
          </span>
        </div>
        <ol class="mt-5 grid gap-4 p-0">
          <li v-for="item in activityItems" :key="item" class="flex gap-3 text-sm text-(--admin-muted)">
            <span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-(--admin-primary)"></span>
            <span>{{ item }}</span>
          </li>
        </ol>
      </aside>
    </section>

    <!-- Content Pipeline -->
    <CmsTable
      title="Content pipeline"
      description="Pages, services, and blog posts ready for publishing."
      :rows="contentRows"
      mode="content"
    />
  </div>
</template>
