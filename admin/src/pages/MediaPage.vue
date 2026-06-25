<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Modal from '@/components/common/Modal.vue'
import Button from '@/components/common/Button.vue'
import Input from '@/components/common/Input.vue'
import Card from '@/components/common/Card.vue'
import Alert from '@/components/common/Alert.vue'
import DeleteConfirmModal from '@/components/DeleteConfirmModal.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { mediaApi } from '@/services/api/media.api'
import { useFetch, usePaginatedFetch } from '@/composables/useFetch'
import { useForm } from '@/composables/useForm'
import { useUiStore } from '@/stores/ui'
import type { CustomMedia } from '@/types/media'

const ui = useUiStore()

// Modal states
const isUploadModalOpen = ref(false)
const isEditModalOpen = ref(false)
const deleteModalOpen = ref(false)
const mediaToDelete = ref<CustomMedia | null>(null)
const editingMedia = ref<CustomMedia | null>(null)

// Filter and search
const searchQuery = ref('')
const selectedType = ref('')
const sortBy = ref('created_at')
const sortOrder = ref('desc')

// File upload
const uploadProgress = ref<number>(0)
const selectedFile = ref<File | null>(null)

// Media list with pagination
const { items: mediaList, loading: mediaLoading, fetchPage: fetchMedia, currentPage, lastPage } = usePaginatedFetch<CustomMedia>(
  async (page: number, perPage: number) => {
    const filters = selectedType.value ? { file_type: selectedType.value } : {}
    return await mediaApi.getMedia(page, perPage)
  },
  { perPage: 20 }
)

// Delete operation
const { loading: isDeleting, execute: deleteMediaRequest } = useFetch(
  async () => {
    if (!mediaToDelete.value) throw new Error('No media selected')
    return await mediaApi.deleteMedia(mediaToDelete.value.id)
  },
  { showErrorToast: false }
)

// Edit form
const mediaForm = useForm<Partial<CustomMedia>>({
  initialValues: {
    alt_text: '',
    title: '',
    caption: '',
  },
  onSubmit: async (data) => {
    if (!editingMedia.value) return

    try {
      await mediaApi.updateMedia(editingMedia.value.id, {
        alt_text: data.alt_text,
        title: data.title,
        caption: data.caption,
      })
      ui.pushToast('Media updated successfully', 'success')
      isEditModalOpen.value = false
      editingMedia.value = null
      await fetchMedia(currentPage.value)
    } catch (err: any) {
      ui.pushToast(err.message || 'Failed to update media', 'danger')
    }
  },
})

// Upload form
const uploadForm = useForm<{ file?: File }>({
  initialValues: { file: undefined },
  onSubmit: async (data) => {
    if (!selectedFile.value) {
      ui.pushToast('Please select a file', 'warning')
      return
    }

    try {
      await mediaApi.uploadFile(selectedFile.value, (progress) => {
        uploadProgress.value = Math.round(progress.percentage)
      })
      ui.pushToast('File uploaded successfully', 'success')
      isUploadModalOpen.value = false
      selectedFile.value = null
      uploadProgress.value = 0
      uploadForm.reset()
      await fetchMedia(1)
    } catch (err: any) {
      ui.pushToast(err.message || 'Failed to upload file', 'danger')
    }
  },
})

const fileTypes = [
  { label: 'All Types', value: '' },
  { label: 'Images', value: 'image' },
  { label: 'Documents', value: 'document' },
  { label: 'Videos', value: 'video' },
  { label: 'Audio', value: 'audio' },
]

const filteredMedia = computed(() => {
  let result = mediaList.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(m =>
      m.file_name?.toLowerCase().includes(query) ||
      m.alt_text?.toLowerCase().includes(query) ||
      m.title?.toLowerCase().includes(query)
    )
  }

  return result
})

const displayStats = computed(() => {
  const total = mediaList.value.length
  const images = mediaList.value.filter(m => m.file_type === 'image').length
  const docs = mediaList.value.filter(m => m.file_type === 'document').length
  const videos = mediaList.value.filter(m => m.file_type === 'video').length
  return { total, images, docs, videos }
})

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (files?.[0]) {
    selectedFile.value = files[0]
  }
}

function openEditModal(media: CustomMedia) {
  editingMedia.value = media
  mediaForm.setField('alt_text', media.alt_text || '')
  mediaForm.setField('title', media.title || '')
  mediaForm.setField('caption', media.caption || '')
  isEditModalOpen.value = true
}

function showDeleteModal(media: CustomMedia) {
  mediaToDelete.value = media
  deleteModalOpen.value = true
}

