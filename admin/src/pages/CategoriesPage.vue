<template>
  <div class="categories-container">
    <!-- Header -->
    <div class="categories-header">
      <div>
        <h1 class="categories-title">Categories Management</h1>
        <p class="categories-subtitle">Organize listings and content with categories and tags</p>
      </div>
      <button class="add-category-button" @click="openCategory()">
        <i class="pi pi-plus"></i>
        Add Category
      </button>
    </div>

    <!-- Main Content -->
    <div class="categories-content">
      <!-- Loading State -->
      <div v-if="loading && categories.length === 0" class="categories-loading">
        <SkeletonCard type="table-row" :count="8" />
      </div>

      <!-- Categories Table -->
      <div v-else class="categories-table-wrapper">
        <!-- Search Bar -->
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by category name..."
            class="search-input"
            @keyup.enter="loadCategories"
          />
          <button class="search-button" @click="loadCategories">
            <i class="pi pi-search"></i>
          </button>
        </div>

        <table class="categories-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Items</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in filteredCategories" :key="category.id" class="category-row">
              <td class="cell-name">
                <div class="category-cell">
                  <div class="category-badge">{{ category.name.charAt(0) }}</div>
                  <div class="category-info">
                    <div class="category-title">{{ category.name }}</div>
                  </div>
                </div>
              </td>
              <td class="cell-type">
                <span class="type-chip">{{ category.type || 'General' }}</span>
              </td>
              <td class="cell-count">
                <span class="count-badge">{{ category.item_count || 0 }}</span>
              </td>
              <td class="cell-status">
                <span :class="['status-badge', `status-${(category.is_active ? 'active' : 'inactive')}`]">
                  {{ category.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="cell-actions">
                <div class="action-buttons">
                  <button class="action-btn edit-btn" @click="openCategory(category)" title="Edit category">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button class="action-btn delete-btn" @click="deleteCategory(category)" title="Delete category">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="categories.length === 0" class="empty-state">
          <i class="pi pi-inbox"></i>
          <h3>No categories yet</h3>
          <p>Create your first category to organize content</p>
        </div>
      </div>
    </div>

    <!-- Category Modal -->
    <div v-if="selectedCategory" class="modal-overlay" @click="selectedCategory = null">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">{{ selectedCategory.id ? 'Edit Category' : 'Create Category' }}</h2>
          <button class="modal-close" @click="selectedCategory = null">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form class="modal-body" @submit.prevent="saveCategory">
          <div class="form-group">
            <label class="form-label">Category Name *</label>
            <input
              v-model="selectedCategory.name"
              type="text"
              class="form-input"
              placeholder="e.g., Restaurants, Hotels"
              @input="generateSlug"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Slug *</label>
            <input
              v-model="selectedCategory.slug"
              type="text"
              class="form-input"
              placeholder="category-slug"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Type *</label>
            <select v-model="selectedCategory.type" class="form-input" required>
              <option value="">Select type</option>
              <option value="listing">Listing</option>
              <option value="post">Post</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea
              v-model="selectedCategory.description"
              class="form-input form-textarea"
              placeholder="Describe this category..."
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-checkbox">
              <input v-model="selectedCategory.is_active" type="checkbox" />
              <span>Active</span>
            </label>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="selectedCategory = null">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Category' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/api'
import SkeletonCard from '@/components/SkeletonCard.vue'

interface Category {
  id: number
  name: string
  slug: string
  type: string
  description?: string
  is_active: boolean
  item_count?: number
}

const categories = ref<Category[]>([])
const selectedCategory = ref<Category | null>(null)
const loading = ref(false)
const isSaving = ref(false)
const searchQuery = ref('')

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  const query = searchQuery.value.toLowerCase()
  return categories.value.filter(c => c.name.toLowerCase().includes(query))
})

async function loadCategories() {
  loading.value = true
  try {
    const params: any = { type: 'listing' }
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    const response = await api.get('/categories', { params })
    let categoriesData = response.data.data || response.data
    if (!Array.isArray(categoriesData)) {
      categoriesData = []
    }
    // Filter to show only listing categories
    categories.value = categoriesData.filter(c => c.type === 'listing' || c.type === 'Listing')
  } catch (error: any) {
    categories.value = []
  } finally {
    loading.value = false
  }
}

