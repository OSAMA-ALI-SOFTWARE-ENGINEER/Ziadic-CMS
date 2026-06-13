<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPublicListings, type PublicListing } from '@/services/listings'
import { getImageUrl } from '@/utils/imageUrl'
import GalleryPreview from '@/components/GalleryPreview.vue'

const route = useRoute()
const showGalleryPreview = ref(false)
const galleryPreviewIndex = ref(0)
const galleryImages = ref<string[]>([])

onMounted(async () => {
  const slug = route.params.slug as string
  if (!slug) return

  try {
    // Wait for Webflow to fully initialize
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Fetch listing data
    const listings = await fetchPublicListings()
    const listing = listings.find(l => l.slug === slug)

    if (listing) {
      console.log('[CMS] Found listing:', listing.title)

      // Wait a bit more for Webflow to fully render
      await new Promise(resolve => setTimeout(resolve, 500))

      // Populate Webflow with CMS data
      populatePage(listing)

      // Store gallery images for preview
      if (listing.gallery && listing.gallery.length > 0) {
        galleryImages.value = listing.gallery
      }
    }
  } catch (error) {
    console.error('[CMS] Error loading listing:', error)
  }
})

function openGalleryPreview(index: number) {
  galleryPreviewIndex.value = index
  showGalleryPreview.value = true
}

function closeGalleryPreview() {
  showGalleryPreview.value = false
}

function populatePage(listing: PublicListing) {
  try {
    const doc = document

    // Update all text nodes that might contain placeholder text
    updatePageTitle(listing)
    updateLocation(listing)
    updateHours(listing)
    updateDescription(listing)
    updateContactInfo(listing)
    updateGallery(listing)
  } catch (error) {
    console.error('[CMS] Error populating page:', error)
  }
}

function updatePageTitle(listing: PublicListing) {
  // Update page banner title
  const titles = document.querySelectorAll('.page-banner-title, .section-title, h1')
  titles.forEach(el => {
    if (el.textContent && (el.textContent.includes('Loading') || el.textContent.length < 100)) {
      el.textContent = listing.title
      el.classList.remove('w-dyn-bind-empty')
    }
  })
}

function updateLocation(listing: PublicListing) {
  // Update location info
  const locationElements = document.querySelectorAll(
    '.date-and-time-icon-text, [class*="location"], [class*="address"]'
  )
  let locationUpdated = false

  locationElements.forEach(el => {
    const text = el.textContent || ''
    if (!locationUpdated && (text.includes('Location') || text.length > 10 && text.length < 150)) {
      el.textContent = listing.location
      el.classList.remove('w-dyn-bind-empty')
      locationUpdated = true
    }
  })
}

function updateHours(listing: PublicListing) {
  // Update hours/days info
  const timeElements = document.querySelectorAll(
    '.date-and-time-icon-text, [class*="hours"], [class*="time"]'
  )
  let timeUpdated = false
  let daysUpdated = false

  timeElements.forEach(el => {
    const text = el.textContent || ''

    // Update time
    if (!timeUpdated && (text.includes('AM') || text.includes('PM') || text.match(/\d{2}:\d{2}/))) {
      const timeStr = listing.open_time && listing.close_time
        ? `${listing.open_time.substring(0, 5)} - ${listing.close_time.substring(0, 5)}`
        : listing.hours
      el.textContent = timeStr
      el.classList.remove('w-dyn-bind-empty')
      timeUpdated = true
    }

    // Update days
    if (!daysUpdated && (text.includes('Monday') || text.includes('Saturday') || text.includes('Day'))) {
      el.textContent = listing.open_days || listing.days
      el.classList.remove('w-dyn-bind-empty')
      daysUpdated = true
    }
  })
}

function updateDescription(listing: PublicListing) {
  // Update description
  const descElements = document.querySelectorAll(
    '.listings-content-wrap p, [class*="description"], [class*="summary"]'
  )
  descElements.forEach(el => {
    const text = el.textContent || ''
    if (text.length < 200 && text.length > 10) {
      el.textContent = listing.description || listing.summary
      el.classList.remove('w-dyn-bind-empty')
    }
  })
}

function updateContactInfo(listing: PublicListing) {
  // Find all elements and update contact information
  const allElements = document.querySelectorAll('*')
  let phoneUpdated = false
  let emailUpdated = false
  let websiteUpdated = false

  allElements.forEach(el => {
    const text = el.textContent || ''
    if (text.length > 200 || el.children.length > 5) return // Skip containers

    const isLink = el.tagName === 'A'

    // Update phone
    if (!phoneUpdated && listing.contact_phone && text.match(/\d{3}[\s.-]?\d{3}[\s.-]?\d{4}|\+\d{1,3}\s?\d+|\(\d+\)/)) {
      el.textContent = listing.contact_phone
      el.classList.remove('w-dyn-bind-empty')
      phoneUpdated = true
    }

    // Update email
    if (!emailUpdated && listing.contact_email && text.includes('@') && !text.includes('www')) {
      if (isLink) {
        (el as HTMLAnchorElement).href = `mailto:${listing.contact_email}`
      }
      el.textContent = listing.contact_email
      el.classList.remove('w-dyn-bind-empty')
      emailUpdated = true
    }

    // Update website
    if (!websiteUpdated && listing.contact_website && (text.includes('www') || text.includes('example'))) {
      const displayUrl = listing.contact_website.replace(/^https?:\/\//, '')
      el.textContent = displayUrl
      if (isLink) {
        const link = el as HTMLAnchorElement
        link.href = listing.contact_website.startsWith('http')
          ? listing.contact_website
          : `https://${listing.contact_website}`
        link.target = '_blank'
      }
      el.classList.remove('w-dyn-bind-empty')
      websiteUpdated = true
    }
  })
}

function updateGallery(listing: PublicListing) {
  // Update gallery images
  const galleryImgs = document.querySelectorAll<HTMLImageElement>('.vibrant-gallery-img, [class*="gallery"] img')
  const images = (listing.gallery && listing.gallery.length > 0) ? listing.gallery : [listing.image]

  galleryImgs.forEach((img, index) => {
    if (images[index % images.length]) {
      img.src = getImageUrl(images[index % images.length])
      img.alt = listing.title
      img.classList.remove('w-dyn-bind-empty')
    }
  })

  // Store for preview
  if (listing.gallery && listing.gallery.length > 0) {
    galleryImages.value = listing.gallery
  }
}
</script>

<template>
  <!-- Gallery Preview Modal -->
  <GalleryPreview
    v-if="showGalleryPreview && galleryImages.length > 0"
    :images="galleryImages.map(img => getImageUrl(img))"
    :initialIndex="galleryPreviewIndex"
    @close="closeGalleryPreview"
  />

  <!-- This component populates Webflow listing page with real-time CMS data -->
</template>
