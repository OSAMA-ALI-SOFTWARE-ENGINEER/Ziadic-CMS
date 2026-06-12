<script setup lang="ts">
import { onMounted, ref } from "vue"
import Button from "primevue/button"
import InputText from "primevue/inputtext"
import InputNumber from "primevue/inputnumber"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import Dialog from "primevue/dialog"
import Toast from "primevue/toast"
import ConfirmDialog from "primevue/confirmdialog"
import ColorPicker from "primevue/colorpicker"
import Select from "primevue/select"
import Accordion from "primevue/accordion"
import AccordionTab from "primevue/accordiontab"
import TabView from "primevue/tabview"
import TabPanel from "primevue/tabpanel"
import { useToast } from "primevue/usetoast"
import { useConfirm } from "primevue/useconfirm"
import { api } from "@/services/api"

const toast = useToast()
const confirm = useConfirm()

// General Settings
const appSettings = ref({ app_name: "Kukaqka", app_email: "hello@kukaqka.com" })
const appLoading = ref(false)

// Branding Settings
const brandingSettings = ref({
  mainLogo: "",
  darkLogo: "",
  lightLogo: "",
  favicon: "",
  appleTouchIcon: "",
  loginPageLogo: "",
})
const brandingLoading = ref(false)

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
const themeLoading = ref(false)
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
const seoLoading = ref(false)

// Payments Settings
const paymentSettings = ref({ status: "coming-soon" })
const paymentLoading = ref(false)
const paymentStatusOptions = [
  { label: "Coming Soon", value: "coming-soon" },
  { label: "Active", value: "active" },
]

// Cities, Countries, Categories
const cities = ref<any[]>([])
const citiesLoading = ref(false)
const showCityDialog = ref(false)
const newCity = ref({ name: "", country_id: null })
const editingCity = ref<any>(null)

const countries = ref<any[]>([])
const countriesLoading = ref(false)
const showCountryDialog = ref(false)
const newCountry = ref({ name: "", iso2: "", iso3: "" })
const editingCountry = ref<any>(null)

const categories = ref<any[]>([])
const categoriesLoading = ref(false)
const showCategoryDialog = ref(false)
const newCategory = ref({ name: "", description: "" })
const editingCategory = ref<any>(null)

// Load all settings
async function loadAllSettings() {
  await Promise.all([
    loadCities(),
    loadCountries(),
    loadCategories(),
  ])
}

async function saveAppSettings() {
  try {
    appLoading.value = true
    const settings = [
      { group: "app", key: "name", value: appSettings.value.app_name },
      { group: "app", key: "email", value: appSettings.value.app_email },
    ]
    await api.post("/admin/settings", { settings })
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
    await api.post("/admin/settings/branding", brandingSettings.value)
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
    await api.post("/admin/settings/theme", themeSettings.value)
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
    await api.post("/admin/settings/seo", seoSettings.value)
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
    await api.post("/admin/settings/payments", paymentSettings.value)
    toast.add({ severity: "success", summary: "Success", detail: "Payment settings saved" })
  } catch (error: any) {
    console.error("Failed to save payment settings:", error)
    toast.add({ severity: "error", summary: "Error", detail: error.response?.data?.message || "Failed to save payment settings" })
  } finally {
    paymentLoading.value = false
  }
}

async function loadCities() {
  try {
    citiesLoading.value = true
    const response = await api.get("/public/cities")
    cities.value = Array.isArray(response.data) ? response.data : response.data?.data || []
  } catch (error: any) {
    console.warn("Failed to load cities:", error.message)
  } finally {
    citiesLoading.value = false
  }
}

async function loadCountries() {
  try {
    countriesLoading.value = true
    const response = await api.get("/public/countries")
    countries.value = Array.isArray(response.data) ? response.data : response.data?.data || []
  } catch (error: any) {
    console.warn("Failed to load countries:", error.message)
  } finally {
    countriesLoading.value = false
  }
}

async function loadCategories() {
  try {
    categoriesLoading.value = true
    const response = await api.get("/public/categories")
    categories.value = Array.isArray(response.data) ? response.data : response.data?.data || []
  } catch (error: any) {
    console.warn("Failed to load categories:", error.message)
  } finally {
    categoriesLoading.value = false
  }
}

