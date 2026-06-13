<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted } from 'vue'
import { api } from '@/services/api'

interface Category {
  id: number
  name: string
  slug: string
}

interface Country {
  id: number
  name: string
  iso2: string
}

interface City {
  id: number
  name: string
  country_id: number
}

interface Listing {
  id?: number
  title: string
  slug: string
  excerpt: string
  description: string
  category_ids: number[]
  city_id: number | null
  country_id: number | null
  status: string
  seo_title: string
  seo_description: string
  seo_keywords: string
  business_name?: string
  email?: string
  phone?: string
  website_url?: string
  address?: string
  is_popular?: boolean
  popular_order?: number
}

const props = defineProps<{
  listing?: any | null
}>()

const emit = defineEmits<{
  save: [listing: Listing, originalTitle?: string]
  cancel: []
}>()

const step = ref(1)
const loading = ref(false)
const categories = ref<Category[]>([])
const countries = ref<Country[]>([])
const cities = ref<City[]>([])
const selectedCountry = ref<number | null>(null)
const previews = ref<string[]>([])
const errors = ref<Record<string, string>>({})

const form = reactive<Listing>({
  title: '',
  slug: '',
  excerpt: '',
  description: '',
  category_ids: [],
  city_id: null,
  country_id: null,
  status: 'draft',
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  business_name: '',
  email: '',
  phone: '',
  website_url: '',
  address: '',
  is_popular: false,
  popular_order: 0,
})

const stepLabels = ['Basics', 'Content', 'Media', 'SEO & Status']

const statusTone = computed(() => {
  if (form.status === 'published' || form.status === 'approved') return 'success'
  if (form.status === 'pending') return 'warning'
  if (form.status === 'rejected') return 'danger'
  return 'neutral'
})

const filteredCities = computed(() => {
  if (!selectedCountry.value) return []
  return cities.value.filter((city) => city.country_id === selectedCountry.value)
})

onMounted(async () => {
  await loadDropdownData()
  if (props.listing) {
    loadListingData()
  }
})

async function loadDropdownData() {
  try {
    const [categoriesRes, countriesRes, citiesRes] = await Promise.all([
      api.get('/categories'),
      api.get('/countries'),
      api.get('/cities'),
    ])

    categories.value = categoriesRes.data.data?.data || categoriesRes.data.data || []
    countries.value = countriesRes.data.data?.data || countriesRes.data.data || []
    cities.value = citiesRes.data.data?.data || citiesRes.data.data || []
  } catch (err) {
    console.error('Failed to load dropdown data:', err)
  }
}

function loadListingData() {
  const listing = props.listing
  if (!listing) return

  console.log('Loading listing data:', listing)

  form.title = listing.title || ''
  form.slug = listing.slug || ''
  form.excerpt = listing.excerpt || ''
  form.description = listing.description || ''
  form.status = listing.status || 'draft'
  form.seo_title = listing.seo_title || ''
  form.seo_description = listing.seo_description || ''
  form.seo_keywords = listing.seo_keywords || ''
  form.business_name = listing.business_name || ''
  form.email = listing.email || ''
  form.phone = listing.phone || ''
  form.website_url = listing.website_url || ''
  form.address = listing.address || ''
  form.is_popular = listing.is_popular ?? false
  form.popular_order = listing.popular_order ?? 0

  // Handle city_id - could be direct or nested in city object
  if (listing.city_id) {
    form.city_id = listing.city_id
  } else if (listing.city?.id) {
    form.city_id = listing.city.id
  }

  // Handle country_id - could be direct or nested in city.country
  if (listing.country_id) {
    form.country_id = listing.country_id
  } else if (listing.city?.country?.id) {
    form.country_id = listing.city.country.id
  }

  // Handle categories
  form.category_ids = listing.categories?.map((c: any) => c.id) || listing.category_ids || []

  // Set selected country for dependent city dropdown
  if (form.city_id && cities.value.length > 0) {
    const city = cities.value.find((c) => c.id === form.city_id)
    if (city) {
      selectedCountry.value = city.country_id
    }
  } else if (form.country_id) {
    selectedCountry.value = form.country_id
  }

  console.log('Form loaded:', {
    title: form.title,
    city_id: form.city_id,
    country_id: form.country_id,
    category_ids: form.category_ids,
    status: form.status,
  })
}

function generateSlug() {
  form.slug = form.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function handleFiles(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files || [])
  previews.value = files.map((file) => URL.createObjectURL(file))
}

function toggleCategory(categoryId: number) {
  const index = form.category_ids.indexOf(categoryId)
  if (index > -1) {
    form.category_ids.splice(index, 1)
  } else {
    form.category_ids.push(categoryId)
  }
}

