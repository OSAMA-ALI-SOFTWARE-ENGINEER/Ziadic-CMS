<script setup lang="ts">
import { computed, watch } from 'vue'

/**
 * Modal Component
 * A reusable modal dialog with header, content, and action slots.
 * Supports keyboard navigation (ESC to close) and backdrop click to close.
 *
 * @component
 * @example
 * <Modal title="Confirm Action" :isOpen="showModal" @close="showModal = false">
 *   <p>Are you sure you want to delete this item?</p>
 *   <template #actions>
 *     <Button variant="secondary" @click="showModal = false">Cancel</Button>
 *     <Button variant="danger" @click="handleDelete">Delete</Button>
 *   </template>
 * </Modal>
 */

interface Props {
  /**
   * Whether the modal is open
   */
  isOpen: boolean

  /**
   * Title displayed in the modal header
   */
  title: string

  /**
   * Whether clicking the backdrop closes the modal
   * @default true
   */
  closeOnBackdropClick?: boolean

  /**
   * Whether to show the close button in the header
   * @default true
   */
  showCloseButton?: boolean

  /**
   * Z-index for the modal
   * @default 50
   */
  zIndex?: number

  /**
   * ARIA label for the modal dialog
   */
  ariaLabel?: string

  /**
   * ARIA description for the modal (screen reader)
   */
  ariaDescription?: string

  /**
   * Whether to disable closing with ESC key
   * @default false
   */
  disableEscapeClose?: boolean

  /**
   * Lock body scroll when modal is open
   * @default true
   */
  lockBodyScroll?: boolean

  /**
   * Size of the modal
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  closeOnBackdropClick: true,
  showCloseButton: true,
  zIndex: 50,
  disableEscapeClose: false,
  lockBodyScroll: true,
  size: 'md',
})

const emit = defineEmits<{
  /**
   * Emitted when the modal should close
   */
  close: []
}>()

/**
 * Watch for changes to isOpen and manage body scroll
 */
watch(
  () => props.isOpen,
  (isOpen) => {
    if (props.lockBodyScroll) {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  }
)

/**
 * Compute modal width classes
 */
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }
  return sizes[props.size]
})

/**
 * Handle backdrop click
 */
const handleBackdropClick = (event: MouseEvent) => {
  if (props.closeOnBackdropClick && event.target === event.currentTarget) {
    emit('close')
  }
}

/**
 * Handle keyboard events
 */
const handleKeyDown = (event: KeyboardEvent) => {
  if (!props.disableEscapeClose && event.key === 'Escape') {
    emit('close')
  }
}

/**
 * Generate unique IDs for accessibility
 */
const modalId = `modal-${Math.random().toString(36).slice(2, 9)}`
const titleId = `${modalId}-title`
const descId = `${modalId}-description`
</script>

<template>
  <!-- Modal backdrop with transition -->
  <Transition name="modal-fade">
    <div
      v-if="isOpen"
      :style="{ zIndex }"
      class="fixed inset-0 grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
      @click="handleBackdropClick"
      @keydown="handleKeyDown"
    >
      <!-- Modal dialog -->
      <section
        :role="ariaLabel || title ? 'dialog' : 'alertdialog'"
        :aria-labelledby="titleId"
        :aria-describedby="ariaDescription ? descId : undefined"
        :aria-modal="true"
        class="cms-card max-h-[90vh] w-full overflow-hidden"
        :class="sizeClasses"
      >
        <!-- Modal header -->
        <header class="flex items-center justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4">
          <h2 :id="titleId" class="m-0 text-lg font-semibold text-(--admin-ink)">
            {{ title }}
          </h2>
          <button
            v-if="showCloseButton"
            class="icon-button"
            type="button"
            aria-label="Close modal"
            @click="$emit('close')"
          >
            <i class="pi pi-times" aria-hidden="true"></i>
          </button>
        </header>

        <!-- Modal content -->
        <div class="max-h-[calc(90vh-76px)] overflow-auto p-5">
          <div v-if="ariaDescription" :id="descId" class="sr-only">
            {{ ariaDescription }}
          </div>
          <slot />
        </div>

        <!-- Modal actions footer -->
        <footer v-if="$slots.actions" class="flex justify-end gap-3 border-t border-[var(--admin-border)] px-5 py-4">
          <slot name="actions" />
        </footer>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