function generateSlug() {
  if (!selectedCategory.value) return
  selectedCategory.value.slug = selectedCategory.value.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function openCategory(category?: Category) {
  selectedCategory.value = category
    ? { ...category }
    : { id: 0, name: '', slug: '', type: 'listing', description: '', is_active: true, item_count: 0 }
}

async function saveCategory() {
  if (!selectedCategory.value) return
  isSaving.value = true

  try {
    const isNew = !selectedCategory.value.id
    if (isNew) {
      await api.post('/categories', selectedCategory.value)
    } else {
      await api.put(`/categories/${selectedCategory.value.id}`, selectedCategory.value)
    }
    selectedCategory.value = null
    await loadCategories()
  } catch (error: any) {
    selectedCategory.value = null
  } finally {
    isSaving.value = false
  }
}

async function deleteCategory(category: Category) {
  if (!confirm(`Delete category ${category.name}? This cannot be undone.`)) return

  try {
    await api.delete(`/categories/${category.id}`)
    await loadCategories()
  } catch (error: any) {
  }
}

onMounted(loadCategories)
</script>

<style scoped>
.categories-container {
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%);
}

/* Header */
.categories-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.categories-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.categories-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.add-category-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
  white-space: nowrap;
}

.add-category-button:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
}

/* Content Area */
.categories-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.categories-loading {
  padding: 2rem;
}

/* Search Bar */
.search-bar {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.search-input {
  flex: 1;
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: #f0f0f0;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-button:hover {
  background: #e5e7eb;
  color: #1f2937;
}

/* Table */
.categories-table-wrapper {
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
}

.categories-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.categories-table thead {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 2px solid #e5e7eb;
}

.categories-table thead th {
  padding: 1rem 1.25rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.025em;
  white-space: nowrap;
  user-select: none;
}

.categories-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.15s ease;
}

.categories-table tbody tr:hover {
  background-color: #f9fafb;
}

.categories-table tbody td {
  padding: 1rem 1.25rem;
  vertical-align: middle;
}

/* Table Cells */
.cell-name {
  min-width: 180px;
}

.category-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.category-info {
  min-width: 0;
}

.category-title {
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-type {
  min-width: 120px;
}

.type-chip {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: #f0f9ff;
  color: #0369a1;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #bae6fd;
  text-transform: capitalize;
}

.cell-count {
  min-width: 80px;
  text-align: center;
}

.count-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: #fef3c7;
  color: #92400e;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.85rem;
}

.cell-status {
  min-width: 110px;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  border: 1px solid;
}

.status-active {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #065f46;
  border-color: #a7f3d0;
}

.status-inactive {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  border-color: #d1d5db;
}

.cell-actions {
  min-width: 100px;
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.edit-btn {
  background-color: #e0e7ff;
  color: #6366f1;
}

.edit-btn:hover {
  background-color: #c7d2fe;
}

.delete-btn {
  background-color: #fee2e2;
  color: #7f1d1d;
}

.delete-btn:hover {
  background-color: #fecaca;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  color: #6b7280;
}

.empty-state i {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.empty-state p {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: #9ca3af;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: 0.75rem;
  max-width: 28rem;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 1.25rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: #f0f0f0;
  color: #1f2937;
}

/* Form */
.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}

.form-input {
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-textarea {
  resize: vertical;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.form-checkbox input {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

.btn-primary {
  padding: 0.625rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.625rem 1.5rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

/* Responsive */
@media (max-width: 768px) {
  .categories-container {
    padding: 1rem;
  }

  .categories-header {
    flex-direction: column;
    align-items: stretch;
  }

  .add-category-button {
    width: 100%;
    justify-content: center;
  }

  .categories-table {
    font-size: 0.8rem;
  }

  .categories-table thead th,
  .categories-table tbody td {
    padding: 0.75rem 0.625rem;
  }
}

@media (max-width: 640px) {
  .categories-container {
    padding: 0.75rem;
  }

  .categories-title {
    font-size: 1.5rem;
  }

  .search-bar {
    flex-direction: column;
  }

  .search-button {
    width: auto;
    padding: 0.625rem 1rem;
  }

  .categories-table {
    font-size: 0.75rem;
  }

  .action-buttons {
    flex-wrap: wrap;
  }

  .action-btn {
    width: 1.75rem;
    height: 1.75rem;
  }
}

/* Scrollbar Styling */
.categories-table-wrapper::-webkit-scrollbar {
  height: 6px;
}

.categories-table-wrapper::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.categories-table-wrapper::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.categories-table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
