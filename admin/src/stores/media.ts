import { defineStore } from 'pinia'
import { useUiStore } from './ui'
import { mediaApi, type MediaResponse, type UploadProgress } from '@/services/api/media.api'
import type { CustomMedia } from '@/types/media'

export const useMediaStore = defineStore('media', {
  state: () => ({
    mediaFiles: [] as CustomMedia[],
    currentMediaFile: null as CustomMedia | null,
    isLoading: false,
    isUploading: false,
    error: null as string | null,
    uploadProgress: 0,
    pagination: {
      currentPage: 1,
      perPage: 50,
      total: 0,
      lastPage: 1,
    },
  }),

  getters: {
    getTotalMedia: (state) => state.pagination.total,
    getCurrentPage: (state) => state.pagination.currentPage,
    getLastPage: (state) => state.pagination.lastPage,
    hasMorePages: (state) => state.pagination.currentPage < state.pagination.lastPage,
    getMediaById: (state) => (id: number) => state.mediaFiles.find((m) => m.id === id),
  },

  actions: {
    /**
     * Fetch media files with pagination
     */
    async fetchMedia(page: number = 1, perPage: number = 50) {
      this.isLoading = true
      this.error = null
      try {
        const response = await mediaApi.getMedia(page, perPage)
        this.mediaFiles = response.data
        this.pagination = {
          currentPage: response.meta.current_page,
          perPage: response.meta.per_page,
          total: response.meta.total,
          lastPage: response.meta.last_page,
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch media'
        this.error = message
        useUiStore().pushToast(message, 'danger')
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Get single media file
     */
    async getMediaFile(id: number) {
      this.isLoading = true
      this.error = null
      try {
        const response = await mediaApi.getMediaFile(id)
        this.currentMediaFile = response.data
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch media file'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Upload single file with progress tracking
     */
    async uploadFile(file: File) {
      this.isUploading = true
      this.uploadProgress = 0
      this.error = null
      try {
        const response = await mediaApi.uploadFile(file, (progress: UploadProgress) => {
          this.uploadProgress = Math.round(progress.percentage)
        })
        this.mediaFiles.unshift(response.data)
        this.pagination.total++
        useUiStore().pushToast('File uploaded successfully', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload file'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isUploading = false
        this.uploadProgress = 0
      }
    },

    /**
     * Bulk upload files with progress tracking
     */
    async bulkUploadFiles(files: File[]) {
      this.isUploading = true
      this.uploadProgress = 0
      this.error = null
      try {
        const response = await mediaApi.bulkUploadFiles(files, (fileIndex: number, progress: UploadProgress) => {
          // Calculate overall progress
          const overallProgress = ((fileIndex + progress.percentage / 100) / files.length) * 100
          this.uploadProgress = Math.round(overallProgress)
        })
        this.mediaFiles.unshift(...response.data)
        this.pagination.total += response.data.length
        useUiStore().pushToast(`${response.data.length} files uploaded successfully`, 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload files'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isUploading = false
        this.uploadProgress = 0
      }
    },

    /**
     * Update media file metadata
     */
    async updateMedia(id: number, data: Partial<CustomMedia>) {
      this.isLoading = true
      this.error = null
      try {
        const response = await mediaApi.updateMedia(id, data)
        const index = this.mediaFiles.findIndex((m) => m.id === id)
        if (index >= 0) {
          this.mediaFiles[index] = response.data
        }
        if (this.currentMediaFile?.id === id) {
          this.currentMediaFile = response.data
        }
        useUiStore().pushToast('Media updated successfully', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update media'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Delete single media file
     */
    async deleteMedia(id: number) {
      this.isLoading = true
      this.error = null
      try {
        await mediaApi.deleteMedia(id)
        this.mediaFiles = this.mediaFiles.filter((m) => m.id !== id)
        this.pagination.total--
        if (this.currentMediaFile?.id === id) {
          this.currentMediaFile = null
        }
        useUiStore().pushToast('Media deleted successfully', 'success')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete media'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Bulk delete media files
     */
    async bulkDeleteMedia(ids: number[]) {
      this.isLoading = true
      this.error = null
      try {
        await mediaApi.bulkDeleteMedia(ids)
        this.mediaFiles = this.mediaFiles.filter((m) => !ids.includes(m.id))
        this.pagination.total -= ids.length
        useUiStore().pushToast('Media deleted successfully', 'success')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete media'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Get media by listing
     */
    async getListingMedia(listingId: number) {
      this.isLoading = true
      this.error = null
      try {
        const response = await mediaApi.getListingMedia(listingId)
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch listing media'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Link media to listing
     */
    async linkMediaToListing(mediaId: number, listingId: number) {
      this.isLoading = true
      this.error = null
      try {
        await mediaApi.linkMediaToListing(mediaId, listingId)
        useUiStore().pushToast('Media linked to listing', 'success')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to link media to listing'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Unlink media from listing
     */
    async unlinkMediaFromListing(mediaId: number, listingId: number) {
      this.isLoading = true
      this.error = null
      try {
        await mediaApi.unlinkMediaFromListing(mediaId, listingId)
        useUiStore().pushToast('Media unlinked from listing', 'success')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to unlink media from listing'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Clear current media file
     */
    clearCurrentMediaFile() {
      this.currentMediaFile = null
    },

    /**
     * Reset state
     */
    resetState() {
      this.mediaFiles = []
      this.currentMediaFile = null
      this.error = null
      this.uploadProgress = 0
      this.pagination = {
        currentPage: 1,
        perPage: 50,
        total: 0,
        lastPage: 1,
      }
    },
  },
})
