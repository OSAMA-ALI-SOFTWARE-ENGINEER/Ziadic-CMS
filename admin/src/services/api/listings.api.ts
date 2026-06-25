import { api } from '@/services/api'
import type { Listing } from '@/types/listing'

export interface ListingsResponse {
  data: Listing[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

export interface ListingFilters {
  status?: string
  city_id?: number
  category_id?: number
  page?: number
  per_page?: number
  sort?: string
}

/**
 * Listings API Service
 * Centralized API calls for all listing-related endpoints
 */

export const listingsApi = {
  /**
   * Get all listings with filters
   */
  async getListings(filters?: ListingFilters): Promise<ListingsResponse> {
    const params = new URLSearchParams()
    if (filters) {
      if (filters.status) params.append('status', filters.status)
      if (filters.city_id) params.append('city_id', filters.city_id.toString())
      if (filters.category_id) params.append('category_id', filters.category_id.toString())
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.per_page) params.append('per_page', filters.per_page.toString())
      if (filters.sort) params.append('sort', filters.sort)
    }

    const response = await api.get(`/listings?${params.toString()}`)
    return response.data
  },

  /**
   * Get single listing by ID
   */
  async getListing(id: number): Promise<{ data: Listing }> {
    const response = await api.get(`/listings/${id}`)
    return response.data
  },

  /**
   * Create new listing
   */
  async createListing(data: Partial<Listing>): Promise<{ data: Listing }> {
    const response = await api.post('/listings', data)
    return response.data
  },

  /**
   * Update listing
   */
  async updateListing(id: number, data: Partial<Listing>): Promise<{ data: Listing }> {
    const response = await api.put(`/listings/${id}`, data)
    return response.data
  },

  /**
   * Delete listing
   */
  async deleteListing(id: number): Promise<void> {
    await api.delete(`/listings/${id}`)
  },

  /**
   * Bulk delete listings
   */
  async bulkDeleteListings(ids: number[]): Promise<void> {
    await api.post('/listings/bulk-delete', { ids })
  },

  /**
   * Publish listing
   */
  async publishListing(id: number): Promise<{ data: Listing }> {
    const response = await api.patch(`/listings/${id}/publish`, {})
    return response.data
  },

  /**
   * Unpublish listing
   */
  async unpublishListing(id: number): Promise<{ data: Listing }> {
    const response = await api.patch(`/listings/${id}/unpublish`, {})
    return response.data
  },

  /**
   * Approve listing
   */
  async approveListing(id: number): Promise<{ data: Listing }> {
    const response = await api.patch(`/listings/${id}/approve`, {})
    return response.data
  },

  /**
   * Reject listing
   */
  async rejectListing(id: number, reason: string): Promise<{ data: Listing }> {
    const response = await api.patch(`/listings/${id}/reject`, { reason })
    return response.data
  },

  /**
   * Get popular listings
   */
  async getPopularListings(): Promise<{ data: Listing[] }> {
    const response = await api.get('/listings/popular')
    return response.data
  },
}
