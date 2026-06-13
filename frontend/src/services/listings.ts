export interface Country {
  id: number
  name: string
  slug: string
  iso2: string
  iso3: string
  places_count: number
}

export interface City {
  id: number
  name: string
  slug: string
  country_id: number
  country?: {
    id: number
    name: string
    iso2: string
  }
  places_count: number
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  places_count: number
}

export interface PublicListing {
  id: number
  slug: string
  title: string
  business_name: string | null
  category: string
  country: {
    id: number
    name: string
    iso2: string
  } | null
  categories: Array<{
    name: string
    slug: string
  }>
  image: string | null
  gallery: string[]
  location: string
  city: string | null
  city_slug: string | null
  days: string
  hours: string
  summary: string
  description: string
  contact_address: string | null
  contact_phone: string | null
  contact_email: string | null
  contact_website: string | null
  phone: string | null
  email: string | null
  website_url: string | null
  open_days: string | null
  open_time: string | null
  close_time: string | null
  weekend_text: string | null
  details_heading: string | null
  details_items: string[]
  details_title: string
  details_paragraphs: string[]
  facilities_heading: string | null
  facilities: string[]
  facilities_items: string[]
  gallery_heading: string | null
  seo: {
    title: string | null
    description: string | null
    keywords: string | null
  }
  is_featured: boolean
  is_popular: boolean
  popular_order: number
  published_at: string | null
}

export interface PopularItem {
  type: 'country' | 'city' | 'category'
  label: string
  value: string
  country?: string
  places_count: number
}

export interface PublicCatalog {
  countries: Country[]
  cities: City[]
  categories: Category[]
  popular: {
    countries: PopularItem[]
    cities: PopularItem[]
    categories: PopularItem[]
  }
}

function getApiBase(): string {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (backendUrl) return backendUrl

  // Default to localhost:8000 for local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000'
  }

  // Fallback to same origin
  return window.location.origin
}

const API_BASE = '/api/v1'

export async function fetchPublicCatalog(): Promise<PublicCatalog> {
  const url = `${getApiBase()}${API_BASE}/public/catalog`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch catalog: ${response.statusText}`)
  return response.json()
}

export async function fetchPublicListings(options?: {
  country?: string
  city?: string
  category?: string
}): Promise<PublicListing[]> {
  const url = new URL(`${getApiBase()}${API_BASE}/public/listings`)
  if (options?.country) url.searchParams.set('country', options.country)
  if (options?.city) url.searchParams.set('city', options.city)
  if (options?.category) url.searchParams.set('category', options.category)

  const response = await fetch(url.toString())
  if (!response.ok) throw new Error(`Failed to fetch listings: ${response.statusText}`)
  return response.json()
}

export async function fetchPopularListings(): Promise<PublicListing[]> {
  const url = `${getApiBase()}${API_BASE}/public/listings/popular`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch popular listings: ${response.statusText}`)
  return response.json()
}
