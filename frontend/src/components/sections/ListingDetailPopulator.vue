<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPublicListings, fetchPopularListings, type PublicListing } from '@/services/listings'
import { getImageUrl, deduplicateImages } from '@/utils/imageUrl'
import GalleryPreview from '@/components/GalleryPreview.vue'
import ListingCard from '@/components/ListingCard.vue'

const route = useRoute()

const showGalleryPreview = ref(false)
const galleryPreviewIndex = ref(0)
const galleryImages = ref<string[]>([])
const visibleGalleryCount = ref(4)
const currentListing = ref<PublicListing | null>(null)
const popularListings = ref<PublicListing[]>([])

onMounted(async () => {
  const slug = route.params.slug as string
  if (!slug) return

  try {
    console.log('Waiting for DOM to be ready...')
    await new Promise(resolve => setTimeout(resolve, 500))

    const listings = await fetchPublicListings()
    console.log('All listings fetched:', listings.length)

    const listing = listings.find(l => l.slug === slug)

    if (listing) {
      console.log('Found listing:', listing.slug, {
        title: listing.title,
        gallery_heading: listing.gallery_heading,
        gallery_count: listing.gallery?.length,
      })
      currentListing.value = listing
      populateListingDetail(listing)

      // Load and deduplicate gallery images
      if (listing.gallery && listing.gallery.length > 0) {
        galleryImages.value = deduplicateImages(listing.gallery)
        console.log('Gallery deduped:', galleryImages.value.length, 'unique images')
      }

      // Load popular listings (excluding current listing if possible)
      try {
        const popular = await fetchPopularListings()
        const filtered = popular.filter(p => p.id !== listing.id)
        popularListings.value = filtered.length > 0 ? filtered : popular
        console.log('Popular listings loaded:', popularListings.value.length)
      } catch (error) {
        console.warn('Could not load popular listings:', error)
      }
    } else {
      console.warn('Listing not found:', slug)
    }
  } catch (error) {
    console.error('Failed to fetch listing:', error)
  }
})

function openGalleryPreview(index: number) {
  galleryPreviewIndex.value = index
  showGalleryPreview.value = true
}

function closeGalleryPreview() {
  showGalleryPreview.value = false
}

function loadMoreGallery() {
  visibleGalleryCount.value += 4
}

