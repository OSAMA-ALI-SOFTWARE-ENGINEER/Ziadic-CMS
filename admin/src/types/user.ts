export interface User {
  id: number
  name: string
  email: string
  role: string
  status?: string
  tone?: string
  profile_picture?: string | null
  phone?: string | null
  bio?: string | null
  department?: string | null
  location?: string | null
  permissions?: string[]
  created_at?: string
  updated_at?: string
  [key: string]: any
}