async function submit() {
  errors.value = {}

  // Validation checks
  if (!form.title.trim()) {
    errors.value.title = 'Title is required'
  }
  if (!form.slug.trim()) {
    errors.value.slug = 'Slug is required'
  }
  if (form.category_ids.length === 0) {
    errors.value.categories = 'Select at least one category'
  }
  if (!form.city_id) {
    errors.value.city = 'City is required'
  }

  // If validation failed, scroll to error and return
  if (Object.keys(errors.value).length > 0) {
    console.log('Validation errors:', errors.value)
    // Scroll to top to show error message
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  try {
    loading.value = true
    const isEditing = props.listing?.id

    // Prepare API payload with correct field names
    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      description: form.description,
      business_name: form.business_name,
      email: form.email,
      phone: form.phone,
      website_url: form.website_url,
      address: form.address,
      city_id: form.city_id,
      status: form.status,
      seo_title: form.seo_title,
      seo_description: form.seo_description,
      seo_keywords: form.seo_keywords,
      categories: form.category_ids, // Backend expects 'categories', not 'category_ids'
      is_popular: form.is_popular,
      popular_order: form.is_popular ? form.popular_order : 0,
    }

    console.log('Submitting:', {
      isEditing,
      listingId: props.listing?.id,
      payload,
    })

    let response
    if (isEditing) {
      // Update existing listing
      response = await api.put(`/listings/${props.listing.id}`, payload)
      console.log('✓ Update response:', response.data)
    } else {
      // Create new listing
      response = await api.post('/listings', payload)
      console.log('✓ Create response:', response.data)
    }

    // Emit success event
    emit('save', response.data.data || response.data || form, props.listing?.title)
  } catch (err: any) {
    console.error('❌ Save error:', err)
    const errData = err.response?.data

    // Scroll to error
    window.scrollTo({ top: 0, behavior: 'smooth' })

    if (errData?.errors && typeof errData.errors === 'object') {
      errors.value = errData.errors
    } else {
      errors.value.submit = errData?.message || 'Failed to save listing. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="grid gap-6" @submit.prevent="submit">
    <!-- Error Alert - Show all errors -->
    <div v-if="Object.keys(errors).length > 0" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm space-y-2">
      <div class="flex items-start gap-2">
        <i class="pi pi-exclamation-circle mt-0.5 shrink-0"></i>
        <div>
          <p class="font-semibold mb-2">Please fix the following errors:</p>
          <ul class="list-disc list-inside space-y-1">
            <li v-for="(error, field) in errors" :key="field" class="text-xs">
              <strong class="capitalize">{{ field }}:</strong> {{ error }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="Object.keys(errors).length === 0 && !loading" class="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm flex items-center gap-2">
      <i class="pi pi-check-circle"></i>
      <span>All fields are valid. Click "Save Listing" to continue.</span>
    </div>

    <!-- Step Indicator -->
    <ol class="grid gap-2 sm:grid-cols-4">
      <li
        v-for="(label, index) in stepLabels"
        :key="label"
        class="rounded-lg border px-3 py-2 text-sm font-semibold cursor-pointer transition-all"
        :class="
          step === index + 1
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-200 text-gray-600 hover:border-gray-300'
        "
        @click="step = index + 1"
      >
        {{ index + 1 }}. {{ label }}
      </li>
    </ol>

    <!-- Step 1: Basics -->
    <section v-if="step === 1" class="grid gap-4">
      <!-- Title -->
      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-900">
          Title <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.title"
          @blur="generateSlug"
          type="text"
          placeholder="Enter listing title"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="errors.title ? 'border-red-500' : ''"
        />
        <p v-if="errors.title" class="text-xs text-red-600">{{ errors.title }}</p>
      </div>

      <!-- Slug -->
      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-900">
          Slug <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.slug"
          type="text"
          placeholder="auto-generated-from-title"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="errors.slug ? 'border-red-500' : ''"
        />
        <p v-if="errors.slug" class="text-xs text-red-600">{{ errors.slug }}</p>
      </div>

      <!-- Country & City -->
      <div class="grid gap-4 md:grid-cols-2">
        <div class="grid gap-2">
          <label class="text-sm font-medium text-gray-900">Country</label>
          <select
            v-model.number="selectedCountry"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="null">Select country...</option>
            <option v-for="country in countries" :key="country.id" :value="country.id">
              {{ country.name }}
            </option>
          </select>
        </div>

        <div class="grid gap-2">
          <label class="text-sm font-medium text-gray-900">
            City <span class="text-red-500">*</span>
          </label>
          <select
            v-model.number="form.city_id"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="errors.city ? 'border-red-500' : ''"
            :disabled="!selectedCountry"
          >
            <option :value="null">Select city...</option>
            <option v-for="city in filteredCities" :key="city.id" :value="city.id">
              {{ city.name }}
            </option>
          </select>
          <p v-if="errors.city" class="text-xs text-red-600">{{ errors.city }}</p>
        </div>
      </div>

      <!-- Categories -->
      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-900">
          Categories <span class="text-red-500">*</span>
        </label>
        <div class="grid grid-cols-2 gap-2">
          <label v-for="category in categories" :key="category.id" class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              :checked="form.category_ids.includes(category.id)"
              @change="toggleCategory(category.id)"
              class="w-4 h-4 rounded border-gray-300"
            />
            <span class="text-sm text-gray-700">{{ category.name }}</span>
          </label>
        </div>
        <p v-if="errors.categories" class="text-xs text-red-600">{{ errors.categories }}</p>
      </div>

      <!-- Business Name & Contact Info -->
      <div class="grid gap-4 md:grid-cols-2">
        <div class="grid gap-2">
          <label class="text-sm font-medium text-gray-900">Business Name</label>
          <input
            v-model="form.business_name"
            type="text"
            placeholder="Business name"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium text-gray-900">Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="contact@example.com"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium text-gray-900">Phone</label>
          <input
            v-model="form.phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium text-gray-900">Website</label>
          <input
            v-model="form.website_url"
            type="url"
            placeholder="https://example.com"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Address -->
      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-900">Address</label>
        <textarea
          v-model="form.address"
          placeholder="Full address"
          rows="2"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>
    </section>

    <!-- Step 2: Content -->
    <section v-if="step === 2" class="grid gap-4">
      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-900">Excerpt</label>
        <textarea
          v-model="form.excerpt"
          placeholder="Brief description"
          rows="4"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-900">Description</label>
        <textarea
          v-model="form.description"
          placeholder="Full description with rich formatting"
          rows="8"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>
    </section>

    <!-- Step 3: Media -->
    <section v-if="step === 3" class="grid gap-4">
      <label
        class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <i class="pi pi-cloud-upload text-3xl text-blue-500 mb-2 block"></i>
        <strong class="block text-gray-900 mb-1">Drop images here</strong>
        <span class="text-sm text-gray-600">or click to browse</span>
        <input class="hidden" type="file" multiple accept="image/*" @change="handleFiles" />
      </label>
      <div v-if="previews.length" class="grid gap-3 sm:grid-cols-3">
        <img
          v-for="preview in previews"
          :key="preview"
          :src="preview"
          class="aspect-4/3 rounded-lg object-cover border border-gray-200"
          alt="Preview"
        />
      </div>
    </section>

    <!-- Step 4: SEO & Status -->
    <section v-if="step === 4" class="grid gap-4">
      <div class="grid gap-2 md:col-span-2">
        <label class="text-sm font-medium text-gray-900">Meta Title</label>
        <input
          v-model="form.seo_title"
          type="text"
          placeholder="SEO title for search engines"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-900">Meta Description</label>
        <textarea
          v-model="form.seo_description"
          placeholder="SEO description for search results"
          rows="3"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-900">Keywords</label>
        <input
          v-model="form.seo_keywords"
          type="text"
          placeholder="keyword1, keyword2, keyword3"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-900">Status</label>
        <select
          v-model="form.status"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="draft">Draft</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <!-- Popular Listing Section -->
      <div class="border-t border-gray-200 pt-4 mt-4">
        <div class="grid gap-4">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="form.is_popular"
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300"
            />
            <span class="text-sm font-medium text-gray-900">Show in Popular Listing Collection</span>
          </label>

          <div v-if="form.is_popular" class="grid gap-2 ml-7">
            <label class="text-sm font-medium text-gray-900">Popular Order (0-2)</label>
            <select
              v-model.number="form.popular_order"
              class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">Position 1 (First)</option>
              <option value="1">Position 2 (Second)</option>
              <option value="2">Position 3 (Third)</option>
            </select>
            <p class="text-xs text-gray-600">Set the order this listing appears in the Popular section</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer Actions -->
    <div class="flex flex-wrap justify-between gap-3 border-t border-gray-200 pt-5">
      <button
        type="button"
        @click="step > 1 ? step-- : emit('cancel')"
        class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
      >
        {{ step > 1 ? '← Back' : 'Cancel' }}
      </button>
      <button
        v-if="step < 4"
        type="button"
        @click="step++"
        class="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
      >
        Next →
      </button>
      <button
        v-else
        type="submit"
        :disabled="loading || Object.keys(errors).length > 0"
        :class="[
          'px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition-all duration-200',
          Object.keys(errors).length > 0
            ? 'bg-gray-400 cursor-not-allowed opacity-60'
            : 'bg-green-500 hover:bg-green-600 disabled:opacity-50',
        ]"
      >
        <i :class="loading ? 'pi pi-spin pi-spinner' : 'pi pi-save'"></i>
        {{ loading ? 'Saving...' : 'Save Listing' }}
      </button>
    </div>
  </form>
</template>
