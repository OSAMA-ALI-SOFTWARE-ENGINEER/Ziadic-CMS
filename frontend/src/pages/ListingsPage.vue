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

const selectedCountry = computed(() => (route.query.country as string) || '')
const selectedCity = computed(() => (route.query.city as string) || '')
const selectedCategory = computed(() => (route.query.category as string) || '')

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
  try {
    listings.value = await fetchPublicListings({
      country: selectedCountry.value || undefined,
      city: selectedCity.value || undefined,
      category: selectedCategory.value || undefined,
    })
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

watch([selectedCountry, selectedCity, selectedCategory], fetchListings)

onMounted(async () => {
  const [catalogData] = await Promise.all([fetchPublicCatalog(), fetchListings()])
  catalog.value = catalogData
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
              <div class="listing-card-image">
                <img v-if="listing.image" :src="listing.image" :alt="listing.title" />
                <div v-if="!listing.image" class="listing-card-placeholder">No image</div>
                <div v-if="listing.category" class="listing-category-badge">{{ listing.category }}</div>
              </div>
              <div class="listing-card-content">
                <h3 class="listing-card-title">{{ listing.title }}</h3>
                <p v-if="listing.contact_address" class="listing-card-address">{{ listing.contact_address }}</p>
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
  padding: 60px 20px;
  background: linear-gradient(135deg, #c41e3a 0%, #a01729 100%);
  border-bottom: none;
}

.page-section-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.page-banner-title {
  font-size: 48px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 24px 0;
  line-height: 1.2;
  font-family: Marcellus, serif;
}

.page-link-flex {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.page-link {
  text-decoration: none;
  color: inherit;
  display: inline-flex;
  align-items: center;
}

.page-link-text {
  font-size: 16px;
  color: #fff;
  font-weight: 500;
  transition: opacity 0.3s ease;
}

.page-link:hover .page-link-text {
  opacity: 0.8;
}

.divider-img {
  width: 24px;
  height: 24px;
  color: #fff;
  stroke: currentColor;
  flex-shrink: 0;
}

/* Filter Section */
.listing-filters-section {
  padding: 40px 20px;
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
  color: #c41e3a;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid #c41e3a;
}

.dynamic-listing-filters__reset:hover {
  opacity: 0.8;
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
  padding: 60px 20px;
  background-color: #fdf5ed;
}

.section-title {
  font-size: 42px;
  font-weight: 400;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 48px;
  font-family: Marcellus, serif;
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 32px;
}

.listings-page-collection-item {
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.listings-page-collection-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.listing-card {
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.listing-card-image {
  position: relative;
  width: 100%;
  padding-bottom: 66.67%;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.listing-card-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

.listing-card-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.listings-page-collection-item:hover .listing-card-image img {
  transform: scale(1.05);
}

.listing-category-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  background-color: #c41e3a;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.listing-card-content {
  padding: 24px;
}

.listing-card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 14px 0;
  line-height: 1.3;
}

.listing-card-address {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.listing-card-hours {
  font-size: 13px;
  color: #999;
  margin: 0;
  font-weight: 500;
}

.listing-container {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 20px;
  padding-right: 20px;
}

.w-container {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 20px;
  padding-right: 20px;
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
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 24px;
  }

  .dynamic-listing-filters__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-section {
    padding: 40px 20px;
  }

  .page-banner-title {
    font-size: 32px;
    margin-bottom: 16px;
  }

  .page-link-flex {
    gap: 10px;
  }

  .page-link-text {
    font-size: 14px;
  }

  .section-title {
    font-size: 24px;
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

  .listing-filters-section {
    padding: 24px 16px;
  }

  .listing-content-section {
    padding: 32px 16px;
  }

  .listings-loading {
    padding: 60px 20px;
  }

  .dynamic-listing-empty {
    padding: 60px 20px;
  }

  .listing-card-title {
    font-size: 16px;
  }

  .listing-card-address {
    font-size: 13px;
  }

  .listing-card-hours {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .page-section {
    padding: 32px 16px;
  }

  .page-banner-title {
    font-size: 24px;
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
    font-size: 20px;
    margin-bottom: 24px;
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
    padding: 20px 12px;
  }

  .listing-content-section {
    padding: 24px 12px;
  }

  .w-container {
    padding-left: 16px;
    padding-right: 16px;
  }

  .listing-card-content {
    padding: 16px;
  }

  .listing-card-title {
    font-size: 15px;
    margin-bottom: 10px;
  }

  .listing-card-address {
    font-size: 12px;
    margin-bottom: 8px;
  }

  .listing-card-hours {
    font-size: 11px;
  }
}
</style>
