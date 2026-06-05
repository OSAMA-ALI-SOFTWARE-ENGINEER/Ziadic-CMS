// Mock API for development/testing when backend endpoints don't exist

import type { BrandingSettings, ThemeSettings, SEOSettings, PaymentSettings } from '@/schemas/settings'

const STORAGE_KEY = 'ziadic_cms_settings'

interface MockStorage {
  branding: Partial<BrandingSettings>
  theme: Partial<ThemeSettings>
  seo: Partial<SEOSettings>
  payments: Partial<PaymentSettings>
}

const defaultStorage: MockStorage = {
  branding: {},
  theme: {},
  seo: {},
  payments: {},
}

function getStorage(): MockStorage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : defaultStorage
  } catch {
    return defaultStorage
  }
}

function setStorage(data: MockStorage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

export const mockApi = {
  async getSettings(section: 'branding' | 'theme' | 'seo' | 'payments') {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const storage = getStorage()
    const data = storage[section as keyof MockStorage]

    return { data }
  },

  async saveSettings(
    section: 'branding' | 'theme' | 'seo' | 'payments',
    data: Record<string, unknown>,
  ) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const storage = getStorage()
    storage[section as keyof MockStorage] = data
    setStorage(storage)

    return { data }
  },

  async uploadFile(file: File): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        resolve(dataUrl)
      }
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      reader.readAsDataURL(file)
    })
  },

  clearAllData() {
    localStorage.removeItem(STORAGE_KEY)
  },

  getAllData() {
    return getStorage()
  },
}
