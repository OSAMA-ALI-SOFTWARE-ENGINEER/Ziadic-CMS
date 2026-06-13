<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPublicListings, type PublicListing } from '@/services/listings'

const route = useRoute()

onMounted(async () => {
  const slug = route.params.slug as string
  if (!slug) return

  try {
    // Wait for DOM and Webflow to be ready (increased time)
    console.log('Waiting for DOM to be ready...')
    await new Promise(resolve => setTimeout(resolve, 500))

    const listings = await fetchPublicListings()
    console.log('All listings fetched:', listings.length, listings.map(l => ({ id: l.id, slug: l.slug, title: l.title })))

    const listing = listings.find(l => l.slug === slug)

    if (listing) {
      console.log('Found listing:', listing.slug, {
        title: listing.title,
        image: listing.image,
        gallery: listing.gallery,
        gallery_length: listing.gallery?.length,
        contact_phone: listing.contact_phone,
        contact_email: listing.contact_email,
        contact_website: listing.contact_website,
        contact_address: listing.contact_address,
        open_days: listing.open_days,
        open_time: listing.open_time,
        close_time: listing.close_time,
      })
      populateListingDetail(listing)
    } else {
      console.warn('Listing not found:', slug, 'Available slugs:', listings.map(l => l.slug))
    }
  } catch (error) {
    console.error('Failed to fetch listing:', error)
  }
})

