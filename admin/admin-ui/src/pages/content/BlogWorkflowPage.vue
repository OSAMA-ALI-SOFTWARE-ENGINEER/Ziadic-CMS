<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-bold text-ink">Blog Publishing Workflow</h2>
    </div>

    <!-- Status Filter -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex gap-3 flex-wrap">
        <button
          v-for="status in workflowStatuses"
          :key="status.value"
          @click="filterStatus = status.value"
          :class="{
            'bg-primary text-white': filterStatus === status.value,
            'bg-gray-100 text-gray-700 hover:bg-gray-200': filterStatus !== status.value,
          }"
          class="px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {{ status.label }}
        </button>
      </div>
    </div>

    <!-- Workflow Items -->
    <div class="space-y-4">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="workflows.length === 0" class="text-center py-12 text-gray-600">
        No articles in this status
      </div>

      <div
        v-for="workflow in workflows"
        :key="workflow.id"
        class="bg-white rounded-lg shadow p-6 space-y-4"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-bold text-ink">{{ workflow.post.title }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ workflow.post.slug }}</p>
          </div>
          <span
            class="inline-block px-3 py-1 rounded-full text-xs font-semibold"
            :class="getStatusBadgeClass(workflow.status)"
          >
            {{ getStatusLabel(workflow.status) }}
          </span>
        </div>

        <!-- Timeline Info -->
        <div class="border-t border-gray-200 pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p class="text-gray-600">Submitted By</p>
            <p class="font-semibold text-ink">{{ workflow.submitter?.name || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-gray-600">Submitted At</p>
            <p class="font-semibold text-ink">{{ formatDate(workflow.created_at) }}</p>
          </div>
          <div v-if="workflow.reviewer">
            <p class="text-gray-600">Reviewed By</p>
            <p class="font-semibold text-ink">{{ workflow.reviewer.name }}</p>
          </div>
          <div v-if="workflow.reviewed_at">
            <p class="text-gray-600">Reviewed At</p>
            <p class="font-semibold text-ink">{{ formatDate(workflow.reviewed_at) }}</p>
          </div>
        </div>

        <!-- Review Notes -->
        <div v-if="workflow.review_notes" class="border-l-4 border-yellow-400 bg-yellow-50 p-4">
          <p class="text-sm font-semibold text-gray-700 mb-1">Review Notes:</p>
          <p class="text-sm text-gray-600">{{ workflow.review_notes }}</p>
        </div>

        <!-- Actions -->
        <div class="border-t border-gray-200 pt-4 flex gap-3 flex-wrap">
          <button
            v-if="workflow.status === 'pending_review'"
            @click="approveWorkflow(workflow.post.id)"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold transition-colors"
          >
            ✓ Approve
          </button>
          <button
            v-if="workflow.status === 'pending_review'"
            @click="rejectDialogOpen = workflow.post.id"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold transition-colors"
          >
            ✕ Reject
          </button>
          <button
            v-if="workflow.status === 'approved'"
            @click="publishWorkflow(workflow.post.id)"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors"
          >
            🚀 Publish
          </button>
          <button
            v-if="workflow.status === 'published'"
            @click="unpublishWorkflow(workflow.post.id)"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-semibold transition-colors"
          >
            Unpublish
          </button>
          <button
            v-if="workflow.status === 'published'"
            @click="archiveWorkflow(workflow.post.id)"
            class="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-sm font-semibold transition-colors"
          >
            Archive
          </button>
          <button
            @click="router.push(`/admin/posts/${workflow.post.id}/edit`)"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold transition-colors"
          >
            Edit Post
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Dialog -->
    <div
      v-if="rejectDialogOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="rejectDialogOpen = null"
    >
      <div class="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 space-y-4">
        <h3 class="text-xl font-bold text-ink">Reject Article</h3>
        <textarea
          v-model="rejectNotes"
          placeholder="Reason for rejection..."
          rows="4"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        ></textarea>
        <div class="flex gap-3 justify-end">
          <button
            @click="rejectDialogOpen = null"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="submitReject"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

interface Workflow {
  id: number
  post: { id: number; title: string; slug: string; status: string }
  status: string
  submitter?: { name: string }
  reviewer?: { name: string }
  review_notes?: string
  created_at: string
  reviewed_at?: string
}

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const filterStatus = ref('')
const workflows = ref<Workflow[]>([])
const rejectDialogOpen = ref<number | null>(null)
const rejectNotes = ref('')

const workflowStatuses = [
  { value: '', label: 'All' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'archived', label: 'Archived' },
]

async function loadWorkflows() {
  loading.value = true
  try {
    const params = filterStatus.value ? `?status=${filterStatus.value}` : ''
    const response = await fetch(
      `http://localhost:8000/api/v1/admin/blog-workflow${params}`,
      {
        headers: { Authorization: `Bearer ${authStore.token}` },
      }
    )

    if (!response.ok) throw new Error('Failed to load workflows')

    const data = await response.json()
    workflows.value = data.data
  } catch (err) {
    console.error('Error loading workflows:', err)
  } finally {
    loading.value = false
  }
}

async function approveWorkflow(postId: number) {
  try {
    await fetch(`http://localhost:8000/api/v1/admin/blog-workflow/posts/${postId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    loadWorkflows()
  } catch (err) {
    console.error('Error approving workflow:', err)
  }
}

async function submitReject() {
  if (!rejectDialogOpen.value || !rejectNotes.value) return

  try {
    await fetch(
      `http://localhost:8000/api/v1/admin/blog-workflow/posts/${rejectDialogOpen.value}/reject`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ review_notes: rejectNotes.value }),
      }
    )
    rejectDialogOpen.value = null
    rejectNotes.value = ''
    loadWorkflows()
  } catch (err) {
    console.error('Error rejecting workflow:', err)
  }
}

async function publishWorkflow(postId: number) {
  try {
    await fetch(`http://localhost:8000/api/v1/admin/blog-workflow/posts/${postId}/publish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    loadWorkflows()
  } catch (err) {
    console.error('Error publishing workflow:', err)
  }
}

async function unpublishWorkflow(postId: number) {
  try {
    await fetch(
      `http://localhost:8000/api/v1/admin/blog-workflow/posts/${postId}/unpublish`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authStore.token}` },
      }
    )
    loadWorkflows()
  } catch (err) {
    console.error('Error unpublishing workflow:', err)
  }
}

async function archiveWorkflow(postId: number) {
  try {
    await fetch(`http://localhost:8000/api/v1/admin/blog-workflow/posts/${postId}/archive`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    loadWorkflows()
  } catch (err) {
    console.error('Error archiving workflow:', err)
  }
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: 'Draft',
    pending_review: 'Pending Review',
    approved: 'Approved',
    published: 'Published',
    rejected: 'Rejected',
    archived: 'Archived',
  }
  return labels[status] || status
}

function getStatusBadgeClass(status: string) {
  const classes: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending_review: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    published: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    archived: 'bg-gray-400 text-gray-100',
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(loadWorkflows)
</script>
