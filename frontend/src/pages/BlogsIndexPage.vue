<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface Article {
  id: number
  title: string
  slug: string
  excerpt: string
  featured_image: string
  author?: { name: string }
  category?: { name: string }
  published_at: string
}

const router = useRouter()
const articles = ref<Article[]>([])
const loading = ref(false)
const error = ref('')

async function loadArticles() {
  try {
    loading.value = true
    error.value = ''
    const response = await fetch('http://localhost:8000/api/v1/public/articles')
    if (!response.ok) throw new Error('Failed to load articles')

    const data = await response.json()
    articles.value = data.data?.data || data.data || []
  } catch (err: any) {
    error.value = err.message || 'Failed to load articles'
    console.error(err)
  } finally {
    loading.value = false
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function goToArticle(slug: string) {
  router.push({ name: 'blog-detail', params: { slug } })
}

function getImageUrl(imagePath: string | undefined): string {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  return `http://localhost:8000${imagePath}`
}

onMounted(loadArticles)
</script>

<template>
  <div class="blogs-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="container">
        <h1 class="hero-title">Blog & Insights</h1>
        <p class="hero-subtitle">Discover articles, tips, and latest updates</p>
      </div>
    </div>

    <!-- Articles Section -->
    <div class="container py-5">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading articles...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="articles.length === 0" class="empty-state">
        <p>No articles published yet. Check back soon!</p>
      </div>

      <!-- Articles Grid -->
      <div v-else class="articles-grid">
        <article
          v-for="article in articles"
          :key="article.id"
          class="article-card"
          @click="goToArticle(article.slug)"
        >
          <!-- Featured Image -->
          <div class="article-image" v-if="article.featured_image">
            <img :src="getImageUrl(article.featured_image)" :alt="article.title" />
          </div>
          <div v-else class="article-image-placeholder">
            <span>📄</span>
          </div>

          <!-- Article Content -->
          <div class="article-content">
            <div class="article-meta">
              <span v-if="article.category" class="category-badge">
                {{ article.category.name }}
              </span>
              <span class="date">{{ formatDate(article.published_at) }}</span>
            </div>

            <h2 class="article-title">{{ article.title }}</h2>
            <p class="article-excerpt">{{ article.excerpt || 'No description available' }}</p>

            <div class="article-footer">
              <span v-if="article.author" class="author">
                By {{ article.author.name }}
              </span>
              <span class="read-more">Read More →</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blogs-page {
  min-height: 100vh;
  background: #f9fafb;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.hero-subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.py-5 {
  padding: 2rem 0;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  background: #fee2e2;
  color: #dc2626;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.empty-state {
  color: #6b7280;
  font-size: 1.125rem;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.article-card {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.article-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

.article-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f3f4f6;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-image-placeholder {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
}

.article-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.category-badge {
  background: #e0e7ff;
  color: #667eea;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
}

.date {
  color: #9ca3af;
}

.article-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: #1f2937;
  line-height: 1.4;
}

.article-excerpt {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
  font-size: 0.875rem;
}

.author {
  color: #667eea;
  font-weight: 500;
}

.read-more {
  color: #667eea;
  font-weight: 600;
  transition: transform 0.2s;
}

.article-card:hover .read-more {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 1.875rem;
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }
}
</style>
