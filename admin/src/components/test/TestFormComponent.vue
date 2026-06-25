<template>
  <div class="test-form-container">
    <div class="card bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold mb-6">Form Validation Test</h2>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Name Field -->
        <div class="form-group">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Enter your name"
            @blur="validateFieldLocal('name')"
            @input="handleFieldChange('name', $event)"
            :class="[
              'w-full px-4 py-2 border rounded-lg transition',
              hasError('name')
                ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
              'focus:outline-none focus:ring-2',
            ]"
          />
          <p v-if="hasError('name')" class="mt-1 text-sm text-red-600">
            {{ getFieldError('name') }}
          </p>
          <p
            v-if="isTouched('name') && !hasError('name')"
            class="mt-1 text-xs text-green-600"
          >
            ✓ Valid
          </p>
        </div>

        <!-- Email Field -->
        <div class="form-group">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="example@domain.com"
            @blur="validateFieldLocal('email')"
            @input="handleFieldChange('email', $event)"
            :class="[
              'w-full px-4 py-2 border rounded-lg transition',
              hasError('email')
                ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
              'focus:outline-none focus:ring-2',
            ]"
          />
          <p v-if="hasError('email')" class="mt-1 text-sm text-red-600">
            {{ getFieldError('email') }}
          </p>
          <p
            v-if="isTouched('email') && !hasError('email')"
            class="mt-1 text-xs text-green-600"
          >
            ✓ Valid
          </p>
        </div>

        <!-- Phone Field -->
        <div class="form-group">
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
            Phone *
          </label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            placeholder="+1234567890"
            @blur="validateFieldLocal('phone')"
            @input="handleFieldChange('phone', $event)"
            :class="[
              'w-full px-4 py-2 border rounded-lg transition',
              hasError('phone')
                ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
              'focus:outline-none focus:ring-2',
            ]"
          />
          <p v-if="hasError('phone')" class="mt-1 text-sm text-red-600">
            {{ getFieldError('phone') }}
          </p>
          <p
            v-if="isTouched('phone') && !hasError('phone')"
            class="mt-1 text-xs text-green-600"
          >
            ✓ Valid
          </p>
        </div>

        <!-- Form State Indicators -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="text-center">
              <p class="text-xs text-gray-600 mb-1">Dirty</p>
              <p
                :class="[
                  'font-semibold',
                  isDirty ? 'text-orange-600' : 'text-gray-400',
                ]"
              >
                {{ isDirty ? 'Yes' : 'No' }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-xs text-gray-600 mb-1">Auto-saving</p>
              <p
                :class="[
                  'font-semibold',
                  autoSavePending ? 'text-blue-600' : 'text-gray-400',
                ]"
              >
                {{ autoSavePending ? 'Yes' : 'No' }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-xs text-gray-600 mb-1">Errors</p>
              <p
                :class="[
                  'font-semibold',
                  Object.keys(errors).length > 0
                    ? 'text-red-600'
                    : 'text-gray-400',
                ]"
              >
                {{ Object.keys(errors).length }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-xs text-gray-600 mb-1">Touched</p>
              <p class="font-semibold text-gray-600">
                {{ Object.keys(touched).filter((k) => touched[k]).length }}/3
              </p>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            :disabled="loading"
            :class="[
              'flex-1 px-6 py-3 font-medium rounded-lg transition',
              loading
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700',
            ]"
          >
            <span v-if="loading" class="inline-block">
              <svg
                class="inline-block h-4 w-4 mr-2 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </span>
            <span v-else>Save Form</span>
          </button>

          <button
            type="button"
            @click="handleReset"
            :disabled="!isDirty || loading"
            class="px-6 py-3 font-medium rounded-lg transition border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>
      </form>

      <!-- Auto-save Options -->
      <div class="border-t mt-6 pt-6">
        <h3 class="text-sm font-semibold text-gray-600 mb-3">Auto-save Options</h3>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="autoSaveEnabled"
            class="rounded border-gray-300"
          />
          <span class="text-sm text-gray-700">Enable auto-save (3s delay)</span>
        </label>
        <p
          v-if="autoSaveEnabled"
          class="mt-3 text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-2"
        >
          Auto-save is enabled. Changes will be saved automatically after 3 seconds of inactivity.
        </p>
      </div>

      <!-- Last Save Info -->
      <div
        v-if="lastSaveTime"
        class="border-t mt-6 pt-6 bg-green-50 border-green-200 rounded p-4"
      >
        <p class="text-sm text-green-800">
          <span class="font-semibold">✓ Last saved:</span>
          {{ lastSaveTime }}
        </p>
      </div>

      <!-- Test Actions -->
      <div class="border-t mt-6 pt-6">
        <h3 class="text-sm font-semibold text-gray-600 mb-3">Test Actions</h3>
        <div class="flex flex-wrap gap-2">
          <button
            @click="validateAllFields"
            class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Validate All
          </button>
          <button
            @click="fillFormData"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Fill Sample Data
          </button>
          <button
            @click="triggerApiError"
            class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
          >
            Simulate API Error
          </button>
          <button
            @click="showFormData"
            class="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition"
          >
            Show Form Data
          </button>
        </div>
      </div>

      <!-- Debug Info -->
      <div class="border-t mt-6 pt-6 bg-gray-50 rounded p-4">
        <h3 class="text-sm font-semibold text-gray-600 mb-2">Debug Info</h3>
        <pre class="text-xs text-gray-700 overflow-auto">{{
          debugInfo
        }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useForm, FormValidations } from '@/composables'

