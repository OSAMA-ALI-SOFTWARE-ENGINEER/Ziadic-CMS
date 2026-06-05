import { api } from '@/services/api'
import { mockApi } from '@/services/mock-api'

export type UploadCategory = 'logo' | 'favicon' | 'og-image' | 'branding'

export async function uploadImage(file: File, category: UploadCategory = 'branding'): Promise<string> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed')
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB')
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', category)

    // DO NOT set Content-Type header - let axios set it automatically with boundary
    const response = await api.post('/admin/upload', formData)

    return response.data.url
  } catch (error: any) {
    // If backend endpoint doesn't exist yet, use mock API
    if (error.response?.status === 404) {
      console.info('📁 Using mock file upload (backend not ready yet)')
      return await mockApi.uploadFile(file)
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      throw new Error('Session expired. Please sign in again.')
    }

    throw error
  }
}
