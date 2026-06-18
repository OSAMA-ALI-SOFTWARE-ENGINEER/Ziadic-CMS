<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { api } from '@/services/api'
import SkeletonCard from '@/components/SkeletonCard.vue'

const toast = useToast()
const confirm = useConfirm()

const activeTab = ref('cities')

// Cities
const cities = ref<any[]>([])
const citiesLoading = ref(false)
const showCityDialog = ref(false)
const newCity = ref({ name: '', country_id: null, image: null, imageFile: null })
const editingCity = ref<any>(null)
const cityImagePreview = ref<string>('')

// Countries
const countries = ref<any[]>([])
const countriesLoading = ref(false)
const showCountryDialog = ref(false)
const newCountry = ref({ name: '', iso2: '', iso3: '' })
const editingCountry = ref<any>(null)

async function loadCities() {
  try {
    citiesLoading.value = true
    const response = await api.get('/cities')
    cities.value = Array.isArray(response.data) ? response.data : response.data?.data || []
  } catch (error: any) {
  } finally {
    citiesLoading.value = false
  }
}

async function loadCountries() {
  try {
    countriesLoading.value = true
    const response = await api.get('/countries')
    countries.value = Array.isArray(response.data) ? response.data : response.data?.data || []
  } catch (error: any) {
  } finally {
    countriesLoading.value = false
  }
}

async function addCity() {
  if (!newCity.value.name.trim()) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Enter city name' })
    return
  }

  try {
    // Create FormData to handle file upload
    const formData = new FormData()
    formData.append('name', newCity.value.name)
    if (newCity.value.country_id) {
      formData.append('country_id', newCity.value.country_id)
    }
    if (newCity.value.imageFile) {
      formData.append('image', newCity.value.imageFile)
    }

    if (editingCity.value) {
      await api.put(`/cities/${editingCity.value.id}`, formData)
      toast.add({ severity: 'success', summary: 'Success', detail: 'City updated' })
    } else {
      await api.post('/cities', formData)
      toast.add({ severity: 'success', summary: 'Success', detail: 'City added' })
    }
    showCityDialog.value = false
    newCity.value = { name: '', country_id: null, image: null, imageFile: null }
    editingCity.value = null
    cityImagePreview.value = ''
    await loadCities()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to save city' })
  }
}

function editCity(city: any) {
  editingCity.value = city
  newCity.value = { name: city.name, country_id: city.country_id || null, image: city.image || null, imageFile: null }
  cityImagePreview.value = city.image || ''
  showCityDialog.value = true
}

function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please select an image file' })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.add({ severity: 'warn', summary: 'Warning', detail: 'Image size must be less than 5MB' })
      return
    }

    newCity.value.imageFile = file

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      cityImagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function deleteCity(city: any) {
  confirm.require({
    message: `Delete "${city.name}"?`,
    header: 'Delete City',
    icon: 'pi pi-trash',
    accept: async () => {
      try {
        await api.delete(`/cities/${city.id}`)
        toast.add({ severity: 'success', summary: 'Success', detail: 'City deleted' })
        await loadCities()
      } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to delete city' })
      }
    },
  })
}

async function addCountry() {
  if (!newCountry.value.name.trim()) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Enter country name' })
    return
  }

  try {
    if (editingCountry.value) {
      await api.put(`/countries/${editingCountry.value.id}`, newCountry.value)
      toast.add({ severity: 'success', summary: 'Success', detail: 'Country updated' })
    } else {
      await api.post('/countries', newCountry.value)
      toast.add({ severity: 'success', summary: 'Success', detail: 'Country added' })
    }
    showCountryDialog.value = false
    newCountry.value = { name: '', iso2: '', iso3: '' }
    editingCountry.value = null
    await loadCountries()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to save country' })
  }
}

function editCountry(country: any) {
  editingCountry.value = country
  newCountry.value = { name: country.name, iso2: country.iso2 || '', iso3: country.iso3 || '' }
  showCountryDialog.value = true
}

function deleteCountry(country: any) {
  confirm.require({
    message: `Delete "${country.name}"?`,
    header: 'Delete Country',
    icon: 'pi pi-trash',
    accept: async () => {
      try {
        await api.delete(`/countries/${country.id}`)
        toast.add({ severity: 'success', summary: 'Success', detail: 'Country deleted' })
        await loadCountries()
      } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to delete country' })
      }
    },
  })
}

onMounted(async () => {
  await Promise.all([loadCities(), loadCountries()])
})
</script>

