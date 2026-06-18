<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'
import Editor from 'primevue/editor'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { withMinimumLoadingTime } from '@/utils/loadingHelper'

interface Article {
  id: number
  title: string
  slug: string
  status: string
  excerpt?: string
  content?: string
  featured_image?: string
  author?: { name: string }
  category?: { name: string }
  created_at: string
}

const articles = ref<Article[]>([])
const authors = ref([])
const categories = ref([])
const newCategory = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const activeTab = ref('articles')
const showForm = ref(false)
const showCategoryModal = ref(false)
const editingCategoryId = ref<number | null>(null)
const editingId = ref<number | null>(null)
const imagePreview = ref('')

interface CategoryForm {
  name: string
  slug: string
}

const categoryForm = ref<CategoryForm>({
  name: '',
  slug: '',
})

const form = ref({
  title: '',
  excerpt: '',
  content: '',
  featured_image: '',
  author_id: '',
  category_id: '',
  seo_title: '',
})

async function load() {
  try {
    loading.value = true
    error.value = ''

    await withMinimumLoadingTime(
      (async () => {
        const [articlesRes, authorsRes, categoriesRes] = await Promise.all([
          api.get('/articles'),
          api.get('/authors'),
          api.get('/article-categories'),
        ])
        articles.value = articlesRes.data.data?.data || articlesRes.data.data || []
        authors.value = authorsRes.data.data?.data || authorsRes.data.data || []
        categories.value = categoriesRes.data.data?.data || categoriesRes.data.data || []
      })(),
      2000
    )
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load data'
  } finally {
    loading.value = false
  }
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function saveArticle() {
  try {
    error.value = ''
    success.value = ''

    // Validate required fields
    if (!form.value.title.trim()) {
      error.value = 'Title is required'
      return
    }
    if (!form.value.content?.trim()) {
      error.value = 'Content is required'
      return
    }
    if (!form.value.author_id) {
      error.value = 'Author is required'
      return
    }

    const formData = new FormData()
    formData.append('title', form.value.title.trim())
    formData.append('slug', generateSlug(form.value.title))
    formData.append('excerpt', form.value.excerpt?.trim() || '')
    formData.append('content', form.value.content.trim())
    formData.append('author_id', String(form.value.author_id))
    formData.append('category_id', form.value.category_id ? String(form.value.category_id) : '0')
    formData.append('seo_title', form.value.seo_title?.trim() || '')
    formData.append('seo_description', '')
    formData.append('seo_keywords', '')
    formData.append('og_image', '')
    formData.append('status', 'draft')

    // For PUT requests, add _method field for Laravel form spoofing
    if (editingId.value) {
      formData.append('_method', 'PUT')
    }

    // Only append featured_image if it's a new File (not a URL string)
    if (form.value.featured_image && form.value.featured_image instanceof File) {
      formData.append('featured_image', form.value.featured_image)
    }

    if (editingId.value) {
      await api.post(`/articles/${editingId.value}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      success.value = 'Article updated successfully'
    } else {
      await api.post('/articles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      success.value = 'Article created successfully'
    }

    showForm.value = false
    editingId.value = null
    resetForm()
    await load()
  } catch (err: any) {
      status: err.response?.status,
      statusText: err.response?.statusText,
      message: err.response?.data?.message,
      errors: err.response?.data?.errors,
    })
    const errors = err.response?.data?.errors
    if (errors && typeof errors === 'object') {
      error.value = Object.entries(errors)
        .map(([field, msgs]: any) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join('\n')
    } else {
      error.value = err.response?.data?.message || 'Failed to save article'
    }
  }
}

async function submitArticle(id: number) {
  try {
    await api.patch(`/articles/${id}/submit`)
    success.value = 'Article submitted for review'
    await load()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to submit'
  }
}

async function approveArticle(id: number) {
  try {
    await api.patch(`/articles/${id}/approve`)
    success.value = 'Article approved'
    await load()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to approve'
  }
}

async function publishArticle(id: number) {
  try {
    await api.patch(`/articles/${id}/publish`)
    success.value = 'Article published'
    await load()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to publish'
  }
}

async function rejectArticle(id: number) {
  const reason = prompt('Rejection reason:')
  if (!reason) return
  try {
    await api.patch(`/articles/${id}/reject`, { reason })
    success.value = 'Article rejected'
    await load()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to reject'
  }
}

async function deleteArticle(id: number, title: string) {
  if (!confirm(`Delete "${title}"?`)) return
  try {
    await api.delete(`/articles/${id}`)
    success.value = 'Article deleted'
    await load()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to delete'
  }
}

async function editArticle(article: Article) {
  try {
    // Fetch full article details including all fields
    const response = await api.get(`/articles/${article.id}`)
    const fullArticle = response.data.data


    editingId.value = fullArticle.id
    form.value = {
      title: fullArticle.title || '',
      excerpt: fullArticle.excerpt || '',
      content: fullArticle.content || '',
      featured_image: '' as any, // Keep empty so we don't send it unless a new file is selected
      author_id: fullArticle.author_id !== null && fullArticle.author_id !== undefined ? String(fullArticle.author_id) : '',
      category_id: fullArticle.category_id !== null && fullArticle.category_id !== undefined ? String(fullArticle.category_id) : '',
      seo_title: fullArticle.seo_title || '',
    }


    // Show existing image preview if available - use full URL
    if (fullArticle.featured_image) {
      const imageUrl = fullArticle.featured_image.startsWith('http')
        ? fullArticle.featured_image
        : `http://localhost:8000${fullArticle.featured_image}`
      imagePreview.value = imageUrl
    }
    showForm.value = true
  } catch (err: any) {
    error.value = 'Failed to load article details'
  }
}

function resetForm() {
  form.value = {
    title: '',
    excerpt: '',
    content: '',
    featured_image: '' as any,
    author_id: '',
    category_id: '',
    seo_title: '',
  }
  editingId.value = null
  imagePreview.value = ''
}

function handleImageUpload(e: any) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event: any) => {
      imagePreview.value = event.target.result
    }
    reader.readAsDataURL(file)
    // Store the file object, not the base64 string
    form.value.featured_image = file as any
  }
}

