<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useSettingsStore } from '@/stores/settings'
import { uploadImage } from '@/services/upload'
import type { BrandingSettings as BrandingSettingsType } from '@/schemas/settings'
import { brandingSchema } from '@/schemas/settings'

const ui = useUiStore()
const settings = useSettingsStore()

const form = reactive<Partial<BrandingSettingsType>>({
  mainLogo: '',
  darkLogo: '',
  lightLogo: '',
  favicon: '',
  appleTouchIcon: '',
  loginPageLogo: '',
})

const errors = ref<Record<string, string>>({})
const uploading = ref<Record<string, boolean>>({})
const dragActive = ref(false)

function setForm() {
  Object.assign(form, settings.branding)
}

function resetForm() {
  setForm()
  errors.value = {}
}

async function uploadLogo(field: keyof BrandingSettingsType, category: 'logo' | 'favicon' | 'og-image' | 'branding') {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e: any) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleFileUpload(field, file, category)
    }
  }
  input.click()
}

async function handleFileUpload(field: keyof BrandingSettingsType, file: File, category: 'logo' | 'favicon' | 'og-image' | 'branding') {
  uploading.value[field] = true
  try {
    const url = await uploadImage(file, category)
    form[field] = url as any
    errors.value[field] = ''
  } catch (error: any) {
    errors.value[field] = error?.message || 'Upload failed'
  } finally {
    uploading.value[field] = false
  }
}

function handleDrop(e: DragEvent, field: keyof BrandingSettingsType, category: 'logo' | 'favicon' | 'og-image' | 'branding') {
  e.preventDefault()
  dragActive.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    handleFileUpload(field, file, category)
  } else {
    errors.value[field] = 'Please drop an image file'
  }
}

async function deleteLogo(field: keyof BrandingSettingsType) {
  form[field] = '' as any
  errors.value[field] = ''
}

async function saveBrandingSettings() {
  const result = brandingSchema.safeParse(form)
  if (!result.success) {
    errors.value = Object.fromEntries(
      result.error.issues.map((e: any) => [String(e.path[0]), e.message])
    )
    return
  }

  const success = await settings.saveSettings('branding', form)
  if (success) {
    ui.pushToast('Branding settings saved successfully', 'success')
    resetForm()
  } else {
    ui.pushToast('Failed to save branding settings', 'danger')
  }
}

setForm()
</script>

