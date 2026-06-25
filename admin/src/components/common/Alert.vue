<script setup lang="ts">
import { ref, computed, watch } from 'vue'

/**
 * Alert Component
 * A reusable alert/notification component with multiple types and auto-dismiss.
 *
 * @component
 * @example
 * <Alert type="success" title="Success" message="Operation completed successfully" />
 * <Alert type="error" message="An error occurred" :autoDismiss="false" @dismiss="clearAlert" />
 * <Alert type="warning" message="This is a warning" :autoDismissMs="5000" />
 * <Alert type="info" title="Information" message="This is an informational alert" />
 */

export type AlertType = 'success' | 'error' | 'warning' | 'info'

interface Props {
  /**
   * Type of alert
   */
  type: AlertType

  /**
   * Title of the alert
   */
  title?: string

  /**
   * Message/content of the alert
   */
  message?: string

  /**
   * Whether to show a dismiss/close button
   * @default true
   */
  dismissible?: boolean

  /**
   * Auto-dismiss the alert after a delay
   * @default false
   */
  autoDismiss?: boolean

  /**
   * Duration in milliseconds before auto-dismiss
   * @default 4000
   */
  autoDismissMs?: number

  /**
   * Whether the alert is visible
   * @default true
   */
  visible?: boolean

  /**
   * Custom icon to override default
   */
  icon?: string

  /**
   * ARIA label for the alert
   */
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  dismissible: true,
  autoDismiss: false,
  autoDismissMs: 4000,
  visible: true,
})

const emit = defineEmits<{
  /**
   * Emitted when the alert is dismissed
   */
  dismiss: []
}>()

// Track visibility locally
const isVisible = ref(props.visible)

// Watch for prop changes
watch(
  () => props.visible,
  (newVal) => {
    isVisible.value = newVal
  }
)

// Setup auto-dismiss
let dismissTimer: ReturnType<typeof setTimeout> | null = null

const startAutoDismiss = () => {
  if (props.autoDismiss && props.autoDismissMs > 0) {
    dismissTimer = setTimeout(() => {
      handleDismiss()
    }, props.autoDismissMs)
  }
}

const clearAutoDismiss = () => {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
}

const handleDismiss = () => {
  clearAutoDismiss()
  isVisible.value = false
  emit('dismiss')
}

// Start auto-dismiss when component mounts or visibility changes
watch(() => isVisible.value, (newVal) => {
  if (newVal) {
    startAutoDismiss()
  } else {
    clearAutoDismiss()
  }
})

// Auto-dismiss on mount if enabled
if (props.autoDismiss && props.visible) {
  startAutoDismiss()
}

/**
 * Compute alert styling based on type
 */
const alertClasses = computed(() => {
  const baseClasses = 'cms-card flex items-start gap-3 p-4 transition-all duration-150'

  const typeClasses: Record<AlertType, string> = {
    success: 'border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/20',
    error: 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20',
    warning: 'border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    info: 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20',
  }

  return `${baseClasses} ${typeClasses[props.type]}`
})

/**
 * Compute icon based on type
 */
const alertIcon = computed(() => {
  if (props.icon) return props.icon

  const icons: Record<AlertType, string> = {
    success: 'pi pi-check-circle',
    error: 'pi pi-exclamation-circle',
    warning: 'pi pi-info-circle',
    info: 'pi pi-info-circle',
  }

  return icons[props.type]
})

/**
 * Compute icon color based on type
 */
const iconColor = computed(() => {
  const colors: Record<AlertType, string> = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  }

  return colors[props.type]
})

/**
 * Compute text color based on type
 */
const textColor = computed(() => {
  const colors: Record<AlertType, string> = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    warning: 'text-yellow-800 dark:text-yellow-200',
    info: 'text-blue-800 dark:text-blue-200',
  }

  return colors[props.type]
})

/**
 * Compute ARIA role based on type
 */
const alertRole = computed(() => {
  return props.type === 'error' ? 'alert' : 'status'
})
</script>

<template>
  <!-- Alert container with transition -->
  <Transition
    name="alert-fade"
    @enter="startAutoDismiss"
  >
    <div
      v-if="isVisible"
      :role="alertRole"
      :aria-live="alertRole === 'alert' ? 'assertive' : 'polite'"
      :aria-atomic="true"
      :aria-label="ariaLabel"
      :class="alertClasses"
    >
      <!-- Icon -->
      <span class="mt-0.5 flex-shrink-0" aria-hidden="true">
        <i :class="[alertIcon, iconColor, 'text-lg']" aria-hidden="true"></i>
      </span>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h4 v-if="title" class="m-0 font-semibold" :class="textColor">
          {{ title }}
        </h4>
        <p v-if="message" class="m-0 mt-1 text-sm" :class="textColor">
          {{ message }}
        </p>

        <!-- Alert content slot -->
        <div v-if="$slots.default" class="mt-2 text-sm" :class="textColor">
          <slot />
        </div>
      </div>

      <!-- Dismiss button -->
      <button
        v-if="dismissible"
        type="button"
        class="icon-button--sm flex-shrink-0"
        :aria-label="`Dismiss ${type} alert`"
        @click="handleDismiss"
      >
        <i class="pi pi-times text-lg" aria-hidden="true"></i>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}

.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
