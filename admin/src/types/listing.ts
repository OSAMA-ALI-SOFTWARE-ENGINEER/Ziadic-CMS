export interface Listing {
  id: number
  title: string
  description?: string
  slug?: string
  category_id?: number
  city_id?: number
  status: string
  tone?: string
  owner?: string
  created_at?: string
  updated_at?: string
  [key: string]: any
}
