import { describe, it, expect } from 'vitest'
import { FormValidations } from '@/composables/useForm'

describe('FormValidations', () => {
  describe('required validation', () => {
    it('should pass for non-empty string', () => {
      const rule = FormValidations.required()
      expect(rule('John')).toBe(true)
    })

    it('should fail for empty string', () => {
      const rule = FormValidations.required()
      expect(rule('')).not.toBe(true)
    })

    it('should fail for null', () => {
      const rule = FormValidations.required()
      expect(rule(null)).not.toBe(true)
    })

    it('should fail for undefined', () => {
      const rule = FormValidations.required()
      expect(rule(undefined)).not.toBe(true)
    })

    it('should fail for whitespace-only string', () => {
      const rule = FormValidations.required()
      expect(rule('   ')).not.toBe(true)
    })

    it('should pass for non-empty value', () => {
      const rule = FormValidations.required()
      expect(rule('value')).toBe(true)
    })

    it('should return custom message', () => {
      const rule = FormValidations.required('Custom error message')
      const result = rule('')
      expect(result).toBe('Custom error message')
    })

    it('should return default message', () => {
      const rule = FormValidations.required()
      const result = rule('')
      expect(result).toBe('This field is required')
    })
  })

  describe('minLength validation', () => {
    it('should pass for string with sufficient length', () => {
      const rule = FormValidations.minLength(3)
      expect(rule('John')).toBe(true)
    })

    it('should pass for string with exact minimum length', () => {
      const rule = FormValidations.minLength(4)
      expect(rule('John')).toBe(true)
    })

    it('should fail for string below minimum length', () => {
      const rule = FormValidations.minLength(5)
      expect(rule('John')).not.toBe(true)
    })

    it('should fail for empty string', () => {
      const rule = FormValidations.minLength(1)
      expect(rule('')).not.toBe(true)
    })

    it('should return custom message', () => {
      const rule = FormValidations.minLength(5, 'At least 5 characters')
      const result = rule('Hi')
      expect(result).toBe('At least 5 characters')
    })

    it('should return default message', () => {
      const rule = FormValidations.minLength(5)
      const result = rule('Hi')
      expect(result).toBe('Minimum 5 characters required')
    })
  })

  describe('maxLength validation', () => {
    it('should pass for string below maximum length', () => {
      const rule = FormValidations.maxLength(5)
      expect(rule('John')).toBe(true)
    })

    it('should pass for string with exact maximum length', () => {
      const rule = FormValidations.maxLength(4)
      expect(rule('John')).toBe(true)
    })

    it('should fail for string exceeding maximum length', () => {
      const rule = FormValidations.maxLength(3)
      expect(rule('John')).not.toBe(true)
    })

    it('should pass for empty string', () => {
      const rule = FormValidations.maxLength(5)
      expect(rule('')).toBe(true)
    })

    it('should return custom message', () => {
      const rule = FormValidations.maxLength(3, 'No more than 3 characters')
      const result = rule('John')
      expect(result).toBe('No more than 3 characters')
    })

    it('should return default message', () => {
      const rule = FormValidations.maxLength(3)
      const result = rule('John')
      expect(result).toBe('Maximum 3 characters allowed')
    })
  })

  describe('email validation', () => {
    it('should pass for valid email', () => {
      const rule = FormValidations.email()
      expect(rule('john@example.com')).toBe(true)
    })

    it('should pass for email with subdomain', () => {
      const rule = FormValidations.email()
      expect(rule('john@mail.example.com')).toBe(true)
    })

    it('should fail for invalid email', () => {
      const rule = FormValidations.email()
      expect(rule('invalid-email')).not.toBe(true)
    })

    it('should fail for email without @', () => {
      const rule = FormValidations.email()
      expect(rule('johnexample.com')).not.toBe(true)
    })

    it('should fail for email without domain', () => {
      const rule = FormValidations.email()
      expect(rule('john@')).not.toBe(true)
    })

    it('should fail for email with spaces', () => {
      const rule = FormValidations.email()
      expect(rule('john @example.com')).not.toBe(true)
    })

    it('should return custom message', () => {
      const rule = FormValidations.email('Please enter a valid email')
      const result = rule('invalid')
      expect(result).toBe('Please enter a valid email')
    })

    it('should return default message', () => {
      const rule = FormValidations.email()
      const result = rule('invalid')
      expect(result).toBe('Invalid email address')
    })
  })

  describe('pattern validation', () => {
    it('should pass for matching pattern', () => {
      const rule = FormValidations.pattern(/^\d{3}-\d{3}-\d{4}$/)
      expect(rule('123-456-7890')).toBe(true)
    })

    it('should fail for non-matching pattern', () => {
      const rule = FormValidations.pattern(/^\d{3}-\d{3}-\d{4}$/)
      expect(rule('123456-7890')).not.toBe(true)
    })

    it('should work with regex flags', () => {
      const rule = FormValidations.pattern(/^hello$/i)
      expect(rule('HELLO')).toBe(true)
      expect(rule('hello')).toBe(true)
      expect(rule('goodbye')).not.toBe(true)
    })

    it('should return custom message', () => {
      const rule = FormValidations.pattern(/^\d+$/, 'Only numbers allowed')
      const result = rule('abc')
      expect(result).toBe('Only numbers allowed')
    })

    it('should return default message', () => {
      const rule = FormValidations.pattern(/^\d+$/)
      const result = rule('abc')
      expect(result).toBe('Invalid format')
    })
  })

  describe('min validation', () => {
    it('should pass for number above minimum', () => {
      const rule = FormValidations.min(5)
      expect(rule(10)).toBe(true)
    })

    it('should pass for number equal to minimum', () => {
      const rule = FormValidations.min(5)
      expect(rule(5)).toBe(true)
    })

    it('should fail for number below minimum', () => {
      const rule = FormValidations.min(5)
      expect(rule(3)).not.toBe(true)
    })

    it('should return custom message', () => {
      const rule = FormValidations.min(5, 'Minimum value is 5')
      const result = rule(3)
      expect(result).toBe('Minimum value is 5')
    })

    it('should return default message', () => {
      const rule = FormValidations.min(5)
      const result = rule(3)
      expect(result).toBe('Must be at least 5')
    })
  })

  describe('max validation', () => {
    it('should pass for number below maximum', () => {
      const rule = FormValidations.max(10)
      expect(rule(5)).toBe(true)
    })

    it('should pass for number equal to maximum', () => {
      const rule = FormValidations.max(10)
      expect(rule(10)).toBe(true)
    })

    it('should fail for number above maximum', () => {
      const rule = FormValidations.max(10)
      expect(rule(15)).not.toBe(true)
    })

    it('should return custom message', () => {
      const rule = FormValidations.max(10, 'Maximum value is 10')
      const result = rule(15)
      expect(result).toBe('Maximum value is 10')
    })

    it('should return default message', () => {
      const rule = FormValidations.max(10)
      const result = rule(15)
      expect(result).toBe('Must be at most 10')
    })
  })

  describe('match validation', () => {
    it('should pass when values match', () => {
      const rule = FormValidations.match('password123')
      expect(rule('password123')).toBe(true)
    })

    it('should fail when values do not match', () => {
      const rule = FormValidations.match('password123')
      expect(rule('different')).not.toBe(true)
    })

    it('should work with objects', () => {
      const obj = { id: 1 }
      const rule = FormValidations.match(obj)
      expect(rule(obj)).toBe(true)
    })

    it('should return custom message', () => {
      const rule = FormValidations.match('password123', 'Passwords do not match')
      const result = rule('different')
      expect(result).toBe('Passwords do not match')
    })

    it('should return default message', () => {
      const rule = FormValidations.match('password123')
      const result = rule('different')
      expect(result).toBe('Fields do not match')
    })
  })

  describe('Combined validations', () => {
    it('should chain multiple rules', () => {
      const rules = [
        FormValidations.required(),
        FormValidations.minLength(5),
        FormValidations.maxLength(20),
      ]

      expect(rules[0]('test')).toBe(true)
      expect(rules[1]('test')).not.toBe(true)
      expect(rules[2]('test')).toBe(true)
    })

    it('should validate email with required', () => {
      const rules = [
        FormValidations.required(),
        FormValidations.email(),
      ]

      const value = 'john@example.com'
      let isValid = true

      for (const rule of rules) {
        const result = rule(value)
        if (result !== true) {
          isValid = false
          break
        }
      }

      expect(isValid).toBe(true)
    })

    it('should fail on first invalid rule', () => {
      const rules = [
        FormValidations.required(),
        FormValidations.minLength(10),
        FormValidations.email(),
      ]

      const value = 'short'
      let firstError: string = ''

      for (const rule of rules) {
        const result = rule(value)
        if (result !== true) {
          firstError = result
          break
        }
      }

      expect(firstError).toBe('Minimum 10 characters required')
    })
  })

  describe('Edge cases', () => {
    it('should handle zero value', () => {
      const minRule = FormValidations.min(0)
      const maxRule = FormValidations.max(10)

      expect(minRule(0)).toBe(true)
      expect(maxRule(0)).toBe(true)
    })

    it('should handle negative numbers', () => {
      const minRule = FormValidations.min(-10)
      const maxRule = FormValidations.max(-5)

      expect(minRule(-5)).toBe(true)
      expect(maxRule(-10)).toBe(true)
    })

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(1000)
      const rule = FormValidations.maxLength(500)

      expect(rule(longString)).not.toBe(true)
    })

    it('should handle special characters in email', () => {
      const rule = FormValidations.email()
      expect(rule('test+tag@example.com')).toBe(true)
    })

    it('should handle null/undefined in match', () => {
      const rule = FormValidations.match(null)
      expect(rule(null)).toBe(true)
      expect(rule(undefined)).not.toBe(true)
    })
  })
})
