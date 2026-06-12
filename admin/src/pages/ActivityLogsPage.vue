<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Activity Logs</h2>
    <div class="bg-white rounded shadow">
      <table class="min-w-full">
        <thead class="bg-(--admin-panel)">
          <tr>
            <th class="px-4 py-3 text-left">Date</th>
            <th class="px-4 py-3 text-left">Action</th>
            <th class="px-4 py-3 text-left">User</th>
            <th class="px-4 py-3 text-left">Related</th>
            <th class="px-4 py-3 text-left">IP</th>
            <th class="px-4 py-3 text-left">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id" class="border-t hover:bg-gray-50 cursor-pointer" @click="select(log)">
            <td class="px-4 py-3">{{ new Date(log.created_at).toLocaleString() }}</td>
            <td class="px-4 py-2">
              <span :class="badgeClass(log)">{{ displayAction(log) }}</span>
            </td>
            <td class="px-4 py-2">{{ displayUser(log) }}</td>
            <td class="px-4 py-2">{{ displayRelated(log) }}</td>
            <td class="px-4 py-2">{{ log.ip_address || log.ip }}</td>
            <td class="px-4 py-2"><pre class="text-xs">{{ pretty(log) }}</pre></td>
          </tr>
        </tbody>
      </table>
        <div v-if="toast" class="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded shadow">{{ toast }}</div>
      <div v-if="selected" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
        <div class="bg-white rounded shadow max-w-3xl w-full p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Activity Log — {{ displayAction(selected) }}</h3>
            <button class="text-gray-500" @click="selected = null">Close</button>
          </div>
          <div class="text-sm mb-4">
            <strong>User:</strong> {{ displayUser(selected) }}
            <br />
            <strong>When:</strong> {{ new Date(selected.created_at).toLocaleString() }}
            <br />
            <strong>IP:</strong> {{ selected.ip_address || selected.ip }}
          </div>
          <pre class="bg-gray-100 p-4 rounded text-xs overflow-auto" style="max-height:400px">{{ pretty(selected) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'

function apiBase() {
  const backend = import.meta.env.VITE_BACKEND_URL
  if (backend) return backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return 'http://127.0.0.1:8000'
  return window.location.origin
}

const logs = ref([])
const selected = ref(null)

function select(l) { selected.value = l }

let pollInterval

async function load() {
  try {
    const useDebug = import.meta.env.DEV
    const path = useDebug ? '/api/admin/debug/activity-logs' : '/api/v1/admin/activity-logs'
    const res = await axios.get(apiBase() + path)
    logs.value = res.data.data ?? res.data
  } catch (e) {
    console.error('Failed to load activity logs', e)
    logs.value = []
  }
}

onMounted(() => {
  load()
  pollInterval = setInterval(load, 10000)
  trySubscribeRealtime(load)
})

onBeforeUnmount(() => {
  if (pollInterval) clearInterval(pollInterval)
})

function pretty(l) {
  try {
    if (l.old_value || l.new_value) return JSON.stringify({ old: l.old_value, new: l.new_value }, null, 2)
    if (l.properties) return JSON.stringify(typeof l.properties === 'string' ? JSON.parse(l.properties) : l.properties, null, 2)
    return JSON.stringify(l, null, 2)
  } catch (e) { return '' }
}

function displayAction(l) {
  return l.action || l.event || '(unknown)'
}

function displayUser(l) {
  const name = l.user_name || (l.properties && (l.properties.causer_name || (typeof l.properties === 'string' ? (JSON.parse(l.properties).causer_name || null) : null)))
  const role = l.user_role || (l.properties && (l.properties.causer_role || null))
  return (name ? name : 'System') + (role ? ` (${role})` : '')
}

function displayRelated(l) {
  const type = l.related_type || l.subject_type || ''
  const id = l.related_id || l.subject_id || ''
  return `${type ? type : '#'} ${id ? `#${id}` : ''}`.trim()
}

function badgeClass(l) {
  const action = (l.action || l.event || '').toLowerCase()
  if (action.includes('created') || action.includes('submitted') || action.includes('uploaded')) {
    return 'badge badge--success'
  }
  if (action.includes('deleted') || action.includes('rejected')) {
    return 'badge badge--danger'
  }
  if (action.includes('approved') || action.includes('published')) {
    return 'badge badge--primary'
  }
  if (action.includes('login') || action.includes('logout')) {
    return 'badge badge--warning'
  }
  return 'badge badge--muted'
}

// simple toast for new logs
const toast = ref(null)
function showToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = null }, 4000)
}

// realtime subscription helper for the other SPA (Echo optional)
let echo2
async function trySubscribeRealtime(loadFn) {
  try {
    if (!window.Echo) {
      const Echo = (await import('laravel-echo')).default
      const Pusher = (await import('pusher-js')).default
      echo2 = new Echo({ broadcaster: 'pusher', key: import.meta.env.VITE_PUSHER_KEY || 'local', wsHost: import.meta.env.VITE_ECHO_HOST || window.location.hostname, wsPort: import.meta.env.VITE_ECHO_PORT || 6001, forceTLS: false, disableStats: true, enabledTransports: ['ws', 'wss'], client: Pusher })
      window.Echo = echo2
    }
    window.Echo.channel('activity-logs').listen('ActivityLogged', (e) => loadFn())
  } catch (e) {}
}
</script>

<style scoped>
pre { white-space: pre-wrap }
</style>

<style>
.badge { display:inline-flex; align-items:center; padding:0.125rem 0.5rem; border-radius:0.375rem; font-size:0.75rem; font-weight:600 }
.badge--success { background:var(--badge-success-bg,#e6fffa); color:var(--badge-success-fg,#065f46) }
.badge--danger { background:var(--badge-danger-bg,#fee2e2); color:var(--badge-danger-fg,#7f1d1d) }
.badge--primary { background:var(--badge-primary-bg,#eff6ff); color:var(--badge-primary-fg,#1e3a8a) }
.badge--warning { background:var(--badge-warning-bg,#fffbeb); color:var(--badge-warning-fg,#92400e) }
.badge--muted { background:var(--badge-muted-bg,#f3f4f6); color:var(--badge-muted-fg,#111827) }

:root.dark .badge--success { background:var(--badge-success-bg-dark,#064e3b); color:var(--badge-success-fg-dark,#d1fae5) }
:root.dark .badge--danger { background:var(--badge-danger-bg-dark,#7f1d1d); color:var(--badge-danger-fg-dark,#fee2e2) }
:root.dark .badge--primary { background:var(--badge-primary-bg-dark,#1e3a8a); color:var(--badge-primary-fg-dark,#dbeafe) }
:root.dark .badge--warning { background:var(--badge-warning-bg-dark,#92400e); color:var(--badge-warning-fg-dark,#fff7ed) }
:root.dark .badge--muted { background:var(--badge-muted-bg-dark,#111827); color:var(--badge-muted-fg-dark,#f8fafc) }
</style>
