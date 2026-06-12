<template>
  <div class="blog-detail-page">
    <div v-if="loading" class="section flex justify-center py-24">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <template v-else-if="post">
      <section class="section page-section blog-detail-hero">
        <div class="container">
          <div class="blog-detail-hero__content">
            <RouterLink to="/blogs" class="blog-detail-back-link">← Back to Blog</RouterLink>

            <h1 class="blog-detail-title">{{ post.title }}</h1>

            <div class="blog-detail-meta-row">
              <span v-if="post.author" class="blog-detail-meta-item blog-detail-meta-item--author">{{ post.author.name }}</span>
              <span class="blog-detail-meta-item">{{ formatDate(post.published_at) }}</span>
              <span v-if="post.category" class="blog-detail-meta-item blog-detail-meta-item--category">{{ post.category.name }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="section blog-detail-content-section">
        <div class="container">
          <article class="blog-detail-article">
            <div v-if="post.featured_image" class="blog-detail-featured-image">
              <img :src="getImageUrl(post.featured_image)" :alt="post.title" />
            </div>

            <div v-if="post.excerpt" class="blog-detail-excerpt">
              <p>{{ post.excerpt }}</p>
            </div>

            <div class="blog-detail-content" v-html="post.content"></div>

            <div v-if="post.tags && post.tags.length > 0" class="blog-detail-tags-wrap">
              <div class="blog-detail-tags">
                <span v-for="tag in post.tags" :key="tag.id" class="blog-detail-tag">#{{ tag.name }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </template>

    <div v-else class="section text-center py-12">
      <p class="text-gray-600">Post not found</p>
      <RouterLink to="/blogs" class="text-primary hover:underline text-sm font-semibold mt-4 inline-block">
        ← Back to Blog
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image?: string
  author?: { id: number; name: string }
  category?: { id: number; name: string }
  tags?: Array<{ id: number; name: string }>
  published_at: string
}

const route = useRoute()
const post = ref<BlogPost | null>(null)
const loading = ref(true)

async function loadPost() {
  try {
    const slug = route.params.slug as string
    const response = await fetch(`http://localhost:8000/api/v1/public/articles/${slug}`)
    if (!response.ok) throw new Error('Article not found')

    const data = await response.json()
    post.value = data.data || null

    if (post.value) {
      document.title = post.value.title
    }
  } catch (err) {
    console.error('Failed to load post:', err)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getImageUrl(imagePath: string | undefined): string {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  return `http://localhost:8000${imagePath}`
}

onMounted(loadPost)
</script>

<style scoped>
.blog-detail-hero {
  background-image: url('/images/All-Bg.png');
  background-position: 50%;
  background-repeat: no-repeat;
  background-size: cover;
  padding-top: 72px;
  padding-bottom: 64px;
  position: relative;
}

.blog-detail-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 147, 154, 0.8) 0%, rgba(255, 147, 154, 0.7) 100%);
}

.blog-detail-hero__content {
  position: relative;
  z-index: 1;
  max-width: 900px;
}

.blog-detail-back-link {
  display: inline-flex;
  margin-bottom: 20px;
  color: rgba(83, 40, 34, 0.9);
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.25s ease;
}

.blog-detail-back-link:hover {
  opacity: 0.75;
}

.blog-detail-title {
  margin: 0 0 18px;
  color: var(--primary-color);
  font-family: var(--marcellus-font-family, Marcellus, serif);
  font-size: clamp(38px, 5.1vw, 84px);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

.blog-detail-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  align-items: center;
  padding-top: 2px;
}

.blog-detail-meta-item {
  color: rgba(28, 34, 44, 0.72);
  font-size: 15px;
  line-height: 1.4;
}

.blog-detail-meta-item--author,
.blog-detail-meta-item--category {
  color: rgba(28, 34, 44, 0.86);
  font-weight: 600;
}

.blog-detail-content-section {
  background: var(--body-background-color, #fdf5ed);
  padding-top: 48px;
}

.blog-detail-article {
  max-width: 820px;
}

.blog-detail-featured-image {
  margin-bottom: 32px;
  border-radius: 10px;
  overflow: hidden;
  max-width: 100%;
}

.blog-detail-featured-image img {
  width: 100%;
  height: auto;
  display: block;
}

.blog-detail-excerpt {
  margin-bottom: 30px;
  padding: 22px 24px;
  border-left: 4px solid var(--primary-color);
  border-radius: 10px;
  background: rgba(244, 248, 255, 0.74);
}

.blog-detail-excerpt p {
  margin: 0;
  color: rgba(28, 34, 44, 0.82);
  font-size: clamp(18px, 1.35vw, 24px);
  font-style: italic;
  line-height: 1.55;
}

.blog-detail-content {
  margin-bottom: 32px;
  color: rgba(28, 34, 44, 0.86);
  font-size: clamp(18px, 1.2vw, 21px);
  line-height: 1.78;
  white-space: pre-line;
}

.blog-detail-tags-wrap {
  padding-top: 24px;
  border-top: 1px solid rgba(83, 40, 34, 0.14);
}

.blog-detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.blog-detail-tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(225, 26, 29, 0.09);
  color: var(--primary-color);
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
}

@media (max-width: 767px) {
  .blog-detail-hero {
    padding-top: 58px;
    padding-bottom: 50px;
  }

  .blog-detail-back-link {
    margin-bottom: 14px;
  }

  .blog-detail-content-section {
    padding-top: 34px;
  }

  .blog-detail-excerpt {
    padding: 16px 16px 16px 18px;
    margin-bottom: 22px;
  }
}
</style>
