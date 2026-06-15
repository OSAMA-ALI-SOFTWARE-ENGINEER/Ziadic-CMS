<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPublicListings, type PublicListing } from '@/services/listings'
import { getImageUrl } from '@/utils/imageUrl'
import GalleryPreview from '@/components/GalleryPreview.vue'

const route = useRoute()

const listing = ref<PublicListing | null>(null)
const isLoading = ref(true)
const loadError = ref('')
const showGalleryPreview = ref(false)
const galleryPreviewIndex = ref(0)

const galleryImages = computed(() => {
  if (!listing.value?.gallery) return []
  return [...new Set(listing.value.gallery)]
})

const visibleGalleryImages = computed(() => galleryImages.value.slice(0, 4))

const hasMoreGalleryImages = computed(() => galleryImages.value.length > 4)

const visibleGalleryCount = ref(4)

const scheduleInfo = computed(() => {
  if (!listing.value) return { time: '', days: '', weekend: '' }
  const time = listing.value.open_time && listing.value.close_time
    ? `${listing.value.open_time.substring(0, 5)} - ${listing.value.close_time.substring(0, 5)}`
    : listing.value.hours || '06:00 AM - 10:00 PM'
  const days = listing.value.open_days || listing.value.days || 'Monday - Saturday'
  const weekend = listing.value.weekend_text || 'Weekend: Sunday'
  return { time, days, weekend }
})

