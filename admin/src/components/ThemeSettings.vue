<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useSettingsStore } from '@/stores/settings'
import type { ThemeSettings as ThemeSettingsType } from '@/schemas/settings'
import { themeSchema } from '@/schemas/settings'

const ui = useUiStore()
const settings = useSettingsStore()

const form = reactive<Partial<ThemeSettingsType>>({
  primaryColor: '#4F46E5',
  secondaryColor: '#8B5CF6',
  accentColor: '#EC4899',
  successColor: '#10B981',
  warningColor: '#F59E0B',
  errorColor: '#EF4444',
  backgroundColor: '#FFFFFF',
  sidebarColor: '#F9FAFB',
  headerColor: '#FFFFFF',
  cardColor: '#FFFFFF',
  buttonColor: '#4F46E5',
  fontFamily: 'Inter, system-ui, sans-serif',
  headingFont: 'Poppins, system-ui, sans-serif',
  bodyFont: 'Inter, system-ui, sans-serif',
  sidebarWidth: 280,
  cardBorderRadius: 8,
  containerWidth: 1280,
  isCollapsedDefault: false,
  isFixedHeader: true,
  isFixedSidebar: true,
  themeMode: 'light',
})

const errors = ref<Record<string, string>>({})

const colorFields = [
  { key: 'primaryColor', label: 'Primary Color', icon: 'pi pi-palette' },
  { key: 'secondaryColor', label: 'Secondary Color', icon: 'pi pi-palette' },
  { key: 'accentColor', label: 'Accent Color', icon: 'pi pi-palette' },
  { key: 'successColor', label: 'Success Color', icon: 'pi pi-check-circle' },
  { key: 'warningColor', label: 'Warning Color', icon: 'pi pi-exclamation-triangle' },
  { key: 'errorColor', label: 'Error Color', icon: 'pi pi-times-circle' },
  { key: 'backgroundColor', label: 'Background Color', icon: 'pi pi-palette' },
  { key: 'sidebarColor', label: 'Sidebar Color', icon: 'pi pi-palette' },
  { key: 'headerColor', label: 'Header Color', icon: 'pi pi-palette' },
  { key: 'cardColor', label: 'Card Color', icon: 'pi pi-palette' },
  { key: 'buttonColor', label: 'Button Color', icon: 'pi pi-palette' },
]

function setForm() {
  Object.assign(form, settings.theme)
}

function resetForm() {
  setForm()
  errors.value = {}
}

function applyThemePreview() {
  const root = document.documentElement
  Object.entries(form).forEach(([key, value]) => {
    if (key.endsWith('Color') && typeof value === 'string') {
      const cssVar = '--admin-' + key.replace(/Color$/, '').replace(/([A-Z])/g, '-$1').toLowerCase()
      root.style.setProperty(cssVar, value)
    }
  })
}

async function saveThemeSettings() {
  const result = themeSchema.safeParse(form)
  if (!result.success) {
    errors.value = Object.fromEntries(
      result.error.issues.map((e: any) => [String(e.path[0]), e.message])
    )
    return
  }

  const success = await settings.saveSettings('theme', form)
  if (success) {
    applyThemePreview()
    ui.pushToast('Theme settings saved successfully', 'success')
    resetForm()
  } else {
    ui.pushToast('Failed to save theme settings', 'danger')
  }
}

onMounted(() => {
  setForm()
  applyThemePreview()
})
</script>

