<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import * as adminService from '@/services/admin'

const toast = useToast()
const loading = ref(false)

const settings = ref({
  site_name: 'Zaidic',
  site_description: '',
  site_url: '',
  support_email: '',
  contact_email: '',
  phone: '',
  address: '',
})

onMounted(async () => {
  loading.value = true
  try {
    const branding = await adminService.fetchAdminSettings('branding')
    settings.value = { ...settings.value, ...branding }
  } catch (error) {
    console.error('Failed to load settings')
  } finally {
    loading.value = false
  }
})

async function saveSettings() {
  loading.value = true
  try {
    await adminService.updateAdminSettings('branding', settings.value)
    toast.add({ severity: 'success', summary: 'Success', detail: 'Settings saved' })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save settings' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="settings-page">
    <h1 class="page-title">Settings</h1>

    <Toast />

    <!-- Branding Settings -->
    <Card class="settings-card">
      <template #header>
        <h2 class="settings-title">Branding & Site Info</h2>
      </template>

      <template #content>
        <div class="settings-form">
          <div class="form-group">
            <label for="site_name">Site Name</label>
            <InputText
              id="site_name"
              v-model="settings.site_name"
              placeholder="Your site name"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="site_description">Site Description</label>
            <Textarea
              id="site_description"
              v-model="settings.site_description"
              placeholder="Brief description of your site"
              rows="4"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="site_url">Site URL</label>
            <InputText
              id="site_url"
              v-model="settings.site_url"
              type="url"
              placeholder="https://example.com"
              class="form-input"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="support_email">Support Email</label>
              <InputText
                id="support_email"
                v-model="settings.support_email"
                type="email"
                placeholder="support@example.com"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="contact_email">Contact Email</label>
              <InputText
                id="contact_email"
                v-model="settings.contact_email"
                type="email"
                placeholder="contact@example.com"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="phone">Phone</label>
              <InputText
                id="phone"
                v-model="settings.phone"
                placeholder="+1 (555) 123-4567"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="address">Address</label>
              <InputText
                id="address"
                v-model="settings.address"
                placeholder="123 Main St, City, State"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-actions">
            <Button
              label="Save Settings"
              icon="pi pi-save"
              @click="saveSettings"
              :loading="loading"
              class="save-btn"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Additional Settings Sections -->
    <Card class="settings-card">
      <template #header>
        <h2 class="settings-title">SEO Settings</h2>
      </template>

      <template #content>
        <div class="empty-placeholder">
          <p>SEO settings configuration coming soon</p>
          <p class="text-muted">Configure meta tags, sitemap, and other SEO features</p>
        </div>
      </template>
    </Card>

    <Card class="settings-card">
      <template #header>
        <h2 class="settings-title">Payment Settings</h2>
      </template>

      <template #content>
        <div class="empty-placeholder">
          <p>Payment settings configuration coming soon</p>
          <p class="text-muted">Configure payment gateways and billing information</p>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2rem;
}

.settings-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: none;
  margin-bottom: 2rem;
}

.settings-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  padding: 1rem;
}

.settings-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #c41e3a;
  outline: none;
  box-shadow: 0 0 0 3px rgba(196, 30, 58, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.save-btn {
  width: fit-content;
}

.empty-placeholder {
  padding: 2rem;
  text-align: center;
  color: #999;
}

.empty-placeholder p {
  margin: 0.5rem 0;
}

.text-muted {
  font-size: 0.875rem;
  color: #bbb;
}

:deep(.p-inputtext),
:deep(.p-textarea) {
  width: 100%;
}

:deep(.p-textarea textarea) {
  font-family: inherit;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .settings-page {
    padding: 0;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .save-btn {
    width: 100%;
  }
}
</style>
