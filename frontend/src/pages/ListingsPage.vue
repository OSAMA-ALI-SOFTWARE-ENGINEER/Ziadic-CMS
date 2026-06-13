<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchPublicCatalog, fetchPublicListings, type PublicCatalog, type PublicListing } from '@/services/listings'

const route = useRoute()
const router = useRouter()

const catalog = ref<PublicCatalog>({
  countries: [],
  cities: [],
  categories: [],
  popular: { countries: [], cities: [], categories: [] },
})
const listings = ref<PublicListing[]>([])
const isLoading = ref(true)
const loadError = ref('')

function queryValue(key: string) {
  const value = route.query[key]
  return Array.isArray(value) ? value[0] || '' : value || ''
}

const selectedCountry = computed(() => queryValue('country'))
const selectedCity = computed(() => queryValue('city'))
const selectedCategory = computed(() => queryValue('category'))

const availableCities = computed(() => {
  if (!selectedCountry.value) return []
  return catalog.value.cities.filter((c) => c.country?.iso2 === selectedCountry.value)
})

const selectedCountryName = computed(() => {
  return catalog.value.countries.find((c) => c.iso2 === selectedCountry.value)?.name || ''
})

const selectedCityName = computed(() => {
  return catalog.value.cities.find((c) => c.slug === selectedCity.value)?.name || ''
})

const selectedCategoryName = computed(() => {
  return catalog.value.categories.find((c) => c.slug === selectedCategory.value)?.name || ''
})

const bannerTitle = computed(() => {
  const parts = [selectedCategoryName.value, selectedCityName.value, selectedCountryName.value].filter(Boolean)
  return parts.length ? `${parts.join(' / ')} Places` : 'Listings'
})

const titleSummary = computed(() => {
  const parts = [selectedCategoryName.value, selectedCityName.value, selectedCountryName.value].filter(Boolean)
  return parts.length ? `${parts.join(' / ')} Places` : 'Discover Abundance of Listings.'
})

const placesCount = computed(() => listings.value.length)

