<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const toast = useToast()
const confirm = useConfirm()

const mediaList = ref<any[]>([])
const loading = ref(false)
const uploading = ref(false)
const searchQuery = ref('')
const typeFilter = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const selectedMedia = ref<any>(null)
const showDetails = ref(false)
const dragActive = ref(false)
const selectedIds = ref<number[]>([])
const uploadProgress = ref(0)
const fileInputRef = ref<HTMLInputElement>()

const typeOptions = [
  { label: 'All Files', value: '' },
  { label: 'Images', value: 'image' },
  { label: 'Videos', value: 'video' },
  { label: 'Audio', value: 'audio' },
  { label: 'Documents', value: 'document' },
]

const filteredMedia = computed(() => {
  return mediaList.value.filter(media => {
    const matchesSearch = !searchQuery.value ||
      media.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesSearch
  })
})

const isAllSelected = computed(() => {
  return filteredMedia.value.length > 0 && selectedIds.value.length === filteredMedia.value.length
})

const hasSelection = computed(() => {
  return selectedIds.value.length > 0
})

async function loadMedia() {
  try {
    loading.value = true
    const params = new URLSearchParams()
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (typeFilter.value) params.append('type', typeFilter.value)

    const url = `/api/v1/admin/media${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url)
    const data = await response.json()
    mediaList.value = data.data || []
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load media',
    })
  } finally {
    loading.value = false
  }
}

function handleDragEnter() {
  dragActive.value = true
}

function handleDragLeave() {
  dragActive.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  dragActive.value = false

  const files = event.dataTransfer?.files
  if (files) {
    uploadFiles(Array.from(files))
  }
}

function handleFileInput(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    uploadFiles(Array.from(files))
  }
  target.value = ''
}

async function uploadFiles(files: File[]) {
  if (files.length === 0) return

  uploading.value = true
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })

    const response = await fetch('/api/v1/admin/media', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) throw new Error('Upload failed')

    const data = await response.json()
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: data.message || `${files.length} file(s) uploaded`,
    })
    loadMedia()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Upload failed. Please try again.',
    })
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

async function viewDetails(media: any) {
  selectedMedia.value = media
  showDetails.value = true
}

function copyUrl() {
  if (!selectedMedia.value?.url) return
  navigator.clipboard.writeText(selectedMedia.value.url)
  toast.add({
    severity: 'info',
    summary: 'Copied',
    detail: 'URL copied to clipboard',
  })
}

function confirmDelete(media: any) {
  confirm.require({
    message: `Delete "${media.name}.${media.extension}"?`,
    header: 'Confirm Deletion',
    icon: 'pi pi-trash',
    accept: async () => {
      try {
        const response = await fetch(`/api/v1/admin/media/${media.id}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Delete failed')
        toast.add({ severity: 'success', summary: 'Success', detail: 'Media deleted' })
        loadMedia()
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete media' })
      }
    },
  })
}

function confirmBulkDelete() {
  if (selectedIds.value.length === 0) return

  confirm.require({
    message: `Delete ${selectedIds.value.length} file(s)?`,
    header: 'Confirm Deletion',
    icon: 'pi pi-trash',
    accept: async () => {
      try {
        const response = await fetch('/api/v1/admin/media/bulk', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds.value }),
        })
        if (!response.ok) throw new Error('Delete failed')
        const data = await response.json()
        toast.add({ severity: 'success', summary: 'Success', detail: data.message })
        selectedIds.value = []
        loadMedia()
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete files' })
      }
    },
  })
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredMedia.value.map(m => m.id)
  }
}

