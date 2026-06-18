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
    console.log('📝 BlogDetailPage: Loading blog slug:', slug)

    // Wait for legacy template to load
    let attempts = 0
    while (!document.querySelector('.blog-single-wrap') && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }

    const blogWrapper = document.querySelector('.blog-single-wrap')
    console.log('🔍 blogWrapper found:', !!blogWrapper)
    if (!blogWrapper) {
      console.error('❌ blog-single-wrap not found')
      return
    }

    // Fetch article by slug
    console.log('🌐 Fetching from:', `http://localhost:8000/api/v1/public/articles/${slug}`)
    const response = await fetch(`http://localhost:8000/api/v1/public/articles/${slug}`)
    console.log('✅ API Response status:', response.status)

    if (!response.ok) {
      throw new Error(`Article not found: ${response.status}`)
    }

    const data = await response.json()
    console.log('📦 API Data:', data)
    const post = data.data as BlogPost
    console.log('📄 Post data:', post)

    // Update page title
    document.title = post.title

    // Update title
    const titleElement = blogWrapper.querySelector('.blog-single-post-name')
    console.log('📌 Title element found:', !!titleElement)
    if (titleElement) {
      titleElement.textContent = post.title
      console.log('✍️ Updated title to:', post.title)
    }

    // Update featured image
    const blogImg = document.querySelector('.blog-single-img') as HTMLImageElement
    console.log('🖼️ Blog image element found:', !!blogImg)
    if (blogImg && post.featured_image) {
      blogImg.src = getImageUrl(post.featured_image)
      blogImg.alt = post.title
      console.log('✍️ Updated image to:', blogImg.src)
    }

    // Update author info
    const authorImg = blogWrapper.querySelector('.post-author-img') as HTMLImageElement
    if (authorImg && post.author) {
      authorImg.src = getImageUrl(post.author?.id ? `http://localhost:8000/api/v1/authors/${post.author.id}/avatar` : '')
      console.log('✍️ Updated author image')
    }

    const authorName = blogWrapper.querySelector('.post-author-name')
    console.log('👤 Author name element found:', !!authorName)
    if (authorName && post.author) {
      authorName.textContent = post.author.name
      console.log('✍️ Updated author name to:', post.author.name)
    }

    const authorTitle = blogWrapper.querySelector('.post-author-title')
    if (authorTitle && post.author) {
      authorTitle.textContent = post.author.name
    }

    // Update date and category
    const dateElements = blogWrapper.querySelectorAll('.post-date-text')
    console.log('📅 Date elements found:', dateElements.length)
    if (dateElements[0]) {
      dateElements[0].textContent = formatDate(post.published_at)
      console.log('✍️ Updated date to:', formatDate(post.published_at))
    }
    if (dateElements[1]) {
      dateElements[1].textContent = post.category?.name || 'Blog'
      console.log('✍️ Updated category to:', post.category?.name || 'Blog')
    }

    // Update article content
    const contentWrapper = document.querySelector('.blog-rich-text-wrap')
    console.log('📝 Content wrapper found:', !!contentWrapper)
    if (contentWrapper) {
      const richTextElements = contentWrapper.querySelectorAll('.rich-text')
      console.log('📝 Rich text elements found:', richTextElements.length)
      if (richTextElements[0] && post.excerpt) {
        richTextElements[0].innerHTML = post.excerpt
        console.log('✍️ Updated excerpt')
      }
      if (richTextElements[1] && post.content) {
        richTextElements[1].innerHTML = post.content
        console.log('✍️ Updated content')
      }
    }

    console.log('✅ Blog detail page population complete!')

  } catch (error) {
    console.error('❌ Error populating blog detail:', error)
  }
}

onMounted(() => {
  populateBlogDetailContent()
})
</script>
