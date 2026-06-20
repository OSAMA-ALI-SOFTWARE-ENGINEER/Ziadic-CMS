<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api } from '@/services/api'

interface Media {
  id: number
  file_name: string
  file_path: string
  public_url: string
  mime_type: string
  file_type: string
  file_size: number
  alt_text?: string
  title?: string
  caption?: string
  status: string
  created_at: string
}

const media = ref<Media[]>([])
const loading = ref(false)
const uploading = ref(false)
const uploadError = ref<string>('')
const fetchError = ref<string>('')
const searchQuery = ref('')
const selectedType = ref('')
const sortBy = ref('created_at')
const sortOrder = ref('desc')
const perPage = ref(20)
const currentPage = ref(1)
const total = ref(0)
const selectedMediaIds = ref<number[]>([])

const fileTypes = [
  { label: 'All Types', value: '' },
  { label: 'Images', value: 'image' },
  { label: 'Documents', value: 'document' },
  { label: 'Videos', value: 'video' },
  { label: 'Audio', value: 'audio' },
]

const displayFormat = ref<'grid' | 'list'>('grid')

onMounted(() => {
  fetchMedia()
})

async function fetchMedia() {
  loading.value = true
  fetchError.value = ''
  try {
    const response = await api.get('/custom-media', {
      params: {
        search: searchQuery.value,
        file_type: selectedType.value,
        sort_by: sortBy.value,
        sort_order: sortOrder.value,
        per_page: perPage.value,
        page: currentPage.value,
      },
    })
    media.value = response.data.data || response.data || []
    total.value = response.data.total || 0
  } catch (error: any) {
    fetchError.value = error?.response?.data?.message || error?.message || 'Failed to load media'
    media.value = []
  } finally {
    loading.value = false
  }
}

function onSearch() {
  currentPage.value = 1
  fetchMedia()
}

function onFilterChange() {
  currentPage.value = 1
  fetchMedia()
}

function onSortChange() {
  currentPage.value = 1
  fetchMedia()
}

function toggleSelectMedia(id: number) {
  const index = selectedMediaIds.value.indexOf(id)
  if (index > -1) {
    selectedMediaIds.value.splice(index, 1)
  } else {
    selectedMediaIds.value.push(id)
  }
}

function selectAll() {
  selectedMediaIds.value = media.value.map(m => m.id)
}

function deselectAll() {
  selectedMediaIds.value = []
}

async function deleteSelected() {
  if (selectedMediaIds.value.length === 0) return
  if (!confirm(`Delete ${selectedMediaIds.value.length} media items?`)) return

  try {
    await api.post('/custom-media/bulk-delete', {
      ids: selectedMediaIds.value,
    })
    selectedMediaIds.value = []
    fetchMedia()
  } catch (error) {
  }
}

function copyUrl(url: string) {
  navigator.clipboard.writeText(url)
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const totalPages = computed(() => {
  return Math.ceil(total.value / perPage.value)
})

async function onUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])

  if (files.length === 0) {
    return
  }

  uploading.value = true
  uploadError.value = ''
  let uploadedCount = 0
  let failedCount = 0

  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('related_module', 'admin-upload')

    try {
      const response = await api.post('/upload', formData)
      uploadedCount++
    } catch (error: any) {
      uploadError.value = error?.response?.data?.message || error?.message || 'Upload failed'
      failedCount++
    }
  }

  uploading.value = false

  // Reset file input
  input.value = ''

  // Refresh media list after uploads
  if (uploadedCount > 0) {
    await fetchMedia()
  }

  if (failedCount > 0) {
  }
}

