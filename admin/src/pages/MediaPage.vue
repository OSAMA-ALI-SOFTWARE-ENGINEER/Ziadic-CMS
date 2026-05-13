<script setup lang="ts">
import { ref } from 'vue'
import { useCmsStore } from '@/stores/cms'
import { useUiStore } from '@/stores/ui'

const cms = useCmsStore()
const ui = useUiStore()
const previews = ref<string[]>([])

function handleFiles(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files || [])
  previews.value = files.map((file) => URL.createObjectURL(file))
  ui.pushToast(`${files.length} media file(s) ready for upload.`, 'success')
}
</script>

<template>
  <section class="cms-card p-5">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="m-0 text-base font-semibold">Media library</h2>
        <p class="m-0 mt-1 text-sm text-[var(--admin-muted)]">Drag-and-drop upload and manage listing galleries, documents, and SEO images.</p>
      </div>
    </div>

    <label class="dropzone mt-6">
      <i class="pi pi-cloud-upload text-3xl text-[var(--admin-primary)]"></i>
      <strong>Drop files here or click to upload</strong>
      <span>Spatie Media Library endpoint-ready component</span>
      <input class="hidden" type="file" multiple accept="image/*,.pdf" @change="handleFiles" />
    </label>

    <div v-if="previews.length" class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <img v-for="preview in previews" :key="preview" :src="preview" class="aspect-[4/3] rounded-lg object-cover" alt="" />
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <article v-for="item in cms.media" :key="item.id" class="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-soft)] p-3">
        <div class="grid aspect-[4/3] place-items-center rounded-md bg-[var(--admin-panel)] text-2xl text-[var(--admin-primary)]">
          <i class="pi pi-image" aria-hidden="true"></i>
        </div>
        <p class="m-0 mt-3 truncate text-sm font-medium">{{ item.name }}</p>
        <p class="m-0 mt-1 text-xs text-[var(--admin-muted)]">{{ item.type }} · {{ item.size }}</p>
      </article>
    </div>
  </section>
</template>
