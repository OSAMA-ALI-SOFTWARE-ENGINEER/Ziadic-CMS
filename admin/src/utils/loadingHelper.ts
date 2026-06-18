/**
 * Helper function to enforce minimum loading time for better UX
 * Ensures loading state is visible for at least 2 seconds
 */
export async function withMinimumLoadingTime<T>(
  promise: Promise<T>,
  minimumTimeMs: number = 2000
): Promise<T> {
  const startTime = Date.now()
  const result = await promise

  const elapsedTime = Date.now() - startTime
  if (elapsedTime < minimumTimeMs) {
    await new Promise(resolve => setTimeout(resolve, minimumTimeMs - elapsedTime))
  }

  return result
}

/**
 * Wrapper for async functions to apply minimum loading time
 */
export function withLoadingTime(minimumTimeMs: number = 2000) {
  return function <T extends (...args: any[]) => Promise<any>>(fn: T) {
    return (async (...args: any[]) => {
      return withMinimumLoadingTime(fn(...args), minimumTimeMs)
    }) as T
  }
}