function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function openCategoryModal(category?: any) {
  if (category) {
    editingCategoryId.value = category.id
    categoryForm.value = {
      name: category.name,
      slug: category.slug || generateSlugFromName(category.name),
    }
  } else {
    editingCategoryId.value = null
    categoryForm.value = {
      name: '',
      slug: '',
    }
  }
  showCategoryModal.value = true
}

function closeCategoryModal() {
  showCategoryModal.value = false
  editingCategoryId.value = null
  categoryForm.value = {
    name: '',
    slug: '',
  }
}

async function saveCategory() {
  if (!categoryForm.value.name.trim()) {
    error.value = 'Category name is required'
    return
  }

  try {
    error.value = ''
    const slug = categoryForm.value.slug || generateSlugFromName(categoryForm.value.name)
    const payload = {
      name: categoryForm.value.name.trim(),
      slug: slug,
    }

    if (editingCategoryId.value) {
      await api.put(`/article-categories/${editingCategoryId.value}`, payload)
      success.value = 'Category updated successfully'
    } else {
      await api.post('/article-categories', payload)
      success.value = 'Category added successfully'
    }

    closeCategoryModal()
    await load()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to save category'
  }
}

async function deleteCategory(id: number, name: string) {
  if (!confirm(`Delete "${name}"?`)) return
  try {
    await api.delete(`/article-categories/${id}`)
    success.value = 'Category deleted'
    await load()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to delete'
  }
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    draft: '#9CA3AF',
    pending_review: '#EAB308',
    approved: '#3B82F6',
    published: '#10B981',
    rejected: '#EF4444',
  }
  return colors[status] || '#9CA3AF'
}

onMounted(load)
</script>