function populateListingDetail(listing: PublicListing) {
  const root = document.querySelector('.page-wrapper, .legacy-home') || document.body

  console.log('Populating listing detail with:', {
    title: listing.title,
    location: listing.location,
    days: listing.days,
    hours: listing.hours,
    open_days: listing.open_days,
    open_time: listing.open_time,
    close_time: listing.close_time,
  })

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

  // Location, Days, Hours - Update all date-and-time elements
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
    const mainImageUrl = getImageUrl(listing.image)
    console.log('Main image:', { original: listing.image, fullUrl: mainImageUrl })
    mainImg.src = mainImageUrl
    mainImg.alt = listing.title
    mainImg.classList.remove('w-dyn-bind-empty')
  } else {
    console.warn('Main image element not found')
  }

  // Gallery images
  const galleryImages = root.querySelectorAll<HTMLImageElement>('.vibrant-gallery-img')
  const images = listing.gallery && listing.gallery.length > 0 ? listing.gallery : (listing.image ? [listing.image] : [])

  console.log('Gallery images:', {
    count: galleryImages.length,
    availableImages: images.length,
    images: images,
  })

  galleryImages.forEach((img, index) => {
    const imageUrl = images[index % images.length]
    const fullUrl = getImageUrl(imageUrl)
    console.log(`Setting gallery image ${index}:`, {
      original: imageUrl,
      fullUrl: fullUrl,
    })
    img.src = fullUrl
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
    // Use facilities_items if available, fallback to facilities for backward compatibility
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

  // Helper function to get field value with multiple fallback options
  function getFieldValue(listing: PublicListing, ...fieldNames: string[]): string | null {
    for (const field of fieldNames) {
      const value = (listing as any)[field]
      if (value) return value
    }
    return null
  }

  // Extract contact information with proper fallbacks
  const contactPhone = getFieldValue(listing, 'contact_phone', 'phone') || 'Not Available'
  const contactEmail = getFieldValue(listing, 'contact_email', 'email') || 'Not Available'
  const contactWebsite = getFieldValue(listing, 'contact_website', 'website_url') || 'Not Available'
  const contactLocation = getFieldValue(listing, 'contact_address', 'location', 'city') || 'Not Available'

  console.log('Contact information extracted:', {
    phone: contactPhone,
    email: contactEmail,
    website: contactWebsite,
    location: contactLocation,
  })

  // Find all text nodes and elements to match contact information
  const allElements = Array.from(root.querySelectorAll('*'))
  let phoneUpdated = false
  let emailUpdated = false
  let websiteUpdated = false
  let addressUpdated = false

  console.log('Updating contact information:', {
    phone: contactPhone,
    email: contactEmail,
    website: contactWebsite,
    address: contactLocation,
  })

  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i]
    const text = el.textContent || ''
    const isLeaf = el.children.length === 0
    const isLink = el.tagName === 'A'

    // Phone number matching and updating
    if (!phoneUpdated && text && text.length < 50) {
      if (text.match(/\(\d{3}\)|\d{3}[.\s-]\d{3}|000.*012|\+\d{8,}|\(\d{4}\)/)) {
        el.textContent = contactPhone
        el.classList.remove('w-dyn-bind-empty')
        phoneUpdated = true
        console.log('Updated phone (pass 1):', contactPhone, 'from element:', text)
      }
    }

    // Email matching - look for @ symbol BUT NOT if it's a URL (www or osama-ali pattern)
    // Email must have @ and should not be a website domain
    if (!emailUpdated && text && text.length < 60) {
      const hasAtSymbol = text.includes('@')
      const isWebsiteDomain = text.includes('www') || text.includes('osama-ali') || (text.includes('.') && !text.includes('@'))

      if (hasAtSymbol && !isWebsiteDomain) {
        if (isLink && contactEmail !== 'Not Available') {
          (el as HTMLAnchorElement).href = `mailto:${contactEmail}`
        }
        el.textContent = contactEmail
        el.classList.remove('w-dyn-bind-empty')
        emailUpdated = true
        console.log('Updated email (pass 1):', contactEmail, 'from element:', text)
      }
    }

    // Website matching - look for www or domain pattern BUT NOT if it's already an email (@)
    if (!websiteUpdated && text && text.length < 60) {
      const hasAtSymbol = text.includes('@')
      const hasWebsite = text.includes('www') || text.includes('example.com') || text.includes('osama-ali')

      if (!hasAtSymbol && hasWebsite) {
        const displayUrl = contactWebsite === 'Not Available'
          ? contactWebsite
          : contactWebsite.replace(/^https?:\/\//, '')
        el.textContent = displayUrl
        if (isLink && contactWebsite !== 'Not Available') {
          const anchor = el as HTMLAnchorElement
          anchor.href = contactWebsite.startsWith('http') ? contactWebsite : `https://${contactWebsite}`
          anchor.target = '_blank'
          anchor.rel = 'noopener noreferrer'
        }
        el.classList.remove('w-dyn-bind-empty')
        websiteUpdated = true
        console.log('Updated website (pass 1):', contactWebsite, 'from element:', text)
      }
    }

    // Address/Location matching
    if (!addressUpdated && isLeaf && text && text.length < 150) {
      if (text.includes('Germany') || text.includes('Berlin') || text.includes('Address') || text.includes('Location') || text.includes('Distt') || text.match(/\d{4,}/) || text.includes('DE,') || text.includes('Coastal') || text.includes('Gallery')) {
        el.textContent = contactLocation
        el.classList.remove('w-dyn-bind-empty')
        addressUpdated = true
        console.log('Updated address (pass 1):', contactLocation, 'from element:', text)
      }
    }
  }

  // Fallback: If email not found, search more aggressively
  if (!emailUpdated && contactEmail !== 'Not Available') {
    console.log('Email not updated in pass 1, trying fallback search')
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i]
      const text = el.textContent || ''
      const isEmailLink = el.tagName === 'A'
      // Must have @ and not be a website URL
      const hasAtSymbol = text.includes('@')
      const isWebsiteDomain = text.includes('www') || text.includes('osama-ali')

      if (hasAtSymbol && !isWebsiteDomain) {
        console.log('Found email candidate:', text)
        if (isEmailLink) {
          (el as HTMLAnchorElement).href = `mailto:${contactEmail}`
        }
        el.textContent = contactEmail
        el.classList.remove('w-dyn-bind-empty')
        emailUpdated = true
        console.log('Updated email (fallback):', contactEmail)
        break
      }
    }
  }

  // If email is "Not Available", replace placeholders with it
  if (!emailUpdated && contactEmail === 'Not Available') {
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i]
      const text = el.textContent || ''
      if (text.includes('@') || text.includes('info.example')) {
        el.textContent = contactEmail
        el.classList.remove('w-dyn-bind-empty')
        emailUpdated = true
        console.log('Updated email to "Not Available"')
        break
      }
    }
  }

  // Fallback: If website not found, search more aggressively
  if (!websiteUpdated && contactWebsite !== 'Not Available') {
    console.log('Website not updated in pass 1, trying fallback search')
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i]
      const text = el.textContent || ''
      const href = (el as any).href || ''
      const isWebsiteLink = el.tagName === 'A'
      // Must have www or domain pattern but NOT be an email (@)
      const hasAtSymbol = text.includes('@')
      const hasWebsite = text.includes('www') || text.includes('example') || text.includes('osama')

      if (!hasAtSymbol && hasWebsite) {
        console.log('Found website candidate:', text, 'href:', href)
        const displayUrl = contactWebsite.replace(/^https?:\/\//, '')
        el.textContent = displayUrl
        if (isWebsiteLink) {
          const anchor = el as HTMLAnchorElement
          anchor.href = contactWebsite.startsWith('http') ? contactWebsite : `https://${contactWebsite}`
          anchor.target = '_blank'
          anchor.rel = 'noopener noreferrer'
        }
        el.classList.remove('w-dyn-bind-empty')
        websiteUpdated = true
        console.log('Updated website (fallback):', contactWebsite)
        break
      }
    }
  }

  // If website is "Not Available", replace placeholders with it
  if (!websiteUpdated && contactWebsite === 'Not Available') {
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i]
      const text = el.textContent || ''
      if (text.includes('www') || text.includes('example')) {
        el.textContent = contactWebsite
        el.classList.remove('w-dyn-bind-empty')
        websiteUpdated = true
        console.log('Updated website to "Not Available"')
        break
      }
    }
  }

  console.log('Contact update summary:', {
    phoneUpdated,
    emailUpdated,
    websiteUpdated,
    addressUpdated,
  })

  // Schedule information - Find and update all schedule-related elements
  allElements.forEach(el => {
    const text = el.textContent || ''
    const isLeaf = el.children.length === 0

    if (isLeaf) {
      // Update time format (HH:MM - HH:MM)
      if (text.match(/\d{2}:\d{2}\s*-\s*\d{2}:\d{2}|AM|PM/) && !el.closest('a')) {
        const timeStr = listing.open_time && listing.close_time
          ? `${listing.open_time} - ${listing.close_time}`
          : (listing.hours || '06:00 AM - 10:00 PM')
        if (text !== timeStr) {
          el.textContent = timeStr
        }
      }

      // Update days
      if (text.includes('Monday') || text.includes('Saturday') || text.includes('Day')) {
        const daysStr = listing.open_days || listing.days || 'Monday - Saturday'
        if (text !== daysStr && text.length < 50) {
          el.textContent = daysStr
        }
      }

      // Update weekend
      if (text.includes('Weekend') && text.length < 40) {
        el.textContent = listing.weekend_text || 'Weekend: Sunday'
      }
    }
  })

  // Log all updated elements
  const allUpdated = root.querySelectorAll('[class*="empty"]:not(.w-dyn-bind-empty)')
  console.log('Listing detail populated successfully', {
    elementsCleared: allUpdated.length,
    title: root.querySelector('.page-banner-title')?.textContent,
    location: root.querySelector('.date-and-time-icon-text')?.textContent,
    galleryImages: root.querySelectorAll('.vibrant-gallery-img').length,
  })
}

function getImageUrl(path?: string | null): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  return `${backendUrl}/${path.replace(/^\/+/, '')}`
}

function escapeHtml(value: string): string {
  const div = document.createElement('div')
  div.textContent = value
  return div.innerHTML
}
</script>

<template>
  <!-- This component populates listing detail pages with dynamic CMS data -->
</template>
