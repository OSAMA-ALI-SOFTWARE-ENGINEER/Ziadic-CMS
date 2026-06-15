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
const visibleGalleryCount = ref(4)

const galleryImages = computed(() => {
  if (!listing.value?.gallery) return []
  return [...new Set(listing.value.gallery)]
})

const visibleGalleryImages = computed(() => galleryImages.value.slice(0, visibleGalleryCount.value))

const hasMoreGalleryImages = computed(() => galleryImages.value.length > visibleGalleryCount.value)

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

    <!-- Page Banner Section -->
    <section class="section page-section">
      <div class="page-section-content">
        <h1 class="page-banner-title">{{ listing.title }}</h1>
        <div class="page-link-flex">
          <router-link to="/" class="page-link">
            <div class="page-link-text">Home</div>
          </router-link>
          <span class="divider">|</span>
          <span class="page-link">
            <div class="page-link-text">{{ listing.category }}</div>
          </span>
        </div>
      </div>
    </section>

    <!-- Info Bar with Location, Days, Hours -->
    <section class="info-bar-section">
      <div class="info-bar-container">
        <div class="info-item">
          <span class="info-icon">📍</span>
          <span class="info-text">{{ listing.contact_address || listing.location }}</span>
        </div>
        <div class="info-divider"></div>
        <div class="info-item">
          <span class="info-icon">📅</span>
          <span class="info-text">{{ scheduleInfo.days }}</span>
        </div>
        <div class="info-divider"></div>
        <div class="info-item">
          <span class="info-icon">🕐</span>
          <span class="info-text">{{ scheduleInfo.time }}</span>
        </div>
      </div>
    </section>

    <!-- Featured Image -->
    <section class="featured-image-section">
      <img v-if="listing.image" :src="getImageUrl(listing.image)" :alt="listing.title" class="featured-image">
    </section>

    <!-- Main Content Section -->
    <section class="listings-content-section">
      <div class="container">
        <div class="listings-page-single">
          <!-- Two Column Layout -->
          <div class="listting-rice-text-flex">
            <!-- Left Column: Details, Gallery -->
            <div class="listting-rice-text-flex-left">
              <!-- Details Section -->
              <div v-if="listing.details_heading || listing.description" class="details-box">
                <h3 class="details-heading">{{ listing.details_heading || listing.business_name || 'Details' }}</h3>
                <p v-if="listing.description" class="details-text">{{ listing.description }}</p>
                <p v-if="listing.summary && listing.summary !== listing.description" class="details-text">{{ listing.summary }}</p>
              </div>

              <!-- Facilities Section -->
              <div v-if="listing.facilities && listing.facilities.length > 0" class="facilities-box">
                <h4 class="facilities-heading">{{ listing.facilities_heading || 'Facilities Available' }}</h4>
                <div class="facilities-grid">
                  <div v-for="(facility, idx) in listing.facilities" :key="idx" class="facility-item">
                    <span class="facility-dot">●</span>
                    <span class="facility-name">{{ facility }}</span>
                  </div>
                </div>
              </div>

              <!-- Gallery Section -->
              <div v-if="galleryImages.length > 0" class="gallery-section">
                <h4 class="gallery-heading">{{ listing.gallery_heading || 'Vibrant Gallery' }}</h4>
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
              <!-- Contact Information Box -->
              <div v-if="listing.contact_phone || listing.contact_email || listing.contact_website || listing.contact_address" class="contact-information-wrap">
                <h5 class="contact-information-title">Contact Information</h5>
                <div class="contact-information-list-flex">
                  <div v-if="listing.contact_phone || listing.phone" class="contact-information-list">
                    <span class="contact-icon">☎</span>
                    <a :href="`tel:${listing.contact_phone || listing.phone}`" class="contact-information-text">{{ listing.contact_phone || listing.phone }}</a>
                  </div>
                  <div v-if="listing.contact_email || listing.email" class="contact-information-list">
                    <span class="contact-icon">✉</span>
                    <a :href="`mailto:${listing.contact_email || listing.email}`" class="contact-information-text">{{ listing.contact_email || listing.email }}</a>
                  </div>
                  <div v-if="listing.contact_website || listing.website_url" class="contact-information-list">
                    <span class="contact-icon">🌐</span>
                    <a :href="(listing.contact_website || listing.website_url) || '#'" target="_blank" rel="noopener" class="contact-information-text">
                      {{ ((listing.contact_website || listing.website_url) || '').replace(/^https?:\/\/(www\.)?/, '') }}
                    </a>
                  </div>
                  <div v-if="listing.contact_address || listing.location" class="contact-information-list">
                    <span class="contact-icon">📍</span>
                    <span class="contact-information-text">{{ listing.contact_address || listing.location }}</span>
                  </div>
                </div>
              </div>

              <!-- Schedule Information Box -->
              <div class="contact-information-wrap">
                <h5 class="contact-information-title">Schedule Information</h5>
                <div class="contact-information-list-flex">
                  <div class="contact-information-list">
                    <span class="contact-icon">🕐</span>
                    <span class="contact-information-text">{{ scheduleInfo.time }}</span>
                  </div>
                  <div class="contact-information-list">
                    <span class="contact-icon">📅</span>
                    <span class="contact-information-text">{{ scheduleInfo.days }}</span>
                  </div>
                  <div class="contact-information-list">
                    <span class="contact-icon">📅</span>
                    <span class="contact-information-text">{{ scheduleInfo.weekend }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="section cta">
      <div class="container">
        <div class="cta-wtapper">
          <div class="cta-left">
            <div class="section-title-cta-wrap">
              <h2 class="section-title cta">Ready to Start? Click to Unlock Our Urban Wonders!</h2>
              <img src="/images/Blog.png" alt="" class="section-title-shape">
            </div>
            <div class="button-wrap left">
              <router-link to="/listings" class="primary-button white">
                <div class="style-button-text white">Explore Listings</div>
                <div class="button-color active"></div>
              </router-link>
              <router-link to="/add-listing" class="primary-button out-white">
                <div class="style-button-text">Add a Listing</div>
                <div class="button-color"></div>
              </router-link>
            </div>
          </div>
          <div class="cta-right">
            <div class="cta-img">
              <img src="/images/Mask-group.png" alt="" class="cta-img-1 _1">
              <img src="/images/Cta1.png" alt="" class="cta-img-1 _3">
              <img src="/images/Mask-group-1.png" alt="" class="cta-img-1 _2">
              <img src="/images/Best-Listing-Tab-Pane-Shape.png" alt="" class="cta-img-shape1">
              <img src="/images/cta-shap_1cta-shap.png" alt="" class="cta-img-shape2">
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
  font-size: clamp(34px, 4.4vw, 62px);
  font-weight: 400;
  color: #c41e3a;
  margin: 0 0 18px 0;
  font-family: Marcellus, serif;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.page-link-flex {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  width: fit-content;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(6px);
  border-radius: 999px;
  padding: 9px 16px;
}

.page-link {
  text-decoration: none;
  color: #c41e3a;
  display: inline-flex;
  align-items: center;
}

.page-link-text {
  font-size: clamp(13px, 0.95vw, 16px);
  color: #c41e3a;
  font-weight: 500;
}

.divider {
  color: #c41e3a;
  margin: 0 6px;
}

/* Info Bar Section */
.info-bar-section {
  background: #fff;
  border-bottom: 1px solid #e5ddd0;
  padding: 20px;
}

.info-bar-container {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  border: 2px solid #c41e3a;
  border-radius: 12px;
  padding: 20px 30px;
  background: #fdf5ed;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  color: #c41e3a;
  font-weight: 500;
}

.info-icon {
  font-size: 20px;
}

.info-divider {
  width: 1px;
  height: 24px;
  background: #c41e3a;
}

/* Featured Image */
.featured-image-section {
  padding: 30px 20px;
  background: #fdf5ed;
}

.featured-image {
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  border-radius: 16px;
  border: 3px solid #c41e3a;
  display: block;
  max-height: 500px;
  object-fit: cover;
}

/* Listings Content Section */
.listings-content-section {
  padding: 60px 20px;
  background: #fdf5ed;
}

.container {
  max-width: 1350px;
  margin: 0 auto;
  padding: 0 15px;
}

.listings-page-single {
  display: block;
}

/* Two Column Layout */
.listting-rice-text-flex {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 40px;
}

.listting-rice-text-flex-left {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.listting-right-flex {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Details Box */
.details-box {
  border: 2px solid #c41e3a;
  border-radius: 12px;
  padding: 28px;
  background: #fff;
}

.details-heading {
  font-size: 28px;
  font-weight: 600;
  color: #c41e3a;
  margin: 0 0 16px 0;
  font-family: Marcellus, serif;
}

.details-text {
  font-size: 16px;
  color: #c41e3a;
  line-height: 1.8;
  margin: 0 0 12px 0;
}

.details-text:last-child {
  margin-bottom: 0;
}

/* Facilities Box */
.facilities-box {
  border: 2px solid #c41e3a;
  border-radius: 12px;
  padding: 28px;
  background: #fff;
}

.facilities-heading {
  font-size: 28px;
  font-weight: 600;
  color: #c41e3a;
  margin: 0 0 20px 0;
  font-family: Marcellus, serif;
}

.facilities-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.facility-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  color: #c41e3a;
}

.facility-dot {
  color: #c41e3a;
  font-size: 12px;
  font-weight: bold;
}

/* Gallery Section */
.gallery-section {
  margin-top: 30px;
}

.gallery-heading {
  font-size: 28px;
  font-weight: 600;
  color: #c41e3a;
  margin: 0 0 24px 0;
  font-family: Marcellus, serif;
}

.vibrant-gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.gallery-item-wrapper {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 12px;
  cursor: pointer;
  border: 2px solid #c41e3a;
  background: #f0f0f0;
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
  background: #fff;
  border: 2px solid #c41e3a;
  border-radius: 12px;
  padding: 28px;
}

.contact-information-title {
  font-size: 24px;
  font-weight: 600;
  color: #c41e3a;
  margin: 0 0 20px 0;
  font-family: Marcellus, serif;
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

.contact-icon {
  font-size: 20px;
  color: #c41e3a;
  flex-shrink: 0;
  margin-top: 2px;
}

.contact-information-text {
  font-size: 16px;
  color: #c41e3a;
  text-decoration: none;
  word-break: break-word;
  line-height: 1.6;
}

.contact-information-text:hover {
  text-decoration: underline;
}

/* CTA Section */
.section.cta {
  padding: 60px 20px;
  position: relative;
  background: linear-gradient(rgba(90, 50, 30, 0.95), rgba(90, 50, 30, 0.95)), url('/images/All-Bg.png');
  background-size: cover;
  background-position: center;
  min-height: 500px;
  display: flex;
  align-items: center;
}

.cta-wtapper {
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.cta-left {
  color: white;
  z-index: 2;
  position: relative;
}

.section-title-cta-wrap {
  position: relative;
  margin-bottom: 40px;
}

.section-title.cta {
  font-size: clamp(32px, 5vw, 56px);
  font-weight: 400;
  color: white;
  margin: 0 0 20px 0;
  font-family: Marcellus, serif;
  line-height: 1.2;
  text-wrap: balance;
}

.section-title-shape {
  width: 80px;
  height: auto;
  margin-top: 10px;
}

.button-wrap.left {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.primary-button {
  position: relative;
  display: inline-block;
  padding: 14px 28px;
  text-decoration: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  transition: all 0.3s ease;
  background: #f4d35e;
  color: #333;
}

.primary-button.white {
  background: #f4d35e;
  color: #333;
}

.primary-button.white:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(244, 211, 94, 0.4);
}

.primary-button.out-white {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.primary-button.out-white:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.style-button-text {
  font-size: 16px;
  font-weight: 600;
  display: block;
}

.style-button-text.white {
  color: #333;
}

.button-color {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0;
  background: rgba(0, 0, 0, 0.1);
  transition: height 0.3s ease;
  z-index: -1;
}

.button-color.active {
  height: 100%;
}

.cta-right {
  position: relative;
  z-index: 1;
  min-height: 350px;
}

.cta-img {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 350px;
}

.cta-img-1 {
  position: absolute;
  width: auto;
  height: auto;
  max-width: 100%;
  object-fit: contain;
}

.cta-img-1._1 {
  width: 160px;
  bottom: 10%;
  left: 0;
  z-index: 2;
}

.cta-img-1._2 {
  width: 140px;
  bottom: 5%;
  right: 10%;
  z-index: 1;
}

.cta-img-1._3 {
  width: 200px;
  top: 15%;
  right: 15%;
  z-index: 3;
}

.cta-img-shape1,
.cta-img-shape2 {
  position: absolute;
  opacity: 0.6;
  pointer-events: none;
}

.cta-img-shape1 {
  width: 250px;
  top: -50px;
  right: -30px;
  z-index: 0;
}

.cta-img-shape2 {
  width: 200px;
  bottom: -40px;
  left: -20px;
  z-index: 0;
}

/* Loading */
.listings-loading {
  text-align: center;
  padding: 80px 20px;
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

/* Responsive */
@media (max-width: 1024px) {
  .listting-rice-text-flex {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .vibrant-gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .info-bar-container {
    flex-direction: column;
    gap: 12px;
  }

  .info-divider {
    display: none;
  }

  .cta-wtapper {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .cta-right {
    min-height: 250px;
  }

  .cta-img-1._1,
  .cta-img-1._2,
  .cta-img-1._3 {
    width: 120px;
  }
}

@media (max-width: 768px) {
  .page-section {
    padding: 56px 20px;
  }

  .page-banner-title {
    font-size: 40px;
  }

  .info-bar-container {
    padding: 16px 20px;
  }

  .listings-content-section {
    padding: 40px 20px;
  }

  .vibrant-gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .details-box,
  .facilities-box,
  .contact-information-wrap {
    padding: 20px;
  }

  .details-heading,
  .facilities-heading,
  .contact-information-title {
    font-size: 20px;
  }

  .section.cta {
    padding: 40px 20px;
    min-height: auto;
  }

  .cta-wtapper {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .section-title.cta {
    font-size: 32px;
  }

  .cta-right {
    display: none;
  }
}

@media (max-width: 480px) {
  .page-section {
    padding: 44px 16px;
  }

  .page-banner-title {
    font-size: 28px;
  }

  .info-bar-container {
    padding: 16px 12px;
    gap: 8px;
    border-radius: 8px;
  }

  .info-item {
    font-size: 14px;
  }

  .featured-image-section {
    padding: 16px;
  }

  .listings-content-section {
    padding: 24px 16px;
  }

  .listting-rice-text-flex {
    gap: 20px;
  }

  .vibrant-gallery-grid {
    grid-template-columns: 1fr;
  }

  .details-box,
  .facilities-box,
  .contact-information-wrap {
    padding: 16px;
  }

  .details-heading,
  .facilities-heading,
  .contact-information-title {
    font-size: 18px;
  }

  .button-wrap.left {
    flex-direction: column;
  }

  .primary-button {
    width: 100%;
    text-align: center;
  }

  .section.cta {
    padding: 30px 16px;
  }

  .section-title.cta {
    font-size: 24px;
  }

  .cta-left {
    text-align: center;
  }
}
</style>
