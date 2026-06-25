<template>
  <div class="test-upload-container">
    <div class="card bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold mb-6">File Upload Test</h2>

      <!-- Upload Zone -->
      <div
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
        :class="[
          'border-2 border-dashed rounded-lg p-8 text-center transition mb-6',
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400',
        ]"
      >
        <input
          ref="fileInput"
          type="file"
          @change="handleFileSelect"
          accept="image/*"
          style="display: none"
        />

        <div v-if="!selectedFile" class="cursor-pointer" @click="browseFiles">
          <svg
            class="mx-auto h-12 w-12 text-gray-400 mb-3"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-10l-3.172-3.172a4 4 0 00-5.656 0L28 20M9 20l3.172-3.172a4 4 0 015.656 0L28 20"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p class="text-lg font-medium text-gray-700 mb-1">
            Drag and drop your image here
          </p>
          <p class="text-sm text-gray-500 mb-3">
            or <span class="text-blue-600 font-medium">click to browse</span>
          </p>
          <p class="text-xs text-gray-400">Supported formats: JPEG, PNG, GIF, WebP</p>
        </div>

        <!-- Selected File Preview -->
        <div v-else class="text-left">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <img
                v-if="filePreview"
                :src="filePreview"
                alt="Preview"
                class="h-20 w-20 object-cover rounded border border-gray-300"
              />
              <div class="min-w-0 flex-1">
                <p class="font-medium text-gray-900 truncate">
                  {{ selectedFile.name }}
                </p>
                <p class="text-sm text-gray-600">
                  {{ formatFileSize(selectedFile.size) }}
                </p>
              </div>
            </div>
            <button
              @click="clearFile"
              :disabled="loading"
              class="ml-2 text-gray-400 hover:text-gray-600 disabled:text-gray-300"
            >
              <svg
                class="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>

          <!-- Upload Progress -->
          <div v-if="loading" class="space-y-3">
            <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                :style="{ width: uploadProgress + '%' }"
                class="bg-blue-600 h-full transition-all duration-300"
              ></div>
            </div>
            <div class="flex justify-between items-center">
              <p class="text-sm text-gray-600">
                Uploading... {{ uploadProgress }}%
              </p>
              <button
                @click="cancelUpload"
                class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition"
              >
                Cancel
              </button>
            </div>
          </div>

          <!-- Upload Actions -->
          <div v-else-if="!uploadedFile" class="flex gap-2">
            <button
              @click="handleUpload"
              :disabled="!selectedFile || loading"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              Upload File
            </button>
            <button
              @click="clearFile"
              class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Upload Error -->
      <div
        v-if="uploadError"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      >
        <h3 class="text-red-800 font-semibold mb-2">Upload Failed</h3>
        <p class="text-red-700 mb-4">{{ uploadError }}</p>
        <button
          @click="uploadError = null"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Dismiss
        </button>
      </div>

      <!-- Uploaded File Info -->
      <div v-if="uploadedFile" class="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 class="text-green-800 font-semibold mb-4">✓ File Uploaded Successfully</h3>

        <div class="space-y-4">
          <div v-if="uploadedFile.preview" class="flex justify-center">
            <img
              :src="uploadedFile.preview"
              alt="Uploaded"
              class="max-h-64 rounded border border-green-300"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-600 mb-1">File Name</p>
              <p class="font-medium text-gray-900 break-all">
                {{ uploadedFile.name }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-600 mb-1">File Size</p>
              <p class="font-medium text-gray-900">
                {{ formatFileSize(uploadedFile.size) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-600 mb-1">File Type</p>
              <p class="font-medium text-gray-900">{{ uploadedFile.type }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-600 mb-1">Upload Time</p>
              <p class="font-medium text-gray-900">{{ uploadedFile.uploadedAt }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-xs text-gray-600 mb-1">Mock URL</p>
              <p class="font-mono text-xs text-gray-700 break-all bg-gray-100 rounded p-2">
                {{ uploadedFile.url }}
              </p>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              @click="downloadFile"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Download
            </button>
            <button
              @click="resetUpload"
              class="flex-1 px-4 py-2 border border-green-300 text-green-800 rounded hover:bg-green-100 transition"
            >
              Upload Another
            </button>
          </div>
        </div>
      </div>

      <!-- Test Actions -->
      <div v-if="!uploadedFile" class="border-t mt-6 pt-6">
        <h3 class="text-sm font-semibold text-gray-600 mb-3">Test Actions</h3>
        <div class="flex flex-wrap gap-2">
          <button
            @click="simulateLargeFile"
            :disabled="loading"
            class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition disabled:bg-orange-400"
          >
            Test Large File
          </button>
          <button
            @click="simulateInvalidFile"
            :disabled="loading"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:bg-red-400"
          >
            Trigger Size Error
          </button>
          <button
            @click="simulateApiError"
            :disabled="loading"
            class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:bg-purple-400"
          >
            Trigger API Error
          </button>
        </div>
      </div>

      <!-- Debug Info -->
      <div class="border-t mt-6 pt-6 bg-gray-50 rounded p-4">
        <h3 class="text-sm font-semibold text-gray-600 mb-2">Debug Info</h3>
        <pre class="text-xs text-gray-700 overflow-auto">{{
          debugInfo
        }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFetch } from '@/composables'

// Types
interface UploadedFileInfo {
  name: string
  size: number
  type: string
  url: string
  preview?: string
  uploadedAt: string
}

// Mock upload API
async function mockUploadFile(file: File, onProgress?: (progress: any) => void): Promise<UploadedFileInfo> {
  // Simulate upload progress
  const progressInterval = setInterval(() => {
    const currentProgress = uploadProgress.value
    if (currentProgress < 90) {
      uploadProgress.value = Math.min(currentProgress + Math.random() * 40, 90)
      onProgress?.({
        loaded: (file.size * uploadProgress.value) / 100,
        total: file.size,
        percentage: uploadProgress.value,
      })
    }
  }, 200)

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000))
  clearInterval(progressInterval)
  uploadProgress.value = 100

  // Return mock response
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    url: `https://api.example.com/media/${Math.random().toString(36).substr(2, 9)}`,
    uploadedAt: new Date().toLocaleTimeString(),
  }
}

// Local state
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const filePreview = ref<string | null>(null)
const uploadedFile = ref<UploadedFileInfo | null>(null)
const uploadError = ref<string | null>(null)
const uploadProgress = ref(0)
const isDragOver = ref(false)

// Setup useFetch (we'll use it for upload)
const { loading, execute, reset: resetFetch } = useFetch(
  async () => {
    if (!selectedFile.value) throw new Error('No file selected')
    return mockUploadFile(selectedFile.value, (progress) => {
      uploadProgress.value = progress.percentage
    })
  },
  { showErrorToast: false, showLoadingToast: false }
)

// Computed
const debugInfo = computed(() => {
  return JSON.stringify(
    {
      hasSelectedFile: !!selectedFile.value,
      fileSize: selectedFile.value?.size,
      fileName: selectedFile.value?.name,
      isUploading: loading.value,
      uploadProgress: uploadProgress.value,
      uploadError: uploadError.value,
      hasUploadedFile: !!uploadedFile.value,
    },
    null,
    2
  )
})

// Methods
function browseFiles() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files?.length) {
    selectFile(files[0])
  }
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files?.length) {
    selectFile(files[0])
  }
}