async function addCity() {
  if (!newCity.value.name.trim()) {
    toast.add({ severity: "warn", summary: "Warning", detail: "Enter city name" })
    return
  }

  try {
    if (editingCity.value) {
      await api.put(`/admin/cities/${editingCity.value.id}`, newCity.value)
      toast.add({ severity: "success", summary: "Success", detail: "City updated" })
    } else {
      await api.post("/admin/cities", newCity.value)
      toast.add({ severity: "success", summary: "Success", detail: "City added" })
    }
    showCityDialog.value = false
    newCity.value = { name: "", country_id: null }
    editingCity.value = null
    await loadCities()
  } catch (error: any) {
    console.error("Failed to save city:", error)
    toast.add({ severity: "error", summary: "Error", detail: error.response?.data?.message || "Failed to save city" })
  }
}

function editCity(city: any) {
  editingCity.value = city
  newCity.value = { name: city.name, country_id: city.country_id || null }
  showCityDialog.value = true
}

function deleteCity(city: any) {
  confirm.require({
    message: `Delete "${city.name}"?`,
    header: "Delete City",
    icon: "pi pi-trash",
    accept: async () => {
      try {
        await api.delete(`/admin/cities/${city.id}`)
        toast.add({ severity: "success", summary: "Success", detail: "City deleted" })
        await loadCities()
      } catch (error: any) {
        console.error("Failed to delete city:", error)
        toast.add({ severity: "error", summary: "Error", detail: error.response?.data?.message || "Failed to delete city" })
      }
    },
  })
}

async function addCountry() {
  if (!newCountry.value.name.trim()) {
    toast.add({ severity: "warn", summary: "Warning", detail: "Enter country name" })
    return
  }

  try {
    if (editingCountry.value) {
      await api.put(`/admin/countries/${editingCountry.value.id}`, newCountry.value)
      toast.add({ severity: "success", summary: "Success", detail: "Country updated" })
    } else {
      await api.post("/admin/countries", newCountry.value)
      toast.add({ severity: "success", summary: "Success", detail: "Country added" })
    }
    showCountryDialog.value = false
    newCountry.value = { name: "", iso2: "", iso3: "" }
    editingCountry.value = null
    await loadCountries()
  } catch (error: any) {
    console.error("Failed to save country:", error)
    toast.add({ severity: "error", summary: "Error", detail: error.response?.data?.message || "Failed to save country" })
  }
}

function editCountry(country: any) {
  editingCountry.value = country
  newCountry.value = { name: country.name, iso2: country.iso2 || "", iso3: country.iso3 || "" }
  showCountryDialog.value = true
}

function deleteCountry(country: any) {
  confirm.require({
    message: `Delete "${country.name}"?`,
    header: "Delete Country",
    icon: "pi pi-trash",
    accept: async () => {
      try {
        await api.delete(`/admin/countries/${country.id}`)
        toast.add({ severity: "success", summary: "Success", detail: "Country deleted" })
        await loadCountries()
      } catch (error: any) {
        console.error("Failed to delete country:", error)
        toast.add({ severity: "error", summary: "Error", detail: error.response?.data?.message || "Failed to delete country" })
      }
    },
  })
}

async function addCategory() {
  if (!newCategory.value.name.trim()) {
    toast.add({ severity: "warn", summary: "Warning", detail: "Enter category name" })
    return
  }

  try {
    if (editingCategory.value) {
      await api.put(`/admin/categories/${editingCategory.value.id}`, newCategory.value)
      toast.add({ severity: "success", summary: "Success", detail: "Category updated" })
    } else {
      await api.post("/admin/categories", newCategory.value)
      toast.add({ severity: "success", summary: "Success", detail: "Category added" })
    }
    showCategoryDialog.value = false
    newCategory.value = { name: "", description: "" }
    editingCategory.value = null
    await loadCategories()
  } catch (error: any) {
    console.error("Failed to save category:", error)
    toast.add({ severity: "error", summary: "Error", detail: error.response?.data?.message || "Failed to save category" })
  }
}

function editCategory(category: any) {
  editingCategory.value = category
  newCategory.value = { name: category.name, description: category.description || "" }
  showCategoryDialog.value = true
}

function deleteCategory(category: any) {
  confirm.require({
    message: `Delete "${category.name}"?`,
    header: "Delete Category",
    icon: "pi pi-trash",
    accept: async () => {
      try {
        await api.delete(`/admin/categories/${category.id}`)
        toast.add({ severity: "success", summary: "Success", detail: "Category deleted" })
        await loadCategories()
      } catch (error: any) {
        console.error("Failed to delete category:", error)
        toast.add({ severity: "error", summary: "Error", detail: error.response?.data?.message || "Failed to delete category" })
      }
    },
  })
}

