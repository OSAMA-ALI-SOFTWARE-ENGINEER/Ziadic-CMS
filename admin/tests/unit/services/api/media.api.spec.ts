import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mediaApi } from '@/services/api/media.api'
import * as apiModule from '@/services/api'

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockApi = apiModule.api as any

describe('Media API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockMedia = {
    id: 1,
    filename: 'image.jpg',
    url: 'https://example.com/image.jpg',
    size: 1024000,
    mime_type: 'image/jpeg',
    created_at: '2024-01-01',
  }

  const mockMediaResponse = {
    data: {
      data: [mockMedia],
      meta: {
        current_page: 1,
        per_page: 50,
        total: 1,
        last_page: 1,
      },
    },
  }

  describe('getMedia', () => {
    it('should fetch media with default pagination', async () => {
      mockApi.get.mockResolvedValue(mockMediaResponse)

      const result = await mediaApi.getMedia()

      expect(mockApi.get).toHaveBeenCalledWith('/media', {
        params: { page: 1, per_page: 50 },
      })
      expect(result).toEqual(mockMediaResponse.data)
    })

    it('should fetch media with custom pagination', async () => {
      mockApi.get.mockResolvedValue(mockMediaResponse)

      await mediaApi.getMedia(2, 25)

      expect(mockApi.get).toHaveBeenCalledWith('/media', {
        params: { page: 2, per_page: 25 },
      })
    })

    it('should handle empty media library', async () => {
      const emptyResponse = {
        data: {
          data: [],
          meta: {
            current_page: 1,
            per_page: 50,
            total: 0,
            last_page: 1,
          },
        },
      }
      mockApi.get.mockResolvedValue(emptyResponse)

      const result = await mediaApi.getMedia()

      expect(result.data).toHaveLength(0)
    })
  })

  describe('getMediaFile', () => {
    it('should fetch single media file by id', async () => {
      mockApi.get.mockResolvedValue({ data: { data: mockMedia } })

      const result = await mediaApi.getMediaFile(1)

      expect(mockApi.get).toHaveBeenCalledWith('/media/1')
      expect(result.data).toEqual(mockMedia)
    })
  })

  describe('uploadFile', () => {
    it('should upload single file', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      mockApi.post.mockResolvedValue({ data: { data: mockMedia } })

      const result = await mediaApi.uploadFile(file)

      expect(mockApi.post).toHaveBeenCalled()
      expect(result.data).toEqual(mockMedia)
    })

    it('should handle upload progress callback', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const progressCallback = vi.fn()

      mockApi.post.mockImplementation((url, data, config) => {
        // Simulate progress
        config.onUploadProgress({ loaded: 50, total: 100 })
        config.onUploadProgress({ loaded: 100, total: 100 })
        return Promise.resolve({ data: { data: mockMedia } })
      })

      await mediaApi.uploadFile(file, progressCallback)

      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          loaded: expect.any(Number),
          total: expect.any(Number),
          percentage: expect.any(Number),
        })
      )
    })

    it('should calculate progress percentage correctly', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      let progressData: any = null

      mockApi.post.mockImplementation((url, data, config) => {
        config.onUploadProgress({ loaded: 50, total: 100 })
        return Promise.resolve({ data: { data: mockMedia } })
      })

      await mediaApi.uploadFile(file, (progress) => {
        progressData = progress
      })

      expect(progressData.percentage).toBe(50)
    })

    it('should handle upload error', async () => {
      const file = new File(['content'], 'test.jpg')
      const error = new Error('Upload failed')
      mockApi.post.mockRejectedValue(error)

      await expect(mediaApi.uploadFile(file)).rejects.toThrow('Upload failed')
    })
  })

  describe('bulkUploadFiles', () => {
    it('should upload multiple files', async () => {
      const files = [
        new File(['content1'], 'test1.jpg'),
        new File(['content2'], 'test2.jpg'),
      ]

      const media1 = { ...mockMedia, id: 1 }
      const media2 = { ...mockMedia, id: 2 }

      mockApi.post
        .mockResolvedValueOnce({ data: { data: media1 } })
        .mockResolvedValueOnce({ data: { data: media2 } })

      const result = await mediaApi.bulkUploadFiles(files)

      expect(result.data).toHaveLength(2)
      expect(mockApi.post).toHaveBeenCalledTimes(2)
    })

    it('should track progress for each file', async () => {
      const files = [
        new File(['content1'], 'test1.jpg'),
        new File(['content2'], 'test2.jpg'),
      ]
      const progressCallback = vi.fn()

      const media1 = { ...mockMedia, id: 1 }
      const media2 = { ...mockMedia, id: 2 }

      mockApi.post
        .mockImplementationOnce((url, data, config) => {
          config.onUploadProgress({ loaded: 100, total: 100 })
          return Promise.resolve({ data: { data: media1 } })
        })
        .mockImplementationOnce((url, data, config) => {
          config.onUploadProgress({ loaded: 100, total: 100 })
          return Promise.resolve({ data: { data: media2 } })
        })

      await mediaApi.bulkUploadFiles(files, progressCallback)

      expect(progressCallback).toHaveBeenCalledWith(
        0,
        expect.objectContaining({ percentage: 100 })
      )
      expect(progressCallback).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ percentage: 100 })
      )
    })

    it('should handle partial upload failure', async () => {
      const files = [
        new File(['content1'], 'test1.jpg'),
        new File(['content2'], 'test2.jpg'),
      ]

      const media1 = { ...mockMedia, id: 1 }

      mockApi.post
        .mockResolvedValueOnce({ data: { data: media1 } })
        .mockRejectedValueOnce(new Error('Upload failed'))

      await expect(mediaApi.bulkUploadFiles(files)).rejects.toThrow()
    })
  })

  describe('updateMedia', () => {
    it('should update media metadata', async () => {
      const updates = { filename: 'renamed.jpg' }
      mockApi.patch.mockResolvedValue({
        data: { data: { ...mockMedia, ...updates } },
      })

      const result = await mediaApi.updateMedia(1, updates)

      expect(mockApi.patch).toHaveBeenCalledWith('/media/1', updates)
      expect(result.data.filename).toBe('renamed.jpg')
    })
  })

  describe('deleteMedia', () => {
    it('should delete single media file', async () => {
      mockApi.delete.mockResolvedValue({})

      await mediaApi.deleteMedia(1)

      expect(mockApi.delete).toHaveBeenCalledWith('/media/1')
    })
  })

  describe('bulkDeleteMedia', () => {
    it('should bulk delete media files', async () => {
      mockApi.post.mockResolvedValue({})

      await mediaApi.bulkDeleteMedia([1, 2, 3])

      expect(mockApi.post).toHaveBeenCalledWith('/media/bulk-delete', {
        ids: [1, 2, 3],
      })
    })
  })

  describe('getListingMedia', () => {
    it('should get media for listing', async () => {
      const listingMedia = [mockMedia, { ...mockMedia, id: 2 }]
      mockApi.get.mockResolvedValue({ data: { data: listingMedia } })

      const result = await mediaApi.getListingMedia(1)

      expect(mockApi.get).toHaveBeenCalledWith('/listings/1/media')
      expect(result.data).toHaveLength(2)
    })
  })

  describe('linkMediaToListing', () => {
    it('should link media to listing', async () => {
      mockApi.post.mockResolvedValue({})

      await mediaApi.linkMediaToListing(1, 10)

      expect(mockApi.post).toHaveBeenCalledWith('/media/1/link', {
        listing_id: 10,
      })
    })
  })

  describe('unlinkMediaFromListing', () => {
    it('should unlink media from listing', async () => {
      mockApi.delete.mockResolvedValue({})

      await mediaApi.unlinkMediaFromListing(1, 10)

      expect(mockApi.delete).toHaveBeenCalledWith('/media/1/unlink', {
        data: { listing_id: 10 },
      })
    })
  })

  describe('Error handling', () => {
    it('should handle file size validation error', async () => {
      const error = new Error('File too large')
      mockApi.post.mockRejectedValue(error)

      const file = new File(['content'], 'large.jpg')
      await expect(mediaApi.uploadFile(file)).rejects.toThrow('File too large')
    })

    it('should handle unsupported file type error', async () => {
      const error = new Error('Unsupported file type')
      mockApi.post.mockRejectedValue(error)

      const file = new File(['content'], 'test.exe')
      await expect(mediaApi.uploadFile(file)).rejects.toThrow()
    })

    it('should handle network timeout', async () => {
      mockApi.delete.mockRejectedValue(new Error('Timeout'))

      await expect(mediaApi.deleteMedia(1)).rejects.toThrow('Timeout')
    })
  })

  describe('Media relationships', () => {
    it('should handle media to listing workflow', async () => {
      mockApi.post.mockResolvedValueOnce({ data: { data: mockMedia } })
      mockApi.post.mockResolvedValueOnce({})

      // Upload media
      const uploadResult = await mediaApi.uploadFile(
        new File(['content'], 'test.jpg')
      )
      const mediaId = uploadResult.data.id

      // Link to listing
      await mediaApi.linkMediaToListing(mediaId, 5)

      expect(mockApi.post).toHaveBeenCalledTimes(2)
    })
  })
})