<template>
  <div class="location-management-page">
    <Toast />
    <ConfirmDialog />

    <div class="location-header">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">Location Management</h1>
      <p class="text-gray-600">Manage countries and cities for your listings</p>
    </div>

    <Tabs v-model:activeIndex="activeTab" class="location-tabs">
      <TabList>
        <Tab value="cities">
          <span class="flex items-center gap-2">
            <span class="text-lg">🏙️</span>
            <span>Cities</span>
          </span>
        </Tab>
        <Tab value="countries">
          <span class="flex items-center gap-2">
            <span class="text-lg">🌍</span>
            <span>Countries</span>
          </span>
        </Tab>
      </TabList>

      <TabPanels>
        <!-- Cities Tab -->
        <TabPanel value="cities">
          <div class="p-6">
            <div class="mb-6">
              <Button
                label="+ Add City"
                icon="pi pi-plus"
                class="p-button-success"
                @click="
                  () => {
                    editingCity = null
                    newCity = { name: '', country_id: null }
                    showCityDialog = true
                  }
                "
              />
            </div>

            <div v-if="citiesLoading && cities.length === 0">
              <SkeletonCard type="table-row" :count="5" />
            </div>
            <div v-else>
              <DataTable :value="cities" striped-rows hover :rows="15" paginator class="data-table">
                <Column field="name" header="City Name" sortable />
                <Column field="country.name" header="Country" />
                <Column field="places_count" header="Listings" />
                <Column header="Actions" style="width: 150px">
                  <template #body="{ data }">
                    <div class="flex gap-2">
                      <Button
                        icon="pi pi-pencil"
                        class="p-button-rounded p-button-text p-button-info p-button-sm"
                        @click="editCity(data)"
                        v-tooltip="'Edit'"
                      />
                      <Button
                        icon="pi pi-trash"
                        class="p-button-rounded p-button-text p-button-danger p-button-sm"
                        @click="deleteCity(data)"
                        v-tooltip="'Delete'"
                      />
                    </div>
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>
        </TabPanel>

        <!-- Countries Tab -->
        <TabPanel value="countries">
          <div class="p-6">
            <div class="mb-6">
              <Button
                label="+ Add Country"
                icon="pi pi-plus"
                class="p-button-success"
                @click="
                  () => {
                    editingCountry = null
                    newCountry = { name: '', iso2: '', iso3: '' }
                    showCountryDialog = true
                  }
                "
              />
            </div>

            <div v-if="countriesLoading && countries.length === 0">
              <SkeletonCard type="table-row" :count="5" />
            </div>
            <div v-else>
              <DataTable :value="countries" striped-rows hover :rows="15" paginator class="data-table">
                <Column field="name" header="Country Name" sortable />
                <Column field="iso2" header="ISO2" />
                <Column field="iso3" header="ISO3" />
                <Column field="places_count" header="Listings" />
                <Column header="Actions" style="width: 150px">
                  <template #body="{ data }">
                    <div class="flex gap-2">
                      <Button
                        icon="pi pi-pencil"
                        class="p-button-rounded p-button-text p-button-info p-button-sm"
                        @click="editCountry(data)"
                        v-tooltip="'Edit'"
                      />
                      <Button
                        icon="pi pi-trash"
                        class="p-button-rounded p-button-text p-button-danger p-button-sm"
                        @click="deleteCountry(data)"
                        v-tooltip="'Delete'"
                      />
                    </div>
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>

    <!-- City Dialog -->
    <Dialog v-model:visible="showCityDialog" :header="editingCity ? 'Edit City' : 'Add City'" modal :style="{ width: '450px' }">
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
        <div>
          <label class="block font-semibold mb-2 text-gray-700">City Image</label>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              class="hidden"
              id="cityImageInput"
              @change="handleImageUpload"
            />
            <label for="cityImageInput" class="cursor-pointer">
              <div v-if="!cityImagePreview" class="py-4">
                <i class="pi pi-cloud-upload text-3xl text-gray-400 mb-2 block"></i>
                <p class="text-gray-600 text-sm">Click to upload image</p>
                <p class="text-gray-500 text-xs mt-1">Max size: 5MB</p>
              </div>
              <div v-else class="py-2">
                <img :src="cityImagePreview" alt="Preview" class="max-h-40 mx-auto rounded-lg mb-2" />
                <p class="text-blue-600 text-sm">Click to change image</p>
              </div>
            </label>
          </div>
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
  </div>
</template>

<style scoped>
.location-management-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 0;
}

.location-header {
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.location-tabs {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

:deep(.p-tabs) {
  border: none;
}

:deep(.p-tablist) {
  background-color: white;
  border: none;
  border-bottom: 2px solid #e5e7eb;
  padding: 0;
}

:deep(.p-tab button) {
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  border: none;
  transition: all 0.3s ease;
}

:deep(.p-tab button:hover) {
  color: #3b82f6;
}

:deep(.p-tab button.p-highlight) {
  color: #0369a1;
  border-bottom: 3px solid #0369a1;
}

:deep(.p-tabpanels) {
  background-color: white;
  border: none;
  padding: 0;
}

:deep(.data-table) {
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

:deep(.p-inputtext) {
  border-radius: 6px;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
}

:deep(.p-inputtext:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
