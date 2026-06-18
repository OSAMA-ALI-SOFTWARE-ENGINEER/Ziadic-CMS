<script setup lang="ts">
import { computed, reactive, ref, onMounted, watch } from 'vue'
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

interface GalleryMedia {
  id: number
  file_name: string
  public_url: string
  file_type: string
  alt_text?: string
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
  business_name?: string
  email?: string
  phone?: string
  website_url?: string
  address?: string
  is_popular?: boolean
  popular_order?: number
  contact_phone?: string
  contact_email?: string
  contact_website?: string
  contact_address?: string
  open_days?: string
  open_time?: string
  close_time?: string
  weekend_text?: string
  details_heading?: string
  details_items?: string[]
  facilities_heading?: string
  facilities_items?: string[]
  gallery_heading?: string
  thumbnail_image?: string
  seo_title?: string
  seo_description?: string
  seo_keywords?: string
}

const props = defineProps<{
  listing?: any | null
}>()

const emit = defineEmits<{
  save: [listing: Listing, originalTitle?: string]
  cancel: []
}>()

function getBackendUrl(): string {
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return backendUrl.replace('/api/v1/admin', '')
}

const step = ref(1)
const loading = ref(false)
const categories = ref<Category[]>([])
const countries = ref<Country[]>([])
const cities = ref<City[]>([])
const selectedCountry = ref<number | null>(null)
const previews = ref<string[]>([])
const uploadedImages = ref<{ preview: string; path?: string; id?: number }[]>([])
const galleryMediaFiles = ref<GalleryMedia[]>([])
const galleryImageIds = ref<number[]>([])
const thumbnailPreview = ref<string>('')
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
  business_name: '',
  email: '',
  phone: '',
  website_url: '',
  address: '',
  is_popular: false,
  popular_order: 0,
  contact_phone: '',
  contact_email: '',
  contact_website: '',
  contact_address: '',
  open_days: 'Monday - Saturday',
  open_time: '09:00',
  close_time: '18:00',
  weekend_text: 'Weekend: Sunday',
  details_heading: 'Details',
  details_items: [],
  facilities_heading: 'Facilities Available',
  facilities_items: [],
  gallery_heading: 'Gallery',
  thumbnail_image: '',
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
})

const stepLabels = ['Basics', 'Location', 'Contact', 'Schedule', 'Details', 'Gallery', 'SEO']

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

// Watch for listing prop changes - ensures gallery loads even if listing was in cache
watch(() => props.listing?.id, (listingId) => {
  if (listingId) {
    loadListingData()
  }
}, { immediate: false })

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
  }
}

async function loadListingData() {
  const listing = props.listing
  if (!listing) return


  // If listing doesn't have mediaFiles, fetch it from API
  if (!listing.mediaFiles || listing.mediaFiles.length === 0) {
    try {
      const response = await api.get(`/listings/${listing.id}`)
      const fullListing = response.data

      // Use the fully loaded listing instead
      return loadListingDataInternal(fullListing)
    } catch (error) {
      // Continue with cached data
    }
  }

  loadListingDataInternal(listing)
}

