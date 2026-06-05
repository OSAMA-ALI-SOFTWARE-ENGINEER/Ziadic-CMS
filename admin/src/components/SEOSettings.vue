<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useSettingsStore } from '@/stores/settings'
import type { SEOSettings as SEOSettingsType } from '@/schemas/settings'
import { seoSchema } from '@/schemas/settings'

const ui = useUiStore()
const settings = useSettingsStore()

const form = reactive<Partial<SEOSettingsType>>({
  defaultMetaTitle: '',
  defaultMetaDescription: '',
  defaultKeywords: '',
  robotsMetaTag: 'index, follow',
  openGraphTitle: '',
  openGraphDescription: '',
  openGraphImage: '',
  twitterTitle: '',
  twitterDescription: '',
  twitterCardImage: '',
  sitemapURL: '',
  robotsTxt: '',
  canonicalURL: '',
  googleVerificationCode: '',
  bingVerificationCode: '',
})

const errors = ref<Record<string, string>>({})

function setForm() {
  Object.assign(form, settings.seo)
}

function resetForm() {
  setForm()
  errors.value = {}
}

async function saveSEOSettings() {
  const result = seoSchema.safeParse(form)
  if (!result.success) {
    errors.value = Object.fromEntries(
      result.error.issues.map((e: any) => [String(e.path[0]), e.message])
    )
    return
  }

  const success = await settings.saveSettings('seo', form)
  if (success) {
    ui.pushToast('SEO settings saved successfully', 'success')
    resetForm()
  } else {
    ui.pushToast('Failed to save SEO settings', 'danger')
  }
}

setForm()
</script>

