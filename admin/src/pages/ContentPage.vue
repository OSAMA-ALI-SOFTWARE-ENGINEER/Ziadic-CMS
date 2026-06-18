<template>
  <div class="content-container">
    <!-- Header -->
    <div class="content-header">
      <div>
        <h1 class="content-title">Content Management</h1>
        <p class="content-subtitle">Manage pages, blog posts, and content</p>
      </div>
      <button class="add-content-button" @click="selectedType = 'page'; openContent()">
        <i class="pi pi-plus"></i>
        Add Content
      </button>
    </div>

    <!-- Content Types Grid -->
    <div class="content-types-grid">
      <div class="content-type-card" @click="selectedType = 'page'">
        <div class="type-icon">
          <i class="pi pi-file"></i>
        </div>
        <h3>Pages</h3>
        <p>Static and dynamic pages</p>
        <span class="type-count">{{ pages.length }}</span>
      </div>

      <div class="content-type-card" @click="selectedType = 'post'">
        <div class="type-icon">
          <i class="pi pi-book"></i>
        </div>
        <h3>Blog Posts</h3>
        <p>Articles and blog entries</p>
        <span class="type-count">{{ posts.length }}</span>
      </div>

      <div class="content-type-card" @click="selectedType = 'service'">
        <div class="type-icon">
          <i class="pi pi-cog"></i>
        </div>
        <h3>Services</h3>
        <p>Service offerings</p>
        <span class="type-count">{{ services.length }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content-main">
      <!-- Loading State -->
      <div v-if="loading && contents.length === 0" class="content-loading">
        <SkeletonCard type="table-row" :count="8" />
      </div>

      <!-- Content Table -->
      <div v-else class="content-table-wrapper">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by title..."
            class="search-input"
            @keyup.enter="loadContents"
          />
          <button class="search-button" @click="loadContents">
            <i class="pi pi-search"></i>
          </button>
        </div>

        <table class="content-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="content in filteredContents" :key="content.id" class="content-row">
              <td class="cell-title">
                <div class="content-cell">
                  <div class="content-icon">
                    <i :class="getTypeIcon(content.type)"></i>
                  </div>
                  <div class="content-info">
                    <div class="content-name">{{ content.title }}</div>
                  </div>
                </div>
              </td>
              <td class="cell-type">
                <span class="type-badge">{{ content.type }}</span>
              </td>
              <td class="cell-status">
                <span :class="['status-badge', `status-${content.status}`]">
                  {{ content.status }}
                </span>
              </td>
              <td class="cell-date">
                {{ formatDate(content.published_at) }}
              </td>
              <td class="cell-actions">
                <div class="action-buttons">
                  <button class="action-btn edit-btn" @click="openContent(content)" title="Edit content">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button class="action-btn delete-btn" @click="deleteContent(content)" title="Delete content">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="contents.length === 0" class="empty-state">
          <i class="pi pi-inbox"></i>
          <h3>No content yet</h3>
          <p>Create your first page or post to get started</p>
        </div>
      </div>
    </div>

    <!-- Content Modal -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">{{ selectedContent?.id ? 'Edit Content' : 'Create Content' }}</h2>
          <button class="modal-close" @click="showModal = false">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form v-if="selectedContent" class="modal-body" @submit.prevent="saveContent">
          <div class="form-group">
            <label class="form-label">Title *</label>
            <input
              v-model="selectedContent.title"
              type="text"
              class="form-input"
              placeholder="Content title"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Slug *</label>
            <input
              v-model="selectedContent.slug"
              type="text"
              class="form-input"
              placeholder="content-slug"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea
              v-model="selectedContent.description"
              class="form-input form-textarea"
              placeholder="Content description..."
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Status</label>
            <select v-model="selectedContent.status" class="form-input">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Content' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import SkeletonCard from '@/components/SkeletonCard.vue'

interface Content {
  id: number
  title: string
  slug: string
  type: string
  description?: string
  status: string
  published_at?: string
}

function apiBase() {
  const backend = import.meta.env.VITE_BACKEND_URL
  if (backend) return backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return 'http://127.0.0.1:8000'
  return window.location.origin
}

const contents = ref<Content[]>([])
const pages = ref<Content[]>([])
const posts = ref<Content[]>([])
const services = ref<Content[]>([])
const selectedContent = ref<Content | null>(null)
const selectedType = ref('page')
const showModal = ref(false)
const loading = ref(false)
const isSaving = ref(false)
const searchQuery = ref('')

const filteredContents = computed(() => {
  if (!searchQuery.value) return contents.value
  const query = searchQuery.value.toLowerCase()
  return contents.value.filter(c => c.title.toLowerCase().includes(query))
})

function getTypeIcon(type: string) {
  const icons: Record<string, string> = {
    page: 'pi pi-file',
    post: 'pi pi-book',
    service: 'pi pi-cog',
  }
  return icons[type] || 'pi pi-file'
}

function formatDate(dateString?: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function loadContents() {
  loading.value = true
  try {
    const response = await axios.get(`${apiBase()}/api/v1/admin/content`, {
      params: searchQuery.value ? { search: searchQuery.value } : {}
    })
    contents.value = response.data.data || response.data || []
    pages.value = contents.value.filter(c => c.type === 'page')
    posts.value = contents.value.filter(c => c.type === 'post')
    services.value = contents.value.filter(c => c.type === 'service')
  } catch (error) {
    console.error('Failed to load content:', error)
    contents.value = []
  } finally {
    loading.value = false
  }
}

function openContent(content?: Content) {
  selectedContent.value = content
    ? { ...content }
    : { id: 0, title: '', slug: '', type: selectedType.value, description: '', status: 'draft', published_at: undefined }
  showModal.value = true
}

async function saveContent() {
  if (!selectedContent.value) return
  isSaving.value = true

  try {
    const isNew = !selectedContent.value.id
    if (isNew) {
      await axios.post(`${apiBase()}/api/v1/admin/content`, selectedContent.value)
    } else {
      await axios.put(`${apiBase()}/api/v1/admin/content/${selectedContent.value.id}`, selectedContent.value)
    }
    showModal.value = false
    await loadContents()
  } catch (error: any) {
    console.error('Failed to save content:', error)
    alert(error.response?.data?.message || 'Failed to save content')
  } finally {
    isSaving.value = false
  }
}

async function deleteContent(content: Content) {
  if (!confirm(`Delete "${content.title}"? This cannot be undone.`)) return

  try {
    await axios.delete(`${apiBase()}/api/v1/admin/content/${content.id}`)
    await loadContents()
  } catch (error: any) {
    console.error('Failed to delete content:', error)
    alert(error.response?.data?.message || 'Failed to delete content')
  }
}

onMounted(loadContents)
</script>

<style scoped>
.content-container {
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%);
}

/* Header */
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.content-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.content-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.add-content-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
  white-space: nowrap;
}