<template>
  <div class="settings-section">
    <div class="grid gap-6">
      <!-- Section Header -->
      <div>
        <h2 class="m-0 text-base font-semibold">Theme & Appearance</h2>
        <p class="m-0 mt-1 text-sm text-(--admin-muted)">Customize colors, typography, and layout. Changes preview in real-time.</p>
      </div>

      <!-- Color Picker Grid -->
      <div>
        <h3 class="text-sm font-semibold text-(--admin-ink) mb-4">Colors</h3>
        <div class="color-picker-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="field in colorFields" :key="field.key" class="settings-field">
            <label class="flex items-center gap-2 text-sm font-medium text-(--admin-ink) mb-2">
              <i :class="field.icon" aria-hidden="true"></i>
              {{ field.label }}
            </label>
            <div class="flex gap-2 items-center">
              <div class="relative">
                <input
                  :value="form[field.key as keyof ThemeSettingsType]"
                  type="color"
                  class="h-10 w-16 cursor-pointer rounded border border-(--admin-border) p-1"
                  @input="(e: any) => { form[field.key as keyof ThemeSettingsType] = e.target.value; applyThemePreview() }"
                />
              </div>
              <input
                :value="form[field.key as keyof ThemeSettingsType]"
                type="text"
                class="cms-input flex-1"
                placeholder="#000000"
                @input="(e: any) => { form[field.key as keyof ThemeSettingsType] = e.target.value; applyThemePreview() }"
              />
            </div>
            <p v-if="errors[field.key]" class="mt-1 text-xs text-red-500">{{ errors[field.key] }}</p>
          </div>
        </div>
      </div>

      <!-- Typography Settings -->
      <div>
        <h3 class="text-sm font-semibold text-(--admin-ink) mb-4">Typography</h3>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">Font Family</label>
            <input
              v-model="form.fontFamily"
              type="text"
              class="cms-input"
              placeholder="Inter, system-ui, sans-serif"
              @input="applyThemePreview"
            />
            <p v-if="errors.fontFamily" class="mt-1 text-xs text-red-500">{{ errors.fontFamily }}</p>
          </div>

          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">Heading Font</label>
            <input
              v-model="form.headingFont"
              type="text"
              class="cms-input"
              placeholder="Poppins, system-ui, sans-serif"
              @input="applyThemePreview"
            />
            <p v-if="errors.headingFont" class="mt-1 text-xs text-red-500">{{ errors.headingFont }}</p>
          </div>

          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">Body Font</label>
            <input
              v-model="form.bodyFont"
              type="text"
              class="cms-input"
              placeholder="Inter, system-ui, sans-serif"
              @input="applyThemePreview"
            />
            <p v-if="errors.bodyFont" class="mt-1 text-xs text-red-500">{{ errors.bodyFont }}</p>
          </div>
        </div>
      </div>

      <!-- Layout Settings -->
      <div>
        <h3 class="text-sm font-semibold text-(--admin-ink) mb-4">Layout</h3>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">
              Sidebar Width: <span class="text-(--admin-muted)">{{ form.sidebarWidth }}px</span>
            </label>
            <input
              v-model.number="form.sidebarWidth"
              type="range"
              min="200"
              max="400"
              class="w-full"
              @input="applyThemePreview"
            />
            <p v-if="errors.sidebarWidth" class="mt-1 text-xs text-red-500">{{ errors.sidebarWidth }}</p>
          </div>

          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">
              Card Border Radius: <span class="text-(--admin-muted)">{{ form.cardBorderRadius }}px</span>
            </label>
            <input
              v-model.number="form.cardBorderRadius"
              type="range"
              min="0"
              max="30"
              class="w-full"
              @input="applyThemePreview"
            />
            <p v-if="errors.cardBorderRadius" class="mt-1 text-xs text-red-500">{{ errors.cardBorderRadius }}</p>
          </div>

          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">
              Container Width: <span class="text-(--admin-muted)">{{ form.containerWidth }}px</span>
            </label>
            <input
              v-model.number="form.containerWidth"
              type="range"
              min="800"
              max="1600"
              class="w-full"
              @input="applyThemePreview"
            />
            <p v-if="errors.containerWidth" class="mt-1 text-xs text-red-500">{{ errors.containerWidth }}</p>
          </div>
        </div>
      </div>

      <!-- Behavior Settings -->
      <div>
        <h3 class="text-sm font-semibold text-(--admin-ink) mb-4">Behavior</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="flex items-center gap-3 p-3 rounded border border-(--admin-border) cursor-pointer hover:bg-(--admin-soft)">
            <input v-model="form.isCollapsedDefault" type="checkbox" class="w-4 h-4" />
            <span class="text-sm font-medium">Collapse sidebar by default</span>
          </label>

          <label class="flex items-center gap-3 p-3 rounded border border-(--admin-border) cursor-pointer hover:bg-(--admin-soft)">
            <input v-model="form.isFixedHeader" type="checkbox" class="w-4 h-4" />
            <span class="text-sm font-medium">Fix header position</span>
          </label>

          <label class="flex items-center gap-3 p-3 rounded border border-(--admin-border) cursor-pointer hover:bg-(--admin-soft)">
            <input v-model="form.isFixedSidebar" type="checkbox" class="w-4 h-4" />
            <span class="text-sm font-medium">Fix sidebar position</span>
          </label>

          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">Theme Mode</label>
            <select v-model="form.themeMode" class="cms-input">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
            <p v-if="errors.themeMode" class="mt-1 text-xs text-red-500">{{ errors.themeMode }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 justify-end pt-4 border-t border-(--admin-border)">
        <button
          class="secondary-action"
          type="button"
          :disabled="settings.isSaving('theme')"
          @click="resetForm"
        >
          Discard
        </button>
        <button
          class="primary-action"
          type="button"
          :disabled="settings.isSaving('theme')"
          @click="saveThemeSettings"
        >
          {{ settings.isSaving('theme') ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-picker-grid {
  display: grid;
}
</style>
