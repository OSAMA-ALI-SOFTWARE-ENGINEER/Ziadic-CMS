<script setup lang="ts">
import { computed } from 'vue'

/**
 * Button Component
 * A reusable button with multiple variants, sizes, and states.
 *
 * @component
 * @example
 * <Button variant="primary" size="md" @click="handleClick">Click me</Button>
 * <Button variant="secondary" :disabled="true">Disabled</Button>
 * <Button variant="danger" size="lg">Delete</Button>
 * <Button variant="loading" :disabled="isLoading">Processing...</Button>
 */

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'loading'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface Props {
  /**
   * Visual style variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant

  /**
   * Size of the button
   * @default 'md'
   */
  size?: ButtonSize

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * HTML type attribute
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset'

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string

  /**
   * Show loading spinner
   * @default false
   */
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  type: 'button',
  isLoading: false,
})

defineEmits<{
  /**
   * Emitted when button is clicked
   */
  click: [event: MouseEvent]
}>()

/**
 * Compute classes based on variant and size
 */
const buttonClasses = computed(() => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-primary-strong)] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'border border-[var(--admin-border)] bg-[var(--admin-panel)] text-[var(--admin-ink)] hover:bg-[var(--admin-soft)] hover:border-[var(--admin-primary)]',
    danger: 'bg-red-600 text-white shadow-lg hover:shadow-xl hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0',
    loading: 'bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-primary-strong)] text-white shadow-lg opacity-75 cursor-wait',
  }

  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm min-h-8',
    md: 'px-4 py-2.5 text-sm min-h-10',
    lg: 'px-6 py-3 text-base min-h-12',
  }

  return `${baseClasses} ${variants[props.variant]} ${sizes[props.size]}`
})

/**
 * Compute disabled state considering loading state
 */
const isDisabled = computed(() => props.disabled || props.isLoading)
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="isDisabled"
    :aria-label="ariaLabel"
    :aria-busy="isLoading"
  >
    <!-- Loading spinner -->
    <span v-if="isLoading" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true"></span>

    <!-- Button content -->
    <slot />
  </button>
</template>
