import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api } from '@/services/api'
import { mockApi } from '@/services/mock-api'
import type { BrandingSettings, ThemeSettings, SEOSettings, PaymentSettings } from '@/schemas/settings'

type SettingSection = 'branding' | 'theme' | 'seo' | 'payments'

const defaultBranding: Partial<BrandingSettings> = {
  mainLogo: '',
  darkLogo: '',
  lightLogo: '',
  favicon: '',
  appleTouchIcon: '',
  loginPageLogo: '',
}

const defaultTheme: Partial<ThemeSettings> = {
  primaryColor: '#465fff',
  secondaryColor: '#8B5CF6',
  accentColor: '#EC4899',
  successColor: '#10B981',
  warningColor: '#F59E0B',
  errorColor: '#EF4444',
  backgroundColor: '#FFFFFF',
  sidebarColor: '#F9FAFB',
  headerColor: '#FFFFFF',
  cardColor: '#FFFFFF',
  buttonColor: '#465fff',
  fontFamily: 'Inter, system-ui, sans-serif',
  headingFont: 'Poppins, system-ui, sans-serif',
  bodyFont: 'Inter, system-ui, sans-serif',
  sidebarWidth: 280,
  cardBorderRadius: 12,
  containerWidth: 1280,
  isCollapsedDefault: false,
  isFixedHeader: true,
  isFixedSidebar: true,
  themeMode: 'light' as const,
}

const defaultSEO: Partial<SEOSettings> = {
  defaultMetaTitle: 'Kukaqka CMS',
  defaultMetaDescription: 'Admin Control Panel',
  defaultKeywords: 'cms, admin, dashboard',
  robotsMetaTag: 'index, follow',
  openGraphTitle: '',
  openGraphDescription: '',
  openGraphImage: '',
  twitterTitle: '',
  twitterDescription: '',
  twitterCardImage: '',
  sitemapURL: '',
  robotsTxt: 'User-agent: *\nAllow: /',
  canonicalURL: '',
  googleVerificationCode: '',
  bingVerificationCode: '',
}

const defaultPayments: Partial<PaymentSettings> = {
  status: 'coming-soon' as const,
}

export const useSettingsStore = defineStore('settings', () => {
  const branding = ref<Partial<BrandingSettings>>(JSON.parse(JSON.stringify(defaultBranding)))
  const theme = ref<Partial<ThemeSettings>>(JSON.parse(JSON.stringify(defaultTheme)))
  const seo = ref<Partial<SEOSettings>>(JSON.parse(JSON.stringify(defaultSEO)))
  const payments = ref<Partial<PaymentSettings>>(JSON.parse(JSON.stringify(defaultPayments)))

  const savingSection = ref<SettingSection | null>(null)
  const errors = ref<Record<string, Record<string, string>>>({})
  const originalState = ref<Record<string, Partial<Record<string, unknown>>>>({
    branding: JSON.parse(JSON.stringify(defaultBranding)),
    theme: JSON.parse(JSON.stringify(defaultTheme)),
    seo: JSON.parse(JSON.stringify(defaultSEO)),
    payments: JSON.parse(JSON.stringify(defaultPayments)),
  })

  const sections = {
    branding,
    theme,
    seo,
    payments,
  } as const

  async function loadSettings(section: SettingSection) {
    try {
      const response = await api.get(`/admin/settings/${section}`, {
        headers: { 'X-Silent-Error': '1' },
      })
      const data = response.data || {}

      sections[section].value = { ...sections[section].value, ...data }
      originalState.value[section] = JSON.parse(JSON.stringify(sections[section].value))
    } catch (error: any) {
      // If backend endpoint doesn't exist (404), try mock API
      if (error.response?.status === 404) {
        try {
          const mockResponse = await mockApi.getSettings(section)
          const data = mockResponse.data || {}

          if (Object.keys(data).length > 0) {
            sections[section].value = { ...sections[section].value, ...data }
            originalState.value[section] = JSON.parse(JSON.stringify(sections[section].value))
          }
        } catch {
          // Mock API also failed, use defaults (already set)
        }
      } else {
        console.error(`Failed to load ${section} settings:`, error.message)
      }
    }
  }

  async function saveSettings(section: SettingSection, data: Partial<Record<string, unknown>>) {
    savingSection.value = section
    try {
      const response = await api.post(`/admin/settings/${section}`, data, {
        headers: { 'X-Silent-Error': '1' },
      })
      const result = response.data || data
      sections[section].value = result as any
      originalState.value[section] = JSON.parse(JSON.stringify(result))
      errors.value[section] = {}
      return true
    } catch (error: any) {
      // If backend endpoint doesn't exist (404), use mock API
      if (error.response?.status === 404) {
        try {
          const mockResponse = await mockApi.saveSettings(section, data as any)
          const result = mockResponse.data || data
          sections[section].value = result as any
          originalState.value[section] = JSON.parse(JSON.stringify(result))
          errors.value[section] = {}
          console.info(`✅ Settings saved locally (mock API - backend not ready yet)`)
          return true
        } catch (mockError) {
          console.error('Mock API failed:', mockError)
          if (errors.value[section] === undefined) {
            errors.value[section] = {}
          }
          errors.value[section].save = 'Failed to save settings'
          return false
        }
      } else {
        if (errors.value[section] === undefined) {
          errors.value[section] = {}
        }
        errors.value[section].save = error.response?.data?.message || 'Failed to save settings'
        return false
      }
    } finally {
      savingSection.value = null
    }
  }

  function resetSettings(section: SettingSection) {
    sections[section].value = JSON.parse(JSON.stringify(originalState.value[section] || {}))
    errors.value[section] = {}
  }

  const isDirty = (section: SettingSection): boolean => {
    return JSON.stringify(sections[section].value) !== JSON.stringify(originalState.value[section] || {})
  }

  const isSaving = (section: SettingSection): boolean => {
    return savingSection.value === section
  }

  const sectionErrors = (section: SettingSection): Record<string, string> => {
    return errors.value[section] || {}
  }

  return {
    branding,
    theme,
    seo,
    payments,
    loadSettings,
    saveSettings,
    resetSettings,
    isDirty: computed(() => isDirty),
    isSaving: computed(() => isSaving),
    sectionErrors: computed(() => sectionErrors),
  }
})
