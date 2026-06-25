import { ref, computed } from 'vue'
import { useUiStore } from '@/stores/ui'

export interface UseFetchOptions {
  immediate?: boolean
  showErrorToast?: boolean
  showLoadingToast?: boolean
}

interface UseFetchState<T> {
  data: T | null
  error: Error | null
  loading: boolean
  success: boolean
}

/**
 * Composable for fetching data with error handling and loading states
 * Usage:
 *   const { data, loading, error, execute } = useFetch(() => api.get('/url'))
 *   await execute()
 */
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions = {}
) {
  const {
    immediate = false,
    showErrorToast = true,
    showLoadingToast = false,
  } = options

  const ui = useUiStore()
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<T | null>(null)
  const success = ref(false)

  const isLoading = computed(() => loading.value)
  const isError = computed(() => error.value !== null)
  const hasData = computed(() => data.value !== null)

  async function execute() {
    loading.value = true
    error.value = null
    success.value = false

    try {
      if (showLoadingToast) {
        ui.pushToast('Loading...', 'info')
      }

      const result = await fetchFn()
      data.value = result
      success.value = true

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      error.value = new Error(errorMessage)

      if (showErrorToast) {
        ui.pushToast(errorMessage, 'danger')
      }

      throw error.value
    } finally {
      loading.value = false
    }
  }

  if (immediate) {
    execute()
  }

  return {
    data: computed(() => data.value),
    error: computed(() => error.value),
    loading: isLoading,
    success,
    hasData,
    isError,
    execute,
    reset: () => {
      data.value = null
      error.value = null
      loading.value = false
      success.value = false
    },
  }
}

/**
 * Composable for fetching paginated data
 */
export function usePaginatedFetch<T>(
  fetchFn: (page: number, perPage: number) => Promise<any>,
  options: UseFetchOptions & { perPage?: number } = {}
) {
  const { perPage = 50, ...fetchOptions } = options

  const currentPage = ref(1)
  const items = ref<T[]>([])
  const total = ref(0)
  const lastPage = ref(1)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const totalPages = computed(() => lastPage.value)
  const canPreviousPage = computed(() => currentPage.value > 1)
  const canNextPage = computed(() => currentPage.value < lastPage.value)

  async function fetchPage(page: number = 1) {
    loading.value = true
    error.value = null

    try {
      const result = await fetchFn(page, perPage)
      items.value = result.data
      currentPage.value = result.meta.current_page
      total.value = result.meta.total
      lastPage.value = result.meta.last_page

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data'
      error.value = new Error(errorMessage)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function nextPage() {
    if (canNextPage.value) {
      await fetchPage(currentPage.value + 1)
    }
  }

  async function previousPage() {
    if (canPreviousPage.value) {
      await fetchPage(currentPage.value - 1)
    }
  }

  async function goToPage(page: number) {
    if (page >= 1 && page <= lastPage.value) {
      await fetchPage(page)
    }
  }

  return {
    items: computed(() => items.value),
    currentPage: computed(() => currentPage.value),
    total: computed(() => total.value),
    lastPage: totalPages,
    loading,
    error,
    canNextPage,
    canPreviousPage,
    fetchPage,
    nextPage,
    previousPage,
    goToPage,
  }
}