// Interface
interface UserForm {
  name: string
  email: string
  phone: string
}

// Mock API submission
async function mockSubmitForm(formData: UserForm): Promise<void> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // 10% chance of error for testing
  if (Math.random() < 0.1) {
    const error: any = new Error('Failed to save form data')
    error.response = {
      data: {
        errors: {
          email: 'Email already exists',
        },
      },
    }
    throw error
  }

  // Update last save time
  lastSaveTime.value = new Date().toLocaleTimeString()
}

// Setup useForm
const {
  form,
  errors,
  touched,
  loading,
  isDirty,
  setField,
  validateField,
  validate,
  submit,
  reset,
  hasError,
  getFieldError,
  isTouched,
} = useForm<UserForm>({
  onSubmit: mockSubmitForm,
  initialValues: {
    name: '',
    email: '',
    phone: '',
  },
  autoSave: false, // We'll control this manually
})

// Local state
const autoSaveEnabled = ref(false)
const autoSavePending = ref(false)
const lastSaveTime = ref<string | null>(null)
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

// Validation rules
const validationRules = {
  name: [
    FormValidations.required('Name is required'),
    FormValidations.minLength(2, 'Name must be at least 2 characters'),
  ],
  email: [
    FormValidations.required('Email is required'),
    FormValidations.email('Please enter a valid email address'),
  ],
  phone: [
    FormValidations.required('Phone is required'),
    FormValidations.minLength(7, 'Phone must be at least 7 characters'),
  ],
}

// Computed
const debugInfo = computed(() => {
  return JSON.stringify(
    {
      formData: form,
      isDirty: isDirty.value,
      isLoading: loading.value,
      fieldErrors: errors,
      touchedFields: Object.keys(touched).filter((k) => touched[k as keyof typeof touched]),
      errorCount: Object.keys(errors).length,
    },
    null,
    2
  )
})

// Methods
function handleFieldChange(field: keyof UserForm, event: Event) {
  const target = event.target as HTMLInputElement
  setField(field, target.value)

  // Trigger auto-save if enabled
  if (autoSaveEnabled.value) {
    autoSavePending.value = true
    if (autoSaveTimer) clearTimeout(autoSaveTimer)

    autoSaveTimer = setTimeout(() => {
      handleAutoSave()
    }, 3000)
  }
}

function validateFieldLocal(field: keyof UserForm) {
  validateField(field, validationRules[field])
}

function validateAllFields() {
  const isValid = validate(validationRules)
  if (isValid) {
    console.log('✓ All fields are valid')
  } else {
    console.log('✗ Some fields have errors')
  }
}

async function handleSubmit() {
  try {
    const isValid = validate(validationRules)
    if (!isValid) return

    await submit()
  } catch (err) {
    console.error('Form submission failed:', err)
  }
}

async function handleAutoSave() {
  try {
    const isValid = validate(validationRules)
    if (!isValid) {
      autoSavePending.value = false
      return
    }

    await submit()
    autoSavePending.value = false
  } catch (err) {
    autoSavePending.value = false
    console.error('Auto-save failed:', err)
  }
}

function handleReset() {
  reset()
  lastSaveTime.value = null
  autoSavePending.value = false
}

function fillFormData() {
  setField('name', 'John Doe')
  setField('email', 'john@example.com')
  setField('phone', '+1234567890')
}

async function triggerApiError() {
  try {
    // Force an error by throwing
    throw new Error('Simulated API error: Server is unavailable')
  } catch (err) {
    console.error('Simulated error:', err)
  }
}

function showFormData() {
  console.log('Current form data:', form)
  alert(`Form Data:\n${JSON.stringify(form, null, 2)}`)
}
</script>

<style scoped>
.test-form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
}
</style>