function loadListingDataInternal(listing: any) {
  if (!listing) return

  form.title = listing.title || ''
  form.slug = listing.slug || ''
  form.excerpt = listing.excerpt || ''
  form.description = listing.description || ''
  form.status = listing.status || 'draft'
  form.business_name = listing.business_name || ''
  form.email = listing.email || ''
  form.phone = listing.phone || ''
  form.website_url = listing.website_url || ''
  form.address = listing.address || ''
  form.is_popular = listing.is_popular ?? false
  form.popular_order = listing.popular_order ?? 0
  form.contact_phone = listing.contact_phone || ''
  form.contact_email = listing.contact_email || ''
  form.contact_website = listing.contact_website || ''
  form.contact_address = listing.contact_address || ''
  form.open_days = listing.open_days || 'Monday - Saturday'
  form.open_time = formatTimeInput(listing.open_time || '09:00')
  form.close_time = formatTimeInput(listing.close_time || '18:00')
  form.weekend_text = listing.weekend_text || 'Weekend: Sunday'
  form.details_heading = listing.details_heading || 'Details'
  form.details_items = listing.details_items || []
  form.facilities_heading = listing.facilities_heading || 'Facilities Available'
  form.facilities_items = listing.facilities_items || []
  form.gallery_heading = listing.gallery_heading || 'Gallery'
  form.thumbnail_image = listing.thumbnail_image || ''
  form.seo_title = listing.seo_title || ''
  form.seo_description = listing.seo_description || ''
  form.seo_keywords = listing.seo_keywords || ''

  if (form.thumbnail_image) {
    // Convert path to full URL if it's a relative path
    thumbnailPreview.value = form.thumbnail_image.startsWith('http')
      ? form.thumbnail_image
      : `${getBackendUrl()}/${form.thumbnail_image.replace(/^\/+/, '')}`
  }

  // Load existing gallery images from mediaFiles (new system)
  if (listing.mediaFiles && Array.isArray(listing.mediaFiles) && listing.mediaFiles.length > 0) {
    galleryMediaFiles.value = listing.mediaFiles
    galleryImageIds.value = listing.mediaFiles.map((media: any) => media.id)
    uploadedImages.value = listing.mediaFiles.map((media: any) => {
      return {
        preview: media.public_url,
        path: media.file_path,
        id: media.id,
      }
    })
  } else if (listing.images && Array.isArray(listing.images)) {
    // Fallback to legacy images for backwards compatibility
    uploadedImages.value = listing.images.map((img: any) => ({
      preview: img.path.startsWith('http')
        ? img.path
        : `${getBackendUrl()}/${img.path.replace(/^\/+/, '')}`,
      path: img.path,
    }))
  } else {
  }

  if (listing.city_id) {
    form.city_id = listing.city_id
  } else if (listing.city?.id) {
    form.city_id = listing.city.id
  }

  if (listing.country_id) {
    form.country_id = listing.country_id
  } else if (listing.city?.country?.id) {
    form.country_id = listing.city.country.id
  }

  form.category_ids = listing.categories?.map((c: any) => c.id) || listing.category_ids || []

  if (form.city_id && cities.value.length > 0) {
    const city = cities.value.find((c) => c.id === form.city_id)
    if (city) {
      selectedCountry.value = city.country_id
    }
  } else if (form.country_id) {
    selectedCountry.value = form.country_id
  }
}

function generateSlug() {
  form.slug = form.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function formatTimeInput(timeValue: string): string {
  if (!timeValue) return '09:00'
  // Handle various formats and convert to HH:MM
  const match = timeValue.match(/(\d{1,2}):(\d{2})/)
  if (match) {
    return `${String(parseInt(match[1])).padStart(2, '0')}:${match[2]}`
  }
  return '09:00'
}

function removeImage(index: number) {
  const image = uploadedImages.value[index]
  if (image?.id) {
    // Remove from galleryImageIds
    const idIndex = galleryImageIds.value.indexOf(image.id)
    if (idIndex > -1) {
      galleryImageIds.value.splice(idIndex, 1)
    }
  }
  uploadedImages.value.splice(index, 1)
}

async function handleFiles(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files || [])

  for (const file of files) {
    const preview = URL.createObjectURL(file)
    uploadedImages.value.push({ preview, id: undefined })

    try {
      await uploadImage(file, uploadedImages.value.length - 1)
    } catch (error) {
      errors.value.gallery = 'Failed to upload one or more images'
    }
  }
}

async function uploadImage(file: File, index: number) {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await api.post('/upload', formData)

    uploadedImages.value[index].path = response.data.path
    uploadedImages.value[index].preview = response.data.public_url

    // If upload response includes media ID, add it to galleryImageIds
    if (response.data.id) {
      uploadedImages.value[index].id = response.data.id
      if (!galleryImageIds.value.includes(response.data.id)) {
        galleryImageIds.value.push(response.data.id)
      }
    } else {
    }
  } catch (error) {
    throw error
  }
}

