import { api } from '@/services/api'
import type { User } from '@/types/user'

export interface UsersResponse {
  data: User[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface UserFilters {
  role?: string
  page?: number
  per_page?: number
  sort?: string
  search?: string
}

/**
 * Users API Service
 * Centralized API calls for user management
 */

export const usersApi = {
  /**
   * Get all users
   */
  async getUsers(filters?: UserFilters): Promise<UsersResponse> {
    const params = new URLSearchParams()
    if (filters) {
      if (filters.role) params.append('role', filters.role)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.per_page) params.append('per_page', filters.per_page.toString())
      if (filters.sort) params.append('sort', filters.sort)
      if (filters.search) params.append('search', filters.search)
    }

    const response = await api.get(`/users?${params.toString()}`)
    return response.data
  },

  /**
   * Get single user
   */
  async getUser(id: number): Promise<{ data: User }> {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  /**
   * Create new user
   */
  async createUser(data: Partial<User>): Promise<{ data: User }> {
    const response = await api.post('/users', data)
    return response.data
  },

  /**
   * Update user
   */
  async updateUser(id: number, data: Partial<User>): Promise<{ data: User }> {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  },

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`)
  },

  /**
   * Assign role to user
   */
  async assignRole(userId: number, roleName: string): Promise<{ data: User }> {
    const response = await api.patch(`/users/${userId}/role`, { role: roleName })
    return response.data
  },

  /**
   * Reset user password
   */
  async resetPassword(userId: number): Promise<{ data: { temporary_password: string } }> {
    const response = await api.post(`/users/${userId}/reset-password`, {})
    return response.data
  },

  /**
   * Deactivate user
   */
  async deactivateUser(userId: number): Promise<{ data: User }> {
    const response = await api.patch(`/users/${userId}/deactivate`, {})
    return response.data
  },

  /**
   * Activate user
   */
  async activateUser(userId: number): Promise<{ data: User }> {
    const response = await api.patch(`/users/${userId}/activate`, {})
    return response.data
  },

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: number): Promise<{ data: string[] }> {
    const response = await api.get(`/users/${userId}/permissions`)
    return response.data
  },

  /**
   * Update user permissions
   */
  async updateUserPermissions(userId: number, permissions: string[]): Promise<{ data: User }> {
    const response = await api.patch(`/users/${userId}/permissions`, { permissions })
    return response.data
  },

  /**
   * Bulk delete users
   */
  async bulkDeleteUsers(ids: number[]): Promise<void> {
    await api.post('/users/bulk-delete', { ids })
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<{ data: User }> {
    const response = await api.get('/users/me')
    return response.data
  },

  /**
   * Update current user profile
   */
  async updateProfile(data: Partial<User>): Promise<{ data: User }> {
    const response = await api.post('/user/update-profile', data)
    return response.data
  },

  /**
   * Get available roles
   */
  async getRoles(): Promise<{ data: Array<{ id: number; name: string; label: string }> }> {
    const response = await api.get('/roles-list')
    return response.data || { data: [] }
  },
}
