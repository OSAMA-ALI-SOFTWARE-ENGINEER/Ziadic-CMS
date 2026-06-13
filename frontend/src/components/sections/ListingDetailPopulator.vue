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

onMounted(async () => {
  const slug = route.params.slug as string
  if (!slug) return

  try {
    const listings = await fetchPublicListings()
    const listing = listings.find(l => l.slug === slug)

    if (listing) {
      // Populate Webflow HTML
      populateListingDetail(listing)

      // Load gallery images for preview modal
      if (listing.gallery && listing.gallery.length > 0) {
        galleryImages.value = deduplicateImages(listing.gallery)
      }
    }
  } catch (error) {
    console.error('Error loading listing:', error)
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
    dateTimeTexts[2].textContent = listing.open_time && listing.close_time
      ? `${listing.open_time} - ${listing.close_time}`
      : (listing.hours || '09:00 - 18:00')
    dateTimeTexts.forEach(el => el.classList.remove('w-dyn-bind-empty'))
  }

  // Main image
  const mainImg = root.querySelector<HTMLImageElement>('.listing-single-img')
  if (mainImg) {
    mainImg.src = getImageUrl(listing.image)
    mainImg.alt = listing.title
    mainImg.classList.remove('w-dyn-bind-empty')
  }

  // Gallery images
  const galleryImages = root.querySelectorAll<HTMLImageElement>('.vibrant-gallery-img')
  const images = galleryImages.value && galleryImages.value.length > 0
    ? galleryImages.value
    : (listing.image ? [listing.image] : [])

  galleryImages.forEach((img, index) => {
    const imageUrl = images[index % images.length]
    img.src = getImageUrl(imageUrl)
    img.alt = listing.title
    img.classList.remove('w-dyn-bind-empty')
  })

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
  const contactLocation = listing.contact_address || listing.location || 'Not Available'

  // Update contact info in page
  const allElements = Array.from(root.querySelectorAll('*'))
  let phoneUpdated = false
  let emailUpdated = false
  let websiteUpdated = false
  let addressUpdated = false

  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i]
    const text = el.textContent || ''
    const isLeaf = el.children.length === 0
    const isLink = el.tagName === 'A'

    // Phone
    if (!phoneUpdated && text && text.match(/\(\d{3}\)|\d{3}[.\s-]\d{3}|000.*012|\+\d{8,}|\(\d{4}\)/)) {
      el.textContent = contactPhone
      el.classList.remove('w-dyn-bind-empty')
      phoneUpdated = true
    }

    // Email
    if (!emailUpdated && text && text.includes('@') && !text.includes('www') && !text.includes('osama-ali')) {
      if (isLink && contactEmail !== 'Not Available') {
        (el as HTMLAnchorElement).href = `mailto:${contactEmail}`
      }
      el.textContent = contactEmail
      el.classList.remove('w-dyn-bind-empty')
      emailUpdated = true
    }

    // Website
    if (!websiteUpdated && text && (text.includes('www') || text.includes('example')) && !text.includes('@')) {
      const displayUrl = contactWebsite === 'Not Available' ? contactWebsite : contactWebsite.replace(/^https?:\/\//, '')
      el.textContent = displayUrl
      if (isLink && contactWebsite !== 'Not Available') {
        const anchor = el as HTMLAnchorElement
        anchor.href = contactWebsite.startsWith('http') ? contactWebsite : `https://${contactWebsite}`
        anchor.target = '_blank'
        anchor.rel = 'noopener noreferrer'
      }
      el.classList.remove('w-dyn-bind-empty')
      websiteUpdated = true
    }

    // Address
    if (!addressUpdated && isLeaf && text && text.length < 150) {
      if (text.includes('Address') || text.includes('Location') || text.match(/\d{4,}/)) {
        el.textContent = contactLocation
        el.classList.remove('w-dyn-bind-empty')
        addressUpdated = true
      }
    }
  }

  // Update schedule info
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i]
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

  <!-- This component populates the existing Webflow HTML with CMS data -->
</template>
