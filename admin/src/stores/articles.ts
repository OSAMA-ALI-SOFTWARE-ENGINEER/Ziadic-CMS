import { defineStore } from 'pinia'
import { useUiStore } from './ui'
import { articlesApi, type ArticlesResponse, type ArticleFilters } from '@/services/api/articles.api'
import type { Article } from '@/types/article'

export const useArticlesStore = defineStore('articles', {
  state: () => ({
    articles: [] as Article[],
    drafts: [] as Article[],
    currentArticle: null as Article | null,
    isLoading: false,
    error: null as string | null,
    pagination: {
      currentPage: 1,
      perPage: 50,
      total: 0,
      lastPage: 1,
    },
    draftsPagination: {
      currentPage: 1,
      perPage: 50,
      total: 0,
      lastPage: 1,
    },
    filters: {} as ArticleFilters,
  }),

  getters: {
    getTotalArticles: (state) => state.pagination.total,
    getTotalDrafts: (state) => state.draftsPagination.total,
    getCurrentPage: (state) => state.pagination.currentPage,
    getLastPage: (state) => state.pagination.lastPage,
    hasMorePages: (state) => state.pagination.currentPage < state.pagination.lastPage,
    getArticleById: (state) => (id: number) => state.articles.find((a) => a.id === id),
    getDraftById: (state) => (id: number) => state.drafts.find((a) => a.id === id),
  },

  actions: {
    /**
     * Fetch articles with filters and pagination
     */
    async fetchArticles(filters?: ArticleFilters, page: number = 1) {
      this.isLoading = true
      this.error = null
      try {
        const response = await articlesApi.getArticles({
          ...filters,
          page,
          per_page: this.pagination.perPage,
        })

        this.articles = response.data
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
        const message = err instanceof Error ? err.message : 'Failed to fetch articles'
        this.error = message
        useUiStore().pushToast(message, 'danger')
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Get single article
     */
    async getArticle(id: number) {
      this.isLoading = true
      this.error = null
      try {
        const response = await articlesApi.getArticle(id)
        this.currentArticle = response.data
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch article'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Create new article
     */
    async createArticle(data: Partial<Article>) {
      this.isLoading = true
      this.error = null
      try {
        const response = await articlesApi.createArticle(data)
        this.articles.unshift(response.data)
        this.pagination.total++
        useUiStore().pushToast('Article created successfully', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create article'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Update article
     */
    async updateArticle(id: number, data: Partial<Article>) {
      this.isLoading = true
      this.error = null
      try {
        const response = await articlesApi.updateArticle(id, data)
        const index = this.articles.findIndex((a) => a.id === id)
        if (index >= 0) {
          this.articles[index] = response.data
        }
        if (this.currentArticle?.id === id) {
          this.currentArticle = response.data
        }
        useUiStore().pushToast('Article updated successfully', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update article'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Delete article
     */
    async deleteArticle(id: number) {
      this.isLoading = true
      this.error = null
      try {
        await articlesApi.deleteArticle(id)
        this.articles = this.articles.filter((a) => a.id !== id)
        this.pagination.total--
        if (this.currentArticle?.id === id) {
          this.currentArticle = null
        }
        useUiStore().pushToast('Article deleted successfully', 'success')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete article'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Bulk delete articles
     */
    async bulkDeleteArticles(ids: number[]) {
      this.isLoading = true
      this.error = null
      try {
        await articlesApi.bulkDeleteArticles(ids)
        this.articles = this.articles.filter((a) => !ids.includes(a.id))
        this.pagination.total -= ids.length
        useUiStore().pushToast('Articles deleted successfully', 'success')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete articles'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Publish article
     */
    async publishArticle(id: number) {
      this.isLoading = true
      this.error = null
      try {
        const response = await articlesApi.publishArticle(id)
        const index = this.articles.findIndex((a) => a.id === id)
        if (index >= 0) {
          this.articles[index] = response.data
        }
        if (this.currentArticle?.id === id) {
          this.currentArticle = response.data
        }
        useUiStore().pushToast('Article published successfully', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to publish article'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Unpublish article
     */
    async unpublishArticle(id: number) {
      this.isLoading = true
      this.error = null
      try {
        const response = await articlesApi.unpublishArticle(id)
        const index = this.articles.findIndex((a) => a.id === id)
        if (index >= 0) {
          this.articles[index] = response.data
        }
        if (this.currentArticle?.id === id) {
          this.currentArticle = response.data
        }
        useUiStore().pushToast('Article unpublished successfully', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to unpublish article'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Submit article for review
     */
    async submitArticle(id: number) {
      this.isLoading = true
      this.error = null
      try {
        const response = await articlesApi.submitArticle(id)
        const index = this.articles.findIndex((a) => a.id === id)
        if (index >= 0) {
          this.articles[index] = response.data
        }
        if (this.currentArticle?.id === id) {
          this.currentArticle = response.data
        }
        useUiStore().pushToast('Article submitted for review', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit article'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Approve article
     */
    async approveArticle(id: number) {
      this.isLoading = true
      this.error = null
      try {
        const response = await articlesApi.approveArticle(id)
        const index = this.articles.findIndex((a) => a.id === id)
        if (index >= 0) {
          this.articles[index] = response.data
        }
        if (this.currentArticle?.id === id) {
          this.currentArticle = response.data
        }
        useUiStore().pushToast('Article approved', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to approve article'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Reject article
     */
    async rejectArticle(id: number, reason: string) {
      this.isLoading = true
      this.error = null
      try {
        const response = await articlesApi.rejectArticle(id, reason)
        const index = this.articles.findIndex((a) => a.id === id)
        if (index >= 0) {
          this.articles[index] = response.data
        }
        if (this.currentArticle?.id === id) {
          this.currentArticle = response.data
        }
        useUiStore().pushToast('Article rejected', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to reject article'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Save draft
     */
    async saveDraft(id: number | null, data: Partial<Article>) {
      this.isLoading = true
      this.error = null
      try {
        const response = await articlesApi.saveDraft(id, data)
        if (id) {
          const index = this.drafts.findIndex((a) => a.id === id)
          if (index >= 0) {
            this.drafts[index] = response.data
          }
        } else {
          this.drafts.unshift(response.data)
          this.draftsPagination.total++
        }
        useUiStore().pushToast('Draft saved successfully', 'success')
        return response.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save draft'
        this.error = message
        useUiStore().pushToast(message, 'danger')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch drafts
     */
    async fetchDrafts(page: number = 1, perPage: number = 50) {
      this.isLoading = true
      this.error = null
      try {
        const response = await articlesApi.getDrafts(page, perPage)
        this.drafts = response.data
        this.draftsPagination = {
          currentPage: response.meta.current_page,
          perPage: response.meta.per_page,
          total: response.meta.total,
          lastPage: response.meta.last_page,
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch drafts'
        this.error = message
        useUiStore().pushToast(message, 'danger')
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Clear current article
     */
    clearCurrentArticle() {
      this.currentArticle = null
    },

    /**
     * Reset state
     */
    resetState() {
      this.articles = []
      this.drafts = []
      this.currentArticle = null
      this.error = null
      this.pagination = {
        currentPage: 1,
        perPage: 50,
        total: 0,
        lastPage: 1,
      }
      this.draftsPagination = {
        currentPage: 1,
        perPage: 50,
        total: 0,
        lastPage: 1,
      }
      this.filters = {}
    },
  },
})
