<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPublicListings, fetchPopularListings, type PublicListing } from '@/services/listings'
import { getImageUrl } from '@/utils/imageUrl'
import GalleryPreview from '@/components/GalleryPreview.vue'

const route = useRoute()
const showGalleryPreview = ref(false)
const galleryPreviewIndex = ref(0)
const galleryImages = ref<string[]>([])
const galleryHeading = ref('Vibrant Gallery')
const visibleGalleryCount = ref(4)
const currentListing = ref<PublicListing | null>(null)
const popularListings = ref<PublicListing[]>([])

const visibleGalleryImages = computed(() => {
  return galleryImages.value.slice(0, visibleGalleryCount.value)
})

const hasMoreGalleryImages = computed(() => {
  return galleryImages.value.length > visibleGalleryCount.value
})

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
      currentListing.value = listing

      // Set gallery heading from CMS
      galleryHeading.value = listing.gallery_heading || listing.gallery_heading || 'Vibrant Gallery'

      // Wait a bit more for Webflow to fully render
      await new Promise(resolve => setTimeout(resolve, 500))

      // Populate Webflow with CMS data
      populatePage(listing)

      // Store gallery images for preview (deduplicate)
      if (listing.gallery && listing.gallery.length > 0) {
        const uniqueImages = [...new Set(listing.gallery)]
        galleryImages.value = uniqueImages
      }

      // Fetch popular listings for carousel
      try {
        const popular = await fetchPopularListings()
        // Exclude current listing from carousel
        const filtered = popular.filter(p => p.id !== listing.id)
        popularListings.value = filtered.length > 0 ? filtered : popular
        console.log('[CMS] Popular listings loaded:', popularListings.value.length)
      } catch (error) {
        console.warn('[CMS] Could not load popular listings:', error)
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

function loadMoreGalleryImages() {
  visibleGalleryCount.value += 4
}

function updateGalleryHeading() {
  // Update gallery section heading with CMS data
  const galleryHeadings = document.querySelectorAll(
    '.vibrant-gallery h2, .vibrant-gallery h3, [class*="gallery"] h2, [class*="gallery"] h3'
  )
  galleryHeadings.forEach(el => {
    el.textContent = galleryHeading.value
  })
}

function populatePage(listing: PublicListing) {
  try {
    // Update all text nodes that might contain placeholder text
    updatePageTitle(listing)
    updateLocation(listing)
    updateHours(listing)
    updateDescription(listing)
    updateContactInfo(listing)
    updateGalleryHeading()
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

  <!-- Enhanced Gallery Section with Load More -->
  <div v-if="galleryImages.length > 0" class="gallery-enhancement">
    <!-- Gallery images with click-to-preview -->
    <div class="gallery-grid-enhanced">
      <div
        v-for="(image, index) in visibleGalleryImages"
        :key="index"
        class="gallery-item-enhanced"
        @click="openGalleryPreview(index)"
      >
        <img :src="getImageUrl(image)" :alt="`Gallery image ${index + 1}`" />
        <div class="gallery-overlay">🔍</div>
      </div>
    </div>

    <!-- Load More Button -->
    <div v-if="hasMoreGalleryImages" class="gallery-load-more">
      <button @click="loadMoreGalleryImages" class="load-more-btn">
        Load More ({{ galleryImages.length - visibleGalleryCount }} more)
      </button>
    </div>
  </div>

  <!-- Popular Listing Collection Carousel -->
  <div v-if="popularListings.length > 0" class="popular-listings-section">
    <h2 class="popular-section-title">Popular Listing Collection</h2>
    <div class="popular-listings-grid">
      <a
        v-for="listing in popularListings"
        :key="listing.id"
        :href="`/listings/${listing.slug}`"
        class="popular-listing-card"
      >
        <div class="popular-card-image">
          <img :src="getImageUrl(listing.image)" :alt="listing.title" />
        </div>
        <div class="popular-card-content">
          <h3 class="popular-card-title">{{ listing.title }}</h3>
          <p class="popular-card-category">{{ listing.category }}</p>
          <p class="popular-card-location">{{ listing.location }}</p>
          <p class="popular-card-summary">{{ listing.summary }}</p>
        </div>
      </a>
    </div>
  </div>

  <!-- This component populates Webflow listing page with real-time CMS data -->
</template>

<style scoped>
.gallery-enhancement {
  margin-top: 20px;
  padding: 20px;
}

.gallery-grid-enhanced {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.gallery-item-enhanced {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  background: #f0f0f0;
}

.gallery-item-enhanced img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.gallery-item-enhanced:hover img {
  transform: scale(1.1);
}

.gallery-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: background 0.3s;
}

.gallery-item-enhanced:hover .gallery-overlay {
  background: rgba(0, 0, 0, 0.4);
}

.gallery-load-more {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.load-more-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.load-more-btn:hover {
  background: #c0392b;
}

.popular-listings-section {
  margin-top: 60px;
  padding: 40px 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.popular-section-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 30px 0;
  color: #222;
  text-align: center;
}

.popular-listings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.popular-listing-card {
  text-decoration: none;
  color: inherit;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.popular-listing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.popular-card-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f0f0f0;
}

.popular-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popular-card-content {
  padding: 16px;
}

.popular-card-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #222;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.popular-card-category {
  font-size: 12px;
  color: #666;
  margin: 0 0 6px 0;
  text-transform: uppercase;
  font-weight: 600;
}

.popular-card-location {
  font-size: 13px;
  color: #888;
  margin: 0 0 10px 0;
}

.popular-card-summary {
  font-size: 13px;
  color: #666;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

@media (max-width: 1024px) {
  .popular-listings-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .popular-listings-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .gallery-grid-enhanced {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .popular-listings-section {
    padding: 30px 15px;
    margin-top: 40px;
  }

  .popular-section-title {
    font-size: 22px;
    margin-bottom: 20px;
  }
}
</style>
