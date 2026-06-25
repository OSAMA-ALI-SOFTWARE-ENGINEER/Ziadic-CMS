<script setup lang="ts">
import { computed } from 'vue'

/**
 * Input Component
 * A reusable text input with validation, error states, and accessibility features.
 *
 * @component
 * @example
 * <Input label="Email" type="email" v-model="email" />
 * <Input label="Password" type="password" v-model="password" error="Password is required" />
 * <Input label="Search" placeholder="Enter search term" v-model="search" />
 */

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time'

interface Props {
  /**
   * Label text displayed above the input
   */
  label?: string

  /**
   * HTML input type
   * @default 'text'
   */
  type?: InputType

  /**
   * Placeholder text
   */
  placeholder?: string

  /**
   * Current input value (v-model)
   */
  modelValue?: string | number

  /**
   * Error message to display below the input
   */
  error?: string

  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Whether the field is required
   * @default false
   */
  required?: boolean

  /**
   * Maximum length of input
   */
  maxlength?: number

  /**
   * Minimum length of input
   */
  minlength?: number

  /**
   * HTML autocomplete attribute
   */
  autocomplete?: string

  /**
   * Unique identifier for the input
   */
  id?: string

  /**
   * Helper text displayed below the label
   */
  helperText?: string

  /**
   * Show a success state
   * @default false
   */
  isSuccess?: boolean

  /**
   * Aria description for accessibility
   */
  ariaDescription?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  modelValue: '',
  disabled: false,
  required: false,
  isSuccess: false,
})

const emit = defineEmits<{
  /**
   * Emitted when input value changes
   */
  'update:modelValue': [value: string]

  /**
   * Emitted when input loses focus
   */
  blur: [event: FocusEvent]

  /**
   * Emitted when input receives focus
   */
  focus: [event: FocusEvent]
}>()

// Generate unique ID if not provided
const inputId = computed(() => props.id || `input-${Math.random().toString(36).slice(2, 9)}`)

// Compute error ID for aria-describedby
const errorId = computed(() => `${inputId.value}-error`)
const helperId = computed(() => `${inputId.value}-helper`)

/**
 * Compute input classes based on state
 */
const inputClasses = computed(() => {
  const baseClasses = 'cms-input block w-full px-3 py-2.5 transition-all duration-150'

  if (props.error) {
    return `${baseClasses} border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20`
  }

  if (props.isSuccess) {
    return `${baseClasses} border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-500/20`
  }

  return baseClasses
})

/**
 * Compute aria-describedby value
 */
const ariaDescribedBy = computed(() => {
  const ids = []
  if (props.error) ids.push(errorId.value)
  if (props.helperText) ids.push(helperId.value)
  if (props.ariaDescription) ids.push(`${inputId.value}-description`)
  return ids.length > 0 ? ids.join(' ') : undefined
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="block text-sm font-semibold text-(--admin-ink)">
      {{ label }}
      <span v-if="required" class="text-red-500" aria-label="required">*</span>
    </label>

    <!-- Helper text under label -->
    <p v-if="helperText && !error" :id="helperId" class="text-xs text-(--admin-muted)">
      {{ helperText }}
    </p>

    <!-- Input wrapper -->
    <div class="relative">
      <input
        :id="inputId"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :maxlength="maxlength"
        :minlength="minlength"
        :autocomplete="autocomplete"
        :aria-describedby="ariaDescribedBy"
        :aria-invalid="!!error"
        :aria-label="label || ariaDescription"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <!-- Success icon -->
      <span v-if="isSuccess && !error" class="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" aria-hidden="true">
        <i class="pi pi-check text-lg" aria-hidden="true"></i>
      </span>

      <!-- Error icon -->
      <span v-if="error" class="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" aria-hidden="true">
        <i class="pi pi-exclamation-circle text-lg" aria-hidden="true"></i>
      </span>
    </div>

    <!-- Error message -->
    <p v-if="error" :id="errorId" class="text-xs font-medium text-red-500">
      {{ error }}
    </p>

    <!-- Aria description (hidden from view) -->
    <span v-if="ariaDescription" :id="`${inputId}-description`" class="sr-only">
      {{ ariaDescription }}
    </span>
  </div>
</template>
