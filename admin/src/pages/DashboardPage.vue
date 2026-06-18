<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import CmsTable from '@/components/CmsTable.vue'
import ChartPanel from '@/components/ChartPanel.vue'
import StatCard from '@/components/StatCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { useDashboardStore } from '@/stores/dashboard'

const dashboard = useDashboardStore()
const activeActivityFilter = ref('all')

// Filter activity by type
const filteredActivity = computed(() => {
  if (activeActivityFilter.value === 'all') return dashboard.recentActivity
  return dashboard.recentActivity.filter(a => a.type === activeActivityFilter.value)
})

// Get activity icon color
function getActivityColor(type: string): string {
  const colors: Record<string, string> = {
    'listing': 'text-blue-500',
    'approval': 'text-green-500',
    'content': 'text-purple-500',
    'payment': 'text-yellow-500',
  }
  return colors[type] || 'text-gray-500'
}

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
  <div class="space-y-6 w-full overflow-hidden">
    <!-- Dashboard Header with Last Updated -->
    <div class="min-w-0">
      <h1 class="m-0 text-2xl sm:text-3xl font-bold text-(--admin-ink) truncate">Dashboard</h1>
      <p class="m-0 mt-2 text-xs sm:text-sm text-(--admin-muted) overflow-hidden">
        <span class="inline-flex items-center gap-1 flex-wrap">
          <i class="pi pi-circle-fill text-green-500 text-xs shrink-0"></i>
          <span class="truncate">Last updated:</span>
          <span class="font-medium text-(--admin-ink) truncate">{{ dashboard.formattedLastUpdated }}</span>
        </span>
      </p>
    </div>

    <!-- Metrics Grid -->
    <section v-if="dashboard.isLoading && dashboard.metrics.length === 0" class="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 w-full">
      <SkeletonCard type="metric" :count="4" />
    </section>

    <section v-else class="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 w-full">
      <div
        v-for="metric in dashboard.metrics"
        :key="metric.id"
        :class="[
          'rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border',
          metric.tone === 'neutral' && metric.value === 'Coming Soon'
            ? 'bg-gray-50 border-gray-200'
            : 'bg-white border-gray-100'
        ]"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">{{ metric.label }}</p>
            <p
              :class="[
                'text-3xl font-bold',
                metric.value === 'Coming Soon'
                  ? 'text-gray-400'
                  : 'text-gray-900'
              ]"
            >
              {{ metric.value }}
            </p>
          </div>
          <div :class="['p-3 rounded-lg', {
            'bg-green-100 text-green-600': metric.tone === 'success',
            'bg-yellow-100 text-yellow-600': metric.tone === 'warning',
            'bg-red-100 text-red-600': metric.tone === 'danger',
            'bg-blue-100 text-blue-600': metric.tone === 'info',
            'bg-gray-100 text-gray-600': metric.tone === 'neutral',
          }]">
            <i :class="metric.icon"></i>
          </div>
        </div>
        <div
          v-if="metric.value === 'Coming Soon'"
          class="flex items-center justify-center py-2 px-3 rounded-lg bg-white border border-dashed border-gray-300"
        >
          <i class="pi pi-hourglass text-gray-400 mr-2"></i>
          <span class="text-xs font-medium text-gray-500">{{ metric.delta }}</span>
        </div>
        <div v-else class="flex items-center gap-2">
          <span
            :class="[
              'text-xs font-semibold px-2 py-1 rounded',
              {
                'bg-green-100 text-green-700': metric.changePercent && metric.changePercent > 0,
                'bg-red-100 text-red-700': metric.changePercent && metric.changePercent < 0,
                'bg-gray-100 text-gray-700': !metric.changePercent || metric.changePercent === 0,
              }
            ]"
          >
            <i :class="metric.changePercent && metric.changePercent > 0 ? 'pi pi-arrow-up text-xs' : metric.changePercent && metric.changePercent < 0 ? 'pi pi-arrow-down text-xs' : 'pi pi-minus text-xs'"></i>
            {{ Math.abs(metric.changePercent || 0).toFixed(1) }}%
          </span>
          <span class="text-xs text-gray-500">{{ metric.delta }}</span>
        </div>
      </div>
    </section>

    <!-- Chart Panel -->
    <div v-if="dashboard.isLoading && dashboard.recentListings.length === 0" class="w-full overflow-hidden">
      <SkeletonCard type="chart" />
    </div>
    <div v-else class="w-full overflow-x-auto">
      <ChartPanel />
    </div>

    <!-- Recent Listings & Activity -->
    <section class="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-[1.5fr_0.8fr] w-full">
      <!-- Recent Listings Table -->
      <div class="cms-card p-4 sm:p-6 min-w-0">
        <div class="mb-4 sm:mb-6 min-w-0">
          <h2 class="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">Recent listings</h2>
          <p class="text-xs sm:text-sm text-gray-600 line-clamp-2">Approval workflow, city data, and featured listing status.</p>
        </div>

        <div v-if="dashboard.isLoading && dashboard.recentListings.length === 0">
          <SkeletonCard type="table-row" :count="5" />
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="border-b border-gray-200 hidden sm:table-header-group">
              <tr>
                <th class="text-left py-2 sm:py-3 px-2 sm:px-3 font-semibold text-gray-700 text-xs sm:text-sm">Title</th>
                <th class="text-left py-2 sm:py-3 px-2 sm:px-3 font-semibold text-gray-700 text-xs sm:text-sm">Category</th>
                <th class="text-left py-2 sm:py-3 px-2 sm:px-3 font-semibold text-gray-700 text-xs sm:text-sm hidden md:table-cell">City</th>
                <th class="text-left py-2 sm:py-3 px-2 sm:px-3 font-semibold text-gray-700 text-xs sm:text-sm">Status</th>
                <th class="text-left py-2 sm:py-3 px-2 sm:px-3 font-semibold text-gray-700 text-xs sm:text-sm hidden lg:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(listing, idx) in dashboard.recentListings.slice(0, 5)"
                :key="idx"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors block sm:table-row mb-3 sm:mb-0 p-3 sm:p-0 rounded-lg sm:rounded-none bg-gray-50 sm:bg-transparent"
              >
                <td class="py-1 sm:py-3 px-0 sm:px-3 font-medium text-gray-900 text-xs sm:text-sm block sm:table-cell before:content-['Title:'] before:font-semibold before:mr-2 sm:before:content-none">
                  <span class="wrap-break-word">{{ listing.title }}</span>
                </td>
                <td class="py-1 sm:py-3 px-0 sm:px-3 text-gray-600 text-xs sm:text-sm block sm:table-cell before:content-['Category:'] before:font-semibold before:mr-2 sm:before:content-none">
                  {{ listing.category }}
                </td>
                <td class="py-1 sm:py-3 px-0 sm:px-3 text-gray-600 text-xs sm:text-sm hidden md:table-cell before:content-['City:'] before:font-semibold before:mr-2 md:before:content-none">
                  {{ listing.city }}
                </td>
                <td class="py-1 sm:py-3 px-0 sm:px-3 block sm:table-cell before:content-['Status:'] before:font-semibold before:mr-2 sm:before:content-none">
                  <span :class="[
                    'inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold',
                    {
                      'bg-green-100 text-green-700': listing.status === 'published',
                      'bg-yellow-100 text-yellow-700': listing.status === 'pending',
                      'bg-red-100 text-red-700': listing.status === 'rejected',
                      'bg-gray-100 text-gray-700': listing.status === 'draft',
                    }
                  ]">
                    {{ listing.status }}
                  </span>
                </td>
                <td class="py-1 sm:py-3 px-0 sm:px-3 text-gray-500 text-xs sm:text-sm hidden lg:table-cell before:content-['Updated:'] before:font-semibold before:mr-2 lg:before:content-none">
                  {{ listing.updatedAt }}
                </td>
              </tr>
              <tr v-if="dashboard.recentListings.length === 0">
                <td colspan="5" class="py-8 px-3 text-center text-gray-500">No listings found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CMS Activity -->
      <div class="cms-card p-4 sm:p-6 min-w-0">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div class="min-w-0 flex-1">
            <h2 class="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">CMS activity</h2>
            <p class="text-xs sm:text-sm text-gray-600">Latest admin actions</p>
          </div>
          <div class="p-2 sm:p-3 rounded-lg bg-blue-100 text-blue-600 shrink-0">
            <i class="pi pi-history text-lg"></i>
          </div>
        </div>

        <!-- Activity Filter -->
        <div class="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4 flex-wrap">
          <button
            @click="activeActivityFilter = 'all'"
            :class="[
              'px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap',
              activeActivityFilter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            All
          </button>
          <button
            v-for="type in ['listing', 'approval', 'content', 'payment']"
            :key="type"
            @click="activeActivityFilter = type"
            :class="[
              'px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium transition-all capitalize whitespace-nowrap',
              activeActivityFilter === type
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ type }}
          </button>
        </div>

        <!-- Activity List -->
        <div class="space-y-3">
          <div
            v-for="activity in filteredActivity.slice(0, 6)"
            :key="activity.id"
            class="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <div :class="['pt-1 shrink-0', getActivityColor(activity.type)]">
              <i :class="activity.icon"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-700 line-clamp-2">{{ activity.message }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ activity.timestamp.toLocaleTimeString() }}</p>
            </div>
          </div>
          <div v-if="filteredActivity.length === 0" class="py-6 text-center text-gray-500 text-sm">
            No activity found
          </div>
        </div>
      </div>
    </section>

    <!-- Content Pipeline -->
    <div class="cms-card p-6">
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Content pipeline</h2>
        <p class="text-sm text-gray-600">Pages, services, and blog posts ready for publishing.</p>
      </div>

      <div v-if="dashboard.isLoading && dashboard.contentPipeline.length === 0">
        <SkeletonCard type="table-row" :count="5" />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="border-b border-gray-200">
            <tr>
              <th class="text-left py-3 px-3 font-semibold text-gray-700">Title</th>
              <th class="text-left py-3 px-3 font-semibold text-gray-700">Type</th>
              <th class="text-left py-3 px-3 font-semibold text-gray-700">Author</th>
              <th class="text-left py-3 px-3 font-semibold text-gray-700">Status</th>
              <th class="text-left py-3 px-3 font-semibold text-gray-700">Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(content, idx) in dashboard.contentPipeline.slice(0, 5)"
              :key="idx"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-3 font-medium text-gray-900">{{ content.title }}</td>
              <td class="py-3 px-3 text-gray-600">{{ content.type }}</td>
              <td class="py-3 px-3 text-gray-600">{{ content.author }}</td>
              <td class="py-3 px-3">
                <span :class="[
                  'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                  {
                    'bg-green-100 text-green-700': content.status === 'published',
                    'bg-yellow-100 text-yellow-700': content.status === 'pending',
                    'bg-red-100 text-red-700': content.status === 'rejected',
                    'bg-gray-100 text-gray-700': content.status === 'draft',
                  }
                ]">
                  {{ content.status }}
                </span>
              </td>
              <td class="py-3 px-3 text-gray-500">{{ content.updatedAt }}</td>
            </tr>
            <tr v-if="dashboard.contentPipeline.length === 0">
              <td colspan="5" class="py-8 px-3 text-center text-gray-500">No content found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cms-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.cms-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
