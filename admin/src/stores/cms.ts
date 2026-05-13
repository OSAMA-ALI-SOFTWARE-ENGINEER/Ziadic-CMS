import { defineStore } from 'pinia'
import { listingRows, type ListingRow, type StatusTone } from '@/data/cms'

export type Category = {
  id: number
  name: string
  slug: string
  parent?: string
  status: string
}

export type UserRow = {
  id: number
  name: string
  email: string
  role: string
  status: string
  tone: StatusTone
}

export type MediaItem = {
  id: number
  name: string
  type: string
  size: string
}

export type RoleRow = {
  id: number
  name: string
  users: number
  permissions: string
  status: string
  tone: StatusTone
}

export const useCmsStore = defineStore('cms', {
  state: () => ({
    listings: [...listingRows] as ListingRow[],
    categories: [
      { id: 1, name: 'Arts and Culture', slug: 'arts-and-culture', status: 'Active' },
      { id: 2, name: 'Dining and Restaurants', slug: 'dining-and-restaurants', status: 'Active' },
      { id: 3, name: 'Sports and Fitness', slug: 'sports-and-fitness', status: 'Active' },
      { id: 4, name: 'Car Rental', slug: 'car-rental', parent: 'Services', status: 'Active' },
    ] as Category[],
    users: [
      { id: 1, name: 'Super Admin', email: 'superadmin@kukaqka.com', role: 'super-admin', status: 'Active', tone: 'success' },
      { id: 2, name: 'Admin User', email: 'admin@kukaqka.com', role: 'admin', status: 'Active', tone: 'success' },
      { id: 3, name: 'Staff Editor', email: 'staff@kukaqka.com', role: 'staff', status: 'Active', tone: 'success' },
      { id: 4, name: 'Client Account', email: 'client@kukaqka.com', role: 'client', status: 'Pending', tone: 'warning' },
    ] as UserRow[],
    roles: [
      { id: 1, name: 'super-admin', users: 1, permissions: 'All permissions', status: 'System', tone: 'info' },
      { id: 2, name: 'admin', users: 1, permissions: 'Manage CMS except destructive role deletion', status: 'Active', tone: 'success' },
      { id: 3, name: 'staff', users: 1, permissions: 'Listings, media, content, approvals', status: 'Active', tone: 'success' },
      { id: 4, name: 'client', users: 1, permissions: 'Own listings, media upload, payments', status: 'Active', tone: 'success' },
    ] as RoleRow[],
    media: Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      name: `media-file-${index + 1}.jpg`,
      type: index % 3 === 0 ? 'Featured image' : 'Gallery asset',
      size: `${240 + index * 18} KB`,
    })) as MediaItem[],
  }),
  actions: {
    upsertListing(listing: ListingRow, originalTitle?: string) {
      const index = this.listings.findIndex((row) => row.title === originalTitle)
      if (index >= 0) {
        this.listings[index] = listing
        return
      }
      this.listings.unshift(listing)
    },
    deleteListing(title: string) {
      this.listings = this.listings.filter((listing) => listing.title !== title)
    },
    updateListingStatus(title: string, status: string, tone: StatusTone) {
      const listing = this.listings.find((row) => row.title === title)
      if (listing) {
        listing.status = status
        listing.tone = tone
      }
    },
    upsertCategory(category: Category) {
      const index = this.categories.findIndex((row) => row.id === category.id)
      if (index >= 0) {
        this.categories[index] = category
        return
      }
      this.categories.unshift({ ...category, id: Date.now() })
    },
    deleteCategory(id: number) {
      this.categories = this.categories.filter((category) => category.id !== id)
    },
    upsertUser(user: UserRow) {
      const index = this.users.findIndex((row) => row.id === user.id)
      if (index >= 0) {
        this.users[index] = user
        return
      }
      this.users.unshift({ ...user, id: Date.now() })
    },
    deleteUser(id: number) {
      this.users = this.users.filter((user) => user.id !== id)
    },
    upsertRole(role: RoleRow) {
      const index = this.roles.findIndex((row) => row.id === role.id)
      if (index >= 0) {
        this.roles[index] = role
        return
      }
      this.roles.unshift({ ...role, id: Date.now() })
    },
    deleteRole(id: number) {
      this.roles = this.roles.filter((role) => role.id !== id)
    },
  },
})
