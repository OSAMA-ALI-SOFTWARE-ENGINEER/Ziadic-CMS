<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import BrandingSettings from '@/components/BrandingSettings.vue'
import ThemeSettings from '@/components/ThemeSettings.vue'
import SEOSettings from '@/components/SEOSettings.vue'
import PaymentSettings from '@/components/PaymentSettings.vue'

type SettingsTab = 'branding' | 'theme' | 'seo' | 'payments'

const settings = useSettingsStore()
const activeTab = ref<SettingsTab>('branding')
const showUnsavedWarning = ref(false)

const tabs: Array<{ id: SettingsTab; label: string; icon: string }> = [
  { id: 'branding', label: 'Branding', icon: 'pi pi-palette' },
  { id: 'theme', label: 'Theme', icon: 'pi pi-sun' },
  { id: 'seo', label: 'SEO', icon: 'pi pi-search' },
  { id: 'payments', label: 'Payments', icon: 'pi pi-credit-card' },
]

const componentMap = {
  branding: BrandingSettings,
  theme: ThemeSettings,
  seo: SEOSettings,
  payments: PaymentSettings,
}

const currentComponent = computed(() => componentMap[activeTab.value])

const hasUnsavedChanges = computed(() => {
  return settings.isDirty('branding') ||
         settings.isDirty('theme') ||
         settings.isDirty('seo') ||
         settings.isDirty('payments')
})

function switchTab(tab: SettingsTab) {
  if (hasUnsavedChanges.value && !showUnsavedWarning.value) {
    showUnsavedWarning.value = true
    return
  }
  activeTab.value = tab
  showUnsavedWarning.value = false
}

function discardChanges() {
  settings.resetSettings('branding')
  settings.resetSettings('theme')
  settings.resetSettings('seo')
  settings.resetSettings('payments')
  showUnsavedWarning.value = false
}

onMounted(async () => {
  await settings.loadSettings('branding')
  await settings.loadSettings('theme')
  await settings.loadSettings('seo')
  await settings.loadSettings('payments')
})
</script>

<template>
  <div class="grid gap-6">
    <!-- Unsaved Changes Warning Modal -->
    <div v-if="showUnsavedWarning" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div class="cms-card w-full max-w-sm p-6">
        <h3 class="m-0 text-base font-semibold">Discard unsaved changes?</h3>
        <p class="m-0 mt-2 text-sm text-(--admin-muted)">You have unsaved changes. Are you sure you want to leave without saving?</p>
        <div class="mt-6 flex gap-3 justify-end">
          <button class="secondary-action" type="button" @click="showUnsavedWarning = false">Keep editing</button>
          <button class="primary-action" type="button" @click="discardChanges">Discard</button>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="settings-tabs flex gap-2 border-b border-(--admin-border) overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="[
          'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
          activeTab === tab.id
            ? 'border-b-(--admin-primary) text-(--admin-primary)'
            : 'border-b-transparent text-(--admin-muted) hover:text-(--admin-ink)',
        ]"
        type="button"
        @click="switchTab(tab.id)"
      >
        <i :class="tab.icon" aria-hidden="true"></i>
        <span class="hidden sm:inline">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Section Content -->
    <Transition name="fade" mode="out-in">
      <component :is="currentComponent" :key="activeTab" />
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