<template>
  <div class="settings-section">
    <div class="grid gap-6">
      <!-- Section Header -->
      <div>
        <h2 class="m-0 text-base font-semibold">Branding Settings</h2>
        <p class="m-0 mt-1 text-sm text-(--admin-muted)">Upload your logos and branding assets for different contexts.</p>
      </div>

      <!-- Logo Upload Grid -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Main Logo -->
        <div class="settings-field">
          <label class="block text-sm font-medium text-(--admin-ink) mb-2">Main Logo</label>
          <div
            :class="[
              'logo-upload-area',
              dragActive ? 'border-(--admin-primary) bg-(--admin-soft)' : 'border-(--admin-border)',
            ]"
            @dragover.prevent="dragActive = true"
            @dragleave.prevent="dragActive = false"
            @drop.prevent="handleDrop($event, 'mainLogo', 'logo')"
          >
            <div v-if="form.mainLogo" class="logo-preview">
              <img :src="form.mainLogo" alt="Main logo" class="h-20 w-auto object-contain" />
              <button
                class="absolute -right-2 -top-2 icon-button icon-button--sm bg-red-500 text-white hover:bg-red-600"
                type="button"
                @click="deleteLogo('mainLogo')"
              >
                <i class="pi pi-trash" aria-hidden="true"></i>
              </button>
            </div>
            <div v-else class="flex flex-col items-center justify-center gap-2 py-8">
              <i class="pi pi-cloud-upload text-2xl text-(--admin-muted)" aria-hidden="true"></i>
              <p class="text-sm text-(--admin-muted)">Drag image or <button class="text-(--admin-primary) hover:underline" type="button" @click="uploadLogo('mainLogo', 'logo')">browse</button></p>
            </div>
          </div>
          <p v-if="errors.mainLogo" class="mt-1 text-xs text-red-500">{{ errors.mainLogo }}</p>
        </div>

        <!-- Dark Logo -->
        <div class="settings-field">
          <label class="block text-sm font-medium text-(--admin-ink) mb-2">Dark Logo</label>
          <div
            :class="[
              'logo-upload-area',
              dragActive ? 'border-(--admin-primary) bg-(--admin-soft)' : 'border-(--admin-border)',
            ]"
            @dragover.prevent="dragActive = true"
            @dragleave.prevent="dragActive = false"
            @drop.prevent="handleDrop($event, 'darkLogo', 'logo')"
          >
            <div v-if="form.darkLogo" class="logo-preview">
              <img :src="form.darkLogo" alt="Dark logo" class="h-20 w-auto object-contain" />
              <button
                class="absolute -right-2 -top-2 icon-button icon-button--sm bg-red-500 text-white hover:bg-red-600"
                type="button"
                @click="deleteLogo('darkLogo')"
              >
                <i class="pi pi-trash" aria-hidden="true"></i>
              </button>
            </div>
            <div v-else class="flex flex-col items-center justify-center gap-2 py-8">
              <i class="pi pi-cloud-upload text-2xl text-(--admin-muted)" aria-hidden="true"></i>
              <p class="text-sm text-(--admin-muted)">Drag image or <button class="text-(--admin-primary) hover:underline" type="button" @click="uploadLogo('darkLogo', 'logo')">browse</button></p>
            </div>
          </div>
          <p v-if="errors.darkLogo" class="mt-1 text-xs text-red-500">{{ errors.darkLogo }}</p>
        </div>

        <!-- Light Logo -->
        <div class="settings-field">
          <label class="block text-sm font-medium text-(--admin-ink) mb-2">Light Logo</label>
          <div
            :class="[
              'logo-upload-area',
              dragActive ? 'border-(--admin-primary) bg-(--admin-soft)' : 'border-(--admin-border)',
            ]"
            @dragover.prevent="dragActive = true"
            @dragleave.prevent="dragActive = false"
            @drop.prevent="handleDrop($event, 'lightLogo', 'logo')"
          >
            <div v-if="form.lightLogo" class="logo-preview">
              <img :src="form.lightLogo" alt="Light logo" class="h-20 w-auto object-contain" />
              <button
                class="absolute -right-2 -top-2 icon-button icon-button--sm bg-red-500 text-white hover:bg-red-600"
                type="button"
                @click="deleteLogo('lightLogo')"
              >
                <i class="pi pi-trash" aria-hidden="true"></i>
              </button>
            </div>
            <div v-else class="flex flex-col items-center justify-center gap-2 py-8">
              <i class="pi pi-cloud-upload text-2xl text-(--admin-muted)" aria-hidden="true"></i>
              <p class="text-sm text-(--admin-muted)">Drag image or <button class="text-(--admin-primary) hover:underline" type="button" @click="uploadLogo('lightLogo', 'logo')">browse</button></p>
            </div>
          </div>
          <p v-if="errors.lightLogo" class="mt-1 text-xs text-red-500">{{ errors.lightLogo }}</p>
        </div>

        <!-- Favicon -->
        <div class="settings-field">
          <label class="block text-sm font-medium text-(--admin-ink) mb-2">Favicon</label>
          <div
            :class="[
              'logo-upload-area',
              dragActive ? 'border-(--admin-primary) bg-(--admin-soft)' : 'border-(--admin-border)',
            ]"
            @dragover.prevent="dragActive = true"
            @dragleave.prevent="dragActive = false"
            @drop.prevent="handleDrop($event, 'favicon', 'favicon')"
          >
            <div v-if="form.favicon" class="logo-preview">
              <img :src="form.favicon" alt="Favicon" class="h-10 w-10 object-contain" />
              <button
                class="absolute -right-2 -top-2 icon-button icon-button--sm bg-red-500 text-white hover:bg-red-600"
                type="button"
                @click="deleteLogo('favicon')"
              >
                <i class="pi pi-trash" aria-hidden="true"></i>
              </button>
            </div>
            <div v-else class="flex flex-col items-center justify-center gap-2 py-8">
              <i class="pi pi-cloud-upload text-2xl text-(--admin-muted)" aria-hidden="true"></i>
              <p class="text-sm text-(--admin-muted)">Drag image or <button class="text-(--admin-primary) hover:underline" type="button" @click="uploadLogo('favicon', 'favicon')">browse</button></p>
            </div>
          </div>
          <p v-if="errors.favicon" class="mt-1 text-xs text-red-500">{{ errors.favicon }}</p>
        </div>

        <!-- Apple Touch Icon -->
        <div class="settings-field">
          <label class="block text-sm font-medium text-(--admin-ink) mb-2">Apple Touch Icon</label>
          <div
            :class="[
              'logo-upload-area',
              dragActive ? 'border-(--admin-primary) bg-(--admin-soft)' : 'border-(--admin-border)',
            ]"
            @dragover.prevent="dragActive = true"
            @dragleave.prevent="dragActive = false"
            @drop.prevent="handleDrop($event, 'appleTouchIcon', 'branding')"
          >
            <div v-if="form.appleTouchIcon" class="logo-preview">
              <img :src="form.appleTouchIcon" alt="Apple touch icon" class="h-20 w-20 object-contain rounded-lg" />
              <button
                class="absolute -right-2 -top-2 icon-button icon-button--sm bg-red-500 text-white hover:bg-red-600"
                type="button"
                @click="deleteLogo('appleTouchIcon')"
              >
                <i class="pi pi-trash" aria-hidden="true"></i>
              </button>
            </div>
            <div v-else class="flex flex-col items-center justify-center gap-2 py-8">
              <i class="pi pi-cloud-upload text-2xl text-(--admin-muted)" aria-hidden="true"></i>
              <p class="text-sm text-(--admin-muted)">Drag image or <button class="text-(--admin-primary) hover:underline" type="button" @click="uploadLogo('appleTouchIcon', 'branding')">browse</button></p>
            </div>
          </div>
          <p v-if="errors.appleTouchIcon" class="mt-1 text-xs text-red-500">{{ errors.appleTouchIcon }}</p>
        </div>

        <!-- Login Page Logo -->
        <div class="settings-field">
          <label class="block text-sm font-medium text-(--admin-ink) mb-2">Login Page Logo</label>
          <div
            :class="[
              'logo-upload-area',
              dragActive ? 'border-(--admin-primary) bg-(--admin-soft)' : 'border-(--admin-border)',
            ]"
            @dragover.prevent="dragActive = true"
            @dragleave.prevent="dragActive = false"
            @drop.prevent="handleDrop($event, 'loginPageLogo', 'logo')"
          >
            <div v-if="form.loginPageLogo" class="logo-preview">
              <img :src="form.loginPageLogo" alt="Login logo" class="h-20 w-auto object-contain" />
              <button
                class="absolute -right-2 -top-2 icon-button icon-button--sm bg-red-500 text-white hover:bg-red-600"
                type="button"
                @click="deleteLogo('loginPageLogo')"
              >
                <i class="pi pi-trash" aria-hidden="true"></i>
              </button>
            </div>
            <div v-else class="flex flex-col items-center justify-center gap-2 py-8">
              <i class="pi pi-cloud-upload text-2xl text-(--admin-muted)" aria-hidden="true"></i>
              <p class="text-sm text-(--admin-muted)">Drag image or <button class="text-(--admin-primary) hover:underline" type="button" @click="uploadLogo('loginPageLogo', 'logo')">browse</button></p>
            </div>
          </div>
          <p v-if="errors.loginPageLogo" class="mt-1 text-xs text-red-500">{{ errors.loginPageLogo }}</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 justify-end pt-4 border-t border-(--admin-border)">
        <button
          class="secondary-action"
          type="button"
          :disabled="settings.isSaving('branding')"
          @click="resetForm"
        >
          Discard
        </button>
        <button
          class="primary-action"
          type="button"
          :disabled="settings.isSaving('branding')"
          @click="saveBrandingSettings"
        >
          {{ settings.isSaving('branding') ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logo-upload-area {
  position: relative;
  border: 2px dashed var(--admin-border);
  border-radius: 8px;
  transition: all 150ms ease;
  cursor: pointer;
}

.logo-preview {
  position: relative;
  display: inline-block;
}
</style>
