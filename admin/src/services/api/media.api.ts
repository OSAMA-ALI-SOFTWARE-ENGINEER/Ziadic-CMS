import { api } from '@/services/api'
import type { CustomMedia } from '@/types/media'

export interface MediaResponse {
  data: CustomMedia[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

/**
 * Media API Service
 * Centralized API calls for all media/file management
 */

export const mediaApi = {
  /**
   * Get all media files with pagination
   */
  async getMedia(page: number = 1, perPage: number = 50): Promise<MediaResponse> {
    const response = await api.get('/media', {
      params: { page, per_page: perPage },
    })
    return response.data
  },

  /**
   * Get single media file
   */
  async getMediaFile(id: number): Promise<{ data: CustomMedia }> {
    const response = await api.get(`/media/${id}`)
    return response.data
  },

  /**
   * Upload file with progress tracking
   */
  async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ data: CustomMedia }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const loaded = progressEvent.loaded
          const total = progressEvent.total || 0
          const percentage = total > 0 ? (loaded / total) * 100 : 0
          onProgress({ loaded, total, percentage })
        }
      },
    })

    return response.data
  },

  /**
   * Bulk upload files
   */
  async bulkUploadFiles(
    files: File[],
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<{ data: CustomMedia[] }> {
    const uploadPromises = files.map((file, index) =>
      this.uploadFile(file, (progress) => {
        if (onProgress) onProgress(index, progress)
      })
    )

    const results = await Promise.all(uploadPromises)
    return {
      data: results.map((r) => r.data),
    }
  },

  /**
   * Update media file metadata
   */
  async updateMedia(id: number, data: Partial<CustomMedia>): Promise<{ data: CustomMedia }> {
    const response = await api.patch(`/media/${id}`, data)
    return response.data
  },

  /**
   * Delete single media file
   */
  async deleteMedia(id: number): Promise<void> {
    await api.delete(`/media/${id}`)
  },

  /**
   * Bulk delete media files
   */
  async bulkDeleteMedia(ids: number[]): Promise<void> {
    await api.post('/media/bulk-delete', { ids })
  },

  /**
   * Get media by listing
   */
  async getListingMedia(listingId: number): Promise<{ data: CustomMedia[] }> {
    const response = await api.get(`/listings/${listingId}/media`)
    return response.data
  },

  /**
   * Link media to listing
   */
  async linkMediaToListing(mediaId: number, listingId: number): Promise<void> {
    await api.post(`/media/${mediaId}/link`, { listing_id: listingId })
  },

  /**
   * Unlink media from listing
   */
  async unlinkMediaFromListing(mediaId: number, listingId: number): Promise<void> {
    await api.delete(`/media/${mediaId}/unlink`, {
      data: { listing_id: listingId },
    })
  },
}