function toggleSelect(id: number) {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

function getTypeIcon(type: string): string {
  return {
    image: 'pi pi-image',
    video: 'pi pi-video',
    audio: 'pi pi-volume-up',
    pdf: 'pi pi-file-pdf',
    document: 'pi pi-file',
    file: 'pi pi-file',
  }[type] || 'pi pi-file'
}

onMounted(() => {
  loadMedia()
})
</script>

<template>
  <div class="media-page">
    <Toast />
    <ConfirmDialog />

    <Card class="mb-4">
      <template #title>
        <h1>Media Library</h1>
      </template>
      <template #content>
        <!-- Upload Area -->
        <div
          class="upload-area"
          :class="{ active: dragActive }"
          @dragenter="handleDragEnter"
          @dragover.prevent="dragActive = true"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
        >
          <div class="upload-content">
            <i class="pi pi-cloud-upload" />
            <p class="upload-title">Drag and drop files here</p>
            <p class="upload-subtitle">or</p>
            <input
              ref="fileInputRef"
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              @change="handleFileInput"
              style="display: none"
            />
            <Button
              label="Choose Files"
              icon="pi pi-upload"
              :loading="uploading"
              @click="fileInputRef?.click()"
            />
            <p class="upload-hint">Max 100MB per file. Images, videos, audio, documents.</p>
          </div>
        </div>

        <!-- Controls -->
        <div class="controls mt-4 mb-4">
          <div class="filters">
            <InputGroup>
              <InputGroupAddon>
                <i class="pi pi-search" />
              </InputGroupAddon>
              <InputText
                v-model="searchQuery"
                placeholder="Search media..."
                @input="loadMedia"
              />
            </InputGroup>

            <Dropdown
              v-model="typeFilter"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              placeholder="Filter by type"
              @change="loadMedia"
            />

            <Button
              :icon="`pi pi-${viewMode === 'grid' ? 'list' : 'th-large'}`"
              @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
              v-tooltip="`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`"
            />
          </div>

          <div v-if="hasSelection" class="bulk-actions">
            <span class="selection-count">{{ selectedIds.length }} selected</span>
            <Button
              label="Delete Selected"
              icon="pi pi-trash"
              class="p-button-danger"
              @click="confirmBulkDelete"
              :disabled="selectedIds.length === 0"
            />
          </div>
        </div>

        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="media-grid">
          <div class="select-all-item">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
            />
            <span>Select All</span>
          </div>

          <div
            v-for="media in filteredMedia"
            :key="media.id"
            class="media-item"
            @click="viewDetails(media)"
          >
            <div class="item-select">
              <input
                type="checkbox"
                :checked="selectedIds.includes(media.id)"
                @click.stop="toggleSelect(media.id)"
              />
            </div>
            <div class="item-preview">
              <img v-if="media.type === 'image'" :src="media.url" :alt="media.name" />
              <div v-else class="item-icon">
                <i :class="getTypeIcon(media.type)" />
              </div>
            </div>
            <div class="item-info">
              <div class="item-name" :title="media.name">{{ media.name }}</div>
              <div class="item-meta">
                {{ media.extension }} • {{ media.formatted_size }}
              </div>
            </div>
            <div class="item-actions" @click.stop>
              <Button
                icon="pi pi-copy"
                class="p-button-rounded p-button-text-primary"
                @click="copyUrl"
                v-tooltip="'Copy URL'"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-text-danger"
                @click="confirmDelete(media)"
                v-tooltip="'Delete'"
              />
            </div>
          </div>
        </div>

        <!-- List View -->
        <div v-else class="media-list">
          <div class="list-header">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
            />
            <div class="col-name">Name</div>
            <div class="col-type">Type</div>
            <div class="col-size">Size</div>
            <div class="col-date">Uploaded</div>
            <div class="col-actions">Actions</div>
          </div>

          <div
            v-for="media in filteredMedia"
            :key="media.id"
            class="list-item"
            @click="viewDetails(media)"
          >
            <input
              type="checkbox"
              :checked="selectedIds.includes(media.id)"
              @click.stop="toggleSelect(media.id)"
            />
            <div class="col-name">
              <div class="name-with-icon">
                <i :class="getTypeIcon(media.type)" />
                <span class="name-text" :title="media.name">{{ media.name }}</span>
              </div>
            </div>
            <div class="col-type">{{ media.type }}</div>
            <div class="col-size">{{ media.formatted_size }}</div>
            <div class="col-date">{{ new Date(media.created_at).toLocaleDateString() }}</div>
            <div class="col-actions" @click.stop>
              <Button
                icon="pi pi-copy"
                class="p-button-rounded p-button-text-primary"
                @click="copyUrl"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-text-danger"
                @click="confirmDelete(media)"
              />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredMedia.length === 0 && !loading" class="empty-state">
          <i class="pi pi-inbox" />
          <p>No media files yet</p>
          <p class="empty-hint">Upload files using drag-and-drop or the upload button above</p>
        </div>
      </template>
    </Card>

    <!-- Details Modal -->
    <Dialog
      v-model:visible="showDetails"
      :header="`${selectedMedia?.name}.${selectedMedia?.extension}`"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div v-if="selectedMedia" class="media-details">
        <!-- Preview -->
        <div class="preview-area">
          <img
            v-if="selectedMedia.type === 'image'"
            :src="selectedMedia.url"
            :alt="selectedMedia.name"
            class="preview-image"
          />
          <div v-else class="preview-placeholder">
            <i :class="getTypeIcon(selectedMedia.type)" />
            <p>{{ selectedMedia.extension }}</p>
          </div>
        </div>

        <!-- Details -->
        <div class="details-info">
          <div class="detail-row">
            <label>File Name:</label>
            <p>{{ selectedMedia.file_name }}</p>
          </div>
          <div class="detail-row">
            <label>Type:</label>
            <p class="capitalize">{{ selectedMedia.type }}</p>
          </div>
          <div class="detail-row">
            <label>Size:</label>
            <p>{{ selectedMedia.formatted_size }}</p>
          </div>
          <div class="detail-row">
            <label>MIME Type:</label>
            <p>{{ selectedMedia.mime_type }}</p>
          </div>
          <div class="detail-row">
            <label>Uploaded:</label>
            <p>{{ new Date(selectedMedia.created_at).toLocaleString() }}</p>
          </div>
        </div>

        <!-- URL -->
        <div class="url-section">
          <label>URL:</label>
          <div class="url-input">
            <input
              type="text"
              :value="selectedMedia.url"
              readonly
              class="url-field"
            />
            <Button
              icon="pi pi-copy"
              class="p-button-icon-only"
              @click="copyUrl"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <Button
            label="Delete"
            icon="pi pi-trash"
            class="p-button-danger"
            @click="confirmDelete(selectedMedia); showDetails = false"
          />
          <Button
            label="Close"
            icon="pi pi-times"
            class="p-button-secondary"
            @click="showDetails = false"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.media-page {
  padding: 1.5rem;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 3rem 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: #fafafa;
}

.upload-area.active {
  border-color: #c41e3a;
  background-color: #fff5f6;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-content i {
  font-size: 3rem;
  color: #999;
}

.upload-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.upload-subtitle {
  margin: 0;
  color: #999;
}

.upload-hint {
  font-size: 0.85rem;
  color: #999;
  margin: 0;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
  flex: 1;
  min-width: 300px;
  flex-wrap: wrap;
}

.bulk-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.selection-count {
  font-size: 0.9rem;
  color: #666;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.select-all-item {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f5f5f5;
  border-radius: 6px;
}

.select-all-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.media-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.media-item:hover {
  border-color: #c41e3a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-select {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 10;
}

.item-select input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.item-preview {
  width: 100%;
  aspect-ratio: 1;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.item-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-icon {
  font-size: 2rem;
  color: #999;
}

.item-info {
  margin-bottom: 0.5rem;
}

.item-name {
  font-weight: 500;
  font-size: 0.85rem;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  font-size: 0.75rem;
  color: #999;
}

.item-actions {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}

.media-list {
  margin-top: 1.5rem;
}

.list-header {
  display: grid;
  grid-template-columns: auto 1fr 100px 100px 120px auto;
  gap: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 2px solid #e5e7eb;
  align-items: center;
}

.list-header input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.list-item {
  display: grid;
  grid-template-columns: auto 1fr 100px 100px 120px auto;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.list-item:hover {
  background: #f9f9f9;
}

.list-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.col-name {
  min-width: 0;
}

.name-with-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.name-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-type,
.col-size,
.col-date {
  font-size: 0.9rem;
  color: #666;
}

.col-actions {
  display: flex;
  gap: 0.25rem;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #999;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0.5rem 0;
}

.empty-hint {
  font-size: 0.9rem;
}

.media-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preview-area {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #999;
}

.preview-placeholder i {
  font-size: 4rem;
}

.preview-placeholder p {
  margin: 0;
  font-weight: 600;
}

.details-info {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 6px;
}

.detail-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  margin-bottom: 0.75rem;
  align-items: start;
}

.detail-row label {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
}

.detail-row p {
  margin: 0;
  word-break: break-word;
}

.capitalize {
  text-transform: capitalize;
}

.url-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.url-section label {
  font-weight: 600;
  font-size: 0.9rem;
}

.url-input {
  display: flex;
  gap: 0.5rem;
}

.url-field {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
  font-family: monospace;
}

.url-field:focus {
  outline: none;
  border-color: #c41e3a;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .filters {
    flex-direction: column;
  }

  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .list-header,
  .list-item {
    grid-template-columns: auto 1fr auto;
  }

  .col-type,
  .col-size,
  .col-date {
    display: none;
  }
}
</style>