onMounted(async () => {
  await loadAllSettings()
})
</script>

<template>
  <div class="settings-page">
    <Toast />
    <ConfirmDialog />
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <p class="text-gray-500">Manage application configuration and content</p>
    </div>

    <Accordion class="bg-white rounded-lg border border-gray-200">
      <!-- General Settings -->
      <AccordionTab header="⚙️ General Settings">
        <div class="p-6 max-w-2xl">
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
      </AccordionTab>

      <!-- Branding Settings -->
      <AccordionTab header="🎨 Branding Settings">
        <div class="p-6 max-w-2xl">
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
      </AccordionTab>

      <!-- Theme Settings -->
      <AccordionTab header="🎭 Theme Settings">
        <div class="p-6 max-w-3xl">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Primary Color</label>
              <ColorPicker v-model="themeSettings.primaryColor" inline="false" class="w-full" />
            </div>
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Secondary Color</label>
              <ColorPicker v-model="themeSettings.secondaryColor" inline="false" class="w-full" />
            </div>
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Success Color</label>
              <ColorPicker v-model="themeSettings.successColor" inline="false" class="w-full" />
            </div>
            <div>
              <label class="block font-semibold mb-2 text-gray-700">Error Color</label>
              <ColorPicker v-model="themeSettings.errorColor" inline="false" class="w-full" />
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
      </AccordionTab>

      <!-- SEO Settings -->
      <AccordionTab header="🔍 SEO Settings">
        <div class="p-6 max-w-2xl">
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
      </AccordionTab>

      <!-- Payments Settings -->
      <AccordionTab header="💳 Payment Settings">
        <div class="p-6 max-w-2xl">
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
      </AccordionTab>

      <!-- Location Management (with nested tabs) -->
      <AccordionTab header="🌍 Location Management">
        <div class="p-6">
          <TabView class="nested-tabs">
            <TabPanel header="Cities">
              <div class="p-6">
                <div class="mb-6">
                  <Button label="+ Add City" icon="pi pi-plus" class="p-button-success" @click="() => { editingCity = null; newCity = { name: '', country_id: null }; showCityDialog = true }" />
                </div>
                <DataTable :value="cities" :loading="citiesLoading" striped-rows hover :rows="15" paginator>
                  <Column field="name" header="City Name" sortable />
                  <Column field="country.name" header="Country" />
                  <Column field="places_count" header="Listings" />
                  <Column header="Actions" style="width: 150px">
                    <template #body="{ data }">
                      <div class="flex gap-2">
                        <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-info p-button-sm" @click="editCity(data)" v-tooltip="'Edit'" />
                        <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger p-button-sm" @click="deleteCity(data)" v-tooltip="'Delete'" />
                      </div>
                    </template>
                  </Column>
                </DataTable>
              </div>
            </TabPanel>

            <TabPanel header="Countries">
              <div class="p-6">
                <div class="mb-6">
                  <Button label="+ Add Country" icon="pi pi-plus" class="p-button-success" @click="() => { editingCountry = null; newCountry = { name: '', iso2: '', iso3: '' }; showCountryDialog = true }" />
                </div>
                <DataTable :value="countries" :loading="countriesLoading" striped-rows hover :rows="15" paginator>
                  <Column field="name" header="Country Name" sortable />
                  <Column field="iso2" header="ISO2" />
                  <Column field="iso3" header="ISO3" />
                  <Column field="places_count" header="Listings" />
                  <Column header="Actions" style="width: 150px">
                    <template #body="{ data }">
                      <div class="flex gap-2">
                        <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-info p-button-sm" @click="editCountry(data)" v-tooltip="'Edit'" />
                        <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger p-button-sm" @click="deleteCountry(data)" v-tooltip="'Delete'" />
                      </div>
                    </template>
                  </Column>
                </DataTable>
              </div>
            </TabPanel>
          </TabView>
        </div>
      </AccordionTab>

      <!-- Categories -->
      <AccordionTab header="🏷️ Categories">
        <div class="p-6">
          <div class="mb-6">
            <Button label="+ Add Category" icon="pi pi-plus" class="p-button-success" @click="() => { editingCategory = null; newCategory = { name: '', description: '' }; showCategoryDialog = true }" />
          </div>
          <DataTable :value="categories" :loading="categoriesLoading" striped-rows hover :rows="15" paginator>
            <Column field="name" header="Category Name" sortable />
            <Column field="description" header="Description" />
            <Column field="places_count" header="Listings" />
            <Column header="Actions" style="width: 150px">
              <template #body="{ data }">
                <div class="flex gap-2">
                  <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-info p-button-sm" @click="editCategory(data)" v-tooltip="'Edit'" />
                  <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger p-button-sm" @click="deleteCategory(data)" v-tooltip="'Delete'" />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </AccordionTab>
    </Accordion>

    <!-- City Dialog -->
    <Dialog v-model:visible="showCityDialog" :header="editingCity ? 'Edit City' : 'Add City'" modal :style="{ width: '400px' }">
      <div class="space-y-4">
        <div>
          <label class="block font-semibold mb-2 text-gray-700">City Name</label>
          <InputText v-model="newCity.name" class="w-full" placeholder="e.g., New York" />
        </div>
        <div>
          <label class="block font-semibold mb-2 text-gray-700">Country</label>
          <select v-model="newCity.country_id" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
            <option :value="null">Select Country</option>
            <option v-for="country in countries" :key="country.id" :value="country.id">{{ country.name }}</option>
          </select>
        </div>
        <div class="flex gap-2 justify-end">
          <Button label="Cancel" class="p-button-text" @click="showCityDialog = false" />
          <Button label="Save" class="p-button-success" @click="addCity" />
        </div>
      </div>
    </Dialog>

    <!-- Country Dialog -->
    <Dialog v-model:visible="showCountryDialog" :header="editingCountry ? 'Edit Country' : 'Add Country'" modal :style="{ width: '400px' }">
      <div class="space-y-4">
        <div>
          <label class="block font-semibold mb-2 text-gray-700">Country Name</label>
          <InputText v-model="newCountry.name" class="w-full" placeholder="e.g., United States" />
        </div>
        <div>
          <label class="block font-semibold mb-2 text-gray-700">ISO2 Code</label>
          <InputText v-model="newCountry.iso2" class="w-full" placeholder="e.g., US" maxlength="2" />
        </div>
        <div>
          <label class="block font-semibold mb-2 text-gray-700">ISO3 Code</label>
          <InputText v-model="newCountry.iso3" class="w-full" placeholder="e.g., USA" maxlength="3" />
        </div>
        <div class="flex gap-2 justify-end">
          <Button label="Cancel" class="p-button-text" @click="showCountryDialog = false" />
          <Button label="Save" class="p-button-success" @click="addCountry" />
        </div>
      </div>
    </Dialog>

    <!-- Category Dialog -->
    <Dialog v-model:visible="showCategoryDialog" :header="editingCategory ? 'Edit Category' : 'Add Category'" modal :style="{ width: '400px' }">
      <div class="space-y-4">
        <div>
          <label class="block font-semibold mb-2 text-gray-700">Category Name</label>
          <InputText v-model="newCategory.name" class="w-full" placeholder="e.g., Restaurants" />
        </div>
        <div>
          <label class="block font-semibold mb-2 text-gray-700">Description</label>
          <InputText v-model="newCategory.description" class="w-full" placeholder="Optional description" />
        </div>
        <div class="flex gap-2 justify-end">
          <Button label="Cancel" class="p-button-text" @click="showCategoryDialog = false" />
          <Button label="Save" class="p-button-success" @click="addCategory" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.settings-page { padding: 0; }
:deep(.p-accordion .p-accordion-header) { background-color: #f9fafb; border-color: #e5e7eb; }
:deep(.p-accordion .p-accordion-header:not(.p-disabled).p-highlight > button) { background-color: #3b82f6; color: white; }
:deep(.p-accordion .p-accordion-header button) { padding: 1.25rem; font-weight: 600; }
:deep(.p-accordion .p-accordion-content) { padding: 0; background-color: white; }
:deep(.nested-tabs .p-tabview-nav) { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 0.25rem; }
:deep(.nested-tabs .p-tabview-nav .p-tabview-nav-btn) { padding: 0.75rem 1rem; font-size: 0.875rem; }
:deep(.p-datatable .p-datatable-thead > tr > th) { background-color: #f9fafb; border-color: #e5e7eb; padding: 0.875rem; font-weight: 700; color: #374151; font-size: 0.8rem; text-transform: uppercase; }
:deep(.p-datatable .p-datatable-tbody > tr > td) { border-color: #e5e7eb; padding: 0.875rem; }
:deep(.p-datatable .p-datatable-tbody > tr:hover) { background-color: #f9fafb; }
</style>