onMounted(async () => {
  const slug = route.params.slug as string
  if (!slug) {
    loadError.value = 'No listing specified'
    isLoading.value = false
    return
  }

  try {
    const listings = await fetchPublicListings()
    const found = listings.find(l => l.slug === slug)

    if (!found) {
      loadError.value = 'Listing not found'
      isLoading.value = false
      return
    }

    listing.value = found
    isLoading.value = false
    console.log('[CMS] Listing loaded:', found.title)
  } catch (error) {
    console.error('[CMS] Error loading listing:', error)
    loadError.value = 'Unable to load listing. Please try again.'
    isLoading.value = false
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
</script>

<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="page-wrapper">
    <div class="listings-loading">
      <div class="spinner"></div>
      <p>Loading listing...</p>
    </div>
  </div>

  <!-- Error State -->
  <div v-else-if="loadError" class="page-wrapper">
    <div class="dynamic-listing-empty" style="margin-top: 60px">
      <p>{{ loadError }}</p>
    </div>
  </div>

  <!-- Detail Page -->
  <div v-else-if="listing" class="page-wrapper">
    <!-- Gallery Preview Modal -->
    <GalleryPreview
      v-if="showGalleryPreview && galleryImages.length > 0"
      :images="galleryImages.map(img => getImageUrl(img))"
      :initialIndex="galleryPreviewIndex"
      @close="closeGalleryPreview"
    />

    <!-- Page Header Section -->
    <section class="section page-section">
      <div class="page-section-content">
        <h1 class="page-banner-title">{{ listing.title }}</h1>
      </div>
    </section>

    <!-- Date and Time Information -->
    <div class="date-and-time-section">
      <div class="date-and-time-container">
        <div class="date-and-time-single">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolyline points='12 6 12 12 16 14'/%3E%3C/svg%3E" alt="" class="date-and-time-icon">
          <div class="date-and-time-icon-text">{{ scheduleInfo.time }}</div>
        </div>
        <div class="date-and-time-boder"></div>
        <div class="date-and-time-single">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Crect x='3' y='4' width='18' height='18' rx='2'/%3E%3Cpath d='M16 2v4M8 2v4M3 10h18'/%3E%3C/svg%3E" alt="" class="date-and-time-icon">
          <div class="date-and-time-icon-text">{{ scheduleInfo.days }}</div>
        </div>
        <div class="date-and-time-boder"></div>
        <div class="date-and-time-single">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolyline points='12 6 12 12 16 14'/%3E%3C/svg%3E" alt="" class="date-and-time-icon">
          <div class="date-and-time-icon-text">{{ scheduleInfo.weekend }}</div>
        </div>
      </div>
    </div>

    <!-- Main Content Section -->
    <section class="listings-content-section">
      <div class="container">
        <div class="listings-page-single">
          <!-- Featured Image -->
          <img v-if="listing.image" :src="getImageUrl(listing.image)" :alt="listing.title" class="listing-single-img">

          <!-- Two-Column Layout -->
          <div class="listting-rice-text-flex">
            <!-- Left Column: Gallery -->
            <div class="listting-rice-text-flex-left">
              <!-- Summary -->
              <div v-if="listing.summary" class="rich-text">{{ listing.summary }}</div>

              <!-- Gallery Section -->
              <div v-if="galleryImages.length > 0">
                <h4 class="vibrant-gallery">{{ listing.gallery_heading || 'Vibrant Gallery' }}</h4>
                <div class="vibrant-gallery-grid">
                  <div
                    v-for="(image, index) in visibleGalleryImages"
                    :key="index"
                    class="gallery-item-wrapper"
                    @click="openGalleryPreview(index)"
                  >
                    <img :src="getImageUrl(image)" :alt="`Gallery ${index + 1}`" class="vibrant-gallery-img">
                  </div>
                </div>
                <!-- Load More Button -->
                <div v-if="hasMoreGalleryImages" class="load-more-section">
                  <button @click="loadMoreGalleryImages()" class="load-more-btn">
                    Load More ({{ galleryImages.length - visibleGalleryCount }} more)
                  </button>
                </div>
              </div>
            </div>

            <!-- Right Column: Contact & Schedule -->
            <div class="listting-right-flex">
              <div class="listting-right">
                <!-- Contact Information -->
                <div class="contact-information-wrap">
                  <h5 class="contact-information-title">Contact Information</h5>
                  <div class="contact-information-list-flex">
                    <div v-if="listing.contact_phone || listing.phone" class="contact-information-list">
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/%3E%3Cpolyline points='9 22 9 12 15 12 15 22'/%3E%3C/svg%3E" alt="" class="contact-information-icon">
                      <a :href="`tel:${listing.contact_phone || listing.phone}`" class="contact-information-text">{{ listing.contact_phone || listing.phone }}</a>
                    </div>
                    <div v-if="listing.contact_email || listing.email" class="contact-information-list">
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Crect x='2' y='4' width='20' height='16' rx='2'/%3E%3Cpath d='M2 6l10 7 10-7'/%3E%3C/svg%3E" alt="" class="contact-information-icon">
                      <a :href="`mailto:${listing.contact_email || listing.email}`" class="contact-information-text">{{ listing.contact_email || listing.email }}</a>
                    </div>
                    <div v-if="listing.contact_website || listing.website_url" class="contact-information-list">
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/%3E%3C/svg%3E" alt="" class="contact-information-icon">
                      <a :href="(listing.contact_website || listing.website_url) || '#'" target="_blank" rel="noopener" class="contact-information-text">{{ (listing.contact_website || listing.website_url || '')?.replace(/^https?:\/\/(www\.)?/, '') }}</a>
                    </div>
                    <div v-if="listing.contact_address || listing.location" class="contact-information-list">
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/%3E%3Ccircle cx='12' cy='10' r='3'/%3E%3C/svg%3E" alt="" class="contact-information-icon">
                      <div class="contact-information-text">{{ listing.contact_address || listing.location }}</div>
                    </div>
                  </div>
                </div>

                <!-- Schedule Information -->
                <div class="contact-information-wrap">
                  <h5 class="contact-information-title">Schedule Information</h5>
                  <div class="contact-information-list-flex">
                    <div class="contact-information-list">
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolyline points='12 6 12 12 16 14'/%3E%3C/svg%3E" alt="" class="contact-information-icon">
                      <div class="contact-information-text">{{ scheduleInfo.time }}</div>
                    </div>
                    <div class="contact-information-list">
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Crect x='3' y='4' width='18' height='18' rx='2'/%3E%3Cpath d='M16 2v4M8 2v4M3 10h18'/%3E%3C/svg%3E" alt="" class="contact-information-icon">
                      <div class="contact-information-text">{{ scheduleInfo.days }}</div>
                    </div>
                    <div class="contact-information-list">
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Crect x='3' y='4' width='18' height='18' rx='2'/%3E%3Cpath d='M16 2v4M8 2v4M3 10h18'/%3E%3C/svg%3E" alt="" class="contact-information-icon">
                      <div class="contact-information-text">{{ scheduleInfo.weekend }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-wrapper {
  background-color: var(--body-background-color, #fdf5ed);
}

/* Page Section */
.page-section {
  background-image: url('/images/All-Bg.png');
  background-position: 50%;
  background-repeat: no-repeat;
  background-size: cover;
  padding: 84px 20px;
  position: relative;
  isolation: isolate;
}

.page-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 147, 154, 0.85) 0%, rgba(255, 147, 154, 0.78) 100%);
  z-index: -1;
}

.page-section-content {
  max-width: 1100px;
  margin: 0 auto;
  text-align: center;
}

.page-banner-title {
  width: 100%;
  max-width: 960px;
  color: var(--primary-color, #fff);
  text-align: center;
  margin: 0 auto;
  font-family: Marcellus, serif;
  font-size: clamp(34px, 4.4vw, 62px);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

/* Date and Time Section */
.date-and-time-section {
  background-color: #fff;
  border-bottom: 1px solid #e5ddd0;
  padding: 24px 20px;
}

.date-and-time-container {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.date-and-time-single {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-and-time-icon {
  width: 20px;
  height: 20px;
  color: #c41e3a;
  flex-shrink: 0;
}

.date-and-time-icon-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.date-and-time-boder {
  width: 1px;
  height: 24px;
  background-color: #ddd;
}

/* Listings Content Section */
.listings-content-section {
  padding: 60px 20px;
  background-color: #fdf5ed;
}

.container {
  max-width: 1350px;
  margin: 0 auto;
  padding: 0 15px;
}

.listings-page-single {
  display: block;
}

.listing-single-img {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 40px;
  display: block;
}

/* Two-Column Layout */
.listting-rice-text-flex {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.listting-rice-text-flex-left {
  min-width: 0;
}

.listting-right-flex {
  display: flex;
  flex-direction: column;
}

.listting-right {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Rich Text / Summary */
.rich-text {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 40px;
}

/* Gallery Section */
.vibrant-gallery {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 40px 0 24px 0;
  font-family: Marcellus, serif;
}

.vibrant-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.gallery-item-wrapper {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 12px;
  cursor: pointer;
}

.vibrant-gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.gallery-item-wrapper:hover .vibrant-gallery-img {
  transform: scale(1.05);
}

.load-more-section {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.load-more-btn {
  background: #c41e3a;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.load-more-btn:hover {
  background: #a01630;
}

/* Contact Information */
.contact-information-wrap {
  background: white;
  padding: 28px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.contact-information-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
}

.contact-information-list-flex {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-information-list {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.contact-information-icon {
  width: 20px;
  height: 20px;
  color: #c41e3a;
  flex-shrink: 0;
  margin-top: 2px;
}

.contact-information-text {
  font-size: 14px;
  color: #333;
  text-decoration: none;
  word-break: break-word;
  line-height: 1.6;
}

.contact-information-text:hover {
  color: #c41e3a;
  text-decoration: underline;
}

/* Loading & Error */
.listings-loading {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 20px;
  border: 4px solid #f0f0f0;
  border-top-color: #c41e3a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dynamic-listing-empty {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

/* Responsive */
@media (max-width: 1024px) {
  .listting-rice-text-flex {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .vibrant-gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-section {
    padding: 56px 20px;
  }

  .page-banner-title {
    font-size: 40px;
    margin-bottom: 16px;
  }

  .date-and-time-container {
    gap: 12px;
  }

  .date-and-time-boder {
    display: none;
  }

  .listings-content-section {
    padding: 40px 20px;
  }

  .listting-rice-text-flex {
    gap: 24px;
  }

  .vibrant-gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .contact-information-wrap {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .page-section {
    padding: 44px 16px;
  }

  .page-banner-title {
    font-size: 28px;
  }

  .date-and-time-container {
    flex-direction: column;
    gap: 12px;
  }

  .listings-content-section {
    padding: 24px 16px;
  }

  .listing-single-img {
    margin-bottom: 24px;
  }

  .vibrant-gallery {
    font-size: 20px;
    margin-top: 24px;
  }

  .vibrant-gallery-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .listting-rice-text-flex {
    gap: 20px;
  }

  .contact-information-wrap {
    padding: 16px;
    margin-bottom: 16px;
  }

  .contact-information-title {
    font-size: 16px;
    margin-bottom: 16px;
  }
}
</style>