function selectFile(file: File) {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Please select an image file (JPEG, PNG, GIF, WebP)'
    return
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    uploadError.value = `File size must be less than 5MB. Selected file is ${formatFileSize(file.size)}`
    return
  }

  selectedFile.value = file
  uploadError.value = null
  uploadProgress.value = 0

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    filePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function clearFile() {
  selectedFile.value = null
  filePreview.value = null
  uploadProgress.value = 0
  uploadError.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function handleUpload() {
  if (!selectedFile.value) return

  try {
    uploadProgress.value = 0
    const result = await execute()
    uploadedFile.value = {
      ...result,
      preview: filePreview.value || undefined,
    }
    selectedFile.value = null
    filePreview.value = null
  } catch (err) {
    uploadError.value = err instanceof Error ? err.message : 'Failed to upload file'
  }
}

function cancelUpload() {
  resetFetch()
  clearFile()
}

function resetUpload() {
  uploadedFile.value = null
  clearFile()
}

function downloadFile() {
  if (uploadedFile.value) {
    // In a real app, this would trigger a download
    alert(`Download: ${uploadedFile.value.url}`)
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Test action handlers
function simulateLargeFile() {
  const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large-image.jpg', {
    type: 'image/jpeg',
  })
  selectFile(largeFile)
}

function simulateInvalidFile() {
  const invalidFile = new File(['test'], 'document.pdf', {
    type: 'application/pdf',
  })
  selectFile(invalidFile)
}

async function simulateApiError() {
  if (!selectedFile.value) {
    uploadError.value = 'Please select a file first'
    return
  }

  uploadError.value = 'Simulated API Error: Server unavailable'
}
</script>

<style scoped>
.test-upload-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 1.5rem;
}
</style>
