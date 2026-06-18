<script setup lang="ts">
import { onMounted, ref, watch } from "vue"
import { api } from "@/services/api"

const baseUrl = import.meta.env.BASE_URL

interface AppSettings {
  app_name: string
  app_email: string
}

interface BrandingSettings {
  mainLogo: string
  darkLogo: string
  lightLogo: string
  favicon: string
  appleTouchIcon: string
  loginPageLogo: string
}

interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  successColor: string
  warningColor: string
  errorColor: string
  backgroundColor: string
  sidebarColor: string
  headerColor: string
  cardColor: string
  buttonColor: string
  fontFamily: string
  headingFont: string
  bodyFont: string
  sidebarWidth: number
  cardBorderRadius: number
  containerWidth: number
  isCollapsedDefault: boolean
  isFixedHeader: boolean
  isFixedSidebar: boolean
  themeMode: string
}

interface SeoSettings {
  defaultMetaTitle: string
  defaultMetaDescription: string
  defaultKeywords: string
  robotsMetaTag: string
  openGraphTitle: string
  openGraphDescription: string
  openGraphImage: string
  twitterTitle: string
  twitterDescription: string
  twitterCardImage: string
  sitemapURL: string
  robotsTxt: string
  canonicalURL: string
  googleVerificationCode: string
  bingVerificationCode: string
}

interface OAuthSettings {
  google_client_id: string
  google_client_secret: string
  google_redirect_uri: string
  facebook_app_id: string
  facebook_app_secret: string
  facebook_redirect_uri: string
  oauth_enabled: boolean
}

// Settings state with save indicators
const appSettings = ref<AppSettings>({ app_name: "Kukaqka", app_email: "hello@kukaqka.com" })
const appSaveState = ref<'idle' | 'saving' | 'saved'>('idle')

const brandingSettings = ref<BrandingSettings>({
  mainLogo: "",
  darkLogo: "",
  lightLogo: "",
  favicon: "",
  appleTouchIcon: "",
  loginPageLogo: "",
})
const brandingSaveState = ref<'idle' | 'saving' | 'saved'>('idle')

const themeSettings = ref<ThemeSettings>({
  primaryColor: "#3b82f6",
  secondaryColor: "#6366f1",
  accentColor: "#06b6d4",
  successColor: "#10b981",
  warningColor: "#f59e0b",
  errorColor: "#ef4444",
  backgroundColor: "#ffffff",
  sidebarColor: "#f9fafb",
  headerColor: "#ffffff",
  cardColor: "#ffffff",
  buttonColor: "#3b82f6",
  fontFamily: "Inter",
  headingFont: "Inter",
  bodyFont: "Inter",
  sidebarWidth: 280,
  cardBorderRadius: 8,
  containerWidth: 1280,
  isCollapsedDefault: false,
  isFixedHeader: true,
  isFixedSidebar: true,
  themeMode: "light",
})
const themeSaveState = ref<'idle' | 'saving' | 'saved'>('idle')
const themeModeOptions = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
]

const seoSettings = ref<SeoSettings>({
  defaultMetaTitle: "Kukaqka",
  defaultMetaDescription: "Discover amazing places and listings",
  defaultKeywords: "listings, places, directory",
  robotsMetaTag: "index, follow",
  openGraphTitle: "",
  openGraphDescription: "",
  openGraphImage: "",
  twitterTitle: "",
  twitterDescription: "",
  twitterCardImage: "",
  sitemapURL: "",
  robotsTxt: "",
  canonicalURL: "",
  googleVerificationCode: "",
  bingVerificationCode: "",
})
const seoSaveState = ref<'idle' | 'saving' | 'saved'>('idle')

const paymentSettings = ref({ status: "coming-soon" })
const paymentSaveState = ref<'idle' | 'saving' | 'saved'>('idle')
const paymentStatusOptions = [
  { label: "Coming Soon", value: "coming-soon" },
  { label: "Active", value: "active" },
]

