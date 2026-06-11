<template>
  <div class="submit-listing-page">
    <div class="container">
      <div class="submit-form-wrapper">
        <h1>Submit Your Listing</h1>
        <p class="subtitle">Share your business or place with the world</p>

        <form @submit.prevent="submitForm" class="listing-form">
          <!-- Step 1: Basic Information -->
          <fieldset :disabled="isSubmitting">
            <div class="form-group">
              <label for="title">Listing Title *</label>
              <input
                v-model="form.title"
                id="title"
                type="text"
                placeholder="Enter listing title"
                required
              />
              <span v-if="errors.title" class="error">{{ errors.title }}</span>
            </div>

            <div class="form-group">
              <label for="businessName">Business Name</label>
              <input
                v-model="form.businessName"
                id="businessName"
                type="text"
                placeholder="Enter business name (optional)"
              />
            </div>

            <div class="form-group">
              <label for="description">Description *</label>
              <textarea
                v-model="form.description"
                id="description"
                placeholder="Describe your listing in detail..."
                rows="5"
                required
              />
              <span v-if="errors.description" class="error">{{ errors.description }}</span>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="category">Category *</label>
                <select v-model="form.categoryId" id="category" required>
                  <option value="">Select a category</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
                <span v-if="errors.categoryId" class="error">{{ errors.categoryId }}</span>
              </div>

              <div class="form-group">
                <label for="country">Country *</label>
                <select v-model="form.countryId" id="country" required @change="loadCities">
                  <option value="">Select a country</option>
                  <option v-for="country in countries" :key="country.id" :value="country.id">
                    {{ country.name }}
                  </option>
                </select>
                <span v-if="errors.countryId" class="error">{{ errors.countryId }}</span>
              </div>
            </div>

            <div class="form-group">
              <label for="city">City *</label>
              <select v-model="form.cityId" id="city" required :disabled="!form.countryId">
                <option value="">Select a city</option>
                <option v-for="city in availableCities" :key="city.id" :value="city.id">
                  {{ city.name }}
                </option>
              </select>
              <span v-if="errors.cityId" class="error">{{ errors.cityId }}</span>
            </div>
          </fieldset>

          <!-- Step 2: Contact Information -->
          <fieldset :disabled="isSubmitting">
            <h3>Contact Information</h3>

            <div class="form-group">
              <label for="contactName">Your Name *</label>
              <input
                v-model="form.contactName"
                id="contactName"
                type="text"
                placeholder="Your full name"
                required
              />
              <span v-if="errors.contactName" class="error">{{ errors.contactName }}</span>
            </div>

            <div class="form-group">
              <label for="contactEmail">Your Email *</label>
              <input
                v-model="form.contactEmail"
                id="contactEmail"
                type="email"
                placeholder="your@email.com"
                required
              />
              <span v-if="errors.contactEmail" class="error">{{ errors.contactEmail }}</span>
            </div>

            <div class="form-group">
              <label for="contactPhone">Phone</label>
              <input
                v-model="form.contactPhone"
                id="contactPhone"
                type="tel"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div class="form-group">
              <label for="website">Website</label>
              <input
                v-model="form.website"
                id="website"
                type="url"
                placeholder="https://example.com"
              />
            </div>
          </fieldset>

          <!-- Step 3: Images -->
          <fieldset :disabled="isSubmitting">
            <h3>Images</h3>

            <div class="form-group">
              <label for="image">Featured Image *</label>
              <input
                id="image"
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                required
              />
              <span v-if="errors.image" class="error">{{ errors.image }}</span>
              <div v-if="form.imagePreview" class="image-preview">
                <img :src="form.imagePreview" alt="Preview" />
              </div>
            </div>
          </fieldset>

          <!-- Submit -->
          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Submitting...' : 'Submit Listing' }}
            </button>
          </div>

          <!-- Messages -->
          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as listingsService from '@/services/listings'

const router = useRouter()

interface SubmissionForm {
  title: string
  businessName: string
  description: string
  categoryId: number | string
  countryId: number | string
  cityId: number | string
  contactName: string
  contactEmail: string
  contactPhone: string
  website: string
  image: File | null
  imagePreview: string | null
}

