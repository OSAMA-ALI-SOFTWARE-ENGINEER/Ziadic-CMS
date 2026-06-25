import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Input from '@/components/common/Input.vue'

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      const wrapper = mount(Input)

      expect(wrapper.find('input').exists()).toBe(true)
    })

    it('should render label when provided', () => {
      const wrapper = mount(Input, {
        props: {
          label: 'Email Address',
        },
      })

      expect(wrapper.find('label').text()).toContain('Email Address')
    })

    it('should not render label when not provided', () => {
      const wrapper = mount(Input)

      expect(wrapper.find('label').exists()).toBe(false)
    })

    it('should have correct input type', () => {
      const wrapper = mount(Input, {
        props: {
          type: 'email',
        },
      })

      expect(wrapper.find('input').attributes('type')).toBe('email')
    })

    it('should have default text type', () => {
      const wrapper = mount(Input)

      expect(wrapper.find('input').attributes('type')).toBe('text')
    })
  })

  describe('Placeholder', () => {
    it('should render placeholder', () => {
      const wrapper = mount(Input, {
        props: {
          placeholder: 'Enter your email',
        },
      })

      expect(wrapper.find('input').attributes('placeholder')).toBe('Enter your email')
    })

    it('should not have placeholder by default', () => {
      const wrapper = mount(Input)

      expect(wrapper.find('input').attributes('placeholder')).toBeUndefined()
    })
  })

  describe('Value binding', () => {
    it('should display modelValue', () => {
      const wrapper = mount(Input, {
        props: {
          modelValue: 'test value',
        },
      })

      expect((wrapper.find('input').element as HTMLInputElement).value).toBe('test value')
    })

    it('should emit update:modelValue on input', async () => {
      const wrapper = mount(Input)
      const input = wrapper.find('input')

      await input.setValue('new value')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new value'])
    })

    it('should update model value immediately', async () => {
      const wrapper = mount(Input, {
        props: {
          modelValue: 'initial',
        },
      })

      const input = wrapper.find('input')
      await input.setValue('updated')

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['updated'])
    })
  })

  describe('Error states', () => {
    it('should display error message', () => {
      const wrapper = mount(Input, {
        props: {
          error: 'Email is required',
        },
      })

      expect(wrapper.text()).toContain('Email is required')
    })

    it('should show error icon', () => {
      const wrapper = mount(Input, {
        props: {
          error: 'Error message',
        },
      })

      const errorIcon = wrapper.find('.text-red-500')
      expect(errorIcon.exists()).toBe(true)
    })

    it('should set aria-invalid when error', () => {
      const wrapper = mount(Input, {
        props: {
          error: 'Error',
        },
      })

      expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
    })

    it('should not show error icon without error', () => {
      const wrapper = mount(Input, {
        props: {
          error: '',
        },
      })

      const errorElements = wrapper.findAll('[class*="red-500"]')
      expect(errorElements.length).toBe(0)
    })

    it('should apply error styling to input', () => {
      const wrapper = mount(Input, {
        props: {
          error: 'Required field',
        },
      })

      const input = wrapper.find('input')
      expect(input.classes().join(' ')).toContain('border-red')
    })

    it('should not apply error styling without error', () => {
      const wrapper = mount(Input)

      const input = wrapper.find('input')
      const classes = input.classes().join(' ')
      expect(classes).not.toContain('border-red')
    })
  })

  describe('Success state', () => {
    it('should show success icon when isSuccess is true', () => {
      const wrapper = mount(Input, {
        props: {
          isSuccess: true,
        },
      })

      const successIcon = wrapper.find('[class*="green-500"]')
      expect(successIcon.exists()).toBe(true)
    })

    it('should apply success styling to input', () => {
      const wrapper = mount(Input, {
        props: {
          isSuccess: true,
        },
      })

      const input = wrapper.find('input')
      expect(input.classes().join(' ')).toContain('border-green')
    })

    it('should not show success icon when error exists', () => {
      const wrapper = mount(Input, {
        props: {
          isSuccess: true,
          error: 'Error message',
        },
      })

      const successIcons = wrapper.findAll('[class*="green"]')
      expect(successIcons.length).toBe(0)
    })
  })

  describe('Helper text', () => {
    it('should display helper text', () => {
      const wrapper = mount(Input, {
        props: {
          helperText: 'This field is optional',
        },
      })

      expect(wrapper.text()).toContain('This field is optional')
    })

    it('should not display helper text without value', () => {
      const wrapper = mount(Input)

      const helperText = wrapper.find('[class*="muted"]')
      expect(helperText.exists()).toBe(false)
    })

    it('should not show helper text when error exists', () => {
      const wrapper = mount(Input, {
        props: {
          helperText: 'Helper text',
          error: 'Error',
        },
      })

      const helperElements = wrapper.findAll('[class*="muted"]')
      expect(helperElements.length).toBe(0)
    })
  })

  describe('Required field', () => {
    it('should show required indicator', () => {
      const wrapper = mount(Input, {
        props: {
          label: 'Name',
          required: true,
        },
      })

      expect(wrapper.text()).toContain('*')
    })

    it('should set required attribute on input', () => {
      const wrapper = mount(Input, {
        props: {
          required: true,
        },
      })

      expect(wrapper.find('input').attributes('required')).toBeDefined()
    })

    it('should not show required indicator when not required', () => {
      const wrapper = mount(Input, {
        props: {
          label: 'Optional Field',
          required: false,
        },
      })

      const asterisk = wrapper.find('[aria-label="required"]')
      expect(asterisk.exists()).toBe(false)
    })
  })

  describe('Disabled state', () => {
    it('should disable input when disabled prop is true', () => {
      const wrapper = mount(Input, {
        props: {
          disabled: true,
        },
      })

      expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    })

    it('should not be disabled by default', () => {
      const wrapper = mount(Input)

      expect(wrapper.find('input').attributes('disabled')).toBeUndefined()
    })
  })

  describe('Input types', () => {
    const types = ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date', 'time']

    types.forEach((type) => {
      it(`should support ${type} type`, () => {
        const wrapper = mount(Input, {
          props: {
            type: type as any,
          },
        })

        expect(wrapper.find('input').attributes('type')).toBe(type)
      })
    })
  })

  describe('Constraints', () => {
    it('should set maxlength attribute', () => {
      const wrapper = mount(Input, {
        props: {
          maxlength: 50,
        },
      })

      expect(wrapper.find('input').attributes('maxlength')).toBe('50')
    })

    it('should set minlength attribute', () => {
      const wrapper = mount(Input, {
        props: {
          minlength: 5,
        },
      })

      expect(wrapper.find('input').attributes('minlength')).toBe('5')
    })

    it('should set autocomplete attribute', () => {
      const wrapper = mount(Input, {
        props: {
          autocomplete: 'email',
        },
      })

      expect(wrapper.find('input').attributes('autocomplete')).toBe('email')
    })
  })

  describe('Events', () => {
    it('should emit blur event', async () => {
      const wrapper = mount(Input)

      await wrapper.find('input').trigger('blur')

      expect(wrapper.emitted('blur')).toBeTruthy()
    })

    it('should emit focus event', async () => {
      const wrapper = mount(Input)

      await wrapper.find('input').trigger('focus')

      expect(wrapper.emitted('focus')).toBeTruthy()
    })

    it('should emit update on input', async () => {
      const wrapper = mount(Input)

      await wrapper.find('input').setValue('test')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have unique ID for input', () => {
      const wrapper = mount(Input, {
        props: {
          id: 'email-input',
        },
      })

      expect(wrapper.find('input').attributes('id')).toBe('email-input')
    })

    it('should link label to input via id', () => {
      const wrapper = mount(Input, {
        props: {
          label: 'Email',
          id: 'email-field',
        },
      })

      expect(wrapper.find('label').attributes('for')).toBe('email-field')
    })

    it('should set aria-describedby when error exists', () => {
      const wrapper = mount(Input, {
        props: {
          id: 'test-input',
          error: 'Error message',
        },
      })

      const ariaDescribedBy = wrapper.find('input').attributes('aria-describedby')
      expect(ariaDescribedBy).toContain('test-input-error')
    })

    it('should set aria-describedby when helper text exists', () => {
      const wrapper = mount(Input, {
        props: {
          id: 'test-input',
          helperText: 'Helper text',
        },
      })

      const ariaDescribedBy = wrapper.find('input').attributes('aria-describedby')
      expect(ariaDescribedBy).toContain('test-input-helper')
    })

    it('should set aria-label when provided', () => {
      const wrapper = mount(Input, {
        props: {
          label: 'Email Address',
        },
      })

      expect(wrapper.find('input').attributes('aria-label')).toBe('Email Address')
    })
  })

  describe('Default props', () => {
    it('should have correct defaults', () => {
      const wrapper = mount(Input)

      expect(wrapper.props('type')).toBe('text')
      expect(wrapper.props('disabled')).toBe(false)
      expect(wrapper.props('required')).toBe(false)
      expect(wrapper.props('isSuccess')).toBe(false)
    })
  })
})
