<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { articlesApi } from '@/services/api/articles.api'
import { useForm } from '@/composables/useForm'
import { useFetch, usePaginatedFetch } from '@/composables/useFetch'
import { useUiStore } from '@/stores/ui'
import type { Article } from '@/types/article'
import Editor from 'primevue/editor'
import SkeletonCard from '@/components/SkeletonCard.vue'
import Alert from '@/components/common/Alert.vue'
import Button from '@/components/common/Button.vue'
import Card from '@/components/common/Card.vue'
import Input from '@/components/common/Input.vue'
import Modal from '@/components/common/Modal.vue'

const ui = useUiStore()

// Tab state
const activeTab = ref<'articles' | 'categories'>('articles')

// Alert state
const alertState = ref<{ type: 'success' | 'error' | 'warning' | 'info'; message: string; visible: boolean } | null>(null)

// Modal state
const isEditModalOpen = ref(false)
const isCategoryModalOpen = ref(false)
const editingArticle = ref<Article | null>(null)
const editingCategory = ref<any | null>(null)
const rejectReason = ref('')
const showRejectModal = ref(false)
const articleToReject = ref<number | null>(null)
const imagePreview = ref('')

// Articles list
const { items: articles, loading: articlesLoading, fetchPage: fetchArticles } = usePaginatedFetch<Article>(
  (page: number, perPage: number) => articlesApi.getArticles({ page, per_page: perPage }),
  { perPage: 50 }
)

// Authors and categories for dropdowns
const authorsData = useFetch(() => articlesApi.getArticles(), { showErrorToast: false })
const categoriesData = useFetch(() => articlesApi.getArticles(), { showErrorToast: false })

// Article form
const articleForm = useForm<Partial<Article>>({
  initialValues: {
    title: '',
    excerpt: '',
    content: '',
    featured_image: '',
    author_id: undefined,
    category_id: undefined,
    seo_title: '',
  },
  onSubmit: async (data) => {
    const slug = generateSlug(data.title || '')
    const submitData = {
      ...data,
      slug,
      seo_description: '',
      seo_keywords: '',
      og_image: '',
      status: 'draft',
    }

    if (editingArticle.value?.id) {
      await articlesApi.updateArticle(editingArticle.value.id, submitData)
      showAlert('Article updated successfully', 'success')
    } else {
      await articlesApi.createArticle(submitData)
      showAlert('Article created successfully', 'success')
    }

    isEditModalOpen.value = false
    editingArticle.value = null
    imagePreview.value = ''
    await fetchArticles(1)
  },
})

// Category form
const categoryForm = useForm<{ name: string; slug: string }>({
  initialValues: { name: '', slug: '' },
  onSubmit: async (data) => {
    const slug = data.slug || generateSlug(data.name)

    if (editingCategory.value?.id) {
      await articlesApi.updateArticle(editingCategory.value.id, { name: data.name, slug })
      showAlert('Category updated successfully', 'success')
    } else {
      await articlesApi.createArticle({ name: data.name, slug })
      showAlert('Category created successfully', 'success')
    }

    isCategoryModalOpen.value = false
    editingCategory.value = null
    categoryForm.reset()
  },
})

// Watch category name to auto-generate slug
watch(() => categoryForm.form.name, (newName) => {
  if (newName && !editingCategory.value) {
    categoryForm.setField('slug', generateSlug(newName))
  }
})

// Helper functions
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info') {
  alertState.value = { type, message, visible: true }
  setTimeout(() => {
    if (alertState.value) {
      alertState.value.visible = false
    }
  }, 4000)
}

// Article actions
async function openEditModal(article?: Article) {
  if (article) {
    try {
      const { data } = await articlesApi.getArticle(article.id)
      editingArticle.value = data
      articleForm.setFields({
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        author_id: data.author_id,
        category_id: data.category_id,
        seo_title: data.seo_title,
      })

      if (data.featured_image) {
        const backendUrl = (import.meta as any).env?.VITE_API_URL || 'https://admin.kukaqka.com'
        imagePreview.value = data.featured_image.startsWith('http')
          ? data.featured_image
          : `${backendUrl}${data.featured_image}`
      }
    } catch {
      showAlert('Failed to load article details', 'error')
      return
    }
  } else {
    editingArticle.value = null
    articleForm.reset()
    imagePreview.value = ''
  }
  isEditModalOpen.value = true
}

