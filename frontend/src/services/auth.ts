function getApiBase(): string {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (backendUrl) return backendUrl
  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000'
  }
  return window.location.origin
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  new Headers(options.headers).forEach((value, key) => {
    headers[key] = value
  })

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
  }

  return response
}

export async function fetchPublicPosts() {
  const response = await fetch(`${getApiBase()}/api/v1/public/posts`)
  if (!response.ok) throw new Error('Failed to fetch posts')
  return response.json()
}

export async function fetchPublicPost(slug: string) {
  const response = await fetch(`${getApiBase()}/api/v1/public/posts/${slug}`)
  if (!response.ok) throw new Error('Failed to fetch post')
  return response.json()
}

export async function fetchPublicPage(slug: string) {
  const response = await fetch(`${getApiBase()}/api/v1/public/pages/${slug}`)
  if (!response.ok) throw new Error('Failed to fetch page')
  return response.json()
}