const oauthSettings = ref<OAuthSettings>({
  google_client_id: "",
  google_client_secret: "",
  google_redirect_uri: "https://admin.kukaqka.com/auth/callback/google",
  facebook_app_id: "",
  facebook_app_secret: "",
  facebook_redirect_uri: "https://admin.kukaqka.com/auth/callback/facebook",
  oauth_enabled: false,
})
const oauthSaveState = ref<'idle' | 'saving' | 'saved'>('idle')

// Debounce timers
let appSettingsDebounce: any = null
let brandingSettingsDebounce: any = null
let themeSettingsDebounce: any = null
let seoSettingsDebounce: any = null
let paymentSettingsDebounce: any = null
let oauthSettingsDebounce: any = null

// Reset save state after delay
function resetSaveState(state: typeof appSaveState, delay = 2500) {
  setTimeout(() => {
    state.value = 'idle'
  }, delay)
}

// Auto-save watchers with debouncing
watch(
  () => appSettings.value,
  () => {
    appSaveState.value = 'idle'
    if (appSettingsDebounce) clearTimeout(appSettingsDebounce)
    appSettingsDebounce = setTimeout(() => {
      saveAppSettings()
    }, 1000)
  },
  { deep: true }
)

watch(
  () => brandingSettings.value,
  () => {
    brandingSaveState.value = 'idle'
    if (brandingSettingsDebounce) clearTimeout(brandingSettingsDebounce)
    brandingSettingsDebounce = setTimeout(() => {
      saveBrandingSettings()
    }, 1000)
  },
  { deep: true }
)

watch(
  () => themeSettings.value,
  () => {
    themeSaveState.value = 'idle'
    if (themeSettingsDebounce) clearTimeout(themeSettingsDebounce)
    themeSettingsDebounce = setTimeout(() => {
      saveThemeSettings()
    }, 1000)
  },
  { deep: true }
)

watch(
  () => seoSettings.value,
  () => {
    seoSaveState.value = 'idle'
    if (seoSettingsDebounce) clearTimeout(seoSettingsDebounce)
    seoSettingsDebounce = setTimeout(() => {
      saveSeoSettings()
    }, 1000)
  },
  { deep: true }
)

watch(
  () => paymentSettings.value,
  () => {
    paymentSaveState.value = 'idle'
    if (paymentSettingsDebounce) clearTimeout(paymentSettingsDebounce)
    paymentSettingsDebounce = setTimeout(() => {
      savePaymentSettings()
    }, 1000)
  },
  { deep: true }
)

watch(
  () => oauthSettings.value,
  () => {
    oauthSaveState.value = 'idle'
    if (oauthSettingsDebounce) clearTimeout(oauthSettingsDebounce)
    oauthSettingsDebounce = setTimeout(() => {
      saveOAuthSettings()
    }, 1000)
  },
  { deep: true }
)

async function saveAppSettings() {
  try {
    appSaveState.value = 'saving'
    const settings = [
      { group: "app", key: "name", value: appSettings.value.app_name },
      { group: "app", key: "email", value: appSettings.value.app_email },
    ]
    await api.post("/settings", { settings })
    appSaveState.value = 'saved'
    resetSaveState(appSaveState)
  } catch (error: any) {
    appSaveState.value = 'idle'
  }
}

async function saveBrandingSettings() {
  try {
    brandingSaveState.value = 'saving'
    await api.post("/settings/branding", brandingSettings.value)
    brandingSaveState.value = 'saved'
    resetSaveState(brandingSaveState)
  } catch (error: any) {
    brandingSaveState.value = 'idle'
  }
}

async function saveThemeSettings() {
  try {
    themeSaveState.value = 'saving'
    await api.post("/settings/theme", themeSettings.value)
    themeSaveState.value = 'saved'
    resetSaveState(themeSaveState)
  } catch (error: any) {
    themeSaveState.value = 'idle'
  }
}

async function saveSeoSettings() {
  try {
    seoSaveState.value = 'saving'
    await api.post("/settings/seo", seoSettings.value)
    seoSaveState.value = 'saved'
    resetSaveState(seoSaveState)
  } catch (error: any) {
    seoSaveState.value = 'idle'
  }
}

