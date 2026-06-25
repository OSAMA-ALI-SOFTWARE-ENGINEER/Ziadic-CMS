import { ref, reactive, computed } from 'vue'
import { useUiStore } from '@/stores/ui'

export interface ValidationRule {
  (value: any): true | string
}

export interface FormFieldError {
  [field: string]: string
}

interface UseFormOptions {
  onSubmit: (formData: any) => Promise<void>
  initialValues?: Record<string, any>
  autoSave?: boolean
  autoSaveDelay?: number
}

/**
 * Composable for form handling with validation and auto-save
 * Usage:
 *   const { form, errors, submit, setField } = useForm({
 *     onSubmit: async (data) => { await api.save(data) },
 *     initialValues: { name: '', email: '' }
 *   })
 */
export function useForm<T extends Record<string, any>>(options: UseFormOptions) {
  const { onSubmit, initialValues = {}, autoSave = false, autoSaveDelay = 3000 } = options

  const ui = useUiStore()
  const form = reactive<T>({ ...initialValues } as T)
  const errors = reactive<FormFieldError>({})

  // Initialize touched with all fields set to false
  const touched = reactive<Record<keyof T, boolean>>(
    Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = false
      return acc
    }, {} as Record<keyof T, boolean>)
  )

  const loading = ref(false)
  const hasChanges = ref(false)
  const isDirty = computed(() => hasChanges.value)

  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null
  let lastSavedState = JSON.stringify(form)

  /**
   * Set form field value
   */
  function setField(field: keyof T, value: any) {
    form[field] = value
    hasChanges.value = JSON.stringify(form) !== lastSavedState
    touched[field] = true

    if (autoSave && autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    if (autoSave) {
      autoSaveTimer = setTimeout(() => {
        submitForm()
      }, autoSaveDelay)
    }
  }

  /**
   * Set multiple form fields
   */
  function setFields(fields: Partial<T>) {
    Object.entries(fields).forEach(([key, value]) => {
      form[key as keyof T] = value
      touched[key as keyof T] = true
    })
    hasChanges.value = JSON.stringify(form) !== lastSavedState
  }

  /**
   * Clear form field value
   */
  function clearField(field: keyof T) {
    form[field] = initialValues[field] || ''
    hasChanges.value = JSON.stringify(form) !== lastSavedState
  }

  /**
   * Reset form to initial values
   */
  function reset() {
    Object.keys(initialValues).forEach((key) => {
      form[key as keyof T] = initialValues[key]
    })
    Object.keys(touched).forEach((key) => {
      touched[key as keyof T] = false
    })
    Object.keys(errors).forEach((key) => {
      delete errors[key]
    })
    hasChanges.value = false
  }

  /**
   * Set field errors (typically from API validation)
   */
  function setErrors(fieldErrors: FormFieldError) {
    Object.entries(fieldErrors).forEach(([key, message]) => {
      errors[key] = message
    })
  }

  /**
   * Validate field with custom rules
   */
  function validateField(field: keyof T, rules: ValidationRule[]): boolean {
    const value = form[field]
    for (const rule of rules) {
      const result = rule(value)
      if (result !== true) {
        errors[field as string] = result
        return false
      }
    }
    delete errors[field as string]
    return true
  }

  /**
   * Validate entire form
   */
  function validate(validationRules: Record<keyof T, ValidationRule[]>): boolean {
    let isValid = true

    Object.entries(validationRules).forEach(([field, rules]) => {
      if (!validateField(field as keyof T, rules as ValidationRule[])) {
        isValid = false
      }
    })

    return isValid
  }

  /**
   * Submit form
   */
  async function submitForm(validationRules?: Record<keyof T, ValidationRule[]>) {
    try {
      // Validate if rules provided
      if (validationRules) {
        if (!validate(validationRules)) {
          ui.pushToast('Please fix the errors above', 'warning')
          return
        }
      }

      loading.value = true
      await onSubmit(form)

      lastSavedState = JSON.stringify(form)
      hasChanges.value = false
      ui.pushToast('Saved successfully', 'success')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save'

      // Check if error has field-specific errors (API validation)
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'errors' in error.response.data
      ) {
        setErrors(error.response.data.errors as FormFieldError)
      }

      ui.pushToast(errorMessage, 'danger')
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Get form data as plain object
   */
  function getFormData(): T {
    return { ...form }
  }

  /**
   * Check if field has been touched
   */
  function isTouched(field: keyof T): boolean {
    return touched[field] || false
  }

  /**
   * Check if field has error
   */
  function hasError(field: keyof T): boolean {
    return !!(errors[field as string])
  }

  /**
   * Get field error message
   */
  function getFieldError(field: keyof T): string {
    return errors[field as string] || ''
  }

  return {
    form,
    errors,
    touched,
    loading,
    isDirty,
    hasChanges: computed(() => hasChanges.value),
    setField,
    setFields,
    clearField,
    reset,
    setErrors,
    validateField,
    validate,
    submit: submitForm,
    getFormData,
    isTouched,
    hasError,
    getFieldError,
  }
}

/**
 * Validation rules factory
 */
export const FormValidations = {
  required: (message = 'This field is required') => (value: any) =>
    value && (typeof value === 'string' ? value.trim() : true) ? true : message,

  minLength: (min: number, message?: string) => (value: string) =>
    value && value.length >= min ? true : message || `Minimum ${min} characters required`,

  maxLength: (max: number, message?: string) => (value: string) =>
    !value || value.length <= max ? true : message || `Maximum ${max} characters allowed`,

  email: (message = 'Invalid email address') => (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? true : message,

  pattern: (regex: RegExp, message = 'Invalid format') => (value: string) =>
    regex.test(value) ? true : message,

  min: (min: number, message?: string) => (value: number) =>
    value >= min ? true : message || `Must be at least ${min}`,

  max: (max: number, message?: string) => (value: number) =>
    value <= max ? true : message || `Must be at most ${max}`,

  match: (otherValue: any, message = 'Fields do not match') => (value: any) =>
    value === otherValue ? true : message,
}
