<script setup lang="ts">
import { onMounted, ref, watch } from "vue"
import Button from "primevue/button"
import InputText from "primevue/inputtext"
import InputNumber from "primevue/inputnumber"
import TextArea from "primevue/textarea"
import Toast from "primevue/toast"
import ConfirmDialog from "primevue/confirmdialog"
import ColorPicker from "primevue/colorpicker"
import Select from "primevue/select"
import Accordion from "primevue/accordion"
import AccordionPanel from "primevue/accordionpanel"
import { useToast } from "primevue/usetoast"
import { useConfirm } from "primevue/useconfirm"
import SkeletonCard from "@/components/SkeletonCard.vue"
import { api } from "@/services/api"

const toast = useToast()
const confirm = useConfirm()

// General Settings
const appSettings = ref({ app_name: "Kukaqka", app_email: "hello@kukaqka.com" })
const appLoading = ref(true)

// Branding Settings
const brandingSettings = ref({
  mainLogo: "",
  darkLogo: "",
  lightLogo: "",
  favicon: "",
  appleTouchIcon: "",
  loginPageLogo: "",
})
const brandingLoading = ref(true)

// Theme Settings
const themeSettings = ref({
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
const themeLoading = ref(true)
const themeModeOptions = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
]

// SEO Settings
const seoSettings = ref({
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
const seoLoading = ref(true)

// Payments Settings
const paymentSettings = ref({ status: "coming-soon" })
const paymentLoading = ref(true)
const paymentStatusOptions = [
  { label: "Coming Soon", value: "coming-soon" },
  { label: "Active", value: "active" },
]

// Debounce timer
let appSettingsDebounce: any = null
let brandingSettingsDebounce: any = null
let themeSettingsDebounce: any = null
let seoSettingsDebounce: any = null
let paymentSettingsDebounce: any = null

// Auto-save watchers with debouncing
watch(
  () => appSettings.value,
  () => {
    if (appSettingsDebounce) clearTimeout(appSettingsDebounce)
    appSettingsDebounce = setTimeout(() => {
      saveAppSettings()
    }, 1500)
  },
  { deep: true }
)

watch(
  () => brandingSettings.value,
  () => {
    if (brandingSettingsDebounce) clearTimeout(brandingSettingsDebounce)
    brandingSettingsDebounce = setTimeout(() => {
      saveBrandingSettings()
    }, 1500)
  },
  { deep: true }
)

watch(
  () => themeSettings.value,
  () => {
    if (themeSettingsDebounce) clearTimeout(themeSettingsDebounce)
    themeSettingsDebounce = setTimeout(() => {
      saveThemeSettings()
    }, 1500)
  },
  { deep: true }
)

watch(
  () => seoSettings.value,
  () => {
    if (seoSettingsDebounce) clearTimeout(seoSettingsDebounce)
    seoSettingsDebounce = setTimeout(() => {
      saveSeoSettings()
    }, 1500)
  },
  { deep: true }
)

watch(
  () => paymentSettings.value,
  () => {
    if (paymentSettingsDebounce) clearTimeout(paymentSettingsDebounce)
    paymentSettingsDebounce = setTimeout(() => {
      savePaymentSettings()
    }, 1500)
  },
  { deep: true }
)

// Load all settings
async function loadAllSettings() {
  // Settings only - location management moved to separate page
  appLoading.value = false
  brandingLoading.value = false
  themeLoading.value = false
  seoLoading.value = false
  paymentLoading.value = false
}

async function saveAppSettings() {
  try {
    appLoading.value = true
    const settings = [
      { group: "app", key: "name", value: appSettings.value.app_name },
      { group: "app", key: "email", value: appSettings.value.app_email },
    ]
    await api.post("/settings", { settings })
    toast.add({ severity: "success", summary: "Success", detail: "Settings saved" })
  } catch (error: any) {
    console.error("Failed to save app settings:", error)
    toast.add({ severity: "error", summary: "Error", detail: error.response?.data?.message || "Failed to save settings" })
  } finally {
    appLoading.value = false
  }
}

async function saveBrandingSettings() {
  try {
    brandingLoading.value = true
    await api.post("/settings/branding", brandingSettings.value)
    toast.add({ severity: "success", summary: "Success", detail: "Branding settings saved" })
  } catch (error: any) {
    console.error("Failed to save branding settings:", error)
    toast.add({ severity: "error", summary: "Error", detail: error.response?.data?.message || "Failed to save branding settings" })
  } finally {
    brandingLoading.value = false
  }
}

async function saveThemeSettings() {
  try {
    themeLoading.value = true
    await api.post("/settings/theme", themeSettings.value)
    toast.add({ severity: "success", summary: "Success", detail: "Theme settings saved" })
  } catch (error: any) {
    console.error("Failed to save theme settings:", error)
    toast.add({ severity: "error", summary: "Error", detail: error.response?.data?.message || "Failed to save theme settings" })
  } finally {
    themeLoading.value = false
  }
}

async function saveSeoSettings() {
  try {
    seoLoading.value = true
    await api.post("/settings/seo", seoSettings.value)
    toast.add({ severity: "success", summary: "Success", detail: "SEO settings saved" })
  } catch (error: any) {
    console.error("Failed to save SEO settings:", error)
    toast.add({ severity: "error", summary: "Error", detail: error.response?.data?.message || "Failed to save SEO settings" })
  } finally {
    seoLoading.value = false
  }
}

async function savePaymentSettings() {
  try {
    paymentLoading.value = true
    await api.post("/settings/payments", paymentSettings.value)
    toast.add({ severity: "success", summary: "Success", detail: "Payment settings saved" })
  } catch (error: any) {
    console.error("Failed to save payment settings:", error)
    toast.add({ severity: "error", summary: "Error", detail: error.response?.data?.message || "Failed to save payment settings" })
  } finally {
    paymentLoading.value = false
  }
}


onMounted(async () => {
  await loadAllSettings()
})
</script>

<template>
  <div class="settings-page">
    <Toast />
    <ConfirmDialog />
    <div class="settings-header">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
      <p class="text-gray-600">Manage application configuration and content</p>
    </div>

    <Accordion class="settings-accordion">
      <!-- General Settings -->
      <AccordionPanel>
        <template #header>
          <span class="flex items-center gap-3">
            <span class="text-xl">⚙️</span>
            <span class="font-semibold text-gray-900">General Settings</span>
          </span>
        </template>
        <div v-if="appLoading" class="p-6">
          <SkeletonCard type="table-row" :count="3" />
        </div>
        <div v-else class="p-6 max-w-2xl">
          <div class="space-y-6">
            <div>
              <label class="block font-semibold mb-2 text-gray-700">App Name</label>
              <InputText v-model="appSettings.app_name" class="w-full" placeholder="Application name" />
            </div>
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Admin Email</label>
              <InputText v-model="appSettings.app_email" type="email" class="w-full" placeholder="admin@example.com" />
            </div>
            <div class="flex gap-2">
              <Button label="Save Settings" icon="pi pi-save" class="p-button-success" @click="saveAppSettings" :loading="appLoading" />
            </div>
          </div>
        </div>
      </AccordionPanel>

      <!-- Branding Settings -->
      <AccordionPanel>
        <template #header>
          <span class="flex items-center gap-3">
            <span class="text-xl">🎨</span>
            <span class="font-semibold text-gray-900">Branding Settings</span>
          </span>
        </template>
        <div v-if="brandingLoading" class="p-6">
          <SkeletonCard type="table-row" :count="3" />
        </div>
        <div v-else class="p-6 max-w-2xl">
          <div class="space-y-4">
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Main Logo URL</label>
              <InputText v-model="brandingSettings.mainLogo" class="w-full" placeholder="https://example.com/logo.png" type="url" />
            </div>
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Dark Logo URL</label>
              <InputText v-model="brandingSettings.darkLogo" class="w-full" placeholder="https://example.com/logo-dark.png" type="url" />
            </div>
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Login Page Logo URL</label>
              <InputText v-model="brandingSettings.loginPageLogo" class="w-full" placeholder="https://example.com/login-logo.png" type="url" />
            </div>
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Favicon URL</label>
              <InputText v-model="brandingSettings.favicon" class="w-full" placeholder="https://example.com/favicon.ico" type="url" />
            </div>
            <div class="flex gap-2 pt-4">
              <Button label="Save Branding" icon="pi pi-save" class="p-button-success" @click="saveBrandingSettings" :loading="brandingLoading" />
            </div>
          </div>
        </div>
      </AccordionPanel>

      <!-- Theme Settings -->
      <AccordionPanel>
        <template #header>
          <span class="flex items-center gap-3">
            <span class="text-xl">🎭</span>
            <span class="font-semibold text-gray-900">Theme Settings</span>
          </span>
        </template>
        <div v-if="themeLoading" class="p-6">
          <SkeletonCard type="table-row" :count="3" />
        </div>
        <div v-else class="p-6 max-w-3xl">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Primary Color</label>
              <ColorPicker v-model="themeSettings.primaryColor" :inline="false" class="w-full" />
            </div>
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Secondary Color</label>
              <ColorPicker v-model="themeSettings.secondaryColor" :inline="false" class="w-full" />
            </div>
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Success Color</label>
              <ColorPicker v-model="themeSettings.successColor" :inline="false" class="w-full" />
            </div>
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Error Color</label>
              <ColorPicker v-model="themeSettings.errorColor" :inline="false" class="w-full" />
            </div>
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Theme Mode</label>
              <Select v-model="themeSettings.themeMode" :options="themeModeOptions" option-label="label" option-value="value" class="w-full" />
            </div>
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Sidebar Width</label>
              <InputNumber v-model="themeSettings.sidebarWidth" class="w-full" :min="200" :max="400" />
            </div>
          </div>
          <div class="flex gap-2 pt-6">
            <Button label="Save Theme" icon="pi pi-save" class="p-button-success" @click="saveThemeSettings" :loading="themeLoading" />
          </div>
        </div>
      </AccordionPanel>

      <!-- SEO Settings -->
      <AccordionPanel>
        <template #header>
          <span class="flex items-center gap-3">
            <span class="text-xl">🔍</span>
            <span class="font-semibold text-gray-900">SEO Settings</span>
          </span>
        </template>
        <div v-if="seoLoading" class="p-6">
          <SkeletonCard type="table-row" :count="3" />
        </div>
        <div v-else class="p-6 max-w-2xl">
          <div class="space-y-4">
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Meta Title</label>
              <InputText v-model="seoSettings.defaultMetaTitle" class="w-full" placeholder="Page title for search engines" maxlength="60" />
            </div>
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Meta Description</label>
              <textarea v-model="seoSettings.defaultMetaDescription" class="w-full p-2 border border-gray-200 rounded-lg" rows="3" maxlength="160" placeholder="Page description for search engines"></textarea>
            </div>
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Keywords</label>
              <InputText v-model="seoSettings.defaultKeywords" class="w-full" placeholder="keyword1, keyword2, keyword3" />
            </div>
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Google Verification Code</label>
              <InputText v-model="seoSettings.googleVerificationCode" class="w-full" placeholder="Google verification code" />
            </div>
            <div class="flex gap-2 pt-4">
              <Button label="Save SEO" icon="pi pi-save" class="p-button-success" @click="saveSeoSettings" :loading="seoLoading" />
            </div>
          </div>
        </div>
      </AccordionPanel>

      <!-- Payments Settings -->
      <AccordionPanel>
        <template #header>
          <span class="flex items-center gap-3">
            <span class="text-xl">💳</span>
            <span class="font-semibold text-gray-900">Payment Settings</span>
          </span>
        </template>
        <div v-if="paymentLoading" class="p-6">
          <SkeletonCard type="table-row" :count="2" />
        </div>
        <div v-else class="p-6 max-w-2xl">
          <div class="space-y-4">
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Payment Status</label>
              <Select v-model="paymentSettings.status" :options="paymentStatusOptions" option-label="label" option-value="value" class="w-full" />
            </div>
            <div class="flex gap-2 pt-4">
              <Button label="Save Payments" icon="pi pi-save" class="p-button-success" @click="savePaymentSettings" :loading="paymentLoading" />
            </div>
          </div>
        </div>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<style scoped>
.settings-page {
  padding: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.settings-header {
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.settings-accordion {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

:deep(.p-accordion) {
  border: none;
}

:deep(.p-accordion .p-accordion-header) {
  background-color: white;
  border: none;
  border-bottom: 1px solid #e5e7eb;
  padding: 0;
}

:deep(.p-accordion .p-accordion-header button) {
  padding: 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  color: #1f2937;
  transition: all 0.3s ease;
}

:deep(.p-accordion .p-accordion-header:hover button) {
  background-color: #f3f4f6;
}

:deep(.p-accordion .p-accordion-header.p-highlight button) {
  background-color: #f0f9ff;
  color: #0369a1;
}

:deep(.p-accordion .p-accordion-content) {
  padding: 0;
  background-color: white;
  border: none;
}

:deep(.p-accordion .p-accordion-content > p) {
  padding: 1.5rem;
}

:deep(.nested-tabs .p-tabs) {
  border: none;
}

:deep(.nested-tabs .p-tablist) {
  background-color: #f9fafb;
  border: none;
  border-bottom: 2px solid #e5e7eb;
  padding: 0;
}

:deep(.nested-tabs .p-tab button) {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #6b7280;
  border: none;
}

:deep(.nested-tabs .p-tab button.p-highlight) {
  color: #0369a1;
  border-bottom: 3px solid #0369a1;
}

:deep(.nested-tabs .p-tabpanels) {
  background-color: white;
  border: none;
  padding: 0;
}

:deep(.p-datatable) {
  border: none;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-weight: 700;
  border: none;
  padding: 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  border-color: #e5e7eb;
  padding: 1rem;
  color: #374151;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f9fafb;
}

:deep(.p-inputtext),
:deep(.p-select),
:deep(.p-inputnumber) {
  border-radius: 6px;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
}

:deep(.p-inputtext:focus),
:deep(.p-select:focus),
:deep(.p-inputnumber:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.p-button) {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.p-button-success) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
}

:deep(.p-button-success:hover) {
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

:deep(.p-dialog) {
  border-radius: 12px;
}

:deep(.p-dialog .p-dialog-header) {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 12px 12px 0 0;
}

:deep(.p-colorpicker) {
  border-radius: 6px;
}
</style>
