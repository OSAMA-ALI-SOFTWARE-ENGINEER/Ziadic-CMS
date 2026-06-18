<template>
  <LegacyWebflowPage legacy-path="/legacy/detail_blogs.html" loading-label="Loading Blog..." />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LegacyWebflowPage from '@/components/legacy/LegacyWebflowPage.vue'

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

function getImageUrl(imagePath: string | undefined): string {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  return `http://localhost:8000${imagePath}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

async function populateBlogDetailContent() {
  try {
    // Wait for legacy template to load
    let attempts = 0
    while (!document.querySelector('.blog-single-wrap') && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }

    // Fetch article by slug
    const slug = route.params.slug as string
    const response = await fetch(`http://localhost:8000/api/v1/public/articles/${slug}`)

    if (!response.ok) {
      throw new Error('Article not found')
    }

    const data = await response.json()
    const post = data.data as BlogPost

    // Update page title
    document.title = post.title

    // Find and populate the blog content wrapper
    const blogWrapper = document.querySelector('.blog-single-wrap')
    if (!blogWrapper) {
      return
    }

    // Update title
    const titleElement = blogWrapper.querySelector('.blog-single-post-name')
    if (titleElement) {
      titleElement.textContent = post.title
      titleElement.classList.remove('w-dyn-bind-empty')
    }

    // Update featured image
    const blogImg = document.querySelector('.blog-single-img') as HTMLImageElement
    if (blogImg && post.featured_image) {
      blogImg.src = getImageUrl(post.featured_image)
      blogImg.alt = post.title
      blogImg.classList.remove('w-dyn-bind-empty')
    }

    // Update author image
    const authorImg = blogWrapper.querySelector('.post-author-img') as HTMLImageElement
    if (authorImg && post.author) {
      authorImg.classList.remove('w-dyn-bind-empty')
    }

    // Update author name
    const authorName = blogWrapper.querySelector('.post-author-name')
    if (authorName && post.author) {
      authorName.textContent = post.author.name
      authorName.classList.remove('w-dyn-bind-empty')
    }

    // Update author title
    const authorTitle = blogWrapper.querySelector('.post-author-title')
    if (authorTitle && post.author) {
      authorTitle.textContent = post.author.name
      authorTitle.classList.remove('w-dyn-bind-empty')
    }

    // Update dates
    const dateElements = blogWrapper.querySelectorAll('.post-date-text')
    if (dateElements[0]) {
      dateElements[0].textContent = formatDate(post.published_at)
      dateElements[0].classList.remove('w-dyn-bind-empty')
    }
    if (dateElements[1]) {
      dateElements[1].textContent = post.category?.name || 'Blog'
      dateElements[1].classList.remove('w-dyn-bind-empty')
    }

    // Update article content
    const contentWrapper = document.querySelector('.blog-rich-text-wrap')
    if (contentWrapper) {
      const richTexts = contentWrapper.querySelectorAll('.rich-text')
      if (richTexts[0] && post.excerpt) {
        richTexts[0].innerHTML = post.excerpt
        richTexts[0].classList.remove('w-dyn-bind-empty')
      }
      if (richTexts[1] && post.content) {
        richTexts[1].innerHTML = post.content
        richTexts[1].classList.remove('w-dyn-bind-empty')
      }
    }

  } catch (error) {
    console.error('❌ Blog detail error:', error)
  }
}

onMounted(() => {
  populateBlogDetailContent()
})
</script>

<style scoped>
/* Blog Detail Page Styling */

:deep(.blog-single-wrap) {
  padding: 2rem 0;
}

:deep(.blog-single-post-name) {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

:deep(.post-author-wrap) {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
}

:deep(.post-author-inner) {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

:deep(.post-author-img) {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  background: #e0e0e0;
}

:deep(.post-author-flex) {
  display: flex;
  flex-direction: column;
}

:deep(.post-author-name) {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

:deep(.post-author-title) {
  font-size: 0.95rem;
  color: #666;
  font-style: italic;
}

:deep(.post-date-wrap) {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: right;
}

:deep(.post-date-text-flex) {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  font-size: 0.95rem;
  color: #666;
}

:deep(.post-date-text) {
  color: #666;
  font-size: 0.95rem;
}

:deep(.date-border) {
  width: 1px;
  height: 20px;
  background: #ddd;
}

:deep(.blog-rich-text-wrap) {
  margin-top: 2rem;
}

:deep(.blog-single-img) {
  width: 100%;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 2rem 0;
  object-fit: cover;
}

:deep(.blog-rich-text-wrap .rich-text) {
  font-size: 1rem;
  line-height: 1.8;
  color: #444;
}

:deep(.blog-rich-text-wrap .rich-text:first-child) {
  margin-bottom: 2rem;
  font-size: 1.1rem;
  color: #555;
  font-style: italic;
}

:deep(.blog-rich-text-wrap .rich-text p) {
  margin-bottom: 1.5rem;
  line-height: 1.8;
}

:deep(.blog-rich-text-wrap .rich-text h3) {
  font-size: 1.4rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #333;
}

:deep(.blog-rich-text-wrap .rich-text ul) {
  margin-left: 2rem;
  margin-bottom: 1.5rem;
}

:deep(.blog-rich-text-wrap .rich-text li) {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

:deep(.blog-rich-text-wrap .rich-text blockquote) {
  border-left: 4px solid #e74c3c;
  padding-left: 1.5rem;
  margin: 2rem 0;
  font-style: italic;
  color: #666;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  :deep(.blog-single-post-name) {
    font-size: 1.8rem;
  }

  :deep(.post-author-wrap) {
    flex-direction: column;
    gap: 1.5rem;
  }

  :deep(.post-date-wrap) {
    text-align: left;
  }

  :deep(.post-date-text-flex) {
    justify-content: flex-start;
  }
}
</style>
