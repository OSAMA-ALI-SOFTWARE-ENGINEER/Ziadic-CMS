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
    const slug = route.params.slug as string

    // Wait for legacy template to load
    let attempts = 0
    while (!document.querySelector('.blog-single-wrap') && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }

    const blogWrapper = document.querySelector('.blog-single-wrap')
    if (!blogWrapper) {
      return
    }

    // Fetch article by slug
    const response = await fetch(`http://localhost:8000/api/v1/public/articles/${slug}`)

    if (!response.ok) {
      throw new Error(`Article not found: ${response.status}`)
    }

    const data = await response.json()
    const post = data.data as BlogPost

    // Update page title
    document.title = post.title

    // Update title
    const titleElement = blogWrapper.querySelector('.blog-single-post-name')
    if (titleElement) {
      titleElement.textContent = post.title
    }

    // Update featured image
    const blogImg = document.querySelector('.blog-single-img') as HTMLImageElement
    if (blogImg && post.featured_image) {
      blogImg.src = getImageUrl(post.featured_image)
      blogImg.alt = post.title
    }

    // Update author info
    const authorImg = blogWrapper.querySelector('.post-author-img') as HTMLImageElement
    if (authorImg && post.author) {
      authorImg.src = getImageUrl(post.author?.id ? `http://localhost:8000/api/v1/authors/${post.author.id}/avatar` : '')
    }

    const authorName = blogWrapper.querySelector('.post-author-name')
    if (authorName && post.author) {
      authorName.textContent = post.author.name
    }

    const authorTitle = blogWrapper.querySelector('.post-author-title')
    if (authorTitle && post.author) {
      authorTitle.textContent = post.author.name
    }

    // Update date and category
    const dateElements = blogWrapper.querySelectorAll('.post-date-text')
    if (dateElements[0]) {
      dateElements[0].textContent = formatDate(post.published_at)
    }
    if (dateElements[1]) {
      dateElements[1].textContent = post.category?.name || 'Blog'
    }

    // Update article content
    const contentWrapper = document.querySelector('.blog-rich-text-wrap')
    if (contentWrapper) {
      const richTextElements = contentWrapper.querySelectorAll('.rich-text')
      if (richTextElements[0] && post.excerpt) {
        richTextElements[0].innerHTML = post.excerpt
      }
      if (richTextElements[1] && post.content) {
        richTextElements[1].innerHTML = post.content
      }
    }


  } catch (error) {
  }
}

onMounted(() => {
  populateBlogDetailContent()
})
</script>