const form = ref<SubmissionForm>({
  title: '',
  businessName: '',
  description: '',
  categoryId: '',
  countryId: '',
  cityId: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  website: '',
  image: null,
  imagePreview: null,
})

const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const categories = ref<any[]>([])
const countries = ref<any[]>([])
const cities = ref<any[]>([])

const availableCities = computed(() => {
  if (!form.value.countryId) return []
  return cities.value.filter(c => c.country_id === Number(form.value.countryId))
})

const errors = ref<Record<string, string>>({})

onMounted(async () => {
  try {
    const catalog = await listingsService.fetchPublicCatalog()
    categories.value = catalog.categories
    countries.value = catalog.countries
    cities.value = catalog.cities
  } catch (error) {
    errorMessage.value = 'Failed to load form data. Please refresh the page.'
  }
})

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    errors.value.image = 'Image must be less than 5MB'
    return
  }

  form.value.image = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.imagePreview = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function validateForm(): boolean {
  errors.value = {}

  if (!form.value.title.trim()) {
    errors.value.title = 'Title is required'
  }
  if (!form.value.description.trim()) {
    errors.value.description = 'Description is required'
  }
  if (!form.value.categoryId) {
    errors.value.categoryId = 'Category is required'
  }
  if (!form.value.countryId) {
    errors.value.countryId = 'Country is required'
  }
  if (!form.value.cityId) {
    errors.value.cityId = 'City is required'
  }
  if (!form.value.contactName.trim()) {
    errors.value.contactName = 'Name is required'
  }
  if (!form.value.contactEmail.trim()) {
    errors.value.contactEmail = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.contactEmail)) {
    errors.value.contactEmail = 'Please enter a valid email'
  }
  if (!form.value.image) {
    errors.value.image = 'Featured image is required'
  }

  return Object.keys(errors.value).length === 0
}

async function submitForm() {
  if (!validateForm()) return

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('business_name', form.value.businessName)
    formData.append('description', form.value.description)
    formData.append('category_id', String(form.value.categoryId))
    formData.append('city_id', String(form.value.cityId))
    formData.append('contact_name', form.value.contactName)
    formData.append('contact_email', form.value.contactEmail)
    formData.append('contact_phone', form.value.contactPhone)
    formData.append('website', form.value.website)
    if (form.value.image) {
      formData.append('image', form.value.image)
    }

    // TODO: Call API to submit listing
    // await submitListing(formData)

    successMessage.value = 'Listing submitted successfully! Our team will review it shortly.'

    // Reset form
    setTimeout(() => {
      router.push('/listings')
    }, 2000)
  } catch (error) {
    errorMessage.value = 'Failed to submit listing. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

async function loadCities() {
  // Cities are already loaded in onMounted
}
</script>

<style scoped>
.submit-listing-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fdf5ed 0%, #fff0f5 100%);
  padding: 2rem 1rem;
}

.container {
  max-width: 700px;
  margin: 0 auto;
}

.submit-form-wrapper {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.submit-form-wrapper h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1rem;
  margin-bottom: 2rem;
}

fieldset {
  border: none;
  padding: 0;
  margin: 0 0 2rem 0;
}

fieldset:disabled {
  opacity: 0.6;
  pointer-events: none;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
  margin-top: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

input,
select,
textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #c41e3a;
  box-shadow: 0 0 0 3px rgba(196, 30, 58, 0.1);
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.error {
  color: #d32f2f;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.error-message {
  background-color: #ffebee;
  color: #c41e3a;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  border-left: 4px solid #c41e3a;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  border-left: 4px solid #4caf50;
}

.image-preview {
  margin-top: 1rem;
  border-radius: 6px;
  overflow: hidden;
  max-width: 200px;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.btn-primary {
  flex: 1;
  padding: 1rem;
  background: #c41e3a;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #a01730;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .submit-form-wrapper {
    padding: 1.5rem;
  }

  .submit-form-wrapper h1 {
    font-size: 1.5rem;
  }
}
</style>