async function confirmDelete() {
  if (!mediaToDelete.value) return

  try {
    await deleteMediaRequest()
    const fileName = mediaToDelete.value.file_name
    ui.pushToast(`"${fileName}" deleted successfully`, 'success')
    deleteModalOpen.value = false
    mediaToDelete.value = null
    await fetchMedia(currentPage.value)
  } catch (err: any) {
    ui.pushToast(err.message || 'Failed to delete media', 'danger')
  }
}

function cancelDelete() {
  deleteModalOpen.value = false
  mediaToDelete.value = null
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getFileIcon(fileType: string): string {
  const iconMap: Record<string, string> = {
    'image': 'pi-image',
    'document': 'pi-file',
    'video': 'pi-video',
    'audio': 'pi-volume-up',
  }
  return iconMap[fileType] || 'pi-file'
}

onMounted(() => {
  fetchMedia(1)
})
</script>

<template>
  <div class="media-page space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-(--admin-ink)">Media Library</h1>
        <p class="text-sm text-(--admin-muted) mt-1">Manage and organize your media files</p>
      </div>
      <Button
        @click="fetchMedia(1)"
        :disabled="mediaLoading"
        :is-loading="mediaLoading"
        variant="primary"
        size="md"
      >
        <i :class="['pi', mediaLoading ? 'pi-spin pi-spinner' : 'pi-refresh']"></i>
        <span>{{ mediaLoading ? 'Loading...' : 'Refresh' }}</span>
      </Button>
    </div>

    <!-- Stats Cards -->
    <section v-if="mediaLoading && mediaList.length === 0" class="grid gap-4 md:grid-cols-4">
      <SkeletonCard type="metric" :count="4" />
    </section>

    <section v-else class="grid gap-4 md:grid-cols-4">
      <Card class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-(--admin-muted) font-medium">Total Files</p>
            <p class="text-2xl font-bold text-(--admin-ink) mt-1">{{ displayStats.total }}</p>
          </div>
          <i class="pi pi-folder text-blue-500 text-3xl opacity-20"></i>
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-(--admin-muted) font-medium">Images</p>
            <p class="text-2xl font-bold text-blue-600 mt-1">{{ displayStats.images }}</p>
          </div>
          <i class="pi pi-image text-blue-500 text-3xl opacity-20"></i>
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-(--admin-muted) font-medium">Documents</p>
            <p class="text-2xl font-bold text-green-600 mt-1">{{ displayStats.docs }}</p>
          </div>
          <i class="pi pi-file text-green-500 text-3xl opacity-20"></i>
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-(--admin-muted) font-medium">Videos</p>
            <p class="text-2xl font-bold text-purple-600 mt-1">{{ displayStats.videos }}</p>
          </div>
          <i class="pi pi-video text-purple-500 text-3xl opacity-20"></i>
        </div>
      </Card>
    </section>

    <!-- Actions -->
    <section class="flex gap-3 flex-wrap">
      <Button variant="primary" size="md" @click="isUploadModalOpen = true">
        <i class="pi pi-cloud-upload"></i>
        <span>Upload Media</span>
      </Button>
    </section>

    <!-- Search and Filter -->
    <Card class="p-4">
      <div class="space-y-4">
        <div class="flex gap-3 flex-wrap items-end">
          <div class="flex-1 min-w-[200px]">
            <label class="text-sm font-medium text-(--admin-ink) block mb-2">Search</label>
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name or alt text..."
              @keyup.enter="fetchMedia(1)"
            />
          </div>
          <div class="w-48">
            <label class="text-sm font-medium text-(--admin-ink) block mb-2">Filter by Type</label>
            <select
              v-model="selectedType"
              @change="fetchMedia(1)"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option v-for="type in fileTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </Card>

    <!-- Media Grid/List -->
    <div v-if="mediaLoading && mediaList.length === 0" class="cms-card p-6">
      <SkeletonCard type="grid" :count="8" />
    </div>

    <div v-else-if="!mediaLoading && filteredMedia.length === 0" class="cms-card p-6">
      <div class="text-center py-12">
        <i class="pi pi-inbox text-4xl opacity-30 block mb-3"></i>
        <p class="text-(--admin-muted)">No media files found</p>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="media in filteredMedia" :key="media.id" class="cms-card overflow-hidden hover:shadow-lg transition-shadow">
        <!-- Thumbnail -->
        <div class="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            v-if="media.file_type === 'image'"
            :src="media.public_url"
            :alt="media.alt_text || media.file_name"
            class="w-full h-full object-cover"
          />
          <i v-else :class="['pi', getFileIcon(media.file_type)]" class="text-4xl opacity-50"></i>
        </div>

        <!-- Info -->
        <div class="p-4 space-y-2">
          <h3 class="font-semibold text-sm truncate text-(--admin-ink)" :title="media.file_name">
            {{ media.file_name }}
          </h3>
          <p class="text-xs text-(--admin-muted)">
            {{ formatFileSize(media.file_size) }} · {{ formatDate(media.created_at) }}
          </p>
          <span class="inline-block text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
            {{ media.file_type || 'Unknown' }}
          </span>
        </div>

        <!-- Actions -->
        <div class="p-4 border-t border-gray-100 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            @click="openEditModal(media)"
            class="flex-1"
          >
            <i class="pi pi-pencil"></i>
            <span>Edit</span>
          </Button>
          <Button
            size="sm"
            variant="danger"
            @click="showDeleteModal(media)"
            class="flex-1"
          >
            <i class="pi pi-trash"></i>
            <span>Delete</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="lastPage.value > 1" class="flex justify-center items-center gap-2 mt-6">
      <Button
        variant="secondary"
        size="sm"
        @click="fetchMedia(currentPage.value - 1)"
        :disabled="currentPage.value <= 1"
      >
        <i class="pi pi-chevron-left"></i>
      </Button>
      <span class="text-sm text-(--admin-muted)">
        Page {{ currentPage.value }} of {{ lastPage.value }}
      </span>
      <Button
        variant="secondary"
        size="sm"
        @click="fetchMedia(currentPage.value + 1)"
        :disabled="currentPage.value >= lastPage.value"
      >
        <i class="pi pi-chevron-right"></i>
      </Button>
    </div>

    <!-- Upload Modal -->
    <Modal :is-open="isUploadModalOpen" title="Upload Media" @close="isUploadModalOpen = false">
      <form @submit.prevent="uploadForm.submit" class="space-y-4">
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            @change="handleFileSelect"
            class="hidden"
            id="file-input"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.mp4,.webm,.mp3,.wav"
          />
          <label for="file-input" class="cursor-pointer block">
            <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-2"></i>
            <p class="font-medium text-(--admin-ink)">{{ selectedFile ? selectedFile.name : 'Click to upload or drag and drop' }}</p>
            <p class="text-xs text-(--admin-muted) mt-1">PNG, JPG, PDF, DOC, XLS, MP3, MP4 up to 100MB</p>
          </label>
        </div>

        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="space-y-2">
          <div class="flex justify-between text-xs text-(--admin-muted)">
            <span>Uploading...</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-500 h-2 rounded-full transition-all" :style="{ width: uploadProgress + '%' }"></div>
          </div>
        </div>

        <div class="flex gap-2 justify-end">
          <Button type="button" variant="secondary" @click="isUploadModalOpen = false">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            :disabled="!selectedFile || uploadForm.loading"
            :is-loading="uploadForm.loading"
          >
            Upload
          </Button>
        </div>
      </form>
    </Modal>

    <!-- Edit Modal -->
    <Modal :is-open="isEditModalOpen" title="Edit Media" @close="isEditModalOpen = false">
      <form @submit.prevent="mediaForm.submit" class="space-y-4">
        <Input
          v-model="mediaForm.form.title"
          label="Title"
          type="text"
          placeholder="Enter title"
        />

        <Input
          v-model="mediaForm.form.alt_text"
          label="Alt Text"
          type="text"
          placeholder="Describe the image for accessibility"
        />

        <div>
          <label class="text-sm font-medium text-(--admin-ink) block mb-2">Caption</label>
          <textarea
            v-model="mediaForm.form.caption"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            placeholder="Enter caption"
            rows="3"
          ></textarea>
        </div>

        <div class="flex gap-2 justify-end">
          <Button type="button" variant="secondary" @click="isEditModalOpen = false">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            :disabled="mediaForm.loading"
            :is-loading="mediaForm.loading"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      :is-open="deleteModalOpen"
      :item-name="mediaToDelete?.file_name || ''"
      title="Delete Media"
      message="Are you sure you want to delete"
      :is-loading="isDeleting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.media-page {
  padding: 2rem;
  max-width: 100%;
}

.cms-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.cms-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

@media (max-width: 1024px) {
  .media-page {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .media-page {
    padding: 1rem;
  }

  :deep(.grid.gap-4.md\:grid-cols-4) {
    grid-template-columns: repeat(2, 1fr);
  }

  :deep(.grid.grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3.xl\:grid-cols-4.gap-4) {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .media-page {
    padding: 0.75rem;
  }

  :deep(.grid.gap-4.md\:grid-cols-4) {
    grid-template-columns: 1fr;
  }

  :deep(.grid.grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3.xl\:grid-cols-4.gap-4) {
    grid-template-columns: 1fr;
  }
}
</style>
