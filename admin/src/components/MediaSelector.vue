<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api } from '@/services/api'

interface Media {
  id: number
  file_name: string
  public_url: string
  file_type: string
  file_size: number
  created_at: string
}

const props = defineProps<{
  modelValue?: number | null
  label?: string
  multiple?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | number[] | null]
}>()

const mediaList = ref<Media[]>([])
const selectedIds = ref<number[]>(props.modelValue && Array.isArray(props.modelValue) ? props.modelValue : (props.modelValue ? [props.modelValue] : []))
const loading = ref(false)
const showModal = ref(false)
const searchQuery = ref('')
const selectedType = ref('')

const filteredMedia = computed(() => {
  return mediaList.value.filter(media => {
    const matchesSearch = !searchQuery.value || media.file_name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = !selectedType.value || media.file_type === selectedType.value
    return matchesSearch && matchesType && media.file_type === 'image'
  })
})

const selectedMedia = computed(() => {
  return mediaList.value.filter(m => selectedIds.value.includes(m.id))
})

onMounted(() => {
  fetchMedia()
})

async function fetchMedia() {
  loading.value = true
  try {
    const response = await api.get('/custom-media', {
      params: {
        file_type: 'image',
        per_page: 100,
      },
    })
    mediaList.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch media:', error)
  } finally {
    loading.value = false
  }
}

function toggleSelection(id: number) {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    if (props.multiple) {
      selectedIds.value.push(id)
    } else {
      selectedIds.value = [id]
    }
  }
  emitValue()
}

function emitValue() {
  if (props.multiple) {
    emit('update:modelValue', selectedIds.value.length > 0 ? selectedIds.value : null)
  } else {
    emit('update:modelValue', selectedIds.value.length > 0 ? selectedIds.value[0] : null)
  }
}

function removeSelected(id: number) {
  selectedIds.value = selectedIds.value.filter(s => s !== id)
  emitValue()
}

function clearAll() {
  selectedIds.value = []
  emitValue()
}

async function onFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])

  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post('/upload', formData)
      // Fetch updated media list
      await fetchMedia()
      // Select the newly uploaded file
      const newMedia = mediaList.value.find(m => m.file_name === file.name)
      if (newMedia) {
        selectedIds.value.push(newMedia.id)
        emitValue()
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
    }
  }
}
</script>

<template>
  <div class="media-selector">
    <label class="block text-sm font-medium mb-2">
      {{ label || 'Select Media' }}
    </label>

    <!-- Selected Media Preview -->
    <div v-if="selectedMedia.length > 0" class="selected-media mb-4">
      <div class="grid gap-2 grid-cols-3 md:grid-cols-4">
        <div v-for="media in selectedMedia" :key="media.id" class="relative group">
          <img
            :src="media.public_url"
            :alt="media.file_name"
            class="w-full aspect-square object-cover rounded border border-gray-200"
          />
          <button
            v-if="multiple"
            type="button"
            @click="removeSelected(media.id)"
            class="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
          >
            <i class="pi pi-times text-sm"></i>
          </button>
        </div>
      </div>
      <button
        v-if="multiple && selectedMedia.length > 0"
        type="button"
        @click="clearAll"
        class="mt-2 text-sm text-red-500 hover:text-red-700"
      >
        Clear all
      </button>
    </div>

    <!-- Select Button -->
    <button
      type="button"
      @click="showModal = true"
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
    >
      {{ multiple ? 'Select Images' : 'Choose Image' }}
    </button>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-96 flex flex-col">
        <!-- Header -->
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="font-semibold">Select {{ multiple ? 'Images' : 'an Image' }}</h3>
          <button
            type="button"
            @click="showModal = false"
            class="text-gray-500 hover:text-gray-700"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>

        <!-- Upload Area -->
        <div class="p-4 border-b border-gray-200">
          <label class="border-2 border-dashed border-gray-300 rounded p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition block">
            <i class="pi pi-cloud-upload text-2xl text-blue-500 mb-2"></i>
            <div class="font-medium">Upload Image</div>
            <div class="text-sm text-gray-500">Click to browse or drag and drop</div>
            <input type="file" accept="image/*" hidden @change="onFileUpload" multiple />
          </label>
        </div>

        <!-- Search & Filter -->
        <div class="p-4 border-b border-gray-200 flex gap-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search images..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <select
            v-model="selectedType"
            class="px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">All Types</option>
            <option value="image">Images</option>
          </select>
        </div>

        <!-- Media Grid -->
        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="loading" class="flex items-center justify-center h-full">
            <i class="pi pi-spin pi-spinner text-2xl"></i>
          </div>
          <div v-else-if="filteredMedia.length === 0" class="flex items-center justify-center h-full text-gray-500">
            No images found
          </div>
          <div v-else class="grid grid-cols-3 md:grid-cols-4 gap-2">
            <button
              v-for="media in filteredMedia"
              :key="media.id"
              type="button"
              @click="toggleSelection(media.id)"
              :class="[
                'relative aspect-square rounded border-2 overflow-hidden',
                selectedIds.includes(media.id)
                  ? 'border-blue-500 ring-2 ring-blue-300'
                  : 'border-gray-200 hover:border-gray-400'
              ]"
            >
              <img
                :src="media.public_url"
                :alt="media.file_name"
                class="w-full h-full object-cover"
              />
              <div v-if="selectedIds.includes(media.id)" class="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                <i class="pi pi-check text-white text-2xl"></i>
              </div>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            type="button"
            @click="showModal = false"
            class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="showModal = false"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.media-selector {
  width: 100%;
}

.selected-media {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}
</style>