function populateListingDetail(listing: PublicListing) {
  const root = document.querySelector('.page-wrapper, .legacy-home') || document.body

  // Page title
  const pageTitle = root.querySelector('.page-banner-title')
  if (pageTitle) {
    pageTitle.textContent = listing.title
    pageTitle.classList.remove('w-dyn-bind-empty')
  }

  // Breadcrumb
  const breadcrumb = root.querySelector('.page-link-text')
  if (breadcrumb) {
    breadcrumb.textContent = listing.title
    breadcrumb.classList.remove('w-dyn-bind-empty')
  }

  // Section title
  const sectionTitle = root.querySelector('.section-title.listing')
  if (sectionTitle) {
    sectionTitle.textContent = listing.title
    sectionTitle.classList.remove('w-dyn-bind-empty')
  }

  // Description
  const bodyCopy = root.querySelector('.listings-content-wrap p')
  if (bodyCopy) {
    bodyCopy.textContent = listing.summary || listing.description
    bodyCopy.classList.remove('w-dyn-bind-empty')
  }

  // Location, Days, Hours
  const dateTimeTexts = Array.from(root.querySelectorAll('.date-and-time-icon-text'))
  if (dateTimeTexts.length >= 3) {
    dateTimeTexts[0].textContent = listing.location || 'Location'
    dateTimeTexts[1].textContent = listing.open_days || listing.days || 'Monday - Saturday'
    dateTimeTexts[2].textContent = listing.open_time && listing.close_time ? `${listing.open_time} - ${listing.close_time}` : (listing.hours || '09:00 - 18:00')
    dateTimeTexts.forEach(el => el.classList.remove('w-dyn-bind-empty'))
  }

  // Main image
  const mainImg = root.querySelector<HTMLImageElement>('.listing-single-img')
  if (mainImg) {
    mainImg.src = getImageUrl(listing.image)
    mainImg.alt = listing.title
    mainImg.classList.remove('w-dyn-bind-empty')
  }

  // Gallery heading - fetch from CMS
  const galleryHeading = root.querySelector('.vibrant-gallery h2, .vibrant-gallery h3, [class*="gallery"] h2, [class*="gallery"] h3')
  if (galleryHeading && listing.gallery_heading) {
    galleryHeading.textContent = listing.gallery_heading
    galleryHeading.classList.remove('w-dyn-bind-empty')
  }

  // Details section
  const richText = root.querySelector<HTMLElement>('.rich-text')
  if (richText) {
    const detailsHeading = listing.details_heading || 'Details'
    const detailsItems = listing.details_items && listing.details_items.length > 0
      ? listing.details_items
      : [listing.summary, listing.description].filter(Boolean)

    const facilitiesHeading = listing.facilities_heading || 'Facilities Available'
    const facilitiesItems = (listing.facilities_items && listing.facilities_items.length > 0)
      ? listing.facilities_items
      : (listing.facilities && listing.facilities.length > 0
        ? listing.facilities
        : ['Helpful Staff', 'Easy Access', 'Visitor Friendly'])

    const facilitiesHtml = facilitiesItems.length > 0
      ? `<ul style="margin-left: 1.25rem; list-style-type: disc; line-height: 1.8; margin-bottom: 1.5rem;">${facilitiesItems.map((f: string) => `<li style="margin-bottom: 0.5rem;">${escapeHtml(f)}</li>`).join('')}</ul>`
      : ''

    richText.innerHTML = [
      `<h3>${escapeHtml(detailsHeading)}</h3>`,
      ...detailsItems.map((item: string) => `<p>${escapeHtml(item)}</p>`),
      facilitiesItems.length > 0 ? `<h3 style="margin-top: 1.5rem;">${escapeHtml(facilitiesHeading)}</h3>` : '',
      facilitiesHtml,
    ].filter(Boolean).join('')
    richText.classList.remove('w-dyn-bind-empty')
  }

  // Contact information
  const contactPhone = listing.contact_phone || listing.phone || 'Not Available'
  const contactEmail = listing.contact_email || listing.email || 'Not Available'
  const contactWebsite = listing.contact_website || listing.website_url || 'Not Available'
  const contactLocation = listing.contact_address || listing.location || listing.city || 'Not Available'

  updateContactInfo(root, contactPhone, contactEmail, contactWebsite, contactLocation)
  updateScheduleInfo(root, listing)
}