async function fetchListings() {
  isLoading.value = true
  loadError.value = ''
  try {
    listings.value = await fetchPublicListings({
      country: selectedCountry.value || undefined,
      city: selectedCity.value || undefined,
      category: selectedCategory.value || undefined,
    })
  } catch {
    listings.value = []
    loadError.value = 'Unable to load listings. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function setFilter(key: string, value: string) {
  const query = { ...route.query }
  if (value) {
    query[key] = value
  } else {
    delete query[key]
  }
  if (key === 'country') {
    delete query.city
  }
  router.push({ path: '/listings', query })
}

function resetFilters() {
  router.push({ path: '/listings' })
}

function getImageUrl(path?: string | null): string {
  if (!path) return '/assets/images/1.png'
  if (path.startsWith('http')) return path
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  return `${backendUrl}/${path.replace(/^\/+/, '')}`
}

function normalizeFilterQuery() {
  if (!selectedCountry.value && selectedCity.value) {
    const city = catalog.value.cities.find((item) => item.slug === selectedCity.value)
    if (city?.country?.iso2) {
      router.replace({
        query: {
          ...route.query,
          country: city.country.iso2,
        },
      })
    }
  }

  if (selectedCountry.value && selectedCity.value) {
    const cityBelongsToCountry = catalog.value.cities.some(
      (city) => city.slug === selectedCity.value && city.country?.iso2 === selectedCountry.value,
    )
    if (!cityBelongsToCountry) {
      const query = { ...route.query }
      delete query.city
      router.replace({ path: '/listings', query })
    }
  }
}

watch([selectedCountry, selectedCity, selectedCategory], fetchListings)

onMounted(async () => {
  try {
    catalog.value = await fetchPublicCatalog()
    normalizeFilterQuery()
    await fetchListings()
  } catch {
    loadError.value = 'Unable to load listing filters. Please refresh the page.'
  }
})
</script>

<template>
  <div class="page-wrapper">
    <!-- Page Banner Section (Webflow Style - Centered) -->
    <section class="section page-section">
      <div class="page-section-content">
        <h1 class="page-banner-title">{{ bannerTitle }}</h1>
        <div class="page-link-flex">
          <router-link to="/" class="page-link">
            <div class="page-link-text">Home</div>
          </router-link>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M9 18l6-6-6-6'/%3E%3C/svg%3E" alt="" class="divider-img">
          <span class="page-link">
            <div class="page-link-text">{{ bannerTitle }}</div>
          </span>
        </div>
      </div>
    </section>

    <!-- Filters Section -->
    <div class="section listing-filters-section">
      <div class="listing-container">
        <div class="dynamic-listing-filters">
          <div class="dynamic-listing-filters__header">
            <div>
              <strong>Find places</strong>
              <span
                >{{ placesCount }} place{{ placesCount === 1 ? '' : 's' }} found{{
                  selectedCountryName ? ` in ${selectedCountryName}` : ''
                }}{{ selectedCityName ? `, ${selectedCityName}` : ''
                }}{{ selectedCategoryName ? ` for ${selectedCategoryName}` : '' }}</span
              >
            </div>
            <a v-if="selectedCountry || selectedCity || selectedCategory" @click.prevent="resetFilters" href="#" class="dynamic-listing-filters__reset">Reset filters</a>
          </div>
          <div class="dynamic-listing-filters__grid">
            <label>
              <span>Country</span>
              <select :value="selectedCountry" @change="(e) => setFilter('country', (e.target as HTMLSelectElement).value)">
                <option value="">Select country</option>
                <option
                  v-for="country in catalog.countries"
                  :key="country.iso2"
                  :value="country.iso2"
                >
                  {{ country.name }} ({{ country.places_count }})
                </option>
              </select>
            </label>
            <label :class="{ 'is-disabled': !selectedCountry }">
              <span>City</span>
              <select
                :value="selectedCity"
                :disabled="!selectedCountry"
                @change="(e) => setFilter('city', (e.target as HTMLSelectElement).value)"
              >
                <option value="">{{ selectedCountry ? 'All cities' : 'Select country first' }}</option>
                <option v-for="city in availableCities" :key="city.slug" :value="city.slug">
                  {{ city.name }} ({{ city.places_count }})
                </option>
              </select>
            </label>
            <label>
              <span>Category</span>
              <select :value="selectedCategory" @change="(e) => setFilter('category', (e.target as HTMLSelectElement).value)">
                <option value="">All categories</option>
                <option v-for="category in catalog.categories" :key="category.slug" :value="category.slug">
                  {{ category.name }} ({{ category.places_count }})
                </option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Listings Section -->
    <div class="section listing-content-section">
      <div class="listing-container">
        <h2 class="section-title listing">{{ titleSummary }}</h2>

        <div v-if="isLoading" class="listings-loading">
          <div class="spinner"></div>
          <p>Loading listings...</p>
        </div>

        <div v-else-if="loadError" class="dynamic-listing-empty">
          <p>{{ loadError }}</p>
        </div>

        <div v-else-if="placesCount === 0" class="dynamic-listing-empty">
          <p>No places found for this filter.</p>
          <p class="empty-help-text">Try adjusting your filters or selecting a different category.</p>
        </div>

        <div v-else class="listings-page-wrapper">
          <div class="listings-grid">
            <router-link
              v-for="listing in listings"
              :key="listing.slug"
              :to="`/listings/${listing.slug}`"
              class="listings-page-collection-item listing-card"
            >
              <div class="listing-card-inner-bg" aria-hidden="true"></div>

              <div class="listing-card-image-wrap">
              <div class="listing-card-image">
                <img
                  :src="getImageUrl(listing.image)"
                  :alt="listing.title"
                  loading="lazy"
                />
                <div v-if="listing.category" class="listing-category-badge">{{ listing.category }}</div>
              </div>
              </div>

              <div class="listing-card-content">
                <h3 class="listing-card-title">{{ listing.title }}</h3>
                <p v-if="listing.contact_address" class="listing-card-address">
                  <span class="listing-card-address-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 22C12 22 19 15.75 19 10.5C19 6.35786 15.866 3 12 3C8.13401 3 5 6.35786 5 10.5C5 15.75 12 22 12 22Z"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <circle cx="12" cy="10.5" r="2.5" stroke="currentColor" stroke-width="1.8" />
                    </svg>
                  </span>
                  <span>{{ listing.contact_address }}</span>
                </p>

                <p v-if="listing.days && listing.hours" class="listing-card-hours">
                  {{ listing.days }} / {{ listing.hours }}
                </p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  background-color: var(--body-background-color, #fdf5ed);
}

/* Page Banner Section */
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
  color: var(--primary-color);
  text-align: center;
  margin: 0 auto 18px;
  font-family: var(--marcellus-font-family, Marcellus, serif);
  font-size: clamp(34px, 4.4vw, 62px);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

.page-link-flex {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  width: fit-content;
  margin-inline: auto;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(6px);
  border-radius: 999px;
  padding: 9px 16px;
}

.page-link {
  text-decoration: none;
  color: inherit;
  display: inline-flex;
  align-items: center;
}

.page-link-text {
  font-size: clamp(13px, 0.95vw, 16px);
  color: var(--primary-color);
  font-weight: 500;
  transition: opacity 0.3s ease;
}

.page-link:hover .page-link-text {
  opacity: 0.8;
}

.divider-img {
  width: 24px;
  height: 24px;
  color: var(--primary-color);
  stroke: currentColor;
  flex-shrink: 0;
}

/* Filter Section */
.listing-filters-section {
  padding: 40px 0;
  background-color: #fff;
  border-bottom: 1px solid #e5ddd0;
}

.dynamic-listing-filters {
  width: 100%;
}

.dynamic-listing-filters__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 20px;
}

