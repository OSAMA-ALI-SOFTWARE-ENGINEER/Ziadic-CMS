<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LegacyWebflowPage from '@/components/legacy/LegacyWebflowPage.vue'

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

const articles = ref<Article[]>([])
const loading = ref(false)
const error = ref('')

async function loadArticles() {
  try {
    loading.value = true
    error.value = ''

    const response = await fetch('http://localhost:8000/api/v1/public/articles')

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Handle different response structures
    const articlesData = data.data?.data || data.data || data || []
    articles.value = Array.isArray(articlesData) ? articlesData : []

    if (articles.value.length === 0) {
      error.value = 'No articles found'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load articles'
  } finally {
    loading.value = false
  }
}


function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getImageUrl(imagePath: string | undefined): string {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  return `http://localhost:8000${imagePath}`
}

// Flag to prevent simultaneous category population calls
let isPopulatingCategories = false

// Function to populate category filter tabs dynamically
async function populateCategoryTabs() {
  // Prevent multiple simultaneous calls
  if (isPopulatingCategories) {
    return
  }

  isPopulatingCategories = true

  try {
    // Wait a moment for DOM to settle
    await new Promise(resolve => setTimeout(resolve, 100))

    // Find ALL filter forms (there might be multiple)
    const filterForms = document.querySelectorAll('.cms-form')

    let processedCount = 0

    filterForms.forEach((filterForm, formIndex) => {
      // Get the form element within this filter
      const form = filterForm.querySelector('form')
      if (!form) {
        return
      }

      // Get the collection list wrapper for category items
      const collectionList = form.querySelector('.collection-list-wrapper .w-dyn-items')
      if (!collectionList) {
        return
      }

      // Extract unique categories from articles
      const categorySet = new Set<string>()
      categorySet.add('All')
      articles.value.forEach(article => {
        if (article.category?.name) {
          categorySet.add(article.category.name)
        }
      })

      const categories = Array.from(categorySet)

      // Get all existing items to use as template
      const allExistingItems = Array.from(collectionList.querySelectorAll('.w-dyn-item'))

      if (allExistingItems.length === 0) {
        return
      }

      // Save first item as template before clearing
      const templateCategoryItem = allExistingItems[0].cloneNode(true) as HTMLElement

      // Clear ALL existing items
      allExistingItems.forEach((item) => {
        item.remove()
      })

      // Create new category filter items from scratch
      categories.forEach((category, index) => {
        const newCategoryItem = templateCategoryItem.cloneNode(true) as HTMLElement

        // Find ONLY the first label in the item (to avoid duplicates)
        const firstLabel = newCategoryItem.querySelector('label')
        if (!firstLabel) {
          return
        }

        // Remove any extra labels to prevent duplicates
        const allLabels = Array.from(newCategoryItem.querySelectorAll('label'))
        allLabels.slice(1).forEach(label => label.remove())

        // Update the single label
        const input = firstLabel.querySelector('input[type="radio"]') as HTMLInputElement
        if (input) {
          const uniqueId = `radio-${formIndex}-${index}`
          input.id = uniqueId
          input.value = category
          input.name = 'Blog'

          const labelText = firstLabel.querySelector('[fs-cmsfilter-field="category"]')
          if (labelText) {
            labelText.textContent = category
          }

          firstLabel.setAttribute('for', uniqueId)

          if (index === 0) {
            firstLabel.classList.add('w--current', 'fs-cmsfilter_active')
            input.checked = true
          } else {
            firstLabel.classList.remove('w--current', 'fs-cmsfilter_active')
            input.checked = false
          }
        }

        collectionList.appendChild(newCategoryItem)
      })

      processedCount++
    })

    // Reinitialize Finsweet filter
    if ((window as any).fsAttributes?.push) {
      ;(window as any).fsAttributes.push(['cmsfilter', () => {}])
    }
  } catch (error) {
    // Silent error handling
  } finally {
    isPopulatingCategories = false
  }
}

// Function to populate legacy template with real-time CMS data
async function populateLegacyBlogTemplate() {
  try {
    // Wait for legacy template to load
    let attempts = 0
    while (!document.querySelector('.blog-collection-list') && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }

    const blogList = document.querySelector('.blog-collection-list')
    if (!blogList) {
      return
    }

    // Get template item
    const templateItem = blogList.querySelector('.blog-collection-item')
    if (!templateItem) {
      return
    }

    // Clear all items (keep template for cloning)
    const allItems = Array.from(blogList.querySelectorAll('.blog-collection-item'))
    if (allItems.length > 1) {
      allItems.slice(1).forEach(item => item.remove())
    }

    // Fetch articles
    await loadArticles()

    if (articles.value.length === 0) {
      return
    }

    // Create articles from API data
    articles.value.forEach((article, index) => {
      const newItem = templateItem.cloneNode(true) as HTMLElement

      // Update image
      const img = newItem.querySelector('.blog-img') as HTMLImageElement
      if (img) {
        const imageUrl = getImageUrl(article.featured_image)
        img.src = imageUrl
        img.alt = article.title
      }

      // Update title
      const title = newItem.querySelector('.blog-title')
      if (title) title.textContent = article.title

      // Update excerpt
      const excerpt = newItem.querySelector('.blog-details')
      if (excerpt) excerpt.textContent = article.excerpt || ''

      // Update date
      const dateText = newItem.querySelectorAll('.blog-post-details-text')[0]
      if (dateText) dateText.textContent = formatDate(article.published_at)

      // Update author
      const authorText = newItem.querySelectorAll('.blog-post-details-text')[1]
      if (authorText) authorText.textContent = article.author?.name || 'Unknown'

      // Update category for filtering
      const categoryField = newItem.querySelector('[fs-cmsfilter-field="category"]')
      if (categoryField) {
        categoryField.textContent = article.category?.name || 'All'
      }

      // Update article links
      const links = newItem.querySelectorAll('a')
      links.forEach(link => {
        const href = link.getAttribute('href')
        if (href?.includes('/blogs/')) {
          link.setAttribute('href', `/blog/${article.slug}`)
        }
      })

      if (index === 0) {
        templateItem.replaceWith(newItem)
      } else {
        blogList.appendChild(newItem)
      }
    })

    // Populate category filter tabs
    populateCategoryTabs()

    // Reinitialize Finsweet filter
    if ((window as any).fsAttributes?.push) {
      ;(window as any).fsAttributes.push(['cmsfilter', () => {}])
    }
  } catch (error) {
    // Silent error handling
  }
}

onMounted(() => {
  // Populate legacy template with real CMS data
  populateLegacyBlogTemplate()


  // Auto-refresh every 30 seconds for real-time CMS updates
  const refreshInterval = setInterval(() => {
    populateLegacyBlogTemplate()
  }, 30000)

  return () => {
    clearInterval(refreshInterval)
  }
})
</script>

<template>
  <!-- Legacy Blog Template with Dynamic CMS Data -->
  <LegacyWebflowPage legacy-path="/legacy/template-pages/blogs.html" loading-label="Loading Blogs..." />
</template>

<style>
/* Add spacing between category filter tabs */
.listings-page-tab-link {
  margin-right: 1rem !important;
  margin-left: 1rem !important;
}

.w-dyn-items .w-dyn-item:first-child .listings-page-tab-link {
  margin-left: 0 !important;
}

/* Ensure proper spacing in the filter form */
.tab-menu {
  gap: 1rem !important;
}
</style>
