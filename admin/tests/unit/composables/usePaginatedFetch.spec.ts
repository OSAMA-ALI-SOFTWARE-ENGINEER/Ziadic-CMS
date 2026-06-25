import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePaginatedFetch } from '@/composables/useFetch'

describe('usePaginatedFetch Composable', () => {
  const mockPaginationData = {
    data: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ],
    meta: {
      current_page: 1,
      per_page: 50,
      total: 100,
      last_page: 2,
    },
  }

  describe('Initial state', () => {
    it('should initialize with default values', () => {
      const fetchFn = vi.fn()

      const {
        items,
        currentPage,
        total,
        lastPage,
        loading,
        error,
      } = usePaginatedFetch(fetchFn)

      expect(items.value).toEqual([])
      expect(currentPage.value).toBe(1)
      expect(total.value).toBe(0)
      expect(lastPage.value).toBe(1)
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('should support custom perPage option', async () => {
      const fetchFn = vi.fn().mockResolvedValue(mockPaginationData)

      const { fetchPage } = usePaginatedFetch(fetchFn, { perPage: 25 })

      await fetchPage(1)

      expect(fetchFn).toHaveBeenCalledWith(1, 25)
    })
  })

  describe('Fetching pages', () => {
    it('should fetch page successfully', async () => {
      const fetchFn = vi.fn().mockResolvedValue(mockPaginationData)

      const { fetchPage, items, currentPage, total } = usePaginatedFetch(fetchFn)

      await fetchPage(1)

      expect(items.value).toEqual(mockPaginationData.data)
      expect(currentPage.value).toBe(1)
      expect(total.value).toBe(100)
    })

    it('should set loading state during fetch', async () => {
      let loadingStates: boolean[] = []
      const fetchFn = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockPaginationData), 10)
          })
      )

      const { fetchPage, loading } = usePaginatedFetch(fetchFn)

      const promise = fetchPage(1)
      loadingStates.push(loading.value)

      await promise
      loadingStates.push(loading.value)

      expect(loadingStates[0]).toBe(true)
      expect(loadingStates[1]).toBe(false)
    })

    it('should handle errors during fetch', async () => {
      const error = new Error('Fetch failed')
      const fetchFn = vi.fn().mockRejectedValue(error)

      const { fetchPage, error: fetchError } = usePaginatedFetch(fetchFn)

      await expect(fetchPage(1)).rejects.toThrow('Fetch failed')
      expect(fetchError.value?.message).toBe('Fetch failed')
    })

    it('should update metadata from response', async () => {
      const customData = {
        data: [{ id: 5 }, { id: 6 }],
        meta: {
          current_page: 2,
          per_page: 50,
          total: 200,
          last_page: 4,
        },
      }

      const fetchFn = vi.fn().mockResolvedValue(customData)

      const { fetchPage, items, currentPage, total, lastPage } =
        usePaginatedFetch(fetchFn)

      await fetchPage(2)

      expect(items.value).toHaveLength(2)
      expect(currentPage.value).toBe(2)
      expect(total.value).toBe(200)
      expect(lastPage.value).toBe(4)
    })
  })

  describe('Navigation', () => {
    it('should go to next page', async () => {
      const nextPageData = {
        data: [{ id: 3 }, { id: 4 }],
        meta: {
          current_page: 2,
          per_page: 50,
          total: 100,
          last_page: 2,
        },
      }

      const fetchFn = vi
        .fn()
        .mockResolvedValueOnce(mockPaginationData)
        .mockResolvedValueOnce(nextPageData)

      const { fetchPage, nextPage, currentPage } = usePaginatedFetch(fetchFn)

      await fetchPage(1)
      expect(currentPage.value).toBe(1)

      await nextPage()
      expect(fetchFn).toHaveBeenCalledWith(2, 50)
      expect(currentPage.value).toBe(2)
    })

    it('should go to previous page', async () => {
      const secondPageData = {
        data: [{ id: 3 }, { id: 4 }],
        meta: {
          current_page: 2,
          per_page: 50,
          total: 100,
          last_page: 2,
        },
      }

      const firstPageData = {
        data: [{ id: 1 }, { id: 2 }],
        meta: {
          current_page: 1,
          per_page: 50,
          total: 100,
          last_page: 2,
        },
      }

      const fetchFn = vi
        .fn()
        .mockResolvedValueOnce(secondPageData)
        .mockResolvedValueOnce(firstPageData)

      const { fetchPage, previousPage, currentPage } = usePaginatedFetch(fetchFn)

      await fetchPage(2)
      expect(currentPage.value).toBe(2)

      await previousPage()
      expect(fetchFn).toHaveBeenCalledWith(1, 50)
      expect(currentPage.value).toBe(1)
    })

    it('should go to specific page with goToPage', async () => {
      const pageThreeData = {
        data: [{ id: 5 }, { id: 6 }],
        meta: {
          current_page: 3,
          per_page: 50,
          total: 150,
          last_page: 3,
        },
      }

      const fetchFn = vi.fn().mockResolvedValue(pageThreeData)

      const { goToPage, currentPage, fetchPage } = usePaginatedFetch(fetchFn)

      // First fetch to establish metadata
      await fetchPage(1)
      const initialCallCount = fetchFn.mock.calls.length

      await goToPage(3)

      expect(fetchFn).toHaveBeenCalledWith(3, 50)
      expect(currentPage.value).toBe(3)
    })
  })

  describe('Pagination boundaries', () => {
    it('should not go to next page if already on last page', async () => {
      const lastPageData = {
        data: [{ id: 7 }, { id: 8 }],
        meta: {
          current_page: 2,
          per_page: 50,
          total: 100,
          last_page: 2,
        },
      }

      const fetchFn = vi.fn().mockResolvedValue(lastPageData)

      const { fetchPage, nextPage } = usePaginatedFetch(fetchFn)

      await fetchPage(2)
      await nextPage()

      // Should only be called once for fetchPage
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })

    it('should not go to previous page if already on first page', async () => {
      const fetchFn = vi.fn().mockResolvedValue(mockPaginationData)

      const { fetchPage, previousPage } = usePaginatedFetch(fetchFn)

      await fetchPage(1)
      await previousPage()

      // Should only be called once for fetchPage
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })

    it('should not go to invalid page with goToPage', async () => {
      const fetchFn = vi.fn().mockResolvedValue(mockPaginationData)

      const { fetchPage, goToPage } = usePaginatedFetch(fetchFn)

      await fetchPage(1)
      await goToPage(0) // Invalid - page 0
      await goToPage(10) // Invalid - beyond last page

      // Should only be called once for fetchPage
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('Pagination state', () => {
    it('should compute canNextPage correctly', async () => {
      const fetchFn = vi.fn().mockResolvedValue(mockPaginationData)

      const { fetchPage, canNextPage } = usePaginatedFetch(fetchFn)

      await fetchPage(1)

      expect(canNextPage.value).toBe(true) // last_page is 2, current is 1
    })

    it('should compute canPreviousPage correctly', async () => {
      const fetchFn = vi.fn().mockResolvedValue(mockPaginationData)

      const { fetchPage, canPreviousPage } = usePaginatedFetch(fetchFn)

      await fetchPage(1)

      expect(canPreviousPage.value).toBe(false) // current_page is 1
    })

    it('should compute totalPages correctly', async () => {
      const fetchFn = vi.fn().mockResolvedValue(mockPaginationData)

      const { fetchPage, lastPage } = usePaginatedFetch(fetchFn)

      await fetchPage(1)

      expect(lastPage.value).toBe(2)
    })
  })

  describe('Edge cases', () => {
    it('should handle single page results', async () => {
      const singlePageData = {
        data: [{ id: 1 }],
        meta: {
          current_page: 1,
          per_page: 50,
          total: 1,
          last_page: 1,
        },
      }

      const fetchFn = vi.fn().mockResolvedValue(singlePageData)

      const { fetchPage, canNextPage, canPreviousPage } =
        usePaginatedFetch(fetchFn)

      await fetchPage(1)

      expect(canNextPage.value).toBe(false)
      expect(canPreviousPage.value).toBe(false)
    })

    it('should handle empty data', async () => {
      const emptyData = {
        data: [],
        meta: {
          current_page: 1,
          per_page: 50,
          total: 0,
          last_page: 1,
        },
      }

      const fetchFn = vi.fn().mockResolvedValue(emptyData)

      const { fetchPage, items, total } = usePaginatedFetch(fetchFn)

      await fetchPage(1)

      expect(items.value).toEqual([])
      expect(total.value).toBe(0)
    })

    it('should handle large page numbers', async () => {
      const firstPageData = {
        data: [{ id: 1 }],
        meta: {
          current_page: 1,
          per_page: 50,
          total: 5000,
          last_page: 100,
        },
      }

      const largePageData = {
        data: [{ id: 1000 }],
        meta: {
          current_page: 100,
          per_page: 50,
          total: 5000,
          last_page: 100,
        },
      }

      const fetchFn = vi.fn()
        .mockResolvedValueOnce(firstPageData)
        .mockResolvedValueOnce(largePageData)

      const { goToPage, currentPage, fetchPage } = usePaginatedFetch(fetchFn)

      // First fetch to establish metadata
      await fetchPage(1)

      await goToPage(100)

      expect(currentPage.value).toBe(100)
      expect(fetchFn).toHaveBeenCalledWith(100, 50)
    })
  })

  describe('Multiple pagination instances', () => {
    it('should handle multiple independent instances', async () => {
      const fetchFn1 = vi.fn().mockResolvedValue(mockPaginationData)
      const fetchFn2 = vi.fn().mockResolvedValue({
        ...mockPaginationData,
        data: [{ id: 100 }, { id: 101 }],
      })

      const pagination1 = usePaginatedFetch(fetchFn1)
      const pagination2 = usePaginatedFetch(fetchFn2)

      await pagination1.fetchPage(1)
      await pagination2.fetchPage(1)

      expect(pagination1.items.value[0].id).toBe(1)
      expect(pagination2.items.value[0].id).toBe(100)
    })
  })
})
