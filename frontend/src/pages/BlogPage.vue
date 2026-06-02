<template>
  <div>
    <section class="section page-section blog-hero">
      <div class="container">
        <div class="page-section-wrapper blog-hero__content items-center justify-center text-center">
          <h1 class="page-banner-title blog-hero__title">Our Blog</h1>
          <p class="blog-hero__subtitle">Discover insights, stories, and updates from our community</p>

          <div class="page-link-flex blog-hero__crumbs">
            <RouterLink to="/" class="page-link w-inline-block">
              <div class="page-link-text">Home</div>
            </RouterLink>
            <img src="/images/Home-_-Page.svg" loading="lazy" alt="" class="divider-img">
            <RouterLink to="/blogs" class="page-link w-inline-block" aria-current="page">
              <div class="page-link-text">Our Blog</div>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <div class="section blog-listing-section">
      <div class="container">
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="posts.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <RouterLink
            v-for="post in posts"
            :key="post.id"
            :to="`/blogs/${post.slug}`"
            class="group cursor-pointer"
          >
            <div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
              <div class="bg-linear-to-br from-primary/20 to-yellow-200/20 h-40 flex items-center justify-center">
                <div class="text-4xl">📝</div>
              </div>
              <div class="p-6 flex-1 flex flex-col items-center text-center">
                <p class="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                  {{ post.category?.name || 'Blog' }}
                </p>
                <h3 class="text-xl font-bold text-ink mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {{ post.title }}
                </h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                  {{ post.excerpt || 'Click to read more...' }}
                </p>
                <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span class="text-xs text-gray-500">{{ formatDate(post.published_at) }}</span>
                  <span class="text-xs font-semibold text-primary">Read →</span>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>

        <div v-else class="text-center py-12">
          <p class="text-gray-600">No posts yet. Check back soon!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchPublicPosts } from '@/services/auth'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  author?: { id: number; name: string }
  category?: { id: number; name: string }
  published_at: string
}

const posts = ref<BlogPost[]>([])
const loading = ref(true)

async function loadPosts() {
  try {
    posts.value = await fetchPublicPosts()
  } catch (err) {
    console.error('Failed to load posts:', err)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(loadPosts)
</script>

<style scoped>
.blog-hero {
  background-image: url('/images/All-Bg.png');
  background-position: 50%;
  background-repeat: no-repeat;
  background-size: cover;
  padding-top: 90px;
  padding-bottom: 90px;
  position: relative;
}

.blog-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 147, 154, 0.86) 0%, rgba(255, 147, 154, 0.78) 100%);
}

.blog-hero__content {
  position: relative;
  z-index: 1;
  /* max-width: 860px; */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.blog-hero__title {
  color: var(--primary-color);
  margin: 0;
  font-size: clamp(38px, 5vw, 74px);
  line-height: 1.08;
  letter-spacing: -0.01em;
}

.blog-hero__subtitle {
  margin: 0;
  color: rgba(83, 40, 34, 0.88);
  font-size: clamp(16px, 1.3vw, 22px);
  line-height: 1.5;
  max-width: 680px;
}

.blog-hero__crumbs {
  width: fit-content;
  margin-top: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  gap: 10px;
}

.blog-listing-section {
  background: var(--body-background-color, #fdf5ed);
}

@media (max-width: 767px) {
  .blog-hero {
    padding-top: 68px;
    padding-bottom: 68px;
  }

  .blog-hero__crumbs {
    padding: 7px 11px;
  }
}
</style>