function getFileIcon(fileType: string): string {
  const iconMap: Record<string, string> = {
    'image': 'pi-image',
    'document': 'pi-file',
    'pdf': 'pi-file-pdf',
    'video': 'pi-video',
    'audio': 'pi-volume-up',
  }
  return `pi ${iconMap[fileType] || 'pi-file'}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getMediaUrl(item: Media): string {
  // Prefer public_url as it's already fully qualified
  if (item.public_url) {
    return item.public_url
  }
  // Fallback to file_path with base URL
  if (item.file_path) {
    if (item.file_path.startsWith('http')) {
      return item.file_path
    }
    const backendUrl = import.meta.env.VITE_API_URL || 'https://admin.kukaqka.com'
    return `${backendUrl}/${item.file_path.replace(/^\/+/, '')}`
  }
  return ''
}
</script>

<template>
  <div class="media-library">
    <!-- Header -->
    <div class="media-header">
      <div class="media-title">
        <h2>Media Library</h2>
        <p>Drag-and-drop upload and manage listing galleries, documents, and SEO images.</p>
      </div>
    </div>

    <!-- Upload Area -->
    <div class="upload-area">
      <label class="upload-zone" :style="{ opacity: uploading ? 0.6 : 1 }">
        <i class="pi" :class="uploading ? 'pi-spin pi-spinner' : 'pi-cloud-upload'"></i>
        <strong>{{ uploading ? 'Uploading...' : 'Drop files here or click to upload' }}</strong>
        <span>Images, documents, and videos up to 10MB</span>
        <input type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" hidden @change="onUpload" :disabled="uploading" />
      </label>
    </div>

    <!-- Error Messages -->
    <div v-if="uploadError" class="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm mb-4">
      <i class="pi pi-exclamation-circle mr-2"></i>
      <strong>Upload Error:</strong> {{ uploadError }}
    </div>
    <div v-if="fetchError" class="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm mb-4">
      <i class="pi pi-exclamation-circle mr-2"></i>
      <strong>Fetch Error:</strong> {{ fetchError }}
    </div>

    <!-- Controls -->
    <div class="media-controls">
      <div class="search-filter">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search media..."
            @keyup.enter="onSearch"
          />
          <button @click="onSearch" class="btn-icon">
            <i class="pi pi-search"></i>
          </button>
        </div>

        <select v-model="selectedType" @change="onFilterChange" class="filter-select">
          <option v-for="type in fileTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>

        <select v-model="sortBy" @change="onSortChange" class="filter-select">
          <option value="created_at">Newest</option>
          <option value="created_at" selected>Oldest</option>
          <option value="file_name">Name</option>
          <option value="file_size">Size</option>
        </select>

        <select v-model="displayFormat" class="filter-select">
          <option value="grid">Grid View</option>
          <option value="list">List View</option>
        </select>
      </div>

      <div class="bulk-actions" v-if="selectedMediaIds.length > 0">
        <span class="selection-count">{{ selectedMediaIds.length }} selected</span>
        <button @click="deselectAll" class="btn-text">Deselect All</button>
        <button @click="deleteSelected" class="btn-danger">Delete Selected</button>
      </div>
      <div v-else class="bulk-actions-empty">
        <button @click="selectAll" class="btn-text" v-if="media.length > 0">Select All</button>
      </div>
    </div>

    <!-- Media Grid/List -->
    <div v-if="loading" class="loading">
      <i class="pi pi-spin pi-spinner"></i>
      Loading media...
    </div>

    <div v-else-if="media.length === 0" class="empty-state">
      <i class="pi pi-image"></i>
      <p>No media files yet. Upload your first file to get started.</p>
    </div>

    <div v-else :class="['media-grid', displayFormat]">
      <div v-for="item in media" :key="item.id" class="media-item">
        <div class="media-preview">
          <input
            type="checkbox"
            :checked="selectedMediaIds.includes(item.id)"
            @change="toggleSelectMedia(item.id)"
            class="media-checkbox"
          />

          <img
            v-if="item.file_type === 'image'"
            :src="getMediaUrl(item)"
            :alt="item.alt_text || item.file_name"
            class="preview-image"
          />
          <div v-else class="preview-placeholder">
            <i :class="getFileIcon(item.file_type)"></i>
          </div>

          <div class="preview-actions">
            <button @click="copyUrl(getMediaUrl(item))" title="Copy URL" class="btn-icon">
              <i class="pi pi-copy"></i>
            </button>
            <a :href="getMediaUrl(item)" target="_blank" title="Open" class="btn-icon">
              <i class="pi pi-external-link"></i>
            </a>
          </div>
        </div>

        <div class="media-info">
          <h4>{{ item.file_name }}</h4>
          <p class="file-type">{{ item.file_type }} • {{ formatFileSize(item.file_size) }}</p>
          <p class="upload-date">{{ formatDate(item.created_at) }}</p>
          <p v-if="item.alt_text" class="alt-text">Alt: {{ item.alt_text }}</p>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        @click="currentPage--"
        :disabled="currentPage === 1"
        class="btn-pagination"
      >
        Previous
      </button>
      <span class="page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button
        @click="currentPage++"
        :disabled="currentPage === totalPages"
        @change="fetchMedia"
        class="btn-pagination"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
.media-library {
  padding: 1.5rem;
  max-width: 100%;
}

.media-header {
  margin-bottom: 2.5rem;
  padding: 0 0.5rem;
}

.media-title h2 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.875rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.media-title p {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
}

.upload-area {
  margin-bottom: 2.5rem;
  padding: 0 0.5rem;
}

.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  border: 2px dashed #e5e7eb;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  position: relative;
  overflow: hidden;
}

.upload-zone::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.upload-zone:hover {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.upload-zone i {
  font-size: 3.5rem;
  color: #3b82f6;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.upload-zone strong {
  display: block;
  color: #1f2937;
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.upload-zone span {
  color: #6b7280;
  font-size: 0.9375rem;
}

.media-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding: 0 0.5rem;
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
}

.search-filter {
  display: flex;
  gap: 1rem;
  flex: 1;
  min-width: 280px;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  transition: all 0.2s;
}

.search-box:focus-within {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-box i {
  color: #9ca3af;
  font-size: 1rem;
}

.search-box input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 0.9375rem;
  background: transparent;
  min-width: 0;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: white;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.bulk-actions,
.bulk-actions-empty {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.selection-count {
  color: #6b7280;
  font-size: 0.9375rem;
  font-weight: 500;
  padding: 0 0.5rem;
}

.btn-icon {
  padding: 0.625rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.btn-icon:hover {
  background: #f9fafb;
  border-color: #3b82f6;
  color: #3b82f6;
}

.btn-text {
  padding: 0.625rem 1.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s;
}

.btn-text:hover {
  background: #f9fafb;
  border-color: #3b82f6;
  color: #3b82f6;
}

.btn-danger {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.loading,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.loading i {
  font-size: 2rem;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.empty-state i {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.media-grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  padding: 0 0.5rem;
}

.media-grid.grid {
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.media-grid.list {
  grid-template-columns: 1fr;
}

.media-item {
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.media-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.12);
  transform: translateY(-4px);
}

.media-preview {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  overflow: hidden;
}

.media-grid.list .media-preview {
  padding-top: 0;
  height: 100px;
}

.preview-image,
.preview-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #9ca3af;
  font-size: 2.5rem;
}

.media-checkbox {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 10;
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  accent-color: #3b82f6;
}

.preview-actions {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 0.2s;
}

.media-item:hover .preview-actions {
  opacity: 1;
}

.preview-actions .btn-icon {
  background: white;
  color: #1f2937;
  border: none;
  padding: 0.75rem;
  font-size: 1.125rem;
}

.preview-actions .btn-icon:hover {
  background: #f0f9ff;
  color: #3b82f6;
}

.media-info {
  padding: 1.25rem;
}

.media-info h4 {
  margin: 0 0 0.625rem 0;
  color: #1f2937;
  font-size: 0.9375rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.file-type {
  margin: 0.5rem 0;
  color: #6b7280;
  font-size: 0.8125rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.upload-date {
  margin: 0.5rem 0 0;
  color: #9ca3af;
  font-size: 0.8125rem;
}

.alt-text {
  margin: 0.75rem 0 0 0;
  color: #6b7280;
  font-size: 0.8125rem;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: italic;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-pagination {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-pagination:hover:not(:disabled) {
  background: #f3f4f6;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #6b7280;
  font-size: 0.875rem;
}

@media (max-width: 1024px) {
  .media-library {
    padding: 1.25rem;
  }

  .media-title h2 {
    font-size: 1.625rem;
  }

  .media-title p {
    font-size: 0.95rem;
  }

  .upload-zone {
    padding: 3rem 1.5rem;
  }

  .upload-zone i {
    font-size: 3rem;
  }

  .upload-zone strong {
    font-size: 1rem;
  }

  .media-grid.grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .media-controls {
    gap: 1rem;
    padding: 1.25rem;
  }

  .search-filter {
    gap: 0.875rem;
  }

  .filter-select {
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 768px) {
  .media-library {
    padding: 1rem;
  }

  .media-header {
    padding: 0;
    margin-bottom: 1.5rem;
  }

  .media-title h2 {
    font-size: 1.375rem;
    line-height: 1.25;
  }

  .media-title p {
    font-size: 0.875rem;
  }

  .upload-area {
    padding: 0;
    margin-bottom: 1.5rem;
  }

  .upload-zone {
    padding: 2.5rem 1.25rem;
    border-radius: 0.75rem;
  }

  .upload-zone i {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }

  .upload-zone strong {
    font-size: 0.95rem;
    margin-bottom: 0.375rem;
  }

  .upload-zone span {
    font-size: 0.875rem;
  }

  .media-controls {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .search-filter {
    flex-direction: column;
    width: 100%;
    min-width: auto;
    gap: 0.625rem;
  }

  .search-box {
    width: 100%;
  }

  .filter-select {
    width: 100%;
    padding: 0.625rem;
    font-size: 0.825rem;
  }

  .bulk-actions,
  .bulk-actions-empty {
    width: 100%;
    flex-direction: column;
  }

  .bulk-actions button,
  .bulk-actions-empty button {
    width: 100%;
  }

  .selection-count {
    font-size: 0.8rem;
  }

  .media-grid.grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .media-grid.list {
    gap: 0.75rem;
  }

  .media-item {
    border-radius: 0.5rem;
  }

  .media-info {
    padding: 0.875rem;
  }

  .media-info h4 {
    font-size: 0.825rem;
  }

  .file-type,
  .upload-date {
    font-size: 0.75rem;
  }

  .pagination {
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .btn-pagination {
    padding: 0.4rem 0.875rem;
    font-size: 0.8rem;
  }

  .page-info {
    font-size: 0.8rem;
  }
}

@media (max-width: 640px) {
  .media-library {
    padding: 0.75rem;
  }

  .media-header {
    padding: 0;
    margin-bottom: 1rem;
  }

  .media-title h2 {
    font-size: 1.125rem;
    margin-bottom: 0.375rem;
    line-height: 1.3;
  }

  .media-title p {
    font-size: 0.8rem;
    line-height: 1.3;
  }

  .upload-area {
    margin-bottom: 1rem;
  }

  .upload-zone {
    padding: 2rem 1rem;
    border-radius: 0.5rem;
  }

  .upload-zone i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .upload-zone strong {
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }

  .upload-zone span {
    font-size: 0.8rem;
  }

  .media-controls {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border-radius: 0.5rem;
  }

  .search-filter {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }

  .search-box {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
  }

  .search-box i {
    font-size: 0.85rem;
  }

  .search-box input {
    font-size: 0.85rem;
  }

  .filter-select {
    width: 100%;
    padding: 0.5rem;
    font-size: 0.8rem;
    border-radius: 0.375rem;
  }

  .bulk-actions,
  .bulk-actions-empty {
    width: 100%;
  }

  .bulk-actions button,
  .bulk-actions-empty button {
    flex: 1;
    min-width: auto;
    padding: 0.5rem 0.625rem;
    font-size: 0.75rem;
  }

  .selection-count {
    font-size: 0.75rem;
  }

  .media-grid.grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.625rem;
    margin-bottom: 1rem;
    padding: 0;
  }

  .media-grid.list {
    gap: 0.5rem;
    padding: 0;
  }

  .media-item {
    border-radius: 0.375rem;
    overflow: visible;
  }

  .media-preview {
    border-radius: 0.375rem 0.375rem 0 0;
  }

  .media-grid.list .media-preview {
    height: 80px;
  }

  .preview-image,
  .preview-placeholder {
    border-radius: 0.375rem 0.375rem 0 0;
  }

  .preview-placeholder {
    font-size: 2rem;
  }

  .media-checkbox {
    top: 0.5rem;
    left: 0.5rem;
    width: 1.125rem;
    height: 1.125rem;
  }

  .preview-actions {
    gap: 0.5rem;
  }

  .preview-actions .btn-icon {
    padding: 0.5rem;
    font-size: 1rem;
  }

  .media-info {
    padding: 0.625rem;
  }

  .media-info h4 {
    font-size: 0.75rem;
    margin-bottom: 0.375rem;
    line-height: 1.3;
  }

  .file-type {
    font-size: 0.7rem;
    margin: 0.25rem 0;
  }

  .upload-date {
    font-size: 0.7rem;
    margin: 0.25rem 0 0;
  }

  .alt-text {
    font-size: 0.7rem;
    margin: 0.375rem 0 0;
  }

  .btn-icon {
    padding: 0.5rem;
  }

  .btn-text {
    padding: 0.5rem 0.875rem;
    font-size: 0.8rem;
  }

  .btn-danger {
    padding: 0.5rem 0.875rem;
    font-size: 0.8rem;
  }

  .pagination {
    gap: 0.5rem;
    margin-top: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn-pagination {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }

  .page-info {
    font-size: 0.75rem;
  }

  .loading,
  .empty-state {
    padding: 2rem 1rem;
  }

  .loading i,
  .empty-state i {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }

  .empty-state p {
    font-size: 0.85rem;
  }
}
</style>
