<!--
  SKELETON LOADING TEMPLATE

  Use this as a reference when updating other admin pages.
  Follow the pattern to add skeleton loading to any module.
-->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { api } from '@/services/api'
import { withMinimumLoadingTime } from '@/utils/loadingHelper'

const items = ref([])
const loading = ref(false)
const error = ref('')

// Load function with 2-second minimum loading time
async function loadData() {
  try {
    loading.value = true
    error.value = ''

    // Wrap API calls with minimum loading time
    await withMinimumLoadingTime(
      (async () => {
        const response = await api.get('/endpoint')
        const data = response.data.data || response.data

        // Transform data as needed
        items.value = Array.isArray(data) ? data : data.data || []
      })(),
      2000  // 2-second minimum loading time
    )
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load data'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <h1>Module Name</h1>
      <button @click="loadData" :disabled="loading">
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <!-- SKELETON LOADING STATE -->
    <!-- Show skeletons while loading AND no data yet -->
    <section v-if="loading && items.length === 0" class="grid gap-4">
      <!-- For metric cards -->
      <SkeletonCard type="metric" :count="3" />

      <!-- For table rows -->
      <!-- <SkeletonCard type="table-row" :count="10" /> -->

      <!-- For chart -->
      <!-- <SkeletonCard type="chart" /> -->
    </section>

    <!-- REAL CONTENT -->
    <!-- Show real content once loaded OR have previous data -->
    <section v-else class="content">
      <!-- Metric Cards Example -->
      <div class="stats-grid">
        <div v-for="item in items" :key="item.id" class="stat-card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.value }}</p>
        </div>
      </div>

      <!-- Table Example -->
      <!-- <DataTable :rows="items" :columns="columns" /> -->

      <!-- Empty State -->
      <div v-if="!loading && items.length === 0" class="empty-state">
        <p>No items found</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.alert {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
}

.alert-error {
  background-color: #fee;
  color: #c33;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}
</style>