async function savePaymentSettings() {
  try {
    paymentSaveState.value = 'saving'
    await api.post("/settings/payments", paymentSettings.value)
    paymentSaveState.value = 'saved'
    resetSaveState(paymentSaveState)
  } catch (error: any) {
    paymentSaveState.value = 'idle'
  }
}

async function saveOAuthSettings() {
  try {
    oauthSaveState.value = 'saving'
    await api.post("/settings/oauth", oauthSettings.value)
    oauthSaveState.value = 'saved'
    resetSaveState(oauthSaveState)
  } catch (error: any) {
    oauthSaveState.value = 'idle'
  }
}

onMounted(async () => {
  // Settings initialized with defaults
})
</script>

<template>
  <div class="settings-container">
    <!-- Header -->
    <div class="settings-header">
      <div>
        <h1 class="settings-title">System Settings</h1>
        <p class="settings-subtitle">Configure application settings and preferences</p>
      </div>
    </div>

    <!-- General Settings Card -->
    <div class="settings-card">
      <div class="card-header">
        <div class="card-header-content">
          <div class="card-icon">⚙️</div>
          <div>
            <h2 class="card-title">General Settings</h2>
            <p class="card-description">Manage basic application configuration</p>
          </div>
        </div>
        <div :class="['save-indicator', appSaveState]">
          <i v-if="appSaveState === 'saving'" class="pi pi-spin pi-spinner"></i>
          <i v-if="appSaveState === 'saved'" class="pi pi-check"></i>
        </div>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">Application Name</label>
          <input
            v-model="appSettings.app_name"
            type="text"
            class="form-input"
            placeholder="Enter application name"
          />
          <p class="form-hint">The name displayed throughout the application</p>
        </div>
        <div class="form-group">
          <label class="form-label">Admin Email</label>
          <input
            v-model="appSettings.app_email"
            type="email"
            class="form-input"
            placeholder="admin@example.com"
          />
          <p class="form-hint">Primary contact email for system notifications</p>
        </div>
      </div>
    </div>

    <!-- Branding Settings Card -->
    <div class="settings-card">
      <div class="card-header">
        <div class="card-header-content">
          <div class="card-icon">🎨</div>
          <div>
            <h2 class="card-title">Branding Settings</h2>
            <p class="card-description">Configure logos and brand assets</p>
          </div>
        </div>
        <div :class="['save-indicator', brandingSaveState]">
          <i v-if="brandingSaveState === 'saving'" class="pi pi-spin pi-spinner"></i>
          <i v-if="brandingSaveState === 'saved'" class="pi pi-check"></i>
        </div>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">Main Logo URL</label>
          <input
            v-model="brandingSettings.mainLogo"
            type="url"
            class="form-input"
            placeholder="https://example.com/logo.png"
          />
          <p class="form-hint">URL to your primary logo image</p>
        </div>
        <div class="form-group">
          <label class="form-label">Dark Logo URL</label>
          <input
            v-model="brandingSettings.darkLogo"
            type="url"
            class="form-input"
            placeholder="https://example.com/logo-dark.png"
          />
          <p class="form-hint">Logo for dark theme display</p>
        </div>
        <div class="form-group">
          <label class="form-label">Login Page Logo URL</label>
          <input
            v-model="brandingSettings.loginPageLogo"
            type="url"
            class="form-input"
            placeholder="https://example.com/login-logo.png"
          />
          <p class="form-hint">Logo displayed on login page</p>
        </div>
        <div class="form-group">
          <label class="form-label">Favicon URL</label>
          <input
            v-model="brandingSettings.favicon"
            type="url"
            class="form-input"
            placeholder="https://example.com/favicon.ico"
          />
          <p class="form-hint">Icon displayed in browser tab</p>
        </div>
      </div>
    </div>

    <!-- Theme Settings Card -->
    <div class="settings-card">
      <div class="card-header">
        <div class="card-header-content">
          <div class="card-icon">🎭</div>
          <div>
            <h2 class="card-title">Theme Settings</h2>
            <p class="card-description">Customize colors and layout preferences</p>
          </div>
        </div>
        <div :class="['save-indicator', themeSaveState]">
          <i v-if="themeSaveState === 'saving'" class="pi pi-spin pi-spinner"></i>
          <i v-if="themeSaveState === 'saved'" class="pi pi-check"></i>
        </div>
      </div>
      <div class="card-body">
        <div class="form-group-row">
          <div class="form-group">
            <label class="form-label">Primary Color</label>
            <div class="color-input-wrapper">
              <input
                v-model="themeSettings.primaryColor"
                type="color"
                class="color-input"
              />
              <span class="color-value">{{ themeSettings.primaryColor }}</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Secondary Color</label>
            <div class="color-input-wrapper">
              <input
                v-model="themeSettings.secondaryColor"
                type="color"
                class="color-input"
              />
              <span class="color-value">{{ themeSettings.secondaryColor }}</span>
            </div>
          </div>
        </div>
        <div class="form-group-row">
          <div class="form-group">
            <label class="form-label">Success Color</label>
            <div class="color-input-wrapper">
              <input
                v-model="themeSettings.successColor"
                type="color"
                class="color-input"
              />
              <span class="color-value">{{ themeSettings.successColor }}</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Error Color</label>
            <div class="color-input-wrapper">
              <input
                v-model="themeSettings.errorColor"
                type="color"
                class="color-input"
              />
              <span class="color-value">{{ themeSettings.errorColor }}</span>
            </div>
          </div>
        </div>
        <div class="form-group-row">
          <div class="form-group">
            <label class="form-label">Theme Mode</label>
            <select v-model="themeSettings.themeMode" class="form-input">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Sidebar Width (px)</label>
            <input
              v-model.number="themeSettings.sidebarWidth"
              type="number"
              class="form-input"
              min="200"
              max="400"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- SEO Settings Card -->
    <div class="settings-card">
      <div class="card-header">
        <div class="card-header-content">
          <div class="card-icon">🔍</div>
          <div>
            <h2 class="card-title">SEO Settings</h2>
            <p class="card-description">Configure search engine optimization</p>
          </div>
        </div>
        <div :class="['save-indicator', seoSaveState]">
          <i v-if="seoSaveState === 'saving'" class="pi pi-spin pi-spinner"></i>
          <i v-if="seoSaveState === 'saved'" class="pi pi-check"></i>
        </div>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">Meta Title</label>
          <input
            v-model="seoSettings.defaultMetaTitle"
            type="text"
            class="form-input"
            placeholder="Page title for search engines"
            maxlength="60"
          />
          <p class="form-hint">{{ seoSettings.defaultMetaTitle.length }}/60 characters</p>
        </div>
        <div class="form-group">
          <label class="form-label">Meta Description</label>
          <textarea
            v-model="seoSettings.defaultMetaDescription"
            class="form-textarea"
            placeholder="Page description for search engines"
            rows="3"
            maxlength="160"
          ></textarea>
          <p class="form-hint">{{ seoSettings.defaultMetaDescription.length }}/160 characters</p>
        </div>
        <div class="form-group">
          <label class="form-label">Keywords</label>
          <input
            v-model="seoSettings.defaultKeywords"
            type="text"
            class="form-input"
            placeholder="keyword1, keyword2, keyword3"
          />
          <p class="form-hint">Comma-separated list of keywords</p>
        </div>
        <div class="form-group">
          <label class="form-label">Google Verification Code</label>
          <input
            v-model="seoSettings.googleVerificationCode"
            type="text"
            class="form-input"
            placeholder="Google verification code"
          />
          <p class="form-hint">From Google Search Console</p>
        </div>
      </div>
    </div>

    <!-- Payment Settings Card -->
    <div class="settings-card">
      <div class="card-header">
        <div class="card-header-content">
          <div class="card-icon">💳</div>
          <div>
            <h2 class="card-title">Payment Settings</h2>
            <p class="card-description">Configure payment system options</p>
          </div>
        </div>
        <div :class="['save-indicator', paymentSaveState]">
          <i v-if="paymentSaveState === 'saving'" class="pi pi-spin pi-spinner"></i>
          <i v-if="paymentSaveState === 'saved'" class="pi pi-check"></i>
        </div>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">Payment Status</label>
          <select v-model="paymentSettings.status" class="form-input">
            <option value="coming-soon">Coming Soon</option>
            <option value="active">Active</option>
          </select>
          <p class="form-hint">Whether payment functionality is active or coming soon</p>
        </div>
      </div>
    </div>

    <!-- OAuth Settings Card -->
    <div class="settings-card">
      <div class="card-header">
        <div class="card-header-content">
          <div class="card-icon">🔐</div>
          <div>
            <h2 class="card-title">OAuth Settings</h2>
            <p class="card-description">Configure social authentication providers</p>
          </div>
        </div>
        <div :class="['save-indicator', oauthSaveState]">
          <i v-if="oauthSaveState === 'saving'" class="pi pi-spin pi-spinner"></i>
          <i v-if="oauthSaveState === 'saved'" class="pi pi-check"></i>
        </div>
      </div>
      <div class="card-body">
        <div class="form-group">
          <div class="checkbox-wrapper">
            <input
              v-model="oauthSettings.oauth_enabled"
              type="checkbox"
              id="oauth-enabled"
              class="oauth-checkbox"
            />
            <label for="oauth-enabled" class="checkbox-label">Enable OAuth / Social Login</label>
          </div>
          <p class="form-hint">Enable social authentication for users</p>
        </div>

        <!-- Google OAuth Section -->
        <div class="oauth-section">
          <h3 class="oauth-section-title">
            <img :src="`${baseUrl}images/Google.svg`" alt="Google" class="oauth-logo" />
            Google OAuth
          </h3>
          <div class="form-group">
            <label class="form-label">Client ID</label>
            <input
              v-model="oauthSettings.google_client_id"
              type="text"
              class="form-input"
              placeholder="Your Google OAuth Client ID"
              :disabled="!oauthSettings.oauth_enabled"
            />
            <p class="form-hint">From Google Cloud Console → OAuth 2.0 Credentials</p>
          </div>
          <div class="form-group">
            <label class="form-label">Client Secret</label>
            <input
              v-model="oauthSettings.google_client_secret"
              type="password"
              class="form-input"
              placeholder="Your Google OAuth Client Secret"
              :disabled="!oauthSettings.oauth_enabled"
            />
            <p class="form-hint">Keep this secret safe - never share publicly</p>
          </div>
          <div class="form-group">
            <label class="form-label">Redirect URI</label>
            <input
              v-model="oauthSettings.google_redirect_uri"
              type="url"
              class="form-input"
              placeholder="https://admin.kukaqka.com/auth/callback/google"
              :disabled="!oauthSettings.oauth_enabled"
            />
            <p class="form-hint">Must match exactly with Google Cloud Console settings</p>
          </div>
        </div>

        <!-- Facebook OAuth Section -->
        <div class="oauth-section">
          <h3 class="oauth-section-title">
            <img :src="`${baseUrl}images/Facebook.svg`" alt="Facebook" class="oauth-logo" />
            Facebook OAuth
          </h3>
          <div class="form-group">
            <label class="form-label">App ID</label>
            <input
              v-model="oauthSettings.facebook_app_id"
              type="text"
              class="form-input"
              placeholder="Your Facebook App ID"
              :disabled="!oauthSettings.oauth_enabled"
            />
            <p class="form-hint">From Facebook Developers → My Apps → App ID</p>
          </div>
          <div class="form-group">
            <label class="form-label">App Secret</label>
            <input
              v-model="oauthSettings.facebook_app_secret"
              type="password"
              class="form-input"
              placeholder="Your Facebook App Secret"
              :disabled="!oauthSettings.oauth_enabled"
            />
            <p class="form-hint">Keep this secret safe - never share publicly</p>
          </div>
          <div class="form-group">
            <label class="form-label">Redirect URI</label>
            <input
              v-model="oauthSettings.facebook_redirect_uri"
              type="url"
              class="form-input"
              placeholder="https://admin.kukaqka.com/auth/callback/facebook"
              :disabled="!oauthSettings.oauth_enabled"
            />
            <p class="form-hint">Must match exactly with Facebook App settings</p>
          </div>
        </div>

        <!-- Documentation Section -->
        <div class="documentation-section">
          <h3 class="documentation-title">📚 Setup Guide</h3>
          <div class="guide-steps">
            <div class="guide-step">
              <strong>1. Google OAuth Setup:</strong>
              <ol>
                <li>Go to <a href="https://console.cloud.google.com" target="_blank">Google Cloud Console</a></li>
                <li>Create a new project or select existing</li>
                <li>Enable Google+ API</li>
                <li>Go to "Credentials" → Create OAuth 2.0 Client ID</li>
                <li>Set Authorized redirect URIs to: {{ oauthSettings.google_redirect_uri }}</li>
                <li>Copy Client ID and Secret above</li>
              </ol>
            </div>
            <div class="guide-step">
              <strong>2. Facebook OAuth Setup:</strong>
              <ol>
                <li>Go to <a href="https://developers.facebook.com" target="_blank">Facebook Developers</a></li>
                <li>Create a new app or select existing</li>
                <li>Add "Facebook Login" product</li>
                <li>In Settings → Basic, get App ID and App Secret</li>
                <li>In Settings → Basic, add Valid OAuth Redirect URIs: {{ oauthSettings.facebook_redirect_uri }}</li>
                <li>Copy App ID and Secret above</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%);
}

