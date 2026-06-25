import { api } from '@/services/api'
import type { Article } from '@/types/article'

export interface ArticlesResponse {
  data: Article[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface ArticleFilters {
  status?: string
  category_id?: number
  author_id?: number
  page?: number
  per_page?: number
  sort?: string
  search?: string
}

/**
 * Articles API Service
 * Centralized API calls for all article/blog management
 */

export const articlesApi = {
  /**
   * Get all articles with filters
   */
  async getArticles(filters?: ArticleFilters): Promise<ArticlesResponse> {
    const params = new URLSearchParams()
    if (filters) {
      if (filters.status) params.append('status', filters.status)
      if (filters.category_id) params.append('category_id', filters.category_id.toString())
      if (filters.author_id) params.append('author_id', filters.author_id.toString())
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.per_page) params.append('per_page', filters.per_page.toString())
      if (filters.sort) params.append('sort', filters.sort)
      if (filters.search) params.append('search', filters.search)
    }

    const response = await api.get(`/articles?${params.toString()}`)
    return response.data
  },

  /**
   * Get single article
   */
  async getArticle(id: number): Promise<{ data: Article }> {
    const response = await api.get(`/articles/${id}`)
    return response.data
  },

  /**
   * Create new article
   */
  async createArticle(data: Partial<Article>): Promise<{ data: Article }> {
    const response = await api.post('/articles', data)
    return response.data
  },

  /**
   * Update article
   */
  async updateArticle(id: number, data: Partial<Article>): Promise<{ data: Article }> {
    const response = await api.put(`/articles/${id}`, data)
    return response.data
  },

  /**
   * Delete article
   */
  async deleteArticle(id: number): Promise<void> {
    await api.delete(`/articles/${id}`)
  },

  /**
   * Publish article
   */
  async publishArticle(id: number): Promise<{ data: Article }> {
    const response = await api.patch(`/articles/${id}/publish`, {})
    return response.data
  },

  /**
   * Unpublish article
   */
  async unpublishArticle(id: number): Promise<{ data: Article }> {
    const response = await api.patch(`/articles/${id}/unpublish`, {})
    return response.data
  },

  /**
   * Submit article for review
   */
  async submitArticle(id: number): Promise<{ data: Article }> {
    const response = await api.patch(`/articles/${id}/submit`, {})
    return response.data
  },

  /**
   * Approve article
   */
  async approveArticle(id: number): Promise<{ data: Article }> {
    const response = await api.patch(`/articles/${id}/approve`, {})
    return response.data
  },

  /**
   * Reject article
   */
  async rejectArticle(id: number, reason: string): Promise<{ data: Article }> {
    const response = await api.patch(`/articles/${id}/reject`, { reason })
    return response.data
  },

  /**
   * Save as draft
   */
  async saveDraft(id: number | null, data: Partial<Article>): Promise<{ data: Article }> {
    if (id) {
      const response = await api.patch(`/articles/${id}/draft`, data)
      return response.data
    } else {
      const response = await api.post('/articles/draft', data)
      return response.data
    }
  },

  /**
   * Get drafts
   */
  async getDrafts(page: number = 1, perPage: number = 50): Promise<ArticlesResponse> {
    const response = await api.get('/articles/drafts', {
      params: { page, per_page: perPage },
    })
    return response.data
  },

  /**
   * Bulk delete articles
   */
  async bulkDeleteArticles(ids: number[]): Promise<void> {
    await api.post('/articles/bulk-delete', { ids })
  },
}
