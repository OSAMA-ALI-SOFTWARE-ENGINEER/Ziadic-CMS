import { defineStore } from 'pinia'
import { useUiStore } from './ui'
import { listingsApi, type ListingsResponse, type ListingFilters } from '@/services/api/listings.api'
import type { Listing } from '@/types/listing'

export const useListingsStore = defineStore('listings', {
  state: () => ({
    listings: [] as Listing[],
    currentListing: null as Listing | null,
    isLoading: false,
    error: null as string | null,
    pagination: {
      currentPage: 1,
      perPage: 50,
      total: 0,
      lastPage: 1,
    },
    filters: {
      status: '',
      city_id: undefined,
      category_id: undefined,
      sort: '',
    } as ListingFilters,
  }),

  getters: {
    getTotalListings: (state) => state.pagination.total,
    getCurrentPage: (state) => state.pagination.currentPage,
    getLastPage: (state) => state.pagination.lastPage,
    hasMorePages: (state) => state.pagination.currentPage < state.pagination.lastPage,
    getListingById: (state) => (id: number) => state.listings.find((l) => l.id === id),
  },

  actions: {
    /**
     * Fetch listings with filters and pagination
     */
    async fetchListings(filters?: ListingFilters, page: number = 1) {
      this.isLoading = true
      this.error = null
      try {
        const response = await listingsApi.getListings({
          ...filters,
          page,
          per_page: this.pagination.perPage,
        })

        this.listings = response.data
        this.pagination = {
          currentPage: response.meta.current_page,
          perPage: response.meta.per_page,
          total: response.meta.total,
          lastPage: response.meta.last_page,
        }

        if (filters) {
          this.filters = filters
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch listings'
        this.error = message
        useUiStore().pushToast(message, 'danger')
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Get single listing by ID
     */
    async getListing(id: number) {
      this.isLoading = true
      this.error = null
      try {
        const response = await listingsApi.getListing(id)
        this.currentListing = response.data
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch listing'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Create new listing
     */
    async createListing(data: Partial<Listing>) {
      this.isLoading = true
      this.error = null
      try {
        const response = await listingsApi.createListing(data)
        this.listings.unshift(response.data)
        this.pagination.total++
        useUiStore().pushToast('Listing created successfully', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create listing'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Update listing
     */
    async updateListing(id: number, data: Partial<Listing>) {
      this.isLoading = true
      this.error = null
      try {
        const response = await listingsApi.updateListing(id, data)
        const index = this.listings.findIndex((l) => l.id === id)
        if (index >= 0) {
          this.listings[index] = response.data
        }
        if (this.currentListing?.id === id) {
          this.currentListing = response.data
        }
        useUiStore().pushToast('Listing updated successfully', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update listing'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Delete listing
     */
    async deleteListing(id: number) {
      this.isLoading = true
      this.error = null
      try {
        await listingsApi.deleteListing(id)
        this.listings = this.listings.filter((l) => l.id !== id)
        this.pagination.total--
        if (this.currentListing?.id === id) {
          this.currentListing = null
        }
        useUiStore().pushToast('Listing deleted successfully', 'success')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete listing'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Bulk delete listings
     */
    async bulkDeleteListings(ids: number[]) {
      this.isLoading = true
      this.error = null
      try {
        await listingsApi.bulkDeleteListings(ids)
        this.listings = this.listings.filter((l) => !ids.includes(l.id))
        this.pagination.total -= ids.length
        useUiStore().pushToast('Listings deleted successfully', 'success')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete listings'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Publish listing
     */
    async publishListing(id: number) {
      this.isLoading = true
      this.error = null
      try {
        const response = await listingsApi.publishListing(id)
        const index = this.listings.findIndex((l) => l.id === id)
        if (index >= 0) {
          this.listings[index] = response.data
        }
        if (this.currentListing?.id === id) {
          this.currentListing = response.data
        }
        useUiStore().pushToast('Listing published successfully', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to publish listing'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Unpublish listing
     */
    async unpublishListing(id: number) {
      this.isLoading = true
      this.error = null
      try {
        const response = await listingsApi.unpublishListing(id)
        const index = this.listings.findIndex((l) => l.id === id)
        if (index >= 0) {
          this.listings[index] = response.data
        }
        if (this.currentListing?.id === id) {
          this.currentListing = response.data
        }
        useUiStore().pushToast('Listing unpublished successfully', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to unpublish listing'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Clear current listing
     */
    clearCurrentListing() {
      this.currentListing = null
    },

    /**
     * Reset state
     */
    resetState() {
      this.listings = []
      this.currentListing = null
      this.error = null
      this.pagination = {
        currentPage: 1,
        perPage: 50,
        total: 0,
        lastPage: 1,
      }
      this.filters = {}
    },
  },
})
