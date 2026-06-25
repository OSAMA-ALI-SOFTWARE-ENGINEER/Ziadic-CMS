<script setup lang="ts">
import { computed } from 'vue'

/**
 * Card Component
 * A reusable card container with optional title, header/footer slots, and padding variants.
 *
 * @component
 * @example
 * <Card title="Card Title">
 *   <p>Card content goes here</p>
 * </Card>
 *
 * <Card padding="lg">
 *   <template #header>
 *     <h3>Custom Header</h3>
 *   </template>
 *   <p>Card content</p>
 *   <template #footer>
 *     <Button>Action</Button>
 *   </template>
 * </Card>
 */

export type CardPadding = 'sm' | 'md' | 'lg'

interface Props {
  /**
   * Title displayed at the top of the card
   */
  title?: string

  /**
   * Padding size for the card body
   * @default 'md'
   */
  padding?: CardPadding

  /**
   * Whether to show a dividing border between header and content
   * @default true
   */
  showHeaderBorder?: boolean

  /**
   * Whether to show a dividing border between content and footer
   * @default true
   */
  showFooterBorder?: boolean

  /**
   * CSS class for additional styling
   */
  class?: string

  /**
   * Aria label for accessibility when no title is provided
   */
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  showHeaderBorder: true,
  showFooterBorder: true,
})

/**
 * Compute padding classes
 */
const paddingClasses = computed(() => {
  const paddingSizes: Record<CardPadding, string> = {
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  }
  return paddingSizes[props.padding]
})

/**
 * Compute border classes based on slot presence
 */
const headerBorderClass = computed(() => {
  return props.showHeaderBorder ? 'border-b border-[var(--admin-border)]' : ''
})

const footerBorderClass = computed(() => {
  return props.showFooterBorder ? 'border-t border-[var(--admin-border)]' : ''
})
</script>

<template>
  <article
    class="cms-card overflow-hidden"
    :aria-label="!title ? ariaLabel : undefined"
    :class="class"
  >
    <!-- Header section (title or custom header slot) -->
    <header v-if="title || $slots.header" :class="[paddingClasses, headerBorderClass]">
      <div v-if="title && !$slots.header" class="flex items-center justify-between gap-4">
        <h2 class="m-0 text-lg font-semibold text-(--admin-ink)">{{ title }}</h2>
      </div>
      <slot v-else name="header" />
    </header>

    <!-- Main content section -->
    <div :class="paddingClasses">
      <slot />
    </div>

    <!-- Footer section -->
    <footer v-if="$slots.footer" :class="[paddingClasses, footerBorderClass]">
      <slot name="footer" />
    </footer>
  </article>
</template>