function updateContactInfo(root: Element, phone: string, email: string, website: string, location: string) {
  const allElements = Array.from(root.querySelectorAll('*'))
  let phoneUpdated = false
  let emailUpdated = false
  let websiteUpdated = false
  let addressUpdated = false

  for (const el of allElements) {
    const text = el.textContent || ''
    const isLeaf = el.children.length === 0
    const isLink = el.tagName === 'A'

    if (!phoneUpdated && text.match(/\(\d{3}\)|\d{3}[.\s-]\d{3}|000.*012|\+\d{8,}|\(\d{4}\)/)) {
      el.textContent = phone
      el.classList.remove('w-dyn-bind-empty')
      phoneUpdated = true
    }

    if (!emailUpdated && text.includes('@') && !text.includes('www') && !text.includes('osama-ali')) {
      if (isLink) {
        (el as HTMLAnchorElement).href = email !== 'Not Available' ? `mailto:${email}` : '#'
      }
      el.textContent = email
      el.classList.remove('w-dyn-bind-empty')
      emailUpdated = true
    }

    if (!websiteUpdated && (text.includes('www') || text.includes('example.com') || text.includes('osama-ali')) && !text.includes('@')) {
      const displayUrl = website === 'Not Available' ? website : website.replace(/^https?:\/\//, '')
      el.textContent = displayUrl
      if (isLink && website !== 'Not Available') {
        const anchor = el as HTMLAnchorElement
        anchor.href = website.startsWith('http') ? website : `https://${website}`
        anchor.target = '_blank'
        anchor.rel = 'noopener noreferrer'
      }
      el.classList.remove('w-dyn-bind-empty')
      websiteUpdated = true
    }

    if (!addressUpdated && isLeaf && text && text.length < 150) {
      if (text.includes('Germany') || text.includes('Berlin') || text.includes('Address') || text.includes('Location') || text.match(/\d{4,}/)) {
        el.textContent = location
        el.classList.remove('w-dyn-bind-empty')
        addressUpdated = true
      }
    }
  }
}

function updateScheduleInfo(root: Element, listing: PublicListing) {
  const allElements = Array.from(root.querySelectorAll('*'))

  for (const el of allElements) {
    const text = el.textContent || ''
    const isLeaf = el.children.length === 0

    if (isLeaf) {
      if (text.match(/\d{2}:\d{2}\s*-\s*\d{2}:\d{2}|AM|PM/)) {
        const timeStr = listing.open_time && listing.close_time
          ? `${listing.open_time} - ${listing.close_time}`
          : (listing.hours || '06:00 AM - 10:00 PM')
        if (text !== timeStr) {
          el.textContent = timeStr
        }
      }

      if (text.includes('Monday') || text.includes('Saturday') || text.includes('Day')) {
        const daysStr = listing.open_days || listing.days || 'Monday - Saturday'
        if (text !== daysStr && text.length < 50) {
          el.textContent = daysStr
        }
      }

      if (text.includes('Weekend') && text.length < 40) {
        el.textContent = listing.weekend_text || 'Weekend: Sunday'
      }
    }
  }
}

function escapeHtml(value: string): string {
  const div = document.createElement('div')
  div.textContent = value
  return div.innerHTML
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

  <!-- Gallery Images Section (Vue-based) -->
  <div v-if="currentListing && galleryImages.length > 0" class="listing-gallery-vue">
    <div class="listing-gallery-header">
      <h2>{{ currentListing.gallery_heading || 'Vibrant Gallery' }}</h2>
    </div>

    <!-- Gallery Grid -->
    <div class="gallery-grid">
      <div
        v-for="(image, index) in galleryImages.slice(0, visibleGalleryCount)"
        :key="index"
        class="gallery-item"
        @click="openGalleryPreview(index)"
      >
        <img
          :src="getImageUrl(image)"
          :alt="`${currentListing.title} - Image ${index + 1}`"
          class="gallery-image"
        />
        <div class="gallery-overlay">
          <span class="gallery-icon">🔍</span>
        </div>
      </div>
    </div>

    <!-- Load More Button -->
    <div v-if="visibleGalleryCount < galleryImages.length" class="gallery-load-more">
      <button @click="loadMoreGallery" class="load-more-btn">
        Load More ({{ galleryImages.length - visibleGalleryCount }} more)
      </button>
    </div>
  </div>

  <!-- Popular Listings Carousel Section -->
  <div v-if="popularListings.length > 0" class="popular-listings-carousel">
    <div class="carousel-header">
      <h2>Popular Places You Might Like</h2>
    </div>

    <!-- Carousel Grid -->
    <div class="carousel-grid">
      <ListingCard
        v-for="listing in popularListings"
        :key="listing.id"
        :id="listing.id"
        :slug="listing.slug"
        :title="listing.title"
        :location="listing.location"
        :category="listing.category"
        :image="listing.image"
        :summary="listing.summary"
        :days="listing.days"
        :hours="listing.hours"
      />
    </div>
  </div>

  <!-- Fallback: Populate existing Webflow content -->
  <!-- This ensures backward compatibility with existing HTML structure -->
</template>

<style scoped>
/* Gallery Vue Section Styles */
.listing-gallery-vue {
  margin: 60px 0;
  padding: 0 20px;
}

.listing-gallery-header {
  margin-bottom: 40px;
}

.listing-gallery-header h2 {
  font-size: 32px;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

@media (max-width: 1024px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.gallery-item {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  background: #f0f0f0;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-image {
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
  transition: background 0.3s ease;
}

.gallery-item:hover .gallery-overlay {
  background: rgba(0, 0, 0, 0.4);
}

.gallery-icon {
  font-size: 32px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-item:hover .gallery-icon {
  opacity: 1;
}

.gallery-load-more {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.load-more-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.load-more-btn:hover {
  background: #c0392b;
}

/* Popular Listings Carousel */
.popular-listings-carousel {
  margin: 80px 0;
  padding: 60px 20px;
  background: #f9f9f9;
}

.carousel-header {
  margin-bottom: 40px;
  text-align: center;
}

.carousel-header h2 {
  font-size: 32px;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.carousel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .carousel-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .carousel-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .popular-listings-carousel {
    padding: 40px 15px;
    margin: 60px 0;
  }
}

@media (max-width: 480px) {
  .listing-gallery-vue {
    padding: 0 15px;
  }

  .carousel-header h2,
  .listing-gallery-header h2 {
    font-size: 24px;
  }
}
</style>