<template>
  <div class="cms-page">
    <!-- Header -->
    <div class="cms-page__header">
      <div>
        <h1 class="cms-page__title">📚 Blog Management</h1>
        <p class="cms-page__subtitle">Create, manage, and publish blog articles & categories</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="cms-tabs">
      <button
        @click="activeTab = 'articles'"
        :class="['cms-tab', { 'cms-tab--active': activeTab === 'articles' }]"
      >
        📰 Articles
      </button>
      <button
        @click="activeTab = 'categories'"
        :class="['cms-tab', { 'cms-tab--active': activeTab === 'categories' }]"
      >
        🏷️ Categories
      </button>
    </div>

    <!-- Alerts -->
    <div v-if="error" class="cms-alert cms-alert--error">
      <i class="pi pi-exclamation-circle"></i>
      {{ error }}
    </div>
    <div v-if="success" class="cms-alert cms-alert--success">
      <i class="pi pi-check-circle"></i>
      {{ success }}
    </div>

    <!-- ARTICLES TAB -->
    <template v-if="activeTab === 'articles'">
      <div class="cms-page__actions">
        <button
          @click="() => { resetForm(); showForm = true }"
          class="cms-button cms-button--primary"
        >
          <i class="pi pi-plus"></i> New Article
        </button>
      </div>

    <!-- Articles Table -->
    <div class="cms-card">
      <div v-if="loading && articles.length === 0" class="p-6">
        <SkeletonCard type="table-row" :count="8" />
      </div>

      <table v-else-if="!loading || articles.length > 0" class="cms-table">
        <thead class="cms-table__head">
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Category</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="articles.length === 0">
            <td colspan="6" class="cms-table__empty">No articles found. Create your first article!</td>
          </tr>
          <tr v-for="article in articles" :key="article.id" class="cms-table__row">
            <td class="cms-table__cell cms-table__cell--title">{{ article.title }}</td>
            <td class="cms-table__cell">{{ article.author?.name || '-' }}</td>
            <td class="cms-table__cell">{{ article.category?.name || '-' }}</td>
            <td class="cms-table__cell">
              <span class="cms-badge" :style="{ backgroundColor: getStatusColor(article.status) }">
                {{ article.status }}
              </span>
            </td>
            <td class="cms-table__cell">{{ new Date(article.created_at).toLocaleDateString() }}</td>
            <td class="cms-table__cell cms-table__cell--actions">
              <button @click="editArticle(article)" class="cms-action-btn" title="Edit">✏️</button>
              <button v-if="article.status === 'draft'" @click="submitArticle(article.id)" class="cms-action-btn" title="Submit">📤</button>
              <button v-if="article.status === 'pending_review'" @click="approveArticle(article.id)" class="cms-action-btn" title="Approve">✓</button>
              <button v-if="article.status === 'approved'" @click="publishArticle(article.id)" class="cms-action-btn" title="Publish">🌐</button>
              <button v-if="article.status === 'pending_review'" @click="rejectArticle(article.id)" class="cms-action-btn" title="Reject">✗</button>
              <button @click="deleteArticle(article.id, article.title)" class="cms-action-btn cms-action-btn--danger" title="Delete">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </template>

    <!-- CATEGORIES TAB -->
    <template v-if="activeTab === 'categories'">
      <div class="cms-page__actions">
        <button @click="openCategoryModal()" class="cms-button cms-button--primary">
          <i class="pi pi-plus"></i> Add Category
        </button>
      </div>

      <div class="cms-card">
        <div class="cms-table-wrapper">
          <table class="cms-table">
            <thead class="cms-table__head">
              <tr>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Articles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="categories.length === 0">
                <td colspan="4" class="cms-table__empty">No categories found. Create your first category!</td>
              </tr>
              <tr v-for="cat in categories" :key="cat.id" class="cms-table__row">
                <td class="cms-table__cell">{{ cat.name }}</td>
                <td class="cms-table__cell">{{ cat.slug }}</td>
                <td class="cms-table__cell">{{ cat.articles_count || 0 }}</td>
                <td class="cms-table__cell cms-table__cell--actions">
                  <button @click="openCategoryModal(cat)" class="cms-action-btn" title="Edit">✏️</button>
                  <button @click="deleteCategory(cat.id, cat.name)" class="cms-action-btn cms-action-btn--danger" title="Delete">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Category Modal -->
      <div v-if="showCategoryModal" class="cms-modal">
        <div class="cms-modal__overlay" @click="closeCategoryModal"></div>
        <div class="cms-modal__content">
          <div class="cms-modal__header">
            <h2>{{ editingCategoryId ? '✏️ Edit Category' : '➕ Add New Category' }}</h2>
            <button @click="closeCategoryModal" class="cms-modal__close">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <form class="cms-modal__body" @submit.prevent="saveCategory">
            <div class="cms-form__group">
              <label class="cms-form__label">Category Name *</label>
              <input
                v-model="categoryForm.name"
                type="text"
                placeholder="e.g., Technology, Travel"
                class="cms-form__input"
                @input="categoryForm.slug = generateSlugFromName(categoryForm.name)"
                required
              />
            </div>

            <div class="cms-form__group">
              <label class="cms-form__label">Slug</label>
              <input
                v-model="categoryForm.slug"
                type="text"
                placeholder="Auto-generated slug"
                class="cms-form__input"
              />
              <p class="cms-form__hint">Auto-generated from name, can be edited</p>
            </div>

            <div class="cms-form__actions">
              <button type="button" @click="closeCategoryModal" class="cms-button cms-button--secondary">
                Cancel
              </button>
              <button type="submit" class="cms-button cms-button--primary">
                {{ editingCategoryId ? 'Update Category' : 'Add Category' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </template>

    <!-- Form Modal -->
    <div v-if="showForm" class="cms-modal">
      <div class="cms-modal__overlay" @click="showForm = false"></div>
      <div class="cms-modal__content">
        <div class="cms-modal__header">
          <h2>{{ editingId ? '✏️ Edit Article' : '✨ Create New Article' }}</h2>
          <button @click="showForm = false" class="cms-modal__close">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="cms-modal__body">
          <!-- Title -->
          <div class="cms-form__group">
            <label class="cms-form__label">Title <span class="cms-required">*</span></label>
            <input v-model="form.title" type="text" placeholder="Enter article title..." class="cms-form__input" />
          </div>

          <!-- Featured Image -->
          <div class="cms-form__group">
            <label class="cms-form__label">Featured Image</label>
            <div class="image-upload">
              <input
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="cms-form__input"
              />
              <div v-if="imagePreview" class="image-preview">
                <img :src="imagePreview" alt="Preview" />
              </div>
            </div>
          </div>

          <!-- Description/Excerpt -->
          <div class="cms-form__group">
            <label class="cms-form__label">Description</label>
            <textarea
              v-model="form.excerpt"
              placeholder="Brief description of the article..."
              rows="3"
              class="cms-form__textarea"
              maxlength="500"
            ></textarea>
            <p class="cms-form__hint">{{ form.excerpt.length }}/500 characters</p>
          </div>

          <!-- Content Editor -->
          <div class="cms-form__group">
            <label class="cms-form__label">Content <span class="cms-required">*</span></label>
            <Editor v-model="form.content" editor-style="height: 300px" />
          </div>

          <!-- Author & Category -->
          <div class="cms-form__row">
            <div class="cms-form__group">
              <label class="cms-form__label">Author <span class="cms-required">*</span></label>
              <select v-model="form.author_id" class="cms-form__select">
                <option value="">Select author</option>
                <option v-for="author in authors" :key="author.id" :value="String(author.id)">{{ author.name }}</option>
              </select>
            </div>
            <div class="cms-form__group">
              <label class="cms-form__label">Category</label>
              <select v-model="form.category_id" class="cms-form__select">
                <option value="">Select category</option>
                <option v-for="cat in categories" :key="cat.id" :value="String(cat.id)">{{ cat.name }}</option>
              </select>
            </div>
          </div>

          <!-- SEO Title -->
          <div class="cms-form__group">
            <label class="cms-form__label">SEO Title</label>
            <input v-model="form.seo_title" type="text" placeholder="SEO title for search engines..." class="cms-form__input" />
          </div>
        </div>

        <div class="cms-modal__footer">
          <button @click="showForm = false" class="cms-button cms-button--secondary">Cancel</button>
          <button @click="saveArticle" class="cms-button cms-button--primary">
            <i class="pi pi-check"></i> {{ editingId ? 'Update Article' : 'Create Article' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page Styling */
.cms-page {
  padding: 2rem;
}

.cms-page__actions {
  margin-bottom: 1.5rem;
}

/* Tabs */
.cms-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--admin-border);
}

.cms-tab {
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--admin-muted);
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.cms-tab:hover {
  color: var(--admin-ink);
}

.cms-tab--active {
  color: var(--admin-primary);
  border-bottom-color: var(--admin-primary);
}

.image-upload {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-preview {
  max-width: 200px;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid var(--admin-border);
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.cms-table-wrapper {
  overflow-x: auto;
}

.cms-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.cms-page__title {
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: var(--admin-ink);
}

.cms-page__subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--admin-muted);
}

/* Alerts */
.cms-alert {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.cms-alert--error {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.cms-alert--success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

/* Card */
.cms-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.cms-loading {
  padding: 2rem;
  text-align: center;
  color: var(--admin-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Table */
.cms-table {
  width: 100%;
  border-collapse: collapse;
}

.cms-table__head {
  background: var(--admin-bg-soft);
  border-bottom: 1px solid var(--admin-border);
}

.cms-table__head th {
  padding: 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--admin-ink);
}

.cms-table__row {
  border-bottom: 1px solid var(--admin-border);
  transition: background-color 0.2s;
}

.cms-table__row:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.cms-table__cell {
  padding: 1rem;
  font-size: 0.875rem;
  color: var(--admin-ink);
}

.cms-table__cell--title {
  font-weight: 500;
}

.cms-table__cell--actions {
  display: flex;
  gap: 0.5rem;
}

.cms-table__empty {
  text-align: center;
  color: var(--admin-muted);
  padding: 2rem 1rem;
}

/* Badge */
.cms-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-transform: capitalize;
}

/* Action Buttons */
.cms-action-btn {
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  border-radius: 0.25rem;
}

.cms-action-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.cms-action-btn--danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Button */
.cms-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cms-button--primary {
  background: var(--admin-primary);
  color: white;
}

.cms-button--primary:hover {
  background: var(--admin-primary-strong);
}

.cms-button--secondary {
  background: var(--admin-bg-soft);
  color: var(--admin-ink);
  border: 1px solid var(--admin-border);
}

.cms-button--secondary:hover {
  background: var(--admin-bg);
}

/* Modal */
.cms-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.cms-modal__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.cms-modal__content {
  position: relative;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 48rem;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.cms-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--admin-border);
}

.cms-modal__header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--admin-ink);
}

.cms-modal__close {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: var(--admin-muted);
  transition: color 0.2s;
}

.cms-modal__close:hover {
  color: var(--admin-ink);
}

.cms-modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.cms-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--admin-border);
}

/* Form */
.cms-form__group {
  margin-bottom: 1.5rem;
}

.cms-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.cms-form__label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--admin-ink);
  margin-bottom: 0.5rem;
}

.cms-required {
  color: #ef4444;
}

.cms-form__input,
.cms-form__select,
.cms-form__textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--admin-border);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--admin-ink);
  background: white;
  transition: all 0.2s;
}

.cms-form__input:focus,
.cms-form__select:focus,
.cms-form__textarea:focus {
  outline: none;
  border-color: var(--admin-primary);
  box-shadow: 0 0 0 3px rgba(var(--admin-primary-rgb), 0.1);
}

.cms-form__textarea {
  resize: vertical;
  min-height: 200px;
}

.cms-form__hint {
  margin: 0.5rem 0 0 0;
  font-size: 0.75rem;
  color: var(--admin-muted);
}
</style>
