<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useUiStore } from '@/stores/ui'

type SubscriberRow = {
  id: number
  email: string
  status: string
  source: string
  subscribed_at: string | null
  confirmation_sent_at: string | null
  created_at: string
}

const ui = useUiStore()
const rows = ref<SubscriberRow[]>([])
const loading = ref(false)
const search = ref('')
const currentPage = ref(1)
const perPage = ref(20)
const total = ref(0)
const deletingId = ref<number | null>(null)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)))

function getApiBase(): string {
  const explicitApiUrl = import.meta.env.VITE_API_URL as string | undefined
  if (explicitApiUrl) {
    return explicitApiUrl.replace(/\/api\/v1\/?$/, '')
  }

  return 'http://127.0.0.1:8000'
}

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

function sourceLabel(value: string) {
  if (value === 'sticky-bar') return 'Sticky Bar'
  if (value === 'footer') return 'Footer'
  return value
}

async function fetchSubscribers() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(currentPage.value),
      per_page: String(perPage.value),
    })

    if (search.value) {
      params.set('search', search.value)
    }

    const response = await fetch(`${getApiBase()}/api/v1/public/newsletter/subscribers?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Unable to load subscriptions.')
    }

    const data = await response.json()

    rows.value = data.data || []
    total.value = data.total || 0
    currentPage.value = data.current_page || 1
    perPage.value = data.per_page || 20
  } catch {
    ui.pushToast('Unable to load subscriptions.', 'danger')
  } finally {
    loading.value = false
  }
}

async function deleteSubscriber(row: SubscriberRow) {
  const ok = window.confirm(`Delete ${row.email}? This cannot be undone.`)
  if (!ok) return

  const token = localStorage.getItem('cms-token') || ''
  if (!token) {
    ui.pushToast('Please sign in to delete subscribers.', 'warning')
    return
  }

  const isPreviewToken = token.startsWith('local-preview-token-')
  const endpoint = isPreviewToken
    ? `${getApiBase()}/api/v1/public/newsletter/subscribers/${row.id}`
    : `${getApiBase()}/api/v1/admin/newsletter-subscribers/${row.id}`

  deletingId.value = row.id

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }

    if (!isPreviewToken) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers,
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(payload?.message || 'Failed to delete subscriber.')
    }

    ui.pushToast(payload?.message || 'Subscriber deleted.', 'success')

    if (rows.value.length === 1 && currentPage.value > 1) {
      currentPage.value -= 1
    }

    await fetchSubscribers()
  } catch (error) {
    ui.pushToast(error instanceof Error ? error.message : 'Failed to delete subscriber.', 'danger')
  } finally {
    deletingId.value = null
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1
    fetchSubscribers()
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value -= 1
    fetchSubscribers()
  }
}

onMounted(fetchSubscribers)
</script>

<template>
  <section class="cms-card subscriptions-card overflow-hidden">
    <div class="subscriptions-card__header">
      <div>
        <h2 class="m-0 text-base font-semibold">Newsletter Subscriptions</h2>
        <p class="subscriptions-card__subtitle">Review submissions and remove spam instantly.</p>
      </div>

      <div class="subscriptions-card__search">
        <input v-model="search" class="cms-input" placeholder="Search by email" @keyup.enter="fetchSubscribers" />
        <button class="secondary-action" type="button" @click="fetchSubscribers">Search</button>
      </div>
    </div>

    <div v-if="loading" class="subscriptions-card__loading">Loading subscribers...</div>

    <div v-else class="overflow-x-auto">
      <table class="subscriptions-card__table">
        <thead>
          <tr>
            <th class="px-5 py-3">Email</th>
            <th class="px-5 py-3">Status</th>
            <th class="px-5 py-3">Source</th>
            <th class="px-5 py-3">Subscribed At</th>
            <th class="px-5 py-3">Email Sent At</th>
            <th class="px-5 py-3">Created At</th>
            <th class="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td class="px-5 py-4 font-medium">{{ row.email }}</td>
            <td class="px-5 py-4">
              <span class="subscriptions-chip subscriptions-chip--status">{{ row.status }}</span>
            </td>
            <td class="px-5 py-4">
              <span class="subscriptions-chip">{{ sourceLabel(row.source) }}</span>
            </td>
            <td class="px-5 py-4">{{ formatDate(row.subscribed_at) }}</td>
            <td class="px-5 py-4">{{ formatDate(row.confirmation_sent_at) }}</td>
            <td class="px-5 py-4">{{ formatDate(row.created_at) }}</td>
            <td class="px-5 py-4 text-right">
              <button class="danger-action" type="button" :disabled="deletingId === row.id" @click="deleteSubscriber(row)">
                {{ deletingId === row.id ? 'Deleting...' : 'Delete' }}
              </button>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td class="px-5 py-10 text-center" colspan="7">
              <p class="subscriptions-card__empty-title">No subscribers yet</p>
              <p class="subscriptions-card__empty-text">New signups from footer and sticky popup will appear here.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="subscriptions-card__footer">
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <div class="flex gap-2">
        <button class="secondary-action" type="button" :disabled="currentPage === 1" @click="prevPage">Previous</button>
        <button class="secondary-action" type="button" :disabled="currentPage === totalPages" @click="nextPage">Next</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.subscriptions-card__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--admin-border);
  padding: 18px 20px;
}

.subscriptions-card__subtitle {
  margin: 4px 0 0;
  color: var(--admin-muted);
  font-size: 13px;
}

.subscriptions-card__search {
  display: flex;
  gap: 8px;
  width: min(100%, 360px);
}

.subscriptions-card__loading {
  padding: 20px;
  color: var(--admin-muted);
  font-size: 14px;
}

.subscriptions-card__table {
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.subscriptions-card__table thead {
  background: var(--admin-table-head);
  color: var(--admin-muted);
  text-transform: uppercase;
  font-size: 12px;
}

.subscriptions-card__table tbody tr {
  border-top: 1px solid var(--admin-border);
}

.subscriptions-chip {
  display: inline-flex;
  align-items: center;
  height: 24px;
  border-radius: 999px;
  padding: 0 10px;
  background: #eef2ff;
  color: #3447d5;
  font-size: 12px;
  font-weight: 600;
}

.subscriptions-chip--status {
  background: #ecfdf3;
  color: #067647;
}

.danger-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  background: #fff1f2;
  color: #b42318;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.danger-action:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.subscriptions-card__empty-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.subscriptions-card__empty-text {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--admin-muted);
}

.subscriptions-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid var(--admin-border);
  padding: 14px 20px;
  color: var(--admin-muted);
  font-size: 14px;
}

@media (max-width: 760px) {
  .subscriptions-card__search {
    width: 100%;
  }

  .subscriptions-card__footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
