<script setup lang="ts">
import { getImageUrl } from '@/utils/imageUrl'

interface Props {
  id: number
  slug: string
  title: string
  location?: string
  category?: string
  image?: string
  summary?: string
  days?: string
  hours?: string
}

withDefaults(defineProps<Props>(), {
  location: 'Location available soon',
  category: 'Featured Listing',
  summary: '',
  days: 'Monday - Saturday',
  hours: '09:00 - 18:00',
})
</script>

<template>
  <a :href="`/listings/${slug}`" class="listing-card">
    <!-- Image container -->
    <div class="listing-card-image-wrapper">
      <img
        :src="getImageUrl(image)"
        :alt="title"
        class="listing-card-image"
      />
      <div class="listing-card-overlay" />
    </div>

    <!-- Content -->
    <div class="listing-card-content">
      <!-- Category badge -->
      <div class="listing-card-category">{{ category }}</div>

      <!-- Title -->
      <h3 class="listing-card-title">{{ title }}</h3>

      <!-- Location -->
      <div class="listing-card-location">
        <span class="location-icon">📍</span>
        <span>{{ location }}</span>
      </div>

      <!-- Hours/Days -->
      <div class="listing-card-hours">
        <div class="hours-item">
          <span class="hours-icon">📅</span>
          <span>{{ days }}</span>
        </div>
        <div class="hours-item">
          <span class="hours-icon">⏰</span>
          <span>{{ hours }}</span>
        </div>
      </div>

      <!-- Summary -->
      <p v-if="summary" class="listing-card-summary">{{ summary }}</p>

      <!-- CTA -->
      <div class="listing-card-cta">View Details →</div>
    </div>
  </a>
</template>

<style scoped>
.listing-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.listing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.listing-card-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f0f0f0;
}

.listing-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.listing-card:hover .listing-card-image {
  transform: scale(1.05);
}

.listing-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0);
  transition: background 0.3s;
}

.listing-card:hover .listing-card-overlay {
  background: rgba(0, 0, 0, 0.1);
}

.listing-card-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.listing-card-category {
  display: inline-block;
  background: #f0f0f0;
  color: #666;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.listing-card-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px 0;
  line-height: 1.3;
  color: #222;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.listing-card-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.location-icon {
  font-size: 16px;
}

.listing-card-hours {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #888;
}

.hours-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hours-icon {
  font-size: 14px;
}

.listing-card-summary {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 12px 0;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.listing-card-cta {
  font-size: 13px;
  font-weight: 600;
  color: #e74c3c;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #eee;
  transition: color 0.3s;
}

.listing-card:hover .listing-card-cta {
  color: #c0392b;
}

/* Responsive */
@media (max-width: 768px) {
  .listing-card-title {
    font-size: 16px;
  }

  .listing-card-content {
    padding: 14px;
  }
}
</style>
