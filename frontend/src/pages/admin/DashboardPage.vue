<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import Card from 'primevue/card'
import Skeleton from 'primevue/skeleton'

const adminStore = useAdminStore()

onMounted(() => {
  adminStore.loadDashboard()
  adminStore.loadListings()
  adminStore.loadActivityLogs(10)
})

function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'badge-warning',
    approved: 'badge-info',
    published: 'badge-success',
    draft: 'badge-secondary',
    rejected: 'badge-danger',
  }
  return statusMap[status] || 'badge-secondary'
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="admin-dashboard">
    <h1 class="page-title">Dashboard</h1>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-label">Total Listings</div>
            <div v-if="adminStore.statsLoading" class="stat-value">
              <Skeleton width="100px" height="2.5rem" />
            </div>
            <div v-else class="stat-value">{{ adminStore.dashboardStats?.total_listings || 0 }}</div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-label">Published</div>
            <div v-if="adminStore.statsLoading" class="stat-value">
              <Skeleton width="100px" height="2.5rem" />
            </div>
            <div v-else class="stat-value text-success">{{ adminStore.dashboardStats?.published_listings || 0 }}</div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-label">Pending Approval</div>
            <div v-if="adminStore.statsLoading" class="stat-value">
              <Skeleton width="100px" height="2.5rem" />
            </div>
            <div v-else class="stat-value text-warning">{{ adminStore.dashboardStats?.pending_approvals || 0 }}</div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-label">Total Users</div>
            <div v-if="adminStore.statsLoading" class="stat-value">
              <Skeleton width="100px" height="2.5rem" />
            </div>
            <div v-else class="stat-value">{{ adminStore.dashboardStats?.total_users || 0 }}</div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-label">Newsletter Subscribers</div>
            <div v-if="adminStore.statsLoading" class="stat-value">
              <Skeleton width="100px" height="2.5rem" />
            </div>
            <div v-else class="stat-value">{{ adminStore.dashboardStats?.newsletter_subscribers || 0 }}</div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Recent Listings Section -->
    <Card class="recent-section">
      <template #header>
        <h2 class="section-title">Recent Listings</h2>
      </template>

      <template #content>
        <div v-if="adminStore.listingsLoading" class="loading-state">
          <Skeleton v-for="i in 5" :key="i" height="3rem" class="mb-3" />
        </div>

        <div v-else-if="adminStore.listings.length === 0" class="empty-state">
          <p>No listings yet</p>
        </div>

        <div v-else class="listings-list">
          <div v-for="listing in adminStore.listings.slice(0, 5)" :key="listing.id" class="listing-item">
            <div class="listing-info">
              <h3 class="listing-title">{{ listing.title }}</h3>
              <div class="listing-meta">
                <span v-if="listing.city" class="listing-city">{{ listing.city.name }}</span>
                <span v-if="listing.category" class="listing-category">{{ listing.category.name }}</span>
              </div>
            </div>
            <div class="listing-status">
              <span :class="['badge', getStatusBadgeClass(listing.status)]">{{ listing.status }}</span>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Recent Activity Section -->
    <Card class="recent-section">
      <template #header>
        <h2 class="section-title">Recent Activity</h2>
      </template>

      <template #content>
        <div v-if="adminStore.activityLoading" class="loading-state">
          <Skeleton v-for="i in 5" :key="i" height="2.5rem" class="mb-3" />
        </div>

        <div v-else-if="adminStore.activityLogs.length === 0" class="empty-state">
          <p>No activity yet</p>
        </div>

        <div v-else class="activity-list">
          <div v-for="log in adminStore.activityLogs" :key="log.id" class="activity-item">
            <div class="activity-icon">
              <i class="pi pi-check-circle" />
            </div>
            <div class="activity-content">
              <p class="activity-description">{{ log.description }}</p>
              <span class="activity-time">{{ formatDate(log.created_at) }}</span>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.admin-dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: none;
}

.stat-content {
  padding: 1rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-value.text-success {
  color: #28a745;
}

.stat-value.text-warning {
  color: #ffc107;
}

.recent-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: none;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  padding: 1rem;
}

.loading-state {
  padding: 1rem;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #999;
}

.listings-list,
.activity-list {
  padding: 1rem;
}

.listing-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.listing-item:hover {
  background-color: #f8f9fa;
}

.listing-item:last-child {
  border-bottom: none;
}

.listing-info {
  flex: 1;
}

.listing-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.listing-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #999;
}

.listing-city,
.listing-category {
  display: inline-block;
}

.listing-city::after {
  content: ' •';
  margin-left: 0.5rem;
}

.listing-status {
  margin-left: 1rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-success {
  background-color: #d4edda;
  color: #155724;
}

.badge-warning {
  background-color: #fff3cd;
  color: #856404;
}

.badge-danger {
  background-color: #f8d7da;
  color: #721c24;
}

.badge-info {
  background-color: #d1ecf1;
  color: #0c5460;
}

.badge-secondary {
  background-color: #e2e3e5;
  color: #383d41;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  flex-shrink: 0;
  color: #28a745;
  font-size: 1.25rem;
}

.activity-content {
  flex: 1;
}

.activity-description {
  margin: 0 0 0.25rem 0;
  color: #1a1a1a;
  font-weight: 500;
}

.activity-time {
  font-size: 0.875rem;
  color: #999;
}

.mb-3 {
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .listing-item,
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .listing-status {
    margin-left: 0;
    margin-top: 0.5rem;
  }
}
</style>
