import { useAuthStore } from '@/stores/auth'

function getApiBase(): string {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (backendUrl) return backendUrl
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000'
  }
  return window.location.origin
}

const API_BASE = '/api/v1/admin'

// Types
export interface AdminListing {
  id: number
  title: string
  slug: string
  business_name: string | null
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected'
  city: { id: number; name: string } | null
  category: { id: number; name: string } | null
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: number
  name: string
  email: string
  phone?: string
  roles: string[]
  created_at: string
}

export interface DashboardStats {
  total_listings: number
  published_listings: number
  pending_approvals: number
  total_users: number
  newsletter_subscribers: number
}

// Helper function to get auth headers
function getHeaders() {
  const authStore = useAuthStore()
  return {
    'Authorization': `Bearer ${authStore.token}`,
    'Content-Type': 'application/json',
  }
}

// Dashboard
export async function fetchDashboard(): Promise<DashboardStats> {
  const response = await fetch(`${getApiBase()}${API_BASE}/dashboard`, {
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to fetch dashboard')
  return response.json()
}

// Listings
export async function fetchAdminListings(filters?: {
  status?: string
  city_id?: number
  category_id?: number
}): Promise<AdminListing[]> {
  const url = new URL(`${getApiBase()}${API_BASE}/listings`)
  if (filters?.status) url.searchParams.set('status', filters.status)
  if (filters?.city_id) url.searchParams.set('city_id', String(filters.city_id))
  if (filters?.category_id) url.searchParams.set('category_id', String(filters.category_id))

  const response = await fetch(url.toString(), { headers: getHeaders() })
  if (!response.ok) throw new Error('Failed to fetch listings')
  return response.json()
}

export async function fetchAdminListing(id: number): Promise<AdminListing> {
  const response = await fetch(`${getApiBase()}${API_BASE}/listings/${id}`, {
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to fetch listing')
  return response.json()
}

export async function approveListing(id: number, notes?: string): Promise<void> {
  const response = await fetch(`${getApiBase()}${API_BASE}/listings/${id}/approve`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ notes }),
  })
  if (!response.ok) throw new Error('Failed to approve listing')
}

export async function rejectListing(id: number, reason?: string): Promise<void> {
  const response = await fetch(`${getApiBase()}${API_BASE}/listings/${id}/reject`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ reason }),
  })
  if (!response.ok) throw new Error('Failed to reject listing')
}

export async function publishListing(id: number): Promise<void> {
  const response = await fetch(`${getApiBase()}${API_BASE}/listings/${id}/publish`, {
    method: 'PATCH',
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to publish listing')
}

// Users
export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const response = await fetch(`${getApiBase()}${API_BASE}/users`, {
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to fetch users')
  return response.json()
}

export async function fetchAdminUser(id: number): Promise<AdminUser> {
  const response = await fetch(`${getApiBase()}${API_BASE}/users/${id}`, {
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to fetch user')
  return response.json()
}

export async function assignUserRole(userId: number, role: string): Promise<void> {
  const response = await fetch(`${getApiBase()}${API_BASE}/users/${userId}/role`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ role }),
  })
  if (!response.ok) throw new Error('Failed to assign role')
}

// Settings
export async function fetchAdminSettings(section: string): Promise<Record<string, any>> {
  const response = await fetch(`${getApiBase()}${API_BASE}/settings/${section}`, {
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error('Failed to fetch settings')
  return response.json()
}

export async function updateAdminSettings(section: string, data: Record<string, any>): Promise<void> {
  const response = await fetch(`${getApiBase()}${API_BASE}/settings/${section}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update settings')
}

// Activity Logs
export async function fetchActivityLogs(limit: number = 50): Promise<any[]> {
  const url = new URL(`${getApiBase()}${API_BASE}/activity-logs`)
  url.searchParams.set('limit', String(limit))
  const response = await fetch(url.toString(), { headers: getHeaders() })
  if (!response.ok) throw new Error('Failed to fetch activity logs')
  return response.json()
}
