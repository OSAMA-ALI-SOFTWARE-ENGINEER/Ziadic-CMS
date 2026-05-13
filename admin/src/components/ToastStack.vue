<script setup lang="ts">
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
</script>

<template>
  <div class="fixed right-4 top-4 z-[70] grid w-[min(360px,calc(100vw-32px))] gap-3">
    <TransitionGroup name="toast">
      <article v-for="toast in ui.toasts" :key="toast.id" class="cms-card flex items-start gap-3 p-4">
        <span class="mt-1 h-2.5 w-2.5 rounded-full" :class="`toast-dot--${toast.tone}`"></span>
        <p class="m-0 flex-1 text-sm">{{ toast.message }}</p>
        <button class="border-0 bg-transparent text-[var(--admin-muted)]" type="button" @click="ui.dismissToast(toast.id)">
          <i class="pi pi-times" aria-hidden="true"></i>
        </button>
      </article>
    </TransitionGroup>
  </div>
</template>
