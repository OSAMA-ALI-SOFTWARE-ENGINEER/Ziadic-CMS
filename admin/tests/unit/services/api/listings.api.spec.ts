import { describe, it, expect, beforeEach, vi } from 'vitest'
import { listingsApi } from '@/services/api/listings.api'
import * as apiModule from '@/services/api'

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockApi = apiModule.api as any

describe('Listings API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockListing = {
    id: 1,
    title: 'Modern Apartment',
    description: 'A nice apartment',
    price: 50000,
    status: 'published',
    city_id: 1,
    category_id: 1,
  }

  const mockListingsResponse = {
    data: {
      data: [mockListing],
      meta: {
        current_page: 1,
        per_page: 50,
        total: 1,
        last_page: 1,
      },
      links: {
        first: null,
        last: null,
        prev: null,
        next: null,
      },
    },
  }

  describe('getListings', () => {
    it('should fetch listings without filters', async () => {
      mockApi.get.mockResolvedValue(mockListingsResponse)

      const result = await listingsApi.getListings()

      expect(mockApi.get).toHaveBeenCalledWith('/listings?')
      expect(result).toEqual(mockListingsResponse.data)
    })

    it('should fetch listings with filters', async () => {
      mockApi.get.mockResolvedValue(mockListingsResponse)

      const filters = {
        status: 'published',
        city_id: 1,
        category_id: 2,
        page: 1,
        per_page: 50,
        sort: '-created_at',
      }

      await listingsApi.getListings(filters)

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('status=published')
      )
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('city_id=1')
      )
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('category_id=2')
      )
    })

    it('should handle status filter', async () => {
      mockApi.get.mockResolvedValue(mockListingsResponse)

      await listingsApi.getListings({ status: 'draft' })

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('status=draft')
      )
    })

    it('should handle pagination', async () => {
      mockApi.get.mockResolvedValue(mockListingsResponse)

      await listingsApi.getListings({ page: 2, per_page: 20 })

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      )
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('per_page=20')
      )
    })
  })

  describe('getListing', () => {
    it('should fetch single listing by id', async () => {
      mockApi.get.mockResolvedValue({ data: { data: mockListing } })

      const result = await listingsApi.getListing(1)

      expect(mockApi.get).toHaveBeenCalledWith('/listings/1')
      expect(result.data).toEqual(mockListing)
    })

    it('should handle not found error', async () => {
      const error = new Error('Not found')
      mockApi.get.mockRejectedValue(error)

      await expect(listingsApi.getListing(999)).rejects.toThrow('Not found')
    })
  })

  describe('createListing', () => {
    it('should create new listing', async () => {
      const newListing = { title: 'New Listing', price: 30000 }
      mockApi.post.mockResolvedValue({ data: { data: { ...mockListing, ...newListing } } })

      const result = await listingsApi.createListing(newListing)

      expect(mockApi.post).toHaveBeenCalledWith('/listings', newListing)
      expect(result.data.title).toBe('New Listing')
    })

    it('should handle validation errors', async () => {
      const error = new Error('Validation error')
      mockApi.post.mockRejectedValue(error)

      await expect(listingsApi.createListing({})).rejects.toThrow()
    })
  })

  describe('updateListing', () => {
    it('should update listing', async () => {
      const updates = { title: 'Updated Title' }
      mockApi.put.mockResolvedValue({ data: { data: { ...mockListing, ...updates } } })

      const result = await listingsApi.updateListing(1, updates)

      expect(mockApi.put).toHaveBeenCalledWith('/listings/1', updates)
      expect(result.data.title).toBe('Updated Title')
    })

    it('should handle partial updates', async () => {
      const updates = { price: 60000 }
      mockApi.put.mockResolvedValue({ data: { data: { ...mockListing, ...updates } } })

      await listingsApi.updateListing(1, updates)

      expect(mockApi.put).toHaveBeenCalledWith('/listings/1', updates)
    })
  })

  describe('deleteListing', () => {
    it('should delete listing', async () => {
      mockApi.delete.mockResolvedValue({})

      await listingsApi.deleteListing(1)

      expect(mockApi.delete).toHaveBeenCalledWith('/listings/1')
    })

    it('should handle delete error', async () => {
      mockApi.delete.mockRejectedValue(new Error('Delete failed'))

      await expect(listingsApi.deleteListing(1)).rejects.toThrow()
    })
  })

  describe('bulkDeleteListings', () => {
    it('should bulk delete listings', async () => {
      mockApi.post.mockResolvedValue({})

      await listingsApi.bulkDeleteListings([1, 2, 3])

      expect(mockApi.post).toHaveBeenCalledWith('/listings/bulk-delete', { ids: [1, 2, 3] })
    })

    it('should handle empty array', async () => {
      mockApi.post.mockResolvedValue({})

      await listingsApi.bulkDeleteListings([])

      expect(mockApi.post).toHaveBeenCalledWith('/listings/bulk-delete', { ids: [] })
    })
  })

  describe('publishListing', () => {
    it('should publish listing', async () => {
      const published = { ...mockListing, status: 'published' }
      mockApi.patch.mockResolvedValue({ data: { data: published } })

      const result = await listingsApi.publishListing(1)

      expect(mockApi.patch).toHaveBeenCalledWith('/listings/1/publish', {})
      expect(result.data.status).toBe('published')
    })
  })

  describe('unpublishListing', () => {
    it('should unpublish listing', async () => {
      const unpublished = { ...mockListing, status: 'draft' }
      mockApi.patch.mockResolvedValue({ data: { data: unpublished } })

      const result = await listingsApi.unpublishListing(1)

      expect(mockApi.patch).toHaveBeenCalledWith('/listings/1/unpublish', {})
      expect(result.data.status).toBe('draft')
    })
  })

  describe('approveListing', () => {
    it('should approve listing', async () => {
      const approved = { ...mockListing, status: 'approved' }
      mockApi.patch.mockResolvedValue({ data: { data: approved } })

      const result = await listingsApi.approveListing(1)

      expect(mockApi.patch).toHaveBeenCalledWith('/listings/1/approve', {})
      expect(result.data.status).toBe('approved')
    })
  })

  describe('rejectListing', () => {
    it('should reject listing with reason', async () => {
      const rejected = { ...mockListing, status: 'rejected' }
      mockApi.patch.mockResolvedValue({ data: { data: rejected } })

      const result = await listingsApi.rejectListing(1, 'Not suitable')

      expect(mockApi.patch).toHaveBeenCalledWith('/listings/1/reject', {
        reason: 'Not suitable',
      })
      expect(result.data.status).toBe('rejected')
    })
  })

  describe('getPopularListings', () => {
    it('should fetch popular listings', async () => {
      const popularListings = [mockListing, { ...mockListing, id: 2 }]
      mockApi.get.mockResolvedValue({ data: { data: popularListings } })

      const result = await listingsApi.getPopularListings()

      expect(mockApi.get).toHaveBeenCalledWith('/listings/popular')
      expect(result.data).toHaveLength(2)
    })
  })

  describe('Status transitions', () => {
    it('should handle draft -> published -> approved flow', async () => {
      const draft = { ...mockListing, status: 'draft' }
      const published = { ...mockListing, status: 'published' }
      const approved = { ...mockListing, status: 'approved' }

      mockApi.patch
        .mockResolvedValueOnce({ data: { data: published } })
        .mockResolvedValueOnce({ data: { data: approved } })

      const publishResult = await listingsApi.publishListing(1)
      expect(publishResult.data.status).toBe('published')

      const approveResult = await listingsApi.approveListing(1)
      expect(approveResult.data.status).toBe('approved')

      expect(mockApi.patch).toHaveBeenCalledTimes(2)
    })

    it('should handle publish -> reject flow', async () => {
      const rejected = { ...mockListing, status: 'rejected' }

      mockApi.patch.mockResolvedValue({ data: { data: rejected } })

      const result = await listingsApi.rejectListing(1, 'Inappropriate content')

      expect(result.data.status).toBe('rejected')
    })
  })

  describe('Error handling', () => {
    it('should propagate API errors', async () => {
      const apiError = new Error('API Error')
      mockApi.get.mockRejectedValue(apiError)

      await expect(listingsApi.getListings()).rejects.toEqual(apiError)
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network error')
      mockApi.post.mockRejectedValue(networkError)

      await expect(listingsApi.createListing({})).rejects.toEqual(networkError)
    })

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout')
      mockApi.get.mockRejectedValue(timeoutError)

      await expect(listingsApi.getListings()).rejects.toThrow('Request timeout')
    })
  })
})
