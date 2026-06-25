import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usersApi } from '@/services/api/users.api'
import * as apiModule from '@/services/api'

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockApi = apiModule.api as any

describe('Users API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    created_at: '2024-01-01',
  }

  const mockUsersResponse = {
    data: {
      data: [mockUser],
      meta: {
        current_page: 1,
        per_page: 50,
        total: 1,
        last_page: 1,
      },
    },
  }

  describe('getUsers', () => {
    it('should fetch users without filters', async () => {
      mockApi.get.mockResolvedValue(mockUsersResponse)

      const result = await usersApi.getUsers()

      expect(mockApi.get).toHaveBeenCalledWith('/users?')
      expect(result).toEqual(mockUsersResponse.data)
    })

    it('should fetch users with role filter', async () => {
      mockApi.get.mockResolvedValue(mockUsersResponse)

      await usersApi.getUsers({ role: 'editor' })

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('role=editor')
      )
    })

    it('should fetch users with search', async () => {
      mockApi.get.mockResolvedValue(mockUsersResponse)

      await usersApi.getUsers({ search: 'john' })

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('search=john')
      )
    })

    it('should fetch users with pagination', async () => {
      mockApi.get.mockResolvedValue(mockUsersResponse)

      await usersApi.getUsers({ page: 2, per_page: 25 })

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      )
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('per_page=25')
      )
    })

    it('should fetch users with sort', async () => {
      mockApi.get.mockResolvedValue(mockUsersResponse)

      await usersApi.getUsers({ sort: '-created_at' })

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('sort=-created_at')
      )
    })
  })

  describe('getUser', () => {
    it('should fetch single user by id', async () => {
      mockApi.get.mockResolvedValue({ data: { data: mockUser } })

      const result = await usersApi.getUser(1)

      expect(mockApi.get).toHaveBeenCalledWith('/users/1')
      expect(result.data).toEqual(mockUser)
    })
  })

  describe('createUser', () => {
    it('should create new user', async () => {
      const newUser = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'editor',
      }
      mockApi.post.mockResolvedValue({
        data: { data: { ...mockUser, ...newUser } },
      })

      const result = await usersApi.createUser(newUser)

      expect(mockApi.post).toHaveBeenCalledWith('/users', newUser)
      expect(result.data.name).toBe('Jane Doe')
    })

    it('should handle duplicate email error', async () => {
      const error = new Error('Email already exists')
      mockApi.post.mockRejectedValue(error)

      await expect(
        usersApi.createUser({ name: 'John', email: 'john@example.com' })
      ).rejects.toThrow('Email already exists')
    })
  })

  describe('updateUser', () => {
    it('should update user', async () => {
      const updates = { name: 'Jane Doe' }
      mockApi.put.mockResolvedValue({
        data: { data: { ...mockUser, ...updates } },
      })

      const result = await usersApi.updateUser(1, updates)

      expect(mockApi.put).toHaveBeenCalledWith('/users/1', updates)
      expect(result.data.name).toBe('Jane Doe')
    })
  })

  describe('deleteUser', () => {
    it('should delete user', async () => {
      mockApi.delete.mockResolvedValue({})

      await usersApi.deleteUser(1)

      expect(mockApi.delete).toHaveBeenCalledWith('/users/1')
    })
  })

  describe('assignRole', () => {
    it('should assign role to user', async () => {
      const updatedUser = { ...mockUser, role: 'moderator' }
      mockApi.patch.mockResolvedValue({ data: { data: updatedUser } })

      const result = await usersApi.assignRole(1, 'moderator')

      expect(mockApi.patch).toHaveBeenCalledWith('/users/1/role', {
        role: 'moderator',
      })
      expect(result.data.role).toBe('moderator')
    })

    it('should support multiple role types', async () => {
      const roles = ['admin', 'editor', 'viewer', 'moderator']

      for (const role of roles) {
        mockApi.patch.mockResolvedValue({
          data: { data: { ...mockUser, role } },
        })

        await usersApi.assignRole(1, role)
        expect(mockApi.patch).toHaveBeenCalledWith('/users/1/role', { role })
      }

      expect(mockApi.patch).toHaveBeenCalledTimes(4)
    })
  })

  describe('resetPassword', () => {
    it('should reset user password', async () => {
      mockApi.post.mockResolvedValue({
        data: { data: { temporary_password: 'TempPass123!' } },
      })

      const result = await usersApi.resetPassword(1)

      expect(mockApi.post).toHaveBeenCalledWith('/users/1/reset-password', {})
      expect(result.data.temporary_password).toBeTruthy()
    })
  })

  describe('deactivateUser', () => {
    it('should deactivate user', async () => {
      const deactivated = { ...mockUser, status: 'inactive' }
      mockApi.patch.mockResolvedValue({ data: { data: deactivated } })

      const result = await usersApi.deactivateUser(1)

      expect(mockApi.patch).toHaveBeenCalledWith('/users/1/deactivate', {})
      expect(result.data.status).toBe('inactive')
    })
  })

  describe('activateUser', () => {
    it('should activate user', async () => {
      const activated = { ...mockUser, status: 'active' }
      mockApi.patch.mockResolvedValue({ data: { data: activated } })

      const result = await usersApi.activateUser(1)

      expect(mockApi.patch).toHaveBeenCalledWith('/users/1/activate', {})
      expect(result.data.status).toBe('active')
    })
  })

  describe('getUserPermissions', () => {
    it('should get user permissions', async () => {
      const permissions = ['create_listings', 'edit_listings', 'delete_listings']
      mockApi.get.mockResolvedValue({ data: { data: permissions } })

      const result = await usersApi.getUserPermissions(1)

      expect(mockApi.get).toHaveBeenCalledWith('/users/1/permissions')
      expect(result.data).toEqual(permissions)
    })
  })

  describe('updateUserPermissions', () => {
    it('should update user permissions', async () => {
      const permissions = ['view_dashboard', 'edit_profile']
      mockApi.patch.mockResolvedValue({
        data: { data: { ...mockUser, permissions } },
      })

      const result = await usersApi.updateUserPermissions(1, permissions)

      expect(mockApi.patch).toHaveBeenCalledWith('/users/1/permissions', {
        permissions,
      })
    })

    it('should handle empty permissions', async () => {
      mockApi.patch.mockResolvedValue({
        data: { data: { ...mockUser, permissions: [] } },
      })

      const result = await usersApi.updateUserPermissions(1, [])

      expect(mockApi.patch).toHaveBeenCalledWith('/users/1/permissions', {
        permissions: [],
      })
    })
  })

  describe('bulkDeleteUsers', () => {
    it('should bulk delete users', async () => {
      mockApi.post.mockResolvedValue({})

      await usersApi.bulkDeleteUsers([1, 2, 3])

      expect(mockApi.post).toHaveBeenCalledWith('/users/bulk-delete', {
        ids: [1, 2, 3],
      })
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user profile', async () => {
      mockApi.get.mockResolvedValue({ data: { data: mockUser } })

      const result = await usersApi.getCurrentUser()

      expect(mockApi.get).toHaveBeenCalledWith('/users/me')
      expect(result.data).toEqual(mockUser)
    })
  })

  describe('updateProfile', () => {
    it('should update current user profile', async () => {
      const updates = { name: 'Updated Name' }
      mockApi.post.mockResolvedValue({
        data: { data: { ...mockUser, ...updates } },
      })

      const result = await usersApi.updateProfile(updates)

      expect(mockApi.post).toHaveBeenCalledWith('/user/update-profile', updates)
      expect(result.data.name).toBe('Updated Name')
    })
  })

  describe('getRoles', () => {
    it('should get available roles', async () => {
      const roles = [
        { id: 1, name: 'admin', label: 'Administrator' },
        { id: 2, name: 'editor', label: 'Editor' },
        { id: 3, name: 'viewer', label: 'Viewer' },
      ]
      mockApi.get.mockResolvedValue({ data: { data: roles } })

      const result = await usersApi.getRoles()

      expect(mockApi.get).toHaveBeenCalledWith('/roles-list')
      expect(result.data).toHaveLength(3)
    })

    it('should handle empty roles list', async () => {
      mockApi.get.mockResolvedValue({ data: { data: [] } })

      const result = await usersApi.getRoles()

      expect(result.data).toEqual([])
    })

    it('should handle null response', async () => {
      mockApi.get.mockResolvedValue({ data: null })

      const result = await usersApi.getRoles()

      expect(result.data).toEqual([])
    })
  })

  describe('User status transitions', () => {
    it('should handle active -> inactive -> active flow', async () => {
      const active = { ...mockUser, status: 'active' }
      const inactive = { ...mockUser, status: 'inactive' }

      mockApi.patch
        .mockResolvedValueOnce({ data: { data: inactive } })
        .mockResolvedValueOnce({ data: { data: active } })

      const deactivateResult = await usersApi.deactivateUser(1)
      expect(deactivateResult.data.status).toBe('inactive')

      const activateResult = await usersApi.activateUser(1)
      expect(activateResult.data.status).toBe('active')

      expect(mockApi.patch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error handling', () => {
    it('should handle authorization errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Unauthorized'))

      await expect(usersApi.getUsers()).rejects.toThrow('Unauthorized')
    })

    it('should handle not found errors', async () => {
      mockApi.get.mockRejectedValue(new Error('User not found'))

      await expect(usersApi.getUser(999)).rejects.toThrow('User not found')
    })

    it('should handle validation errors on create', async () => {
      mockApi.post.mockRejectedValue(new Error('Validation failed'))

      await expect(usersApi.createUser({})).rejects.toThrow('Validation failed')
    })

    it('should handle network timeout on bulk operations', async () => {
      mockApi.post.mockRejectedValue(new Error('Timeout'))

      await expect(usersApi.bulkDeleteUsers([1, 2, 3])).rejects.toThrow('Timeout')
    })
  })

  describe('Permission management workflow', () => {
    it('should get and update permissions', async () => {
      const oldPermissions = ['view_dashboard']
      const newPermissions = ['view_dashboard', 'edit_listings']

      mockApi.get.mockResolvedValue({ data: { data: oldPermissions } })
      mockApi.patch.mockResolvedValue({
        data: { data: { ...mockUser, permissions: newPermissions } },
      })

      const getResult = await usersApi.getUserPermissions(1)
      expect(getResult.data).toEqual(oldPermissions)

      const updateResult = await usersApi.updateUserPermissions(1, newPermissions)
      expect(updateResult.data).toBeTruthy()
    })
  })
})
