<script setup lang="ts">
defineProps<{
  title: string
  open: boolean
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" @click.self="$emit('close')">
      <section class="cms-card max-h-[90vh] w-full max-w-230 overflow-hidden">
        <header class="flex items-center justify-between gap-4 border-b border-(--admin-border) px-5 py-4">
          <h2 class="m-0 text-lg font-semibold text-(--admin-ink)">{{ title }}</h2>
          <button class="icon-button" type="button" aria-label="Close modal" @click="$emit('close')">
            <i class="pi pi-times" aria-hidden="true"></i>
          </button>
        </header>
        <div class="max-h-[calc(90vh-76px)] overflow-auto p-5">
          <slot></slot>
        </div>
      </section>
    </div>
  </Transition>
</template>