.dynamic-listing-filters__header > div {
  flex: 1;
}

.dynamic-listing-filters__header strong {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.dynamic-listing-filters__header span {
  font-size: 14px;
  color: #666;
}

.dynamic-listing-filters__reset {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid var(--primary-color);
  padding: 4px 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
  cursor: pointer;
}

.dynamic-listing-filters__reset:hover {
  color: white;
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  padding: 4px 8px;
  border-radius: 4px;
  border-bottom: 1px solid var(--primary-color);
}

.dynamic-listing-filters__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.dynamic-listing-filters__grid label {
  display: flex;
  flex-direction: column;
}

.dynamic-listing-filters__grid label span {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dynamic-listing-filters__grid select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #1a1a1a;
  background-color: #fff;
  cursor: pointer;
}

.dynamic-listing-filters__grid select:hover {
  border-color: #c41e3a;
}

.dynamic-listing-filters__grid select:focus {
  outline: none;
  border-color: #c41e3a;
  box-shadow: 0 0 0 3px rgba(196, 30, 58, 0.1);
}

.dynamic-listing-filters__grid label.is-disabled {
  opacity: 0.5;
}

.dynamic-listing-filters__grid label.is-disabled select {
  cursor: not-allowed;
  background-color: #f5f5f5;
}

.listing-content-section {
  padding: 60px 0;
  background-color: #fdf5ed;
}

.section-title {
  font-size: clamp(28px, 3vw, 46px);
  font-weight: 400;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 40px;
  font-family: Marcellus, serif;
  line-height: 1.12;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

/* Loading State */
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

.listings-loading p {
  font-size: 18px;
  margin: 0;
}

/* Empty State */
.dynamic-listing-empty {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.dynamic-listing-empty p {
  font-size: 18px;
  margin: 0 0 8px 0;
}

.empty-help-text {
  color: #999 !important;
  font-size: 16px;
}

.listings-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
}

.listings-page-collection-item {
  position: relative;
  text-decoration: none;
  color: inherit;
  display: block;
  border-radius: 28px;
  padding: 4px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 8px 22px rgba(30, 16, 6, 0.12);
  transition: transform 0.32s ease, box-shadow 0.32s ease;
}

.listing-card {
  background-color: var(--body-background-color);
}

.listings-page-collection-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 30px rgba(30, 16, 6, 0.18);
}

.listing-card-inner-bg {
  z-index: 1;
  position: absolute;
  inset: 0;
  background-color: var(--pink);
  transform: translate3d(0, 101%, 0);
  transition: transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform;
}

.listing-card-image-wrap,
.listing-card-content {
  position: relative;
  z-index: 2;
}

.listings-page-collection-item:hover .listing-card-inner-bg {
  transform: translate3d(0, 0, 0);
}

.listing-card-image-wrap {
  padding: 0;
}

.listing-card-image {
  position: relative;
  width: 100%;
  padding-bottom: 62%;
  border-radius: 24px;
  overflow: hidden;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}


.listing-card-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform;
}

.listings-page-collection-item:hover .listing-card-image img {
  transform: scale3d(1.016, 1.016, 1);
}

.listings-page-collection-item:focus-visible .listing-card-inner-bg {
  transform: translate3d(0, 0, 0);
}

