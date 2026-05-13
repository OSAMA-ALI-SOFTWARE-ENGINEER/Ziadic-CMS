<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { ListingRow } from '@/data/cms'

const props = defineProps<{
  listing?: ListingRow | null
}>()

const emit = defineEmits<{
  save: [listing: ListingRow, originalTitle?: string]
  cancel: []
}>()

const step = ref(1)
const previews = ref<string[]>([])

const form = reactive({
  title: '',
  category: 'Arts and Culture',
  subcategory: '',
  tags: 'featured, popular',
  city: 'Vlore, AL',
  owner: 'Super Admin',
  status: 'Draft',
  excerpt: '',
  description: '',
  slug: '',
  metaTitle: '',
  metaDescription: '',
  keywords: '',
})

const stepLabels = ['Basics', 'Content', 'Media', 'SEO & Status']

const statusTone = computed(() => {
  if (form.status === 'Published' || form.status === 'Approved') return 'success'
  if (form.status === 'Pending Review') return 'warning'
  if (form.status === 'Rejected') return 'danger'
  return 'neutral'
})

watch(
  () => props.listing,
  (listing) => {
    form.title = listing?.title || ''
    form.category = listing?.category || 'Arts and Culture'
    form.city = listing?.city || 'Vlore, AL'
    form.owner = listing?.owner || 'Super Admin'
    form.status = listing?.status || 'Draft'
    form.slug = listing?.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || ''
  },
  { immediate: true },
)

function handleFiles(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files || [])
  previews.value = files.map((file) => URL.createObjectURL(file))
}

function submit() {
  emit(
    'save',
    {
      title: form.title || 'Untitled Listing',
      category: form.category,
      city: form.city,
      owner: form.owner,
      status: form.status,
      tone: statusTone.value,
      updatedAt: 'Just now',
    },
    props.listing?.title,
  )
}
</script>

<template>
  <form class="grid gap-6" @submit.prevent="submit">
    <ol class="grid gap-2 sm:grid-cols-4">
      <li
        v-for="(label, index) in stepLabels"
        :key="label"
        class="rounded-lg border px-3 py-2 text-sm font-semibold"
        :class="step === index + 1 ? 'border-[var(--admin-primary)] bg-[var(--admin-soft)] text-[var(--admin-primary-strong)]' : 'border-[var(--admin-border)] text-[var(--admin-muted)]'"
      >
        {{ index + 1 }}. {{ label }}
      </li>
    </ol>

    <section v-if="step === 1" class="grid gap-4 md:grid-cols-2">
      <label class="grid gap-2 text-sm font-medium">Title <input v-model="form.title" class="cms-input" /></label>
      <label class="grid gap-2 text-sm font-medium">Slug <input v-model="form.slug" class="cms-input" /></label>
      <label class="grid gap-2 text-sm font-medium">Category <input v-model="form.category" class="cms-input" /></label>
      <label class="grid gap-2 text-sm font-medium">Subcategory <input v-model="form.subcategory" class="cms-input" /></label>
      <label class="grid gap-2 text-sm font-medium">Tags <input v-model="form.tags" class="cms-input" /></label>
      <label class="grid gap-2 text-sm font-medium">City <input v-model="form.city" class="cms-input" /></label>
    </section>

    <section v-if="step === 2" class="grid gap-4">
      <label class="grid gap-2 text-sm font-medium">Excerpt <textarea v-model="form.excerpt" class="cms-input min-h-24 py-3"></textarea></label>
      <label class="grid gap-2 text-sm font-medium">
        Rich description
        <textarea v-model="form.description" class="cms-input min-h-44 py-3" placeholder="Tiptap/TinyMCE endpoint-ready rich content field"></textarea>
      </label>
    </section>

    <section v-if="step === 3" class="grid gap-4">
      <label class="dropzone">
        <i class="pi pi-cloud-upload text-3xl text-[var(--admin-primary)]"></i>
        <strong>Drop listing gallery files here</strong>
        <span>or click to browse and preview uploads</span>
        <input class="hidden" type="file" multiple accept="image/*" @change="handleFiles" />
      </label>
      <div v-if="previews.length" class="grid gap-3 sm:grid-cols-3">
        <img v-for="preview in previews" :key="preview" :src="preview" class="aspect-[4/3] rounded-lg object-cover" alt="" />
      </div>
    </section>

    <section v-if="step === 4" class="grid gap-4 md:grid-cols-2">
      <label class="grid gap-2 text-sm font-medium">Meta title <input v-model="form.metaTitle" class="cms-input" /></label>
      <label class="grid gap-2 text-sm font-medium">Keywords <input v-model="form.keywords" class="cms-input" /></label>
      <label class="grid gap-2 text-sm font-medium md:col-span-2">Meta description <textarea v-model="form.metaDescription" class="cms-input min-h-24 py-3"></textarea></label>
      <label class="grid gap-2 text-sm font-medium">Status
        <select v-model="form.status" class="cms-input">
          <option>Draft</option>
          <option>Pending Review</option>
          <option>Approved</option>
          <option>Published</option>
          <option>Rejected</option>
        </select>
      </label>
    </section>

    <div class="flex flex-wrap justify-between gap-3 border-t border-[var(--admin-border)] pt-5">
      <button class="secondary-action" type="button" @click="step > 1 ? step-- : emit('cancel')">
        {{ step > 1 ? 'Back' : 'Cancel' }}
      </button>
      <button v-if="step < 4" class="primary-action" type="button" @click="step++">Next</button>
      <button v-else class="primary-action" type="submit">Save listing</button>
    </div>
  </form>
</template>
