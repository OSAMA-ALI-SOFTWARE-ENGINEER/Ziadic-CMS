import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminListing, AdminUser, DashboardStats } from '@/services/admin'
import * as adminService from '@/services/admin'

export const useAdminStore = defineStore('admin', () => {
  // Dashboard
  const dashboardStats = ref<DashboardStats | null>(null)
  const statsLoading = ref(false)
  const statsError = ref('')

  // Listings
  const listings = ref<AdminListing[]>([])
  const listingsLoading = ref(false)
  const listingsError = ref('')

  // Users
  const users = ref<AdminUser[]>([])
  const usersLoading = ref(false)
  const usersError = ref('')

  // Activity Logs
  const activityLogs = ref<any[]>([])
  const activityLoading = ref(false)

  // Stats computed
  const pendingCount = computed(() => listings.value.filter(l => l.status === 'pending').length)
  const draftCount = computed(() => listings.value.filter(l => l.status === 'draft').length)

  // Fetch Dashboard
  async function loadDashboard() {
    statsLoading.value = true
    statsError.value = ''
    try {
      dashboardStats.value = await adminService.fetchDashboard()
    } catch (error) {
      statsError.value = error instanceof Error ? error.message : 'Failed to load dashboard'
    } finally {
      statsLoading.value = false
    }
  }

  // Fetch Listings
  async function loadListings(filters?: { status?: string; city_id?: number; category_id?: number }) {
    listingsLoading.value = true
    listingsError.value = ''
    try {
      listings.value = await adminService.fetchAdminListings(filters)
    } catch (error) {
      listingsError.value = error instanceof Error ? error.message : 'Failed to load listings'
    } finally {
      listingsLoading.value = false
    }
  }

  // Approve Listing
  async function approve(id: number, notes?: string) {
    try {
      await adminService.approveListing(id, notes)
      const listing = listings.value.find(l => l.id === id)
      if (listing) listing.status = 'approved'
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to approve')
    }
  }

  // Reject Listing
  async function reject(id: number, reason?: string) {
    try {
      await adminService.rejectListing(id, reason)
      const listing = listings.value.find(l => l.id === id)
      if (listing) listing.status = 'rejected'
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to reject')
    }
  }

  // Publish Listing
  async function publish(id: number) {
    try {
      await adminService.publishListing(id)
      const listing = listings.value.find(l => l.id === id)
      if (listing) listing.status = 'published'
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to publish')
    }
  }

  // Fetch Users
  async function loadUsers() {
    usersLoading.value = true
    usersError.value = ''
    try {
      users.value = await adminService.fetchAdminUsers()
    } catch (error) {
      usersError.value = error instanceof Error ? error.message : 'Failed to load users'
    } finally {
      usersLoading.value = false
    }
  }

  // Assign Role
  async function assignRole(userId: number, role: string) {
    try {
      await adminService.assignUserRole(userId, role)
      const user = users.value.find(u => u.id === userId)
      if (user) user.roles = [role]
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to assign role')
    }
  }

  // Fetch Activity Logs
  async function loadActivityLogs(limit?: number) {
    activityLoading.value = true
    try {
      activityLogs.value = await adminService.fetchActivityLogs(limit)
    } finally {
      activityLoading.value = false
    }
  }

  return {
    // Dashboard
    dashboardStats,
    statsLoading,
    statsError,
    loadDashboard,

    // Listings
    listings,
    listingsLoading,
    listingsError,
    pendingCount,
    draftCount,
    loadListings,
    approve,
    reject,
    publish,

    // Users
    users,
    usersLoading,
    usersError,
    loadUsers,
    assignRole,

    // Activity Logs
    activityLogs,
    activityLoading,
    loadActivityLogs,
  }
})
