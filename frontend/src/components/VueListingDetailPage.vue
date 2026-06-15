<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchPublicListings, fetchPopularListings, type PublicListing } from '@/services/listings'
import { getImageUrl } from '@/utils/imageUrl'
import GalleryPreview from '@/components/GalleryPreview.vue'

const route = useRoute()
const router = useRouter()

const listing = ref<PublicListing | null>(null)
const popularListings = ref<PublicListing[]>([])
const isLoading = ref(true)
const loadError = ref('')
const showGalleryPreview = ref(false)
const galleryPreviewIndex = ref(0)

const galleryImages = computed(() => {
  if (!listing.value?.gallery) return []
  return [...new Set(listing.value.gallery)]
})

const contactInfo = computed(() => {
  if (!listing.value) return {}
  return {
    phone: listing.value.contact_phone || listing.value.phone || '',
    email: listing.value.contact_email || listing.value.email || '',
    website: listing.value.contact_website || listing.value.website_url || '',
    address: listing.value.contact_address || listing.value.location || '',
  }
})

const scheduleInfo = computed(() => {
  if (!listing.value) return {}
  const days = listing.value.open_days || listing.value.days || 'Monday - Saturday'
  const time = listing.value.open_time && listing.value.close_time
    ? `${listing.value.open_time.substring(0, 5)} - ${listing.value.close_time.substring(0, 5)}`
    : listing.value.hours || '09:00 AM - 06:00 PM'

  return { days, time, weekend: listing.value.weekend_text || 'Weekend: Sunday' }
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

    // Fetch popular listings
    try {
      const popular = await fetchPopularListings()
      const filtered = popular.filter(p => p.id !== found.id)
      popularListings.value = filtered.length > 0 ? filtered : popular
    } catch {
      console.warn('Could not load popular listings')
    }

    isLoading.value = false
  } catch (error) {
    console.error('Error loading listing:', error)
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

function goBack() {
  router.back()
}
</script>

<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="detail-loading">
    <div class="spinner"></div>
    <p>Loading listing details...</p>
  </div>

  <!-- Error State -->
  <div v-else-if="loadError" class="detail-error">
    <h2>{{ loadError }}</h2>
    <button @click="goBack" class="btn-back">← Go Back</button>
  </div>

  <!-- Detail Page -->
  <div v-else-if="listing" class="detail-page-wrapper">
    <!-- Gallery Preview Modal -->
    <GalleryPreview
      v-if="showGalleryPreview && galleryImages.length > 0"
      :images="galleryImages.map(img => getImageUrl(img))"
      :initialIndex="galleryPreviewIndex"
      @close="closeGalleryPreview"
    />

    <!-- Banner Section -->
    <section class="detail-banner">
      <div class="detail-banner-content">
        <button @click="goBack" class="btn-back-banner">← Back</button>
        <h1 class="detail-title">{{ listing.title }}</h1>
        <p class="detail-location">📍 {{ listing.location }}</p>
      </div>
    </section>

    <!-- Main Content -->
    <div class="detail-container">
      <!-- Featured Image -->
      <section v-if="listing.image" class="featured-image-section">
        <img :src="getImageUrl(listing.image)" :alt="listing.title" class="featured-image" />
        <span v-if="listing.category" class="category-badge">{{ listing.category }}</span>
      </section>

      <!-- Gallery Section -->
      <section v-if="galleryImages.length > 0" class="gallery-section">
        <h2 class="section-title">{{ listing.gallery_heading || 'Vibrant Gallery' }}</h2>
        <div class="gallery-grid">
          <div
            v-for="(image, index) in galleryImages.slice(0, 4)"
            :key="index"
            class="gallery-item"
            @click="openGalleryPreview(index)"
          >
            <img :src="getImageUrl(image)" :alt="`Gallery ${index + 1}`" />
            <div class="gallery-overlay">🔍</div>
          </div>
        </div>
        <button
          v-if="galleryImages.length > 4"
          @click="$emit('loadMore')"
          class="btn-load-more"
        >
          Load More ({{ galleryImages.length - 4 }} more)
        </button>
      </section>

      <!-- Summary Section -->
      <section class="summary-section">
        <p class="summary-text">{{ listing.summary }}</p>
      </section>

      <!-- Contact Information -->
      <section class="contact-section">
        <h2 class="section-title">Contact Information</h2>
        <div class="contact-grid">
          <div v-if="contactInfo.phone" class="contact-item">
            <span class="contact-icon">📱</span>
            <div>
              <label>Phone</label>
              <a :href="`tel:${contactInfo.phone}`" class="contact-value">{{ contactInfo.phone }}</a>
            </div>
          </div>
          <div v-if="contactInfo.email" class="contact-item">
            <span class="contact-icon">✉️</span>
            <div>
              <label>Email</label>
              <a :href="`mailto:${contactInfo.email}`" class="contact-value">{{ contactInfo.email }}</a>
            </div>
          </div>
          <div v-if="contactInfo.website" class="contact-item">
            <span class="contact-icon">🌐</span>
            <div>
              <label>Website</label>
              <a :href="contactInfo.website" target="_blank" rel="noopener" class="contact-value">
                {{ contactInfo.website.replace(/^https?:\/\/(www\.)?/, '') }}
              </a>
            </div>
          </div>
          <div class="contact-item">
            <span class="contact-icon">📍</span>
            <div>
              <label>Address</label>
              <p class="contact-value">{{ contactInfo.address }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Schedule Section -->
      <section class="schedule-section">
        <h2 class="section-title">Business Hours</h2>
        <div class="schedule-grid">
          <div class="schedule-item">
            <span class="schedule-icon">📅</span>
            <div>
              <label>Days</label>
              <p class="schedule-value">{{ scheduleInfo.days }}</p>
            </div>
          </div>
          <div class="schedule-item">
            <span class="schedule-icon">🕐</span>
            <div>
              <label>Hours</label>
              <p class="schedule-value">{{ scheduleInfo.time }}</p>
            </div>
          </div>
          <div class="schedule-item">
            <span class="schedule-icon">🎉</span>
            <div>
              <label>Weekend</label>
              <p class="schedule-value">{{ scheduleInfo.weekend }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Details Section -->
      <section v-if="listing.details_paragraphs?.length" class="details-section">
        <h2 class="section-title">{{ listing.details_heading || 'Details' }}</h2>
        <div class="details-content">
          <p v-for="(para, idx) in listing.details_paragraphs" :key="idx" class="detail-paragraph">
            {{ para }}
          </p>
        </div>
      </section>

      <!-- Facilities Section -->
      <section v-if="listing.facilities?.length" class="facilities-section">
        <h2 class="section-title">{{ listing.facilities_heading || 'Facilities' }}</h2>
        <ul class="facilities-list">
          <li v-for="(facility, idx) in listing.facilities" :key="idx">
            <span class="facility-icon">✓</span>
            <span>{{ facility }}</span>
          </li>
        </ul>
      </section>

      <!-- Popular Listings Section -->
      <section v-if="popularListings.length > 0" class="popular-section">
        <h2 class="section-title">You Might Also Like</h2>
        <div class="popular-grid">
          <a
            v-for="item in popularListings"
            :key="item.id"
            :href="`/listings/${item.slug}`"
            class="popular-card"
          >
            <div class="popular-card-image">
              <img :src="getImageUrl(item.image)" :alt="item.title" />
            </div>
            <div class="popular-card-content">
              <h3 class="popular-card-title">{{ item.title }}</h3>
              <p class="popular-card-category">{{ item.category }}</p>
              <p class="popular-card-location">📍 {{ item.location }}</p>
            </div>
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Loading & Error States */
.detail-loading,
.detail-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f0f0f0;
  border-top-color: #c41e3a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.detail-loading p,
.detail-error h2 {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.btn-back {
  background: #c41e3a;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.3s;
}

.btn-back:hover {
  background: #a01630;
}

/* Banner Section */
.detail-banner {
  background: linear-gradient(135deg, #ff939a 0%, #ffb3b8 100%);
  padding: 40px 20px;
  position: relative;
}

.detail-banner-content {
  max-width: 1200px;
  margin: 0 auto;
}

.btn-back-banner {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
  transition: background 0.3s;
}

.btn-back-banner:hover {
  background: rgba(255, 255, 255, 0.5);
}

.detail-title {
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
  font-family: 'Marcellus', serif;
}

.detail-location {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
}

/* Main Container */
.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Featured Image */
.featured-image-section {
  position: relative;
  margin-bottom: 40px;
  border-radius: 16px;
  overflow: hidden;
}

.featured-image {
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: cover;
  display: block;
}

.category-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  background: white;
  color: #1a1a1a;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
}

/* Gallery Section */
.gallery-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 24px;
  font-family: 'Marcellus', serif;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.gallery-item {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 12px;
  cursor: pointer;
  background: #f0f0f0;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

.gallery-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  transition: background 0.3s;
}

.gallery-item:hover .gallery-overlay {
  background: rgba(0, 0, 0, 0.4);
}

.btn-load-more {
  display: block;
  margin: 0 auto;
  background: #c41e3a;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-load-more:hover {
  background: #a01630;
}

/* Summary Section */
.summary-section {
  margin-bottom: 40px;
  padding: 24px;
  background: #f9f9f9;
  border-radius: 12px;
}

.summary-text {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
}

/* Contact Section */
.contact-section {
  margin-bottom: 40px;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.contact-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
  border-left: 4px solid #c41e3a;
}

.contact-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.contact-item label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.contact-value {
  font-size: 16px;
  color: #1a1a1a;
  text-decoration: none;
  word-break: break-word;
}

.contact-value:hover {
  color: #c41e3a;
  text-decoration: underline;
}

/* Schedule Section */
.schedule-section {
  margin-bottom: 40px;
}

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.schedule-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #fff5f7;
  border-radius: 12px;
  border: 1px solid #ffdddf;
}

.schedule-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.schedule-item label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.schedule-value {
  font-size: 16px;
  color: #1a1a1a;
  font-weight: 500;
}

/* Details Section */
.details-section {
  margin-bottom: 40px;
}

.details-content {
  padding: 24px;
  background: #f9f9f9;
  border-radius: 12px;
  border-left: 4px solid #c41e3a;
}

.detail-paragraph {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 16px;
}

.detail-paragraph:last-child {
  margin-bottom: 0;
}

/* Facilities Section */
.facilities-section {
  margin-bottom: 40px;
}

.facilities-list {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.facilities-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f0f8f5;
  border-radius: 8px;
  border-left: 3px solid #27ae60;
}

.facility-icon {
  color: #27ae60;
  font-weight: bold;
}

.facilities-list span {
  font-size: 15px;
  color: #1a1a1a;
}

/* Popular Section */
.popular-section {
  margin-top: 60px;
  padding-top: 40px;
  border-top: 2px solid #ddd;
}

.popular-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.popular-card {
  text-decoration: none;
  color: inherit;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.popular-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.popular-card-image {
  width: 100%;
  aspect-ratio: 16 / 9;
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
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.popular-card-category {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 8px;
}

.popular-card-location {
  font-size: 14px;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .detail-title {
    font-size: 28px;
  }

  .detail-container {
    padding: 24px 16px;
  }

  .section-title {
    font-size: 22px;
  }

  .contact-grid {
    grid-template-columns: 1fr;
  }

  .schedule-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .popular-grid {
    grid-template-columns: 1fr;
  }

  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .detail-banner {
    padding: 24px 16px;
  }

  .detail-title {
    font-size: 24px;
  }

  .detail-location {
    font-size: 16px;
  }

  .detail-container {
    padding: 20px 16px;
  }

  .section-title {
    font-size: 20px;
  }

  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .contact-item,
  .schedule-item,
  .facilities-list li {
    flex-direction: column;
  }

  .schedule-grid {
    grid-template-columns: 1fr;
  }
}
</style>