async function submitArticle(id: number) {
  try {
    await articlesApi.submitArticle(id)
    showAlert('Article submitted for review', 'success')
    await fetchArticles(1)
  } catch (err: any) {
    showAlert(err.response?.data?.message || 'Failed to submit', 'error')
  }
}

async function approveArticle(id: number) {
  try {
    await articlesApi.approveArticle(id)
    showAlert('Article approved', 'success')
    await fetchArticles(1)
  } catch (err: any) {
    showAlert(err.response?.data?.message || 'Failed to approve', 'error')
  }
}

async function publishArticle(id: number) {
  try {
    await articlesApi.publishArticle(id)
    showAlert('Article published', 'success')
    await fetchArticles(1)
  } catch (err: any) {
    showAlert(err.response?.data?.message || 'Failed to publish', 'error')
  }
}

function openRejectModal(id: number) {
  articleToReject.value = id
  rejectReason.value = ''
  showRejectModal.value = true
}

async function confirmReject() {
  if (!articleToReject.value || !rejectReason.value.trim()) {
    showAlert('Rejection reason is required', 'warning')
    return
  }

  try {
    await articlesApi.rejectArticle(articleToReject.value, rejectReason.value)
    showAlert('Article rejected', 'success')
    showRejectModal.value = false
    articleToReject.value = null
    rejectReason.value = ''
    await fetchArticles(1)
  } catch (err: any) {
    showAlert(err.response?.data?.message || 'Failed to reject', 'error')
  }
}

async function deleteArticle(id: number, title: string) {
  if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return

  try {
    await articlesApi.deleteArticle(id)
    showAlert('Article deleted successfully', 'success')
    await fetchArticles(1)
  } catch (err: any) {
    showAlert(err.response?.data?.message || 'Failed to delete article', 'error')
  }
}

// Category actions
function openCategoryModal(category?: any) {
  if (category) {
    editingCategory.value = category
    categoryForm.setFields({ name: category.name, slug: category.slug })
  } else {
    editingCategory.value = null
    categoryForm.reset()
  }
  isCategoryModalOpen.value = true
}

async function deleteCategory(id: number, name: string) {
  if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return

  try {
    await articlesApi.deleteArticle(id)
    showAlert('Category deleted successfully', 'success')
    await fetchArticles(1)
  } catch (err: any) {
    showAlert(err.response?.data?.message || 'Failed to delete category', 'error')
  }
}

function handleImageUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      imagePreview.value = event.target?.result as string
    }
    reader.readAsDataURL(file)
    articleForm.setField('featured_image', file as any)
  }
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: '#9CA3AF',
    pending_review: '#EAB308',
    approved: '#3B82F6',
    published: '#10B981',
    rejected: '#EF4444',
  }
  return colors[status.toLowerCase()] || '#9CA3AF'
}

function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
}

// Initialize on mount
onMounted(() => {
  fetchArticles(1)
})
</script>