async function handleThumbnailUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    thumbnailPreview.value = URL.createObjectURL(file)
    try {
      await uploadThumbnailImage(file)
    } catch (error) {
      errors.value.thumbnail_image = 'Failed to upload thumbnail image'
    }
  }
}

async function uploadThumbnailImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await api.post('/upload', formData)
    form.thumbnail_image = response.data.path
  } catch (error) {
    throw error
  }
}

function toggleCategory(categoryId: number) {
  const index = form.category_ids.indexOf(categoryId)
  if (index > -1) {
    form.category_ids.splice(index, 1)
  } else {
    form.category_ids.push(categoryId)
  }
}

function addDetailItem() {
  if (!form.details_items) {
    form.details_items = []
  }
  form.details_items.push('')
}

function removeDetailItem(index: number) {
  form.details_items?.splice(index, 1)
}

function addFacilityItem() {
  if (!form.facilities_items) {
    form.facilities_items = []
  }
  form.facilities_items.push('')
}

function removeFacilityItem(index: number) {
  form.facilities_items?.splice(index, 1)
}

function getGalleryImageUrl(image: any): string {
  // Use preview if it's a blob URL (local upload) or already fully qualified
  if (image.preview) {
    return image.preview
  }
  // For stored media files without blob preview, use public_url
  if (image.public_url) {
    return image.public_url
  }
  // Fallback to file_path with base URL
  if (image.path) {
    if (image.path.startsWith('http')) {
      return image.path
    }
    return `${getBackendUrl()}/${image.path.replace(/^\/+/, '')}`
  }
  return ''
}

