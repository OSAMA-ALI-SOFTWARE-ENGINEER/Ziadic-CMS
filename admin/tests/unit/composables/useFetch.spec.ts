import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFetch } from '@/composables/useFetch'
import { useUiStore } from '@/stores/ui'

describe('useFetch Composable', () => {
  let store: ReturnType<typeof useUiStore>

  beforeEach(() => {
    store = useUiStore()
  })

  describe('Basic data fetching', () => {
    it('should fetch data successfully', async () => {
      const mockData = { id: 1, name: 'Test Item' }
      const fetchFn = vi.fn().mockResolvedValue(mockData)

      const { data, execute, loading, success, hasData } = useFetch(fetchFn)

      expect(loading.value).toBe(false)
      expect(data.value).toBe(null)

      const result = await execute()

      expect(result).toEqual(mockData)
      expect(data.value).toEqual(mockData)
      expect(success.value).toBe(true)
      expect(loading.value).toBe(false)
      expect(hasData.value).toBe(true)
    })

    it('should set loading state during fetch', async () => {
      let loadingStates: boolean[] = []
      const fetchFn = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ id: 1 }), 10)
          })
      )

      const { execute, loading } = useFetch(fetchFn)

      const promise = execute()
      loadingStates.push(loading.value)

      await promise
      loadingStates.push(loading.value)

      expect(loadingStates[0]).toBe(true)
      expect(loadingStates[1]).toBe(false)
    })

    it('should return data on immediate execution', async () => {
      const mockData = { id: 1, name: 'Test Item' }
      const fetchFn = vi.fn().mockResolvedValue(mockData)

      const { data } = useFetch(fetchFn, { immediate: true })

      // Wait a tick for the promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(data.value).toEqual(mockData)
    })
  })

  describe('Error handling', () => {
    it('should handle errors correctly', async () => {
      const error = new Error('Fetch failed')
      const fetchFn = vi.fn().mockRejectedValue(error)

      const { execute, error: fetchError, isError, hasData } = useFetch(fetchFn)

      await expect(execute()).rejects.toThrow('Fetch failed')

      expect(isError.value).toBe(true)
      expect(fetchError.value?.message).toBe('Fetch failed')
      expect(hasData.value).toBe(false)
    })

    it('should show error toast when showErrorToast is true', async () => {
      const pushToastSpy = vi.spyOn(store, 'pushToast')
      const error = new Error('Network error')
      const fetchFn = vi.fn().mockRejectedValue(error)

      const { execute } = useFetch(fetchFn, { showErrorToast: true })

      try {
        await execute()
      } catch (e) {
        // Error expected
      }

      expect(pushToastSpy).toHaveBeenCalledWith('Network error', 'danger')
    })

    it('should not show error toast when showErrorToast is false', async () => {
      const pushToastSpy = vi.spyOn(store, 'pushToast')
      const error = new Error('Network error')
      const fetchFn = vi.fn().mockRejectedValue(error)

      const { execute } = useFetch(fetchFn, { showErrorToast: false })

      try {
        await execute()
      } catch (e) {
        // Error expected
      }

      expect(pushToastSpy).not.toHaveBeenCalled()
    })

    it('should handle non-Error exceptions', async () => {
      const fetchFn = vi.fn().mockRejectedValue('String error')

      const { execute, error } = useFetch(fetchFn)

      await expect(execute()).rejects.toThrow()
      expect(error.value?.message).toBe('String error')
    })
  })

  describe('Reset functionality', () => {
    it('should reset all state', async () => {
      const mockData = { id: 1 }
      const fetchFn = vi.fn().mockResolvedValue(mockData)

      const { execute, data, error, loading, success, reset } = useFetch(fetchFn)

      await execute()

      expect(data.value).not.toBeNull()
      expect(success.value).toBe(true)

      reset()

      expect(data.value).toBeNull()
      expect(error.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(success.value).toBe(false)
    })

    it('should allow re-fetching after reset', async () => {
      const fetchFn = vi.fn()
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 })

      const { execute, data, reset } = useFetch(fetchFn)

      await execute()
      expect(data.value?.id).toBe(1)

      reset()
      expect(data.value).toBeNull()

      await execute()
      expect(data.value?.id).toBe(2)
    })
  })

  describe('Loading toast', () => {
    it('should show loading toast when showLoadingToast is true', async () => {
      const pushToastSpy = vi.spyOn(store, 'pushToast')
      const fetchFn = vi.fn().mockResolvedValue({ id: 1 })

      const { execute } = useFetch(fetchFn, { showLoadingToast: true })

      await execute()

      expect(pushToastSpy).toHaveBeenCalledWith('Loading...', 'info')
    })

    it('should not show loading toast when showLoadingToast is false', async () => {
      const pushToastSpy = vi.spyOn(store, 'pushToast')
      const fetchFn = vi.fn().mockResolvedValue({ id: 1 })

      const { execute } = useFetch(fetchFn, { showLoadingToast: false })

      await execute()

      expect(pushToastSpy).not.toHaveBeenCalledWith('Loading...', 'info')
    })
  })

  describe('Multiple executions', () => {
    it('should allow multiple consecutive executions', async () => {
      const fetchFn = vi.fn()
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 })
        .mockResolvedValueOnce({ id: 3 })

      const { execute, data } = useFetch(fetchFn)

      await execute()
      expect(data.value?.id).toBe(1)

      await execute()
      expect(data.value?.id).toBe(2)

      await execute()
      expect(data.value?.id).toBe(3)
    })

    it('should handle parallel execution requests', async () => {
      let resolveFirst: () => void
      let resolveSecond: () => void

      const promise1 = new Promise<void>((resolve) => {
        resolveFirst = resolve
      })
      const promise2 = new Promise<void>((resolve) => {
        resolveSecond = resolve
      })

      const fetchFn = vi
        .fn()
        .mockReturnValueOnce(promise1.then(() => ({ id: 1 })))
        .mockReturnValueOnce(promise2.then(() => ({ id: 2 })))

      const { execute, data } = useFetch(fetchFn)

      const exec1 = execute()
      const exec2 = execute()

      expect(fetchFn).toHaveBeenCalledTimes(2)

      resolveFirst!()
      resolveSecond!()

      await Promise.all([exec1, exec2])

      expect(data.value?.id).toBe(2)
    })
  })

  describe('Computed properties', () => {
    it('should compute isLoading correctly', async () => {
      const fetchFn = vi.fn().mockResolvedValue({ id: 1 })
      const { execute, loading } = useFetch(fetchFn)

      expect(loading.value).toBe(false)

      execute()

      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(loading.value).toBe(false) // Already resolved
    })

    it('should compute isError and hasData correctly', async () => {
      const mockData = { id: 1 }
      const fetchFn = vi.fn().mockResolvedValue(mockData)

      const { execute, isError, hasData } = useFetch(fetchFn)

      expect(isError.value).toBe(false)
      expect(hasData.value).toBe(false)

      await execute()

      expect(isError.value).toBe(false)
      expect(hasData.value).toBe(true)
    })
  })
})
