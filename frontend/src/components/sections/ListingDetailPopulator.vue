<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPublicListings, type PublicListing } from '@/services/listings'
import { getImageUrl, deduplicateImages } from '@/utils/imageUrl'
import GalleryPreview from '@/components/GalleryPreview.vue'

const route = useRoute()

const showGalleryPreview = ref(false)
const galleryPreviewIndex = ref(0)
const galleryImages = ref<string[]>([])
const currentListing = ref<PublicListing | null>(null)

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

      // Try to populate Webflow HTML
      populateListingDetail(listing)

      // Load and deduplicate gallery images for preview modal
      if (listing.gallery && listing.gallery.length > 0) {
        galleryImages.value = deduplicateImages(listing.gallery)
        console.log('Gallery deduped:', galleryImages.value.length, 'unique images')
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
  <!-- Gallery Preview Modal (teleported, no layout impact) -->
  <GalleryPreview
    v-if="showGalleryPreview && galleryImages.length > 0"
    :images="galleryImages.map(img => getImageUrl(img))"
    :initialIndex="galleryPreviewIndex"
    @close="closeGalleryPreview"
  />

  <!-- Fallback: Display listing if Webflow HTML elements not found -->
  <div v-if="currentListing" class="listing-detail-fallback">
    <div class="listing-detail-header">
      <h1>{{ currentListing.title }}</h1>
      <p class="listing-category">{{ currentListing.category }}</p>
      <p class="listing-location">📍 {{ currentListing.location }}</p>
    </div>

    <div class="listing-detail-info">
      <div class="info-item">
        <span class="info-label">📅 Days:</span>
        <span>{{ currentListing.open_days || currentListing.days }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">⏰ Hours:</span>
        <span>{{ currentListing.open_time && currentListing.close_time ? `${currentListing.open_time} - ${currentListing.close_time}` : currentListing.hours }}</span>
      </div>
    </div>

    <div class="listing-detail-description">
      <h2>About</h2>
      <p>{{ currentListing.description || currentListing.summary }}</p>
    </div>

    <div class="listing-detail-contact">
      <h2>Contact Information</h2>
      <div class="contact-item" v-if="currentListing.contact_phone">
        <span class="contact-label">Phone:</span>
        <a :href="`tel:${currentListing.contact_phone}`">{{ currentListing.contact_phone }}</a>
      </div>
      <div class="contact-item" v-if="currentListing.contact_email">
        <span class="contact-label">Email:</span>
        <a :href="`mailto:${currentListing.contact_email}`">{{ currentListing.contact_email }}</a>
      </div>
      <div class="contact-item" v-if="currentListing.contact_website">
        <span class="contact-label">Website:</span>
        <a :href="currentListing.contact_website" target="_blank">{{ currentListing.contact_website.replace(/^https?:\/\//, '') }}</a>
      </div>
      <div class="contact-item" v-if="currentListing.contact_address">
        <span class="contact-label">Address:</span>
        <span>{{ currentListing.contact_address }}</span>
      </div>
    </div>

    <div class="listing-detail-gallery" v-if="galleryImages.length > 0">
      <h2>{{ currentListing.gallery_heading || 'Vibrant Gallery' }}</h2>
      <div class="gallery-grid-fallback">
        <div
          v-for="(image, index) in galleryImages"
          :key="index"
          class="gallery-item-fallback"
          @click="openGalleryPreview(index)"
        >
          <img
            :src="getImageUrl(image)"
            :alt="`${currentListing.title} - Image ${index + 1}`"
            class="gallery-image-fallback"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- This component populates the existing Webflow HTML with dynamic CMS data -->
  <!-- If Webflow elements are found, they will be populated; otherwise the fallback above displays -->
</template>

<style scoped>
.listing-detail-fallback {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.listing-detail-header {
  margin-bottom: 40px;
  border-bottom: 2px solid #eee;
  padding-bottom: 20px;
}

.listing-detail-header h1 {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 10px 0;
  color: #222;
}

.listing-category {
  display: inline-block;
  background: #f0f0f0;
  color: #666;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin: 0 0 15px 0;
  text-transform: uppercase;
}

.listing-location {
  font-size: 18px;
  color: #555;
  margin: 0;
}

.listing-detail-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.listing-detail-description,
.listing-detail-contact,
.listing-detail-gallery {
  margin-bottom: 40px;
}

.listing-detail-description h2,
.listing-detail-contact h2,
.listing-detail-gallery h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: #222;
}

.listing-detail-description p {
  font-size: 16px;
  line-height: 1.6;
  color: #555;
  margin: 0;
}

.contact-item {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
}

.contact-label {
  font-weight: 600;
  color: #333;
  min-width: 100px;
}

.contact-item a {
  color: #e74c3c;
  text-decoration: none;
  word-break: break-all;
}

.contact-item a:hover {
  text-decoration: underline;
}

.gallery-grid-fallback {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.gallery-item-fallback {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  background: #f0f0f0;
  transition: transform 0.3s;
}

.gallery-item-fallback:hover {
  transform: scale(1.05);
}

.gallery-image-fallback {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .listing-detail-fallback {
    padding: 20px 15px;
  }

  .listing-detail-header h1 {
    font-size: 24px;
  }

  .listing-detail-description h2,
  .listing-detail-contact h2,
  .listing-detail-gallery h2 {
    font-size: 20px;
  }

  .gallery-grid-fallback {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
}
</style>

