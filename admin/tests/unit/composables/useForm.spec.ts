import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useForm, FormValidations, type ValidationRule } from '@/composables/useForm'
import { useUiStore } from '@/stores/ui'

describe('useForm Composable', () => {
  let store: ReturnType<typeof useUiStore>

  beforeEach(() => {
    store = useUiStore()
  })

  describe('Form initialization', () => {
    it('should initialize with provided initial values', () => {
      const onSubmit = vi.fn()
      const initialValues = { name: 'John', email: 'john@example.com' }

      const { form } = useForm({
        onSubmit,
        initialValues,
      })

      expect(form.name).toBe('John')
      expect(form.email).toBe('john@example.com')
    })

    it('should initialize with empty form if no initial values', () => {
      const onSubmit = vi.fn()

      const { form } = useForm({ onSubmit })

      expect(Object.keys(form)).toHaveLength(0)
    })

    it('should initialize clean state', () => {
      const onSubmit = vi.fn()
      const initialValues = { name: 'John' }

      const { hasChanges, isDirty } = useForm({
        onSubmit,
        initialValues,
      })

      expect(hasChanges.value).toBe(false)
      expect(isDirty.value).toBe(false)
    })
  })

  describe('Field manipulation', () => {
    it('should set field value', () => {
      const onSubmit = vi.fn()
      const { form, setField } = useForm({
        onSubmit,
        initialValues: { name: '' },
      })

      setField('name', 'John')

      expect(form.name).toBe('John')
    })

    it('should mark field as touched when set', () => {
      const onSubmit = vi.fn()
      const { setField, isTouched } = useForm({
        onSubmit,
        initialValues: { name: '' },
      })

      setField('name', 'John')

      expect(isTouched('name')).toBe(true)
    })

    it('should set multiple fields at once', () => {
      const onSubmit = vi.fn()
      const { form, setFields } = useForm({
        onSubmit,
        initialValues: { name: '', email: '' },
      })

      setFields({ name: 'John', email: 'john@example.com' })

      expect(form.name).toBe('John')
      expect(form.email).toBe('john@example.com')
    })

    it('should clear field to initial value', () => {
      const onSubmit = vi.fn()
      const { form, setField, clearField } = useForm({
        onSubmit,
        initialValues: { name: 'Initial' },
      })

      setField('name', 'Changed')
      expect(form.name).toBe('Changed')

      clearField('name')

      expect(form.name).toBe('Initial')
    })

    it('should reset entire form', () => {
      const onSubmit = vi.fn()
      const { form, setField, reset, touched } = useForm({
        onSubmit,
        initialValues: { name: 'John', email: 'john@example.com' },
      })

      setField('name', 'Jane')
      expect(touched.name).toBe(true)

      reset()

      expect(form.name).toBe('John')
      expect(form.email).toBe('john@example.com')
      expect(touched.name).toBe(false)
    })

    it('should get form data as plain object', () => {
      const onSubmit = vi.fn()
      const { setField, getFormData } = useForm({
        onSubmit,
        initialValues: { name: '', email: '' },
      })

      setField('name', 'John')
      setField('email', 'john@example.com')

      const data = getFormData()

      expect(data).toEqual({
        name: 'John',
        email: 'john@example.com',
      })
    })
  })

  describe('Change tracking', () => {
    it('should detect changes', () => {
      const onSubmit = vi.fn()
      const { setField, hasChanges } = useForm({
        onSubmit,
        initialValues: { name: 'John' },
      })

      expect(hasChanges.value).toBe(false)

      setField('name', 'Jane')

      expect(hasChanges.value).toBe(true)
    })

    it('should not mark as changed when set to same value', () => {
      const onSubmit = vi.fn()
      const { setField, hasChanges } = useForm({
        onSubmit,
        initialValues: { name: 'John' },
      })

      setField('name', 'John')

      expect(hasChanges.value).toBe(false)
    })

    it('should track if isDirty computed property', () => {
      const onSubmit = vi.fn()
      const { setField, isDirty } = useForm({
        onSubmit,
        initialValues: { name: 'John' },
      })

      expect(isDirty.value).toBe(false)

      setField('name', 'Jane')

      expect(isDirty.value).toBe(true)
    })
  })

  describe('Form validation', () => {
    it('should validate single field', () => {
      const onSubmit = vi.fn()
      const { validateField } = useForm({
        onSubmit,
        initialValues: { name: 'John' },
      })

      const isValid = validateField('name', [
        FormValidations.required(),
      ])

      expect(isValid).toBe(true)
    })

    it('should fail validation with error message', () => {
      const onSubmit = vi.fn()
      const { form, validateField, getFieldError } = useForm({
        onSubmit,
        initialValues: { name: '' },
      })

      form.name = ''

      const isValid = validateField('name', [
        FormValidations.required(),
      ])

      expect(isValid).toBe(false)
      expect(getFieldError('name')).toBe('This field is required')
    })

    it('should validate multiple fields', () => {
      const onSubmit = vi.fn()
      const { form, validate } = useForm({
        onSubmit,
        initialValues: { name: '', email: '' },
      })

      form.name = 'John'
      form.email = 'john@example.com'

      const isValid = validate({
        name: [FormValidations.required()],
        email: [FormValidations.required(), FormValidations.email()],
      })

      expect(isValid).toBe(true)
    })

    it('should fail multiple field validation', () => {
      const onSubmit = vi.fn()
      const { form, validate, hasError } = useForm({
        onSubmit,
        initialValues: { name: '', email: '' },
      })

      form.name = ''
      form.email = 'invalid'

      const isValid = validate({
        name: [FormValidations.required()],
        email: [FormValidations.required(), FormValidations.email()],
      })

      expect(isValid).toBe(false)
      expect(hasError('name')).toBe(true)
      expect(hasError('email')).toBe(true)
    })

    it('should chain multiple validation rules', () => {
      const onSubmit = vi.fn()
      const { form, validate } = useForm({
        onSubmit,
        initialValues: { password: '' },
      })

      form.password = 'short'

      const isValid = validate({
        password: [
          FormValidations.required(),
          FormValidations.minLength(8),
        ],
      })

      expect(isValid).toBe(false)
    })
  })

  describe('Error handling', () => {
    it('should set field errors', () => {
      const onSubmit = vi.fn()
      const { setErrors, getFieldError } = useForm({
        onSubmit,
        initialValues: { name: '', email: '' },
      })

      setErrors({
        name: 'Name is required',
        email: 'Invalid email format',
      })

      expect(getFieldError('name')).toBe('Name is required')
      expect(getFieldError('email')).toBe('Invalid email format')
    })

    it('should check if field has error', () => {
      const onSubmit = vi.fn()
      const { setErrors, hasError } = useForm({
        onSubmit,
        initialValues: { name: '' },
      })

      setErrors({ name: 'Error message' })

      expect(hasError('name')).toBe(true)
    })

    it('should return empty string for field without error', () => {
      const onSubmit = vi.fn()
      const { getFieldError } = useForm({
        onSubmit,
        initialValues: { name: '' },
      })

      expect(getFieldError('name')).toBe('')
    })
  })

  describe('Form submission', () => {
    it('should call onSubmit callback', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      const { form, submit } = useForm({
        onSubmit,
        initialValues: { name: 'John' },
      })

      await submit()

      expect(onSubmit).toHaveBeenCalledWith({ name: 'John' })
    })

    it('should set loading state during submission', async () => {
      let loadingStates: boolean[] = []
      const onSubmit = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 10)
          })
      )

      const { submit, loading } = useForm({
        onSubmit,
        initialValues: { name: 'John' },
      })

      const promise = submit()
      loadingStates.push(loading.value)

      await promise
      loadingStates.push(loading.value)

      expect(loadingStates[0]).toBe(true)
      expect(loadingStates[1]).toBe(false)
    })

    it('should show success toast after submission', async () => {
      const pushToastSpy = vi.spyOn(store, 'pushToast')
      const onSubmit = vi.fn().mockResolvedValue(undefined)

      const { submit } = useForm({
        onSubmit,
        initialValues: { name: 'John' },
      })

      await submit()

      expect(pushToastSpy).toHaveBeenCalledWith('Saved successfully', 'success')
    })

    it('should show validation error toast if validation fails', async () => {
      const pushToastSpy = vi.spyOn(store, 'pushToast')
      const onSubmit = vi.fn()

      const { form, submit } = useForm({
        onSubmit,
        initialValues: { name: '' },
      })

      form.name = ''

      await submit({
        name: [FormValidations.required()],
      })

      expect(pushToastSpy).toHaveBeenCalledWith('Please fix the errors above', 'warning')
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('should reset hasChanges after successful submission', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      const { setField, hasChanges, submit } = useForm({
        onSubmit,
        initialValues: { name: 'John' },
      })

      setField('name', 'Jane')
      expect(hasChanges.value).toBe(true)

      await submit()

      expect(hasChanges.value).toBe(false)
    })

    it('should handle submission errors', async () => {
      const error = new Error('Submission failed')
      const onSubmit = vi.fn().mockRejectedValue(error)

      const { submit } = useForm({
        onSubmit,
        initialValues: { name: 'John' },
      })

      await expect(submit()).rejects.toThrow('Submission failed')
    })

    it('should handle API validation errors', async () => {
      const apiError = new Error('Validation error')
      ;(apiError as any).response = {
        data: {
          errors: {
            email: 'Email already exists',
            phone: 'Invalid phone number',
          },
        },
      }

      const onSubmit = vi.fn().mockRejectedValue(apiError)

      const { submit, getFieldError } = useForm({
        onSubmit,
        initialValues: { email: '', phone: '' },
      })

      try {
        await submit()
      } catch (e) {
        // Error expected
      }

      expect(getFieldError('email')).toBe('Email already exists')
      expect(getFieldError('phone')).toBe('Invalid phone number')
    })
  })

  describe('Auto-save functionality', () => {
    it('should auto-save after delay', async () => {
      vi.useFakeTimers()
      const onSubmit = vi.fn().mockResolvedValue(undefined)

      const { setField } = useForm({
        onSubmit,
        initialValues: { name: '' },
        autoSave: true,
        autoSaveDelay: 3000,
      })

      setField('name', 'John')

      expect(onSubmit).not.toHaveBeenCalled()

      vi.advanceTimersByTime(3000)
      await vi.runAllTimersAsync()

      expect(onSubmit).toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should cancel auto-save if field changed again', async () => {
      vi.useFakeTimers()
      const onSubmit = vi.fn().mockResolvedValue(undefined)

      const { setField } = useForm({
        onSubmit,
        initialValues: { name: '' },
        autoSave: true,
        autoSaveDelay: 3000,
      })

      setField('name', 'John')
      vi.advanceTimersByTime(1500)

      setField('name', 'Jane')
      vi.advanceTimersByTime(1500)

      expect(onSubmit).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1500)
      await vi.runAllTimersAsync()

      expect(onSubmit).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })

    it('should not auto-save if disabled', async () => {
      vi.useFakeTimers()
      const onSubmit = vi.fn()

      const { setField } = useForm({
        onSubmit,
        initialValues: { name: '' },
        autoSave: false,
      })

      setField('name', 'John')
      vi.advanceTimersByTime(5000)

      expect(onSubmit).not.toHaveBeenCalled()

      vi.useRealTimers()
    })
  })

  describe('Touched state', () => {
    it('should track touched fields', () => {
      const onSubmit = vi.fn()
      const { setField, touched } = useForm({
        onSubmit,
        initialValues: { name: '', email: '' },
      })

      expect(touched.name).toBe(false)

      setField('name', 'John')

      expect(touched.name).toBe(true)
      expect(touched.email).toBe(false)
    })

    it('should check if field is touched', () => {
      const onSubmit = vi.fn()
      const { setField, isTouched } = useForm({
        onSubmit,
        initialValues: { name: '', email: '' },
      })

      setField('name', 'John')

      expect(isTouched('name')).toBe(true)
      expect(isTouched('email')).toBe(false)
    })

    it('should reset touched state on form reset', () => {
      const onSubmit = vi.fn()
      const { setField, reset, isTouched } = useForm({
        onSubmit,
        initialValues: { name: '' },
      })

      setField('name', 'John')
      expect(isTouched('name')).toBe(true)

      reset()

      expect(isTouched('name')).toBe(false)
    })
  })
})
