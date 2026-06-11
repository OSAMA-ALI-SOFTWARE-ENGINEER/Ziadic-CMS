<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import Card from 'primevue/card'
import Timeline from 'primevue/timeline'
import Button from 'primevue/button'

const adminStore = useAdminStore()

onMounted(() => {
  adminStore.loadActivityLogs()
})

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getActivityIcon(action: string): string {
  const iconMap: Record<string, string> = {
    created: 'pi pi-plus-circle',
    updated: 'pi pi-pencil',
    deleted: 'pi pi-trash',
    published: 'pi pi-send',
    approved: 'pi pi-check-circle',
    rejected: 'pi pi-times-circle',
    viewed: 'pi pi-eye',
  }
  return iconMap[action] || 'pi pi-circle'
}
</script>

<template>
  <div class="activity-page">
    <h1 class="page-title">Activity Log</h1>

    <div class="activity-controls">
      <Button
        label="Refresh"
        icon="pi pi-refresh"
        @click="adminStore.loadActivityLogs()"
        :loading="adminStore.activityLoading"
      />
    </div>

    <Card class="activity-card">
      <template #content>
        <div v-if="adminStore.activityLoading" class="loading-state">
          <p>Loading activity logs...</p>
        </div>

        <div v-else-if="adminStore.activityLogs.length === 0" class="empty-state">
          <p>No activity recorded yet</p>
        </div>

        <div v-else class="activity-timeline">
          <Timeline :value="adminStore.activityLogs" layout="vertical" align="left" class="custom-timeline">
            <template #content="slotProps">
              <div class="activity-item">
                <div class="activity-header">
                  <p class="activity-subject">{{ slotProps.item.subject }}</p>
                  <span class="activity-time">{{ formatDate(slotProps.item.created_at) }}</span>
                </div>
                <p class="activity-description">{{ slotProps.item.description }}</p>
                <div v-if="slotProps.item.changes" class="activity-changes">
                  <p class="changes-title">Changes:</p>
                  <div class="changes-list">
                    <div v-for="(value, key) in slotProps.item.changes" :key="key" class="change-item">
                      <strong>{{ key }}:</strong> {{ value }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template #marker="slotProps">
              <span class="activity-marker">
                <i :class="getActivityIcon(slotProps.item.action)" />
              </span>
            </template>
          </Timeline>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.activity-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2rem;
}

.activity-controls {
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
}

.activity-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: none;
}

.loading-state,
.empty-state {
  padding: 2rem;
  text-align: center;
  color: #999;
}

:deep(.custom-timeline) {
  padding: 2rem 0;
}

:deep(.p-timeline-event) {
  padding-left: 0;
}

:deep(.p-timeline-event-content) {
  padding: 0 1rem;
}

.activity-item {
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.activity-subject {
  margin: 0;
  font-weight: 600;
  color: #1a1a1a;
  font-size: 1rem;
}

.activity-time {
  font-size: 0.875rem;
  color: #999;
  white-space: nowrap;
}

.activity-description {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
}

.activity-changes {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.changes-title {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #666;
  font-size: 0.875rem;
}

.changes-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.change-item {
  font-size: 0.875rem;
  color: #666;
  padding: 0.5rem;
  background-color: #fff;
  border-radius: 4px;
  border-left: 3px solid #c41e3a;
}

.change-item strong {
  color: #1a1a1a;
}

:deep(.p-timeline-event-marker) {
  width: 40px;
  height: 40px;
  background-color: #c41e3a;
  border: 3px solid #fff;
}

.activity-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #fff;
  font-size: 1.25rem;
}

:deep(.p-timeline-event-connector) {
  background-color: #ddd;
}

@media (max-width: 768px) {
  .activity-page {
    padding: 0;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .activity-header {
    flex-direction: column;
  }

  :deep(.p-timeline) {
    padding: 0;
  }

  .activity-item {
    padding: 1rem;
  }
}
</style>
