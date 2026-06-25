/**
 * API Service Module
 * Centralized export of all API services
 * This ensures single source of truth for all backend API calls
 */

export { listingsApi } from './listings.api'
export { mediaApi } from './media.api'
export { articlesApi } from './articles.api'
export { usersApi } from './users.api'

// Re-export types for convenience
export type { ListingsResponse, ListingFilters } from './listings.api'
export type { MediaResponse, UploadProgress } from './media.api'
export type { ArticlesResponse, ArticleFilters } from './articles.api'
export type { UsersResponse, UserFilters } from './users.api'

/**
 * Import all APIs into a single namespace for consistency
 * Usage: const data = await apiServices.listings.getListings(filters)
 */
import { listingsApi } from './listings.api'
import { mediaApi } from './media.api'
import { articlesApi } from './articles.api'
import { usersApi } from './users.api'

export const apiServices = {
  listings: listingsApi,
  media: mediaApi,
  articles: articlesApi,
  users: usersApi,
}
