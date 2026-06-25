export interface Article {
  id: number
  title: string
  slug?: string
  content?: string
  excerpt?: string
  category_id?: number
  author_id?: number
  status: string
  tone?: string
  created_at?: string
  updated_at?: string
  published_at?: string
  [key: string]: any
}
