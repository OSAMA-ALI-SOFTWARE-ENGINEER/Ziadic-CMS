/**
 * Converts any image path to a full, absolute URL
 * Handles: absolute URLs, relative paths, file_path
 * Prepends API base URL when needed, adds placeholder fallback
 */
export function getImageUrl(path?: string | null): string {
  if (!path) return '/assets/images/placeholder.png'
  if (path.startsWith('http')) return path

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const cleanPath = path.replace(/^\/+/, '')
  return `${backendUrl}/${cleanPath}`
}

/**
 * Extracts unique images from a list, removing duplicates by URL
 * Returns deduplicated array preserving order
 */
export function deduplicateImages(images: string[]): string[] {
  const seen = new Set<string>()
  return images.filter(img => {
    const key = img.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Safely gets the first valid image from a list
 * Falls back to placeholder if no valid images
 */
export function getFirstImage(images?: string[] | null): string {
  if (!images || images.length === 0) return '/assets/images/placeholder.png'
  const first = images[0]
  return first ? getImageUrl(first) : '/assets/images/placeholder.png'
}