.add-content-button:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  transform: translateY(-2px);
}

/* Content Types Grid */
.content-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.content-type-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
}

.content-type-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.type-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  color: #0369a1;
  font-size: 1.5rem;
  margin: 0 auto 1rem;
}

.content-type-card:nth-child(2) .type-icon {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: #16a34a;
}

.content-type-card:nth-child(3) .type-icon {
  background: linear-gradient(135deg, #fdf2f8 0%, #fbce7e 100%);
  color: #9f1239;
}

.content-type-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.content-type-card p {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0.25rem 0 1rem;
}

.type-count {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: #f3f4f6;
  color: #374151;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.85rem;
}

/* Main Content */
.content-main {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.content-loading {
  padding: 2rem;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.search-input {
  flex: 1;
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: #f0f0f0;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-button:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.content-table-wrapper {
  overflow-x: auto;
}

.content-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.content-table thead {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 2px solid #e5e7eb;
}

.content-table thead th {
  padding: 1rem 1.25rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.025em;
}

.content-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.15s ease;
}

.content-table tbody tr:hover {
  background-color: #f9fafb;
}

.content-table tbody td {
  padding: 1rem 1.25rem;
  vertical-align: middle;
}

.cell-title {
  min-width: 200px;
}

.content-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.content-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.content-info {
  min-width: 0;
}

.content-name {
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-type {
  min-width: 100px;
}

.type-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: #f0f9ff;
  color: #0369a1;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #bae6fd;
  text-transform: capitalize;
}

.cell-status {
  min-width: 110px;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  border: 1px solid;
}

.status-draft {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  border-color: #d1d5db;
}

.status-published {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #065f46;
  border-color: #a7f3d0;
}

.status-archived {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #7f1d1d;
  border-color: #fecaca;
}

.cell-date {
  min-width: 110px;
  color: #6b7280;
  font-size: 0.8rem;
}

.cell-actions {
  min-width: 100px;
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.edit-btn {
  background-color: #e0e7ff;
  color: #6366f1;
}

.edit-btn:hover {
  background-color: #c7d2fe;
}

.delete-btn {
  background-color: #fee2e2;
  color: #7f1d1d;
}

.delete-btn:hover {
  background-color: #fecaca;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  color: #6b7280;
}

.empty-state i {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.empty-state p {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: #9ca3af;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: 0.75rem;
  max-width: 32rem;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 1.25rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: #f0f0f0;
  color: #1f2937;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}

.form-input {
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.form-textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

.btn-primary {
  padding: 0.625rem 1.5rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.625rem 1.5rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

@media (max-width: 768px) {
  .content-container {
    padding: 1rem;
  }

  .content-header {
    flex-direction: column;
    align-items: stretch;
  }

  .add-content-button {
    width: 100%;
    justify-content: center;
  }

  .content-types-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }

  .content-table {
    font-size: 0.8rem;
  }

  .content-table thead th,
  .content-table tbody td {
    padding: 0.75rem 0.625rem;
  }
}

@media (max-width: 640px) {
  .content-container {
    padding: 0.75rem;
  }

  .content-title {
    font-size: 1.5rem;
  }

  .content-types-grid {
    grid-template-columns: 1fr;
  }

  .search-bar {
    flex-direction: column;
  }

  .search-button {
    width: auto;
    padding: 0.625rem 1rem;
  }

  .content-table {
    font-size: 0.75rem;
  }

  .action-btn {
    width: 1.75rem;
    height: 1.75rem;
  }
}
</style>
