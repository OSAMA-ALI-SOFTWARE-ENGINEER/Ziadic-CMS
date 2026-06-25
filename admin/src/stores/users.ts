import { defineStore } from 'pinia'
import { useUiStore } from './ui'
import { usersApi, type UsersResponse, type UserFilters } from '@/services/api/users.api'
import type { User } from '@/types/user'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [] as User[],
    currentUser: null as User | null,
    currentUserProfile: null as User | null,
    isLoading: false,
    error: null as string | null,
    pagination: {
      currentPage: 1,
      perPage: 50,
      total: 0,
      lastPage: 1,
    },
    filters: {} as UserFilters,
  }),

  getters: {
    getTotalUsers: (state) => state.pagination.total,
    getCurrentPage: (state) => state.pagination.currentPage,
    getLastPage: (state) => state.pagination.lastPage,
    hasMorePages: (state) => state.pagination.currentPage < state.pagination.lastPage,
    getUserById: (state) => (id: number) => state.users.find((u) => u.id === id),
    isCurrentUserProfileLoaded: (state) => state.currentUserProfile !== null,
  },

  actions: {
    /**
     * Fetch users with filters and pagination
     */
    async fetchUsers(filters?: UserFilters, page: number = 1) {
      this.isLoading = true
      this.error = null
      try {
        const response = await usersApi.getUsers({
          ...filters,
          page,
          per_page: this.pagination.perPage,
        })

        this.users = response.data
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
        const message = err instanceof Error ? err.message : 'Failed to fetch users'
        this.error = message
        useUiStore().pushToast(message, 'danger')
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Get single user
     */
    async getUser(id: number) {
      this.isLoading = true
      this.error = null
      try {
        const response = await usersApi.getUser(id)
        this.currentUser = response.data
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch user'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Create new user
     */
    async createUser(data: Partial<User>) {
      this.isLoading = true
      this.error = null
      try {
        const response = await usersApi.createUser(data)
        this.users.unshift(response.data)
        this.pagination.total++
        useUiStore().pushToast('User created successfully', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create user'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Update user
     */
    async updateUser(id: number, data: Partial<User>) {
      this.isLoading = true
      this.error = null
      try {
        const response = await usersApi.updateUser(id, data)
        const index = this.users.findIndex((u) => u.id === id)
        if (index >= 0) {
          this.users[index] = response.data
        }
        if (this.currentUser?.id === id) {
          this.currentUser = response.data
        }
        useUiStore().pushToast('User updated successfully', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update user'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Delete user
     */
    async deleteUser(id: number) {
      this.isLoading = true
      this.error = null
      try {
        await usersApi.deleteUser(id)
        this.users = this.users.filter((u) => u.id !== id)
        this.pagination.total--
        if (this.currentUser?.id === id) {
          this.currentUser = null
        }
        useUiStore().pushToast('User deleted successfully', 'success')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete user'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Bulk delete users
     */
    async bulkDeleteUsers(ids: number[]) {
      this.isLoading = true
      this.error = null
      try {
        await usersApi.bulkDeleteUsers(ids)
        this.users = this.users.filter((u) => !ids.includes(u.id))
        this.pagination.total -= ids.length
        useUiStore().pushToast('Users deleted successfully', 'success')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete users'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Assign role to user
     */
    async assignRole(userId: number, roleName: string) {
      this.isLoading = true
      this.error = null
      try {
        const response = await usersApi.assignRole(userId, roleName)
        const index = this.users.findIndex((u) => u.id === userId)
        if (index >= 0) {
          this.users[index] = response.data
        }
        if (this.currentUser?.id === userId) {
          this.currentUser = response.data
        }
        useUiStore().pushToast('Role assigned successfully', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to assign role'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Reset user password
     */
    async resetPassword(userId: number) {
      this.isLoading = true
      this.error = null
      try {
        const response = await usersApi.resetPassword(userId)
        useUiStore().pushToast('Password reset link sent', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to reset password'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Deactivate user
     */
    async deactivateUser(userId: number) {
      this.isLoading = true
      this.error = null
      try {
        const response = await usersApi.deactivateUser(userId)
        const index = this.users.findIndex((u) => u.id === userId)
        if (index >= 0) {
          this.users[index] = response.data
        }
        if (this.currentUser?.id === userId) {
          this.currentUser = response.data
        }
        useUiStore().pushToast('User deactivated', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to deactivate user'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Activate user
     */
    async activateUser(userId: number) {
      this.isLoading = true
      this.error = null
      try {
        const response = await usersApi.activateUser(userId)
        const index = this.users.findIndex((u) => u.id === userId)
        if (index >= 0) {
          this.users[index] = response.data
        }
        if (this.currentUser?.id === userId) {
          this.currentUser = response.data
        }
        useUiStore().pushToast('User activated', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to activate user'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Get user permissions
     */
    async getUserPermissions(userId: number) {
      this.isLoading = true
      this.error = null
      try {
        const response = await usersApi.getUserPermissions(userId)
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch user permissions'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Update user permissions
     */
    async updateUserPermissions(userId: number, permissions: string[]) {
      this.isLoading = true
      this.error = null
      try {
        const response = await usersApi.updateUserPermissions(userId, permissions)
        const index = this.users.findIndex((u) => u.id === userId)
        if (index >= 0) {
          this.users[index] = response.data
        }
        if (this.currentUser?.id === userId) {
          this.currentUser = response.data
        }
        useUiStore().pushToast('Permissions updated successfully', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update permissions'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Get current user profile
     */
    async getCurrentUserProfile() {
      this.isLoading = true
      this.error = null
      try {
        const response = await usersApi.getCurrentUser()
        this.currentUserProfile = response.data
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch current user'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Update current user profile
     */
    async updateProfile(data: Partial<User>) {
      this.isLoading = true
      this.error = null
      try {
        const response = await usersApi.updateProfile(data)
        this.currentUserProfile = response.data
        useUiStore().pushToast('Profile updated successfully', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update profile'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Clear current user
     */
    clearCurrentUser() {
      this.currentUser = null
    },

    /**
     * Reset state
     */
    resetState() {
      this.users = []
      this.currentUser = null
      this.currentUserProfile = null
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