<template>
  <div class="space-y-6 p-6">
    <!-- Header -->
    <section>
      <h1 class="text-3xl font-bold text-(--admin-ink)">Blog Management</h1>
      <p class="mt-1 text-sm text-(--admin-muted)">Create, manage, and publish blog articles & categories</p>
    </section>

    <!-- Alert -->
    <Transition name="alert-fade">
      <Alert
        v-if="alertState?.visible"
        :type="alertState.type"
        :message="alertState.message"
        dismissible
        @dismiss="alertState = null"
      />
    </Transition>

    <!-- Tabs -->
    <section class="flex gap-0 border-b border-[var(--admin-border)]">
      <button
        @click="activeTab = 'articles'"
        :class="[
          'px-4 py-3 font-medium transition-all duration-200 border-b-2 -mb-px',
          activeTab === 'articles'
            ? 'text-[var(--admin-primary)] border-b-[var(--admin-primary)]'
            : 'text-[var(--admin-muted)] border-b-transparent hover:text-[var(--admin-ink)]'
        ]"
      >
        📰 Articles
      </button>
      <button
        @click="activeTab = 'categories'"
        :class="[
          'px-4 py-3 font-medium transition-all duration-200 border-b-2 -mb-px',
          activeTab === 'categories'
            ? 'text-[var(--admin-primary)] border-b-[var(--admin-primary)]'
            : 'text-[var(--admin-muted)] border-b-transparent hover:text-[var(--admin-ink)]'
        ]"
      >
        🏷️ Categories
      </button>
    </section>

    <!-- ARTICLES TAB -->
    <template v-if="activeTab === 'articles'">
      <section>
        <Button variant="primary" @click="openEditModal()">
          <i class="pi pi-plus"></i>
          New Article
        </Button>
      </section>

      <!-- Articles Table -->
      <Card v-if="articlesLoading && articles.length === 0">
        <div class="p-6">
          <SkeletonCard type="table-row" :count="8" />
        </div>
      </Card>

      <Card v-else title="All articles" class="overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-[var(--admin-bg-soft)] border-b border-[var(--admin-border)]">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-(--admin-ink)">Title</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-(--admin-ink)">Author</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-(--admin-ink)">Category</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-(--admin-ink)">Status</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-(--admin-ink)">Created</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-(--admin-ink)">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="articles.length === 0" class="border-b border-[var(--admin-border)]">
                <td colspan="6" class="px-4 py-8 text-center text-(--admin-muted)">
                  No articles found. Create your first article!
                </td>
              </tr>
              <tr v-for="article in articles" :key="article.id" class="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg-soft)]">
                <td class="px-4 py-3 text-sm font-medium text-(--admin-ink)">{{ article.title }}</td>
                <td class="px-4 py-3 text-sm text-(--admin-ink)">-</td>
                <td class="px-4 py-3 text-sm text-(--admin-ink)">-</td>
                <td class="px-4 py-3 text-sm">
                  <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white" :style="{ backgroundColor: getStatusColor(article.status) }">
                    {{ getStatusLabel(article.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-(--admin-ink)">{{ new Date(article.created_at || '').toLocaleDateString() }}</td>
                <td class="px-4 py-3 text-sm">
                  <div class="flex gap-2">
                    <button @click="openEditModal(article)" class="icon-button" title="Edit">✏️</button>
                    <button v-if="article.status === 'draft'" @click="submitArticle(article.id)" class="icon-button" title="Submit">📤</button>
                    <button v-if="article.status === 'pending_review'" @click="approveArticle(article.id)" class="icon-button" title="Approve">✓</button>
                    <button v-if="article.status === 'approved'" @click="publishArticle(article.id)" class="icon-button" title="Publish">🌐</button>
                    <button v-if="article.status === 'pending_review'" @click="openRejectModal(article.id)" class="icon-button" title="Reject">✗</button>
                    <button @click="deleteArticle(article.id, article.title)" class="icon-button hover:text-red-600" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </template>

    <!-- CATEGORIES TAB -->
    <template v-if="activeTab === 'categories'">
      <section>
        <Button variant="primary" @click="openCategoryModal()">
          <i class="pi pi-plus"></i>
          Add Category
        </Button>
      </section>

      <Card title="Categories" class="overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-[var(--admin-bg-soft)] border-b border-[var(--admin-border)]">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-(--admin-ink)">Category Name</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-(--admin-ink)">Slug</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-(--admin-ink)">Articles</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-(--admin-ink)">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-[var(--admin-border)]">
                <td colspan="4" class="px-4 py-8 text-center text-(--admin-muted)">
                  No categories found. Create your first category!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <!-- Category Modal -->
      <Modal
        :isOpen="isCategoryModalOpen"
        :title="editingCategory ? 'Edit Category' : 'Add New Category'"
        @close="isCategoryModalOpen = false"
      >
        <div class="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g., Technology, Travel"
            v-model="categoryForm.form.name"
            required
            :error="categoryForm.hasError('name') ? categoryForm.getFieldError('name') : undefined"
          />

          <Input
            label="Slug"
            placeholder="Auto-generated slug"
            v-model="categoryForm.form.slug"
            helperText="Auto-generated from name, can be edited"
          />
        </div>

        <template #actions>
          <Button variant="secondary" @click="isCategoryModalOpen = false">Cancel</Button>
          <Button variant="primary" @click="categoryForm.submit()" :isLoading="categoryForm.loading.value">
            {{ editingCategory ? 'Update' : 'Add' }} Category
          </Button>
        </template>
      </Modal>
    </template>

    <!-- Article Form Modal -->
    <Modal
      :isOpen="isEditModalOpen"
      :title="editingArticle ? 'Edit Article' : 'Create New Article'"
      size="lg"
      @close="isEditModalOpen = false"
    >
      <div class="space-y-4">
        <Input
          label="Title"
          placeholder="Enter article title..."
          v-model="articleForm.form.title"
          required
          :error="articleForm.hasError('title') ? articleForm.getFieldError('title') : undefined"
        />

        <div>
          <label class="block text-sm font-semibold text-(--admin-ink) mb-2">Featured Image</label>
          <input
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            class="cms-input block w-full"
          />
          <div v-if="imagePreview" class="mt-2 rounded-lg overflow-hidden border border-[var(--admin-border)] max-w-[200px]">
            <img :src="imagePreview" alt="Preview" class="w-full h-auto" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-(--admin-ink) mb-2">Description</label>
          <textarea
            v-model="articleForm.form.excerpt"
            placeholder="Brief description of the article..."
            rows="3"
            maxlength="500"
            class="cms-input block w-full resize-vertical"
          ></textarea>
          <p class="mt-1 text-xs text-(--admin-muted)">{{ (articleForm.form.excerpt || '').length }}/500 characters</p>
        </div>

        <div>
          <label class="block text-sm font-semibold text-(--admin-ink) mb-2">Content *</label>
          <Editor v-model="articleForm.form.content" editor-style="height: 300px" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <Input
            label="Author"
            type="text"
            placeholder="Author name"
            v-model="articleForm.form.author_id"
            required
          />
          <Input
            label="Category"
            type="text"
            placeholder="Category name"
            v-model="articleForm.form.category_id"
          />
        </div>

        <Input
          label="SEO Title"
          placeholder="SEO title for search engines..."
          v-model="articleForm.form.seo_title"
        />
      </div>

      <template #actions>
        <Button variant="secondary" @click="isEditModalOpen = false">Cancel</Button>
        <Button variant="primary" @click="articleForm.submit()" :isLoading="articleForm.loading.value">
          {{ editingArticle ? 'Update' : 'Create' }} Article
        </Button>
      </template>
    </Modal>

    <!-- Reject Modal -->
    <Modal
      :isOpen="showRejectModal"
      title="Reject Article"
      @close="showRejectModal = false"
    >
      <div class="space-y-4">
        <p class="text-(--admin-ink)">Please provide a reason for rejecting this article.</p>
        <textarea
          v-model="rejectReason"
          placeholder="Enter rejection reason..."
          rows="4"
          class="cms-input block w-full resize-vertical"
        ></textarea>
      </div>

      <template #actions>
        <Button variant="secondary" @click="showRejectModal = false">Cancel</Button>
        <Button variant="danger" @click="confirmReject()">Reject Article</Button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}

.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.cms-input {
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--admin-border);
  border-radius: 0.375rem;
  font: inherit;
  color: var(--admin-ink);
  background-color: white;
  transition: all 150ms;
}

.cms-input:focus {
  outline: none;
  border-color: var(--admin-primary);
  box-shadow: 0 0 0 2px rgba(var(--admin-primary-rgb, 59, 130, 246), 0.2);
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 150ms;
  cursor: pointer;
  border: none;
  background-color: transparent;
}

.icon-button:hover {
  background-color: var(--admin-bg-soft);
}
</style>
