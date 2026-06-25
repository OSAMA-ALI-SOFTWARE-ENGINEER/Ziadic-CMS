import { describe, it, expect, beforeEach, vi } from 'vitest'
import { articlesApi } from '@/services/api/articles.api'
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

describe('Articles API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockArticle = {
    id: 1,
    title: 'Article Title',
    slug: 'article-title',
    content: 'Article content',
    status: 'draft',
    category_id: 1,
    author_id: 1,
    published_at: null,
  }

  const mockArticlesResponse = {
    data: {
      data: [mockArticle],
      meta: {
        current_page: 1,
        per_page: 50,
        total: 1,
        last_page: 1,
      },
    },
  }

  describe('getArticles', () => {
    it('should fetch articles without filters', async () => {
      mockApi.get.mockResolvedValue(mockArticlesResponse)

      const result = await articlesApi.getArticles()

      expect(mockApi.get).toHaveBeenCalledWith('/articles?')
      expect(result).toEqual(mockArticlesResponse.data)
    })

    it('should fetch articles with status filter', async () => {
      mockApi.get.mockResolvedValue(mockArticlesResponse)

      await articlesApi.getArticles({ status: 'published' })

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('status=published')
      )
    })

    it('should fetch articles with search', async () => {
      mockApi.get.mockResolvedValue(mockArticlesResponse)

      await articlesApi.getArticles({ search: 'test' })

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('search=test')
      )
    })

    it('should fetch articles with pagination', async () => {
      mockApi.get.mockResolvedValue(mockArticlesResponse)

      await articlesApi.getArticles({ page: 2, per_page: 25 })

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      )
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('per_page=25')
      )
    })

    it('should filter by author and category', async () => {
      mockApi.get.mockResolvedValue(mockArticlesResponse)

      await articlesApi.getArticles({
        author_id: 5,
        category_id: 3,
      })

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('author_id=5')
      )
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('category_id=3')
      )
    })
  })

  describe('getArticle', () => {
    it('should fetch single article by id', async () => {
      mockApi.get.mockResolvedValue({ data: { data: mockArticle } })

      const result = await articlesApi.getArticle(1)

      expect(mockApi.get).toHaveBeenCalledWith('/articles/1')
      expect(result.data).toEqual(mockArticle)
    })
  })

  describe('createArticle', () => {
    it('should create new article', async () => {
      const newArticle = { title: 'New Article', content: 'Content' }
      mockApi.post.mockResolvedValue({
        data: { data: { ...mockArticle, ...newArticle } },
      })

      const result = await articlesApi.createArticle(newArticle)

      expect(mockApi.post).toHaveBeenCalledWith('/articles', newArticle)
      expect(result.data.title).toBe('New Article')
    })
  })

  describe('updateArticle', () => {
    it('should update article', async () => {
      const updates = { title: 'Updated Title' }
      mockApi.put.mockResolvedValue({
        data: { data: { ...mockArticle, ...updates } },
      })

      const result = await articlesApi.updateArticle(1, updates)

      expect(mockApi.put).toHaveBeenCalledWith('/articles/1', updates)
      expect(result.data.title).toBe('Updated Title')
    })
  })

  describe('deleteArticle', () => {
    it('should delete article', async () => {
      mockApi.delete.mockResolvedValue({})

      await articlesApi.deleteArticle(1)

      expect(mockApi.delete).toHaveBeenCalledWith('/articles/1')
    })
  })

  describe('publishArticle', () => {
    it('should publish article', async () => {
      const published = {
        ...mockArticle,
        status: 'published',
        published_at: '2024-01-01',
      }
      mockApi.patch.mockResolvedValue({ data: { data: published } })

      const result = await articlesApi.publishArticle(1)

      expect(mockApi.patch).toHaveBeenCalledWith('/articles/1/publish', {})
      expect(result.data.status).toBe('published')
    })
  })

  describe('unpublishArticle', () => {
    it('should unpublish article', async () => {
      const unpublished = { ...mockArticle, status: 'draft' }
      mockApi.patch.mockResolvedValue({ data: { data: unpublished } })

      const result = await articlesApi.unpublishArticle(1)

      expect(mockApi.patch).toHaveBeenCalledWith('/articles/1/unpublish', {})
      expect(result.data.status).toBe('draft')
    })
  })

  describe('submitArticle', () => {
    it('should submit article for review', async () => {
      const submitted = { ...mockArticle, status: 'pending_review' }
      mockApi.patch.mockResolvedValue({ data: { data: submitted } })

      const result = await articlesApi.submitArticle(1)

      expect(mockApi.patch).toHaveBeenCalledWith('/articles/1/submit', {})
      expect(result.data.status).toBe('pending_review')
    })
  })

  describe('approveArticle', () => {
    it('should approve article', async () => {
      const approved = { ...mockArticle, status: 'approved' }
      mockApi.patch.mockResolvedValue({ data: { data: approved } })

      const result = await articlesApi.approveArticle(1)

      expect(mockApi.patch).toHaveBeenCalledWith('/articles/1/approve', {})
      expect(result.data.status).toBe('approved')
    })
  })

  describe('rejectArticle', () => {
    it('should reject article with reason', async () => {
      const rejected = { ...mockArticle, status: 'rejected' }
      mockApi.patch.mockResolvedValue({ data: { data: rejected } })

      const result = await articlesApi.rejectArticle(1, 'Not appropriate')

      expect(mockApi.patch).toHaveBeenCalledWith('/articles/1/reject', {
        reason: 'Not appropriate',
      })
      expect(result.data.status).toBe('rejected')
    })
  })

  describe('saveDraft', () => {
    it('should create new draft', async () => {
      const draft = { title: 'Draft', content: 'Content' }
      mockApi.post.mockResolvedValue({
        data: { data: { ...mockArticle, ...draft } },
      })

      const result = await articlesApi.saveDraft(null, draft)

      expect(mockApi.post).toHaveBeenCalledWith('/articles/draft', draft)
    })

    it('should update existing draft', async () => {
      const updates = { content: 'Updated content' }
      mockApi.patch.mockResolvedValue({
        data: { data: { ...mockArticle, ...updates } },
      })

      const result = await articlesApi.saveDraft(1, updates)

      expect(mockApi.patch).toHaveBeenCalledWith('/articles/1/draft', updates)
    })
  })

  describe('getDrafts', () => {
    it('should get drafts with default pagination', async () => {
      mockApi.get.mockResolvedValue(mockArticlesResponse)

      await articlesApi.getDrafts()

      expect(mockApi.get).toHaveBeenCalledWith('/articles/drafts', {
        params: { page: 1, per_page: 50 },
      })
    })

    it('should get drafts with custom pagination', async () => {
      mockApi.get.mockResolvedValue(mockArticlesResponse)

      await articlesApi.getDrafts(2, 25)

      expect(mockApi.get).toHaveBeenCalledWith('/articles/drafts', {
        params: { page: 2, per_page: 25 },
      })
    })
  })

  describe('bulkDeleteArticles', () => {
    it('should bulk delete articles', async () => {
      mockApi.post.mockResolvedValue({})

      await articlesApi.bulkDeleteArticles([1, 2, 3])

      expect(mockApi.post).toHaveBeenCalledWith('/articles/bulk-delete', {
        ids: [1, 2, 3],
      })
    })
  })

  describe('Article workflow', () => {
    it('should handle draft -> submit -> approve -> publish', async () => {
      const draft = { ...mockArticle, status: 'draft' }
      const submitted = { ...mockArticle, status: 'pending_review' }
      const approved = { ...mockArticle, status: 'approved' }
      const published = { ...mockArticle, status: 'published' }

      mockApi.patch
        .mockResolvedValueOnce({ data: { data: submitted } })
        .mockResolvedValueOnce({ data: { data: approved } })
        .mockResolvedValueOnce({ data: { data: published } })

      const submitResult = await articlesApi.submitArticle(1)
      expect(submitResult.data.status).toBe('pending_review')

      const approveResult = await articlesApi.approveArticle(1)
      expect(approveResult.data.status).toBe('approved')

      const publishResult = await articlesApi.publishArticle(1)
      expect(publishResult.data.status).toBe('published')

      expect(mockApi.patch).toHaveBeenCalledTimes(3)
    })

    it('should handle draft -> submit -> reject flow', async () => {
      const rejected = { ...mockArticle, status: 'rejected' }

      mockApi.patch.mockResolvedValue({ data: { data: rejected } })

      const result = await articlesApi.rejectArticle(1, 'Poor quality')

      expect(result.data.status).toBe('rejected')
    })
  })

  describe('Error handling', () => {
    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValue(new Error('API Error'))

      await expect(articlesApi.getArticles()).rejects.toThrow('API Error')
    })

    it('should handle network errors on create', async () => {
      mockApi.post.mockRejectedValue(new Error('Network error'))

      await expect(articlesApi.createArticle({})).rejects.toThrow()
    })

    it('should handle validation errors on submit', async () => {
      mockApi.patch.mockRejectedValue(new Error('Validation error'))

      await expect(articlesApi.submitArticle(1)).rejects.toThrow()
    })
  })
})