<template>
  <div class="settings-section">
    <div class="grid gap-6">
      <!-- Section Header -->
      <div>
        <h2 class="m-0 text-base font-semibold">SEO Management</h2>
        <p class="m-0 mt-1 text-sm text-(--admin-muted)">Configure global SEO settings, meta tags, and social sharing options.</p>
      </div>

      <!-- Global SEO Section -->
      <div class="settings-card">
        <h3 class="text-sm font-semibold text-(--admin-ink) mb-4 flex items-center gap-2">
          <i class="pi pi-globe" aria-hidden="true"></i>
          Global SEO
        </h3>
        <div class="grid gap-4">
          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">
              Meta Title <span class="text-xs text-(--admin-muted)">(max 60)</span>
            </label>
            <input
              v-model="form.defaultMetaTitle"
              type="text"
              class="cms-input"
              maxlength="60"
              placeholder="Your site title"
            />
            <p class="mt-1 text-xs text-(--admin-muted)">{{ form.defaultMetaTitle?.length || 0 }}/60</p>
            <p v-if="errors.defaultMetaTitle" class="mt-1 text-xs text-red-500">{{ errors.defaultMetaTitle }}</p>
          </div>

          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">
              Meta Description <span class="text-xs text-(--admin-muted)">(max 160)</span>
            </label>
            <textarea
              v-model="form.defaultMetaDescription"
              class="cms-input min-h-20"
              maxlength="160"
              placeholder="Your site description"
            ></textarea>
            <p class="mt-1 text-xs text-(--admin-muted)">{{ form.defaultMetaDescription?.length || 0 }}/160</p>
            <p v-if="errors.defaultMetaDescription" class="mt-1 text-xs text-red-500">{{ errors.defaultMetaDescription }}</p>
          </div>

          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">Keywords</label>
            <input
              v-model="form.defaultKeywords"
              type="text"
              class="cms-input"
              placeholder="keyword1, keyword2, keyword3"
            />
            <p v-if="errors.defaultKeywords" class="mt-1 text-xs text-red-500">{{ errors.defaultKeywords }}</p>
          </div>

          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">Robots Meta Tag</label>
            <input
              v-model="form.robotsMetaTag"
              type="text"
              class="cms-input"
              placeholder="index, follow"
            />
            <p v-if="errors.robotsMetaTag" class="mt-1 text-xs text-red-500">{{ errors.robotsMetaTag }}</p>
          </div>

          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">Canonical URL</label>
            <input
              v-model="form.canonicalURL"
              type="url"
              class="cms-input"
              placeholder="https://example.com"
            />
            <p v-if="errors.canonicalURL" class="mt-1 text-xs text-red-500">{{ errors.canonicalURL }}</p>
          </div>
        </div>
      </div>

      <!-- Open Graph (Social Sharing) Section -->
      <div class="settings-card">
        <h3 class="text-sm font-semibold text-(--admin-ink) mb-4 flex items-center gap-2">
          <i class="pi pi-share-alt" aria-hidden="true"></i>
          Open Graph (Social Sharing)
        </h3>
        <div class="grid gap-4">
          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">OG Title</label>
            <input
              v-model="form.openGraphTitle"
              type="text"
              class="cms-input"
              placeholder="Social media title"
            />
            <p v-if="errors.openGraphTitle" class="mt-1 text-xs text-red-500">{{ errors.openGraphTitle }}</p>
          </div>

          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">OG Description</label>
            <textarea
              v-model="form.openGraphDescription"
              class="cms-input min-h-20"
              placeholder="Social media description"
            ></textarea>
            <p v-if="errors.openGraphDescription" class="mt-1 text-xs text-red-500">{{ errors.openGraphDescription }}</p>
          </div>

          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">OG Image URL</label>
            <input
              v-model="form.openGraphImage"
              type="url"
              class="cms-input"
              placeholder="https://example.com/og-image.jpg"
            />
            <p v-if="errors.openGraphImage" class="mt-1 text-xs text-red-500">{{ errors.openGraphImage }}</p>
          </div>
        </div>
      </div>

      <!-- Twitter Card Section -->
      <div class="settings-card">
        <h3 class="text-sm font-semibold text-(--admin-ink) mb-4 flex items-center gap-2">
          <i class="pi pi-twitter" aria-hidden="true"></i>
          Twitter Card
        </h3>
        <div class="grid gap-4">
          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">Twitter Title</label>
            <input
              v-model="form.twitterTitle"
              type="text"
              class="cms-input"
              placeholder="Twitter title"
            />
            <p v-if="errors.twitterTitle" class="mt-1 text-xs text-red-500">{{ errors.twitterTitle }}</p>
          </div>

          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">Twitter Description</label>
            <textarea
              v-model="form.twitterDescription"
              class="cms-input min-h-20"
              placeholder="Twitter description"
            ></textarea>
            <p v-if="errors.twitterDescription" class="mt-1 text-xs text-red-500">{{ errors.twitterDescription }}</p>
          </div>

          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">Twitter Card Image URL</label>
            <input
              v-model="form.twitterCardImage"
              type="url"
              class="cms-input"
              placeholder="https://example.com/twitter-image.jpg"
            />
            <p v-if="errors.twitterCardImage" class="mt-1 text-xs text-red-500">{{ errors.twitterCardImage }}</p>
          </div>
        </div>
      </div>

      <!-- Technical SEO Section -->
      <div class="settings-card">
        <h3 class="text-sm font-semibold text-(--admin-ink) mb-4 flex items-center gap-2">
          <i class="pi pi-cog" aria-hidden="true"></i>
          Technical SEO
        </h3>
        <div class="grid gap-4">
          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">Sitemap URL</label>
            <input
              v-model="form.sitemapURL"
              type="url"
              class="cms-input"
              placeholder="https://example.com/sitemap.xml"
            />
            <p v-if="errors.sitemapURL" class="mt-1 text-xs text-red-500">{{ errors.sitemapURL }}</p>
          </div>

          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">robots.txt</label>
            <textarea
              v-model="form.robotsTxt"
              class="cms-input min-h-32 font-mono text-xs"
              placeholder="User-agent: *&#10;Allow: /"
            ></textarea>
            <p v-if="errors.robotsTxt" class="mt-1 text-xs text-red-500">{{ errors.robotsTxt }}</p>
          </div>

          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">Google Site Verification Code</label>
            <input
              v-model="form.googleVerificationCode"
              type="text"
              class="cms-input"
              placeholder="Verification code from Google Search Console"
            />
            <p v-if="errors.googleVerificationCode" class="mt-1 text-xs text-red-500">{{ errors.googleVerificationCode }}</p>
          </div>

          <div class="settings-field">
            <label class="block text-sm font-medium text-(--admin-ink) mb-2">Bing Webmaster Tools Code</label>
            <input
              v-model="form.bingVerificationCode"
              type="text"
              class="cms-input"
              placeholder="Verification code from Bing Webmaster Tools"
            />
            <p v-if="errors.bingVerificationCode" class="mt-1 text-xs text-red-500">{{ errors.bingVerificationCode }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 justify-end pt-4 border-t border-(--admin-border)">
        <button
          class="secondary-action"
          type="button"
          :disabled="settings.isSaving('seo')"
          @click="resetForm"
        >
          Discard
        </button>
        <button
          class="primary-action"
          type="button"
          :disabled="settings.isSaving('seo')"
          @click="saveSEOSettings"
        >
          {{ settings.isSaving('seo') ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-card {
  padding: 16px;
  border-radius: 8px;
  background: var(--admin-soft);
  border: 1px solid var(--admin-border);
}
</style>