.listings-page-collection-item:focus-visible .listing-card-image img {
  transform: scale3d(1.016, 1.016, 1);
}

.listing-category-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #fff;
  color: #171717;
  padding: 9px 13px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0;
  text-transform: none;
}

.listing-card-content {
  padding: 22px 22px 24px;
}

.listing-card-title {
  margin: 0 0 12px;
  color: var(--black);
  font-size: clamp(24px, 1.9vw, 34px);
  font-weight: 400;
  line-height: 1.15;
  font-family: var(--marcellus-font-family, Marcellus, serif);
  text-wrap: balance;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.listing-card-address {
  margin: 0 0 12px;
  color: var(--black);
  font-size: clamp(14px, 0.98vw, 17px);
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.listing-card-address-icon {
  color: var(--primary-color);
  width: 20px;
  height: 20px;
  flex: none;
  margin-top: 2px;
}

.listing-card-address-icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

.listing-card-hours {
  font-size: clamp(12px, 0.84vw, 14px);
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.listing-container {
  width: 100%;
  max-width: 1350px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 15px;
  padding-right: 15px;
}

.w-container {
  width: 100%;
  max-width: 1350px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 15px;
  padding-right: 15px;
}

.section {
  position: relative;
  display: block;
}

@media (max-width: 1024px) {
  .page-banner-title {
    font-size: 40px;
  }

  .listings-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }

  .dynamic-listing-filters__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-section {
    padding: 56px 20px;
  }

  .page-banner-title {
    font-size: clamp(30px, 7vw, 40px);
    margin-bottom: 16px;
  }

  .page-link-flex {
    gap: 10px;
  }

  .page-link-text {
    font-size: 13px;
  }

  .section-title {
    font-size: 30px;
    margin-bottom: 32px;
  }

  .dynamic-listing-filters {
    max-width: 100%;
  }

  .dynamic-listing-filters__grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .dynamic-listing-filters__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .dynamic-listing-filters__header strong {
    font-size: 16px;
  }

  .dynamic-listing-filters__header span {
    font-size: 13px;
  }

  .listings-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .listing-card-image-wrap {
    padding: 0;
  }

  .listing-card-image {
    border-radius: 20px;
  }

  .listing-filters-section {
    padding: 24px 0;
  }

  .listing-content-section {
    padding: 32px 0;
  }

  .listings-loading {
    padding: 60px 20px;
  }

  .dynamic-listing-empty {
    padding: 60px 20px;
  }

  .listing-card-title {
    font-size: 28px;
  }

  .listing-card-address {
    font-size: 14px;
  }

  .listing-card-hours {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .page-section {
    padding: 44px 16px;
  }

  .page-banner-title {
    font-size: 28px;
    margin-bottom: 14px;
  }

  .page-link-text {
    font-size: 12px;
  }

  .divider-img {
    width: 20px;
    height: 20px;
  }

  .section-title {
    font-size: 24px;
    margin-bottom: 24px;
  }

  .page-link-flex {
    gap: 8px;
    padding: 8px 12px;
  }

  .dynamic-listing-filters {
    max-width: 100%;
  }

  .dynamic-listing-filters__header {
    gap: 8px;
  }

  .dynamic-listing-filters__header strong {
    font-size: 14px;
  }

  .dynamic-listing-filters__header span {
    font-size: 12px;
  }

  .dynamic-listing-filters__reset {
    font-size: 12px;
  }

  .dynamic-listing-filters__grid label span {
    font-size: 11px;
  }

  .dynamic-listing-filters__grid select {
    padding: 8px 10px;
    font-size: 13px;
  }

  .listings-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .listing-filters-section {
    padding: 20px 0;
  }

  .listing-content-section {
    padding: 24px 0;
  }

  .listing-container,
  .w-container {
    padding-left: 16px;
    padding-right: 16px;
  }

  .listing-card-content {
    padding: 16px 14px 18px;
  }

  .listing-card-title {
    font-size: 24px;
    margin-bottom: 10px;
  }

  .listing-card-address {
    font-size: 12px;
    margin-bottom: 8px;
  }

  .listing-card-hours {
    font-size: 10px;
  }

  .listing-category-badge {
    top: 12px;
    left: 12px;
    padding: 8px 10px;
    font-size: 12px;
  }
}
</style>