/* Header */
.settings-header {
  margin-bottom: 2rem;
}

.settings-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.settings-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

/* Card Container */
.settings-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.settings-card:hover {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 1px solid #e5e7eb;
}

.card-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-icon {
  font-size: 1.75rem;
  line-height: 1;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.card-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

/* Save Indicator */
.save-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.save-indicator.idle {
  opacity: 0;
}

.save-indicator.saving {
  background: #f0f9ff;
  color: #0369a1;
  opacity: 1;
}

.save-indicator.saved {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #065f46;
  opacity: 1;
}

/* Card Body */
.card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Forms */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}

.form-input,
.form-textarea {
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: none;
  font-family: inherit;
}

.form-hint {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0;
  margin-top: 0.25rem;
}

/* Color Input */
.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.color-input {
  width: 3rem;
  height: 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-input:hover {
  border-color: #d1d5db;
}

.color-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.color-value {
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 0.8rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
}

/* OAuth Checkbox */
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.oauth-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  accent-color: #3b82f6;
}

.checkbox-label {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1f2937;
  cursor: pointer;
}

/* OAuth Sections */
.oauth-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.oauth-section:first-of-type {
  border-top: none;
  padding-top: 0;
  margin-top: 0;
}

.oauth-section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.oauth-logo {
  width: 1.5rem;
  height: 1.5rem;
  object-fit: contain;
}

/* Documentation Section */
.documentation-section {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-top: 2rem;
}

.documentation-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0369a1;
  margin: 0 0 1rem 0;
}

.guide-steps {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.guide-step {
  font-size: 0.875rem;
  color: #0c4a6e;
}

.guide-step strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #075985;
}

.guide-step ol {
  margin: 0.5rem 0 0 1.25rem;
  padding: 0;
}

.guide-step li {
  margin-bottom: 0.375rem;
  line-height: 1.5;
}

.guide-step a {
  color: #0284c7;
  text-decoration: none;
  font-weight: 500;
}

.guide-step a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .settings-container {
    padding: 1rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .form-group-row {
    grid-template-columns: 1fr;
  }

  .guide-steps {
    grid-template-columns: 1fr;
  }

  .oauth-section-title {
    font-size: 0.95rem;
  }

  .documentation-section {
    padding: 1rem;
  }
}
</style>