async function submit() {
  errors.value = {}

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

  if (Object.keys(errors.value).length > 0) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  try {
    loading.value = true
    const isEditing = props.listing?.id

    // Convert galleryImageIds to plain array (not Proxy)
    const galleryImageIdsArray = Array.isArray(galleryImageIds.value)
      ? [...galleryImageIds.value]
      : []

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
      categories: form.category_ids,
      is_popular: form.is_popular,
      popular_order: form.is_popular ? form.popular_order : 0,
      contact_phone: form.contact_phone,
      contact_email: form.contact_email,
      contact_website: form.contact_website,
      contact_address: form.contact_address,
      open_days: form.open_days,
      open_time: formatTimeInput(form.open_time),
      close_time: formatTimeInput(form.close_time),
      weekend_text: form.weekend_text,
      details_heading: form.details_heading,
      details_items: form.details_items || [],
      facilities_heading: form.facilities_heading,
      facilities_items: form.facilities_items || [],
      gallery_heading: form.gallery_heading,
      thumbnail_image: form.thumbnail_image,
      gallery_image_ids: galleryImageIdsArray,
    }

    let response
    if (isEditing) {
      response = await api.put(`/listings/${props.listing.id}`, payload)
    } else {
      response = await api.post('/listings', payload)
    }

    emit('save', response.data.data || response.data || form, props.listing?.title)
  } catch (err: any) {
    const errData = err.response?.data
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
    <!-- Error Alert -->
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
    <ol class="grid gap-2 grid-cols-7">
      <li
        v-for="(label, index) in stepLabels"
        :key="label"
        class="rounded-lg border px-2 py-2 text-xs font-semibold cursor-pointer transition-all text-center"
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
      <div class="grid gap-2">
        <label class="text-sm font-medium">Title <span class="text-red-500">*</span></label>
        <input v-model="form.title" @blur="generateSlug" type="text" placeholder="Enter listing title" class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Slug <span class="text-red-500">*</span></label>
        <input v-model="form.slug" type="text" placeholder="auto-generated" class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Business Name</label>
        <input v-model="form.business_name" type="text" placeholder="Business name" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Short Description</label>
        <textarea v-model="form.excerpt" placeholder="Brief summary" rows="3" class="border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea>
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Full Description</label>
        <textarea v-model="form.description" placeholder="Full listing details" rows="5" class="border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea>
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Categories <span class="text-red-500">*</span></label>
        <div class="grid grid-cols-2 gap-2">
          <label v-for="category in categories" :key="category.id" class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :checked="form.category_ids.includes(category.id)" @change="toggleCategory(category.id)" class="w-4 h-4 rounded border-gray-300" />
            <span class="text-sm text-gray-700">{{ category.name }}</span>
          </label>
        </div>
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Thumbnail Image</label>
        <div class="flex flex-col gap-2">
          <input type="file" accept="image/*" @change="handleThumbnailUpload" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <div v-if="thumbnailPreview" class="mt-2 relative w-full max-w-xs">
            <img :src="thumbnailPreview" :alt="form.title" class="w-full h-40 object-cover rounded-lg border border-gray-200" />
            <button type="button" @click="() => { thumbnailPreview = ''; form.thumbnail_image = '' }" class="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Remove</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Step 2: Location -->
    <section v-if="step === 2" class="grid gap-4">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="grid gap-2">
          <label class="text-sm font-medium">Country</label>
          <select v-model.number="selectedCountry" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option :value="null">Select country...</option>
            <option v-for="country in countries" :key="country.id" :value="country.id">{{ country.name }}</option>
          </select>
        </div>

        <div class="grid gap-2">
          <label class="text-sm font-medium">City <span class="text-red-500">*</span></label>
          <select v-model.number="form.city_id" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" :disabled="!selectedCountry">
            <option :value="null">Select city...</option>
            <option v-for="city in filteredCities" :key="city.id" :value="city.id">{{ city.name }}</option>
          </select>
        </div>
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Address</label>
        <textarea v-model="form.address" placeholder="Full address" rows="2" class="border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea>
      </div>
    </section>

    <!-- Step 3: Contact -->
    <section v-if="step === 3" class="grid gap-4">
      <div class="grid gap-2">
        <label class="text-sm font-medium">Phone</label>
        <input v-model="form.contact_phone" type="tel" placeholder="+1 (555) 000-0000" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Email</label>
        <input v-model="form.contact_email" type="email" placeholder="contact@example.com" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Website</label>
        <input v-model="form.contact_website" type="url" placeholder="https://example.com" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Contact Address</label>
        <textarea v-model="form.contact_address" placeholder="Office or contact address" rows="2" class="border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea>
      </div>
    </section>

    <!-- Step 4: Schedule -->
    <section v-if="step === 4" class="grid gap-4">
      <div class="grid gap-2">
        <label class="text-sm font-medium">Operating Days</label>
        <input v-model="form.open_days" type="text" placeholder="Monday - Saturday" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="grid gap-2">
          <label class="text-sm font-medium">Opening Time</label>
          <input v-model="form.open_time" type="time" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        <div class="grid gap-2">
          <label class="text-sm font-medium">Closing Time</label>
          <input v-model="form.close_time" type="time" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Weekend Info</label>
        <input v-model="form.weekend_text" type="text" placeholder="Weekend: Sunday" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
    </section>

    <!-- Step 5: Details -->
    <section v-if="step === 5" class="grid gap-4">
      <div class="grid gap-2">
        <label class="text-sm font-medium">Details Heading</label>
        <input v-model="form.details_heading" type="text" placeholder="Details" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Details Items</label>
        <div v-if="form.details_items" class="space-y-2">
          <div v-for="(item, index) in form.details_items" :key="index" class="flex gap-2">
            <input v-model="form.details_items[index]" type="text" placeholder="Detail item" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <button type="button" @click="removeDetailItem(index)" class="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
              <i class="pi pi-trash text-sm"></i>
            </button>
          </div>
        </div>
        <button type="button" @click="addDetailItem" class="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm font-medium">
          <i class="pi pi-plus text-sm"></i> Add Detail Item
        </button>
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Facilities Heading</label>
        <input v-model="form.facilities_heading" type="text" placeholder="Facilities Available" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Facilities Items</label>
        <div v-if="form.facilities_items" class="space-y-2">
          <div v-for="(item, index) in form.facilities_items" :key="index" class="flex gap-2">
            <input v-model="form.facilities_items[index]" type="text" placeholder="Facility item" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <button type="button" @click="removeFacilityItem(index)" class="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
              <i class="pi pi-trash text-sm"></i>
            </button>
          </div>
        </div>
        <button type="button" @click="addFacilityItem" class="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm font-medium">
          <i class="pi pi-plus text-sm"></i> Add Facility Item
        </button>
      </div>
    </section>

    <!-- Step 6: Gallery -->
    <section v-if="step === 6" class="grid gap-4">
      <div class="grid gap-2">
        <label class="text-sm font-medium">Gallery Heading</label>
        <input v-model="form.gallery_heading" type="text" placeholder="Gallery" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <label class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
        <i class="pi pi-cloud-upload text-3xl text-blue-500 mb-2 block"></i>
        <strong class="block text-gray-900 mb-1">Drop images here</strong>
        <span class="text-sm text-gray-600">or click to browse</span>
        <input class="hidden" type="file" multiple accept="image/*" @change="handleFiles" />
      </label>
      <div v-if="uploadedImages.length" class="grid gap-3 sm:grid-cols-3">
        <div v-for="(image, index) in uploadedImages" :key="index" class="relative">
          <img
            :src="getGalleryImageUrl(image)"
            class="w-full aspect-4/3 rounded-lg object-cover border border-gray-200"
            alt="Preview"
          />
          <div v-if="!image.path && !image.id" class="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
            <i class="pi pi-spin pi-spinner text-white text-2xl"></i>
          </div>
          <button type="button" @click="removeImage(index)" class="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">
            <i class="pi pi-trash text-xs"></i>
          </button>
        </div>
      </div>
    </section>

    <!-- Step 7: SEO -->
    <section v-if="step === 7" class="grid gap-4">
      <div class="grid gap-2">
        <label class="text-sm font-medium">Meta Title</label>
        <input v-model="form.seo_title" type="text" placeholder="SEO title" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Meta Description</label>
        <textarea v-model="form.seo_description" placeholder="SEO description" rows="3" class="border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea>
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Keywords</label>
        <input v-model="form.seo_keywords" type="text" placeholder="keyword1, keyword2, keyword3" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Status</label>
        <select v-model="form.status" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="draft">Draft</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <!-- Popular Listing Section -->
      <div class="border-t border-gray-200 pt-4 mt-4">
        <label class="flex items-center gap-3 cursor-pointer">
          <input v-model="form.is_popular" type="checkbox" class="w-4 h-4 rounded border-gray-300" />
          <span class="text-sm font-medium">Show in Popular Listing Collection</span>
        </label>

        <div v-if="form.is_popular" class="grid gap-2 ml-7 mt-3">
          <label class="text-sm font-medium">Popular Order (0-2)</label>
          <select v-model.number="form.popular_order" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="0">Position 1 (First)</option>
            <option value="1">Position 2 (Second)</option>
            <option value="2">Position 3 (Third)</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Footer Actions -->
    <div class="flex flex-wrap justify-between gap-3 border-t border-gray-200 pt-5">
      <button type="button" @click="step > 1 ? step-- : emit('cancel')" class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
        {{ step > 1 ? '← Back' : 'Cancel' }}
      </button>
      <button v-if="step < 7" type="button" @click="step++" class="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium">
        Next →
      </button>
      <button v-else type="submit" :disabled="loading || Object.keys(errors).length > 0" :class="[
        'px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition-all duration-200',
        Object.keys(errors).length > 0
          ? 'bg-gray-400 cursor-not-allowed opacity-60'
          : 'bg-green-500 hover:bg-green-600 disabled:opacity-50',
      ]">
        <i :class="loading ? 'pi pi-spin pi-spinner' : 'pi pi-save'"></i>
        {{ loading ? 'Saving...' : 'Save Listing' }}
      </button>
    </div>
  </form>
</template>
