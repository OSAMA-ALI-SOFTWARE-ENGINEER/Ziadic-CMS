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
  console.log('MediaLibrary mounted, fetching media...')
  fetchMedia()
})

async function fetchMedia() {
  loading.value = true
  fetchError.value = ''
  try {
    console.log('Fetching media from /custom-media...')
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
    console.log('API Response:', response.data)
    media.value = response.data.data || response.data || []
    total.value = response.data.total || 0
    console.log('Media fetched successfully:', {
      count: media.value.length,
      total: total.value,
      sample: media.value[0],
    })
  } catch (error: any) {
    console.error('Failed to fetch media:', error)
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
    console.error('Failed to delete media:', error)
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
    console.warn('No files selected')
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
      console.log(`Uploading file: ${file.name}`)
      const response = await api.post('/upload', formData)
      console.log(`File uploaded successfully:`, response.data)
      uploadedCount++
    } catch (error: any) {
      console.error(`Failed to upload file ${file.name}:`, error)
      uploadError.value = error?.response?.data?.message || error?.message || 'Upload failed'
      failedCount++
    }
  }

  uploading.value = false

  // Reset file input
  input.value = ''

  // Refresh media list after uploads
  if (uploadedCount > 0) {
    console.log(`${uploadedCount} file(s) uploaded successfully`)
    await fetchMedia()
  }

  if (failedCount > 0) {
    console.warn(`${failedCount} file(s) failed to upload`)
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
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const baseUrl = backendUrl.replace('/api/v1/admin', '')
    return `${baseUrl}/${item.file_path.replace(/^\/+/, '')}`
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
            @error="console.warn('Image failed to load:', item.file_name, getMediaUrl(item))"
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
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.media-header {
  margin-bottom: 2rem;
}

.media-title h2 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.media-title p {
  color: #6b7280;
  margin: 0;
}

.upload-area {
  margin-bottom: 2rem;
}

.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9fafb;
}

.upload-zone:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.upload-zone i {
  font-size: 3rem;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.upload-zone strong {
  display: block;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.upload-zone span {
  color: #6b7280;
  font-size: 0.875rem;
}

.media-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-filter {
  display: flex;
  gap: 1rem;
  flex: 1;
  min-width: 300px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.5rem;
  background: white;
}

.search-box i {
  color: #9ca3af;
}

.search-box input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 0.875rem;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
}

.bulk-actions,
.bulk-actions-empty {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.selection-count {
  color: #6b7280;
  font-size: 0.875rem;
}

.btn-icon {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f3f4f6;
}

.btn-text {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-text:hover {
  background: #f3f4f6;
}

.btn-danger {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: #dc2626;
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
  margin-bottom: 2rem;
}

.media-grid.grid {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.media-grid.list {
  grid-template-columns: 1fr;
}

.media-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.2s;
}

.media-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.media-preview {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: #f9fafb;
  overflow: hidden;
}

.media-grid.list .media-preview {
  padding-top: 0;
  height: 80px;
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
  background: #f3f4f6;
  color: #9ca3af;
  font-size: 2rem;
}

.media-checkbox {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 10;
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.preview-actions {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.2s;
}

.media-item:hover .preview-actions {
  opacity: 1;
}

.preview-actions .btn-icon {
  background: white;
  color: #1f2937;
}

.media-info {
  padding: 1rem;
}

.media-info h4 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-type {
  margin: 0.25rem 0;
  color: #9ca3af;
  font-size: 0.75rem;
}

.upload-date {
  margin: 0.25rem 0;
  color: #d1d5db;
  font-size: 0.75rem;
}

.alt-text {
  margin: 0.5rem 0 0 0;
  color: #6b7280;
  font-size: 0.75rem;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

@media (max-width: 768px) {
  .media-grid.grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .media-controls {
    flex-direction: column;
  }

  .search-filter {
    flex-direction: column;
    width: 100%;
  }
}
</style>
