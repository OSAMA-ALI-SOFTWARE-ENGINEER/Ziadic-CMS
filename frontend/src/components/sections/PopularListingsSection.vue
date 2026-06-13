<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchPopularListings, type PublicListing } from '@/services/listings'

const isLoading = ref(true)

onMounted(async () => {
  try {
    const listings = await fetchPopularListings()
    console.log('Popular listings fetched:', listings.length)

    // Populate the existing Webflow HTML with dynamic data
    populateWebflowContent(listings)
  } catch (error) {
    console.error('Failed to fetch popular listings:', error)
    // Keep static content visible if API fails
  } finally {
    isLoading.value = false
  }
})

function populateWebflowContent(listings: PublicListing[]) {
  // Find the listings wrapper in the Webflow HTML
  const wrapper = document.querySelector('.listings-content-wrapper')
  if (!wrapper) {
    console.warn('Could not find .listings-content-wrapper')
    return
  }

  // Get all card elements
  const cards = wrapper.querySelectorAll<HTMLElement>('.listings-content-slide-collection-item')
  if (!cards.length) {
    console.warn('Could not find listing cards')
    return
  }

  console.log('Found', cards.length, 'card slots, populating with', listings.length, 'listings')

  // Populate each card with listing data
  listings.forEach((listing, index) => {
    const card = cards[index]
    if (!card) return

    // Show the card
    card.style.display = ''

    // Update image
    const img = card.querySelector<HTMLImageElement>('.listings-list-single-img')
    if (img) {
      img.src = getImageUrl(listing.image)
      img.alt = listing.title
    }

    // Update title
    const title = card.querySelector('.listings-list-single-post-name')
    if (title) {
      title.textContent = listing.title
    }

    // Update location
    const location = card.querySelector('.listings-list-location')
    if (location) {
      location.textContent = listing.location
    }

    // Update days/hours
    const dayTexts = card.querySelectorAll('.day-text')
    if (dayTexts.length > 0) {
      dayTexts[0].textContent = listing.days
    }

    const timeText = card.querySelector('.time-text')
    if (timeText) {
      timeText.textContent = listing.hours
    }

    // Update category
    const category = card.querySelector('.cities-places')
    if (category) {
      category.textContent = listing.category
    }

    // Update summary
    const summary = card.querySelector('.listings-summary-text')
    if (summary) {
      summary.textContent = listing.summary
    }

    // Update link href
    const link = card.querySelector<HTMLAnchorElement>('.listings-content-slide-link')
    if (link) {
      link.href = `/listings/${listing.slug}`
    }
  })

  // Hide unused card slots
  for (let i = listings.length; i < cards.length; i++) {
    cards[i].style.display = 'none'
  }

  console.log('Popular listings populated successfully')
}

function getImageUrl(path?: string | null): string {
  if (!path) return '/assets/images/1.png'
  if (path.startsWith('http')) return path
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  return `${backendUrl}/${path.replace(/^\/+/, '')}`
}
</script>

<template>
  <!-- This component populates the existing Webflow HTML with dynamic data -->
  <!-- No visible DOM output - modifies existing Webflow content in place -->
</template>
