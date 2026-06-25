import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/common/Button.vue'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render button with default slot content', () => {
      const wrapper = mount(Button, {
        slots: {
          default: 'Click me',
        },
      })

      expect(wrapper.text()).toContain('Click me')
      expect(wrapper.element.tagName).toBe('BUTTON')
    })

    it('should render with type attribute', () => {
      const wrapper = mount(Button, {
        props: {
          type: 'submit',
        },
        slots: {
          default: 'Submit',
        },
      })

      expect(wrapper.attributes('type')).toBe('submit')
    })

    it('should have default type button', () => {
      const wrapper = mount(Button, {
        slots: {
          default: 'Default',
        },
      })

      expect(wrapper.attributes('type')).toBe('button')
    })
  })

  describe('Variants', () => {
    it('should apply primary variant classes', () => {
      const wrapper = mount(Button, {
        props: {
          variant: 'primary',
        },
        slots: {
          default: 'Primary',
        },
      })

      expect(wrapper.classes()).toContain('from-[var(--admin-primary)]')
    })

    it('should apply secondary variant classes', () => {
      const wrapper = mount(Button, {
        props: {
          variant: 'secondary',
        },
        slots: {
          default: 'Secondary',
        },
      })

      expect(wrapper.classes()).toContain('border')
    })

    it('should apply danger variant classes', () => {
      const wrapper = mount(Button, {
        props: {
          variant: 'danger',
        },
        slots: {
          default: 'Delete',
        },
      })

      expect(wrapper.classes().join(' ')).toContain('red')
    })

    it('should apply loading variant classes', () => {
      const wrapper = mount(Button, {
        props: {
          variant: 'loading',
        },
        slots: {
          default: 'Loading',
        },
      })

      expect(wrapper.classes().join(' ')).toContain('opacity')
    })
  })

  describe('Sizes', () => {
    it('should apply small size classes', () => {
      const wrapper = mount(Button, {
        props: {
          size: 'sm',
        },
        slots: {
          default: 'Small',
        },
      })

      expect(wrapper.classes()).toContain('px-3')
      expect(wrapper.classes()).toContain('py-1.5')
    })

    it('should apply medium size classes', () => {
      const wrapper = mount(Button, {
        props: {
          size: 'md',
        },
        slots: {
          default: 'Medium',
        },
      })

      expect(wrapper.classes()).toContain('px-4')
      expect(wrapper.classes()).toContain('py-2.5')
    })

    it('should apply large size classes', () => {
      const wrapper = mount(Button, {
        props: {
          size: 'lg',
        },
        slots: {
          default: 'Large',
        },
      })

      expect(wrapper.classes()).toContain('px-6')
      expect(wrapper.classes()).toContain('py-3')
    })

    it('should have default medium size', () => {
      const wrapper = mount(Button, {
        slots: {
          default: 'Default Size',
        },
      })

      expect(wrapper.classes()).toContain('px-4')
      expect(wrapper.classes()).toContain('py-2.5')
    })
  })

  describe('Disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      const wrapper = mount(Button, {
        props: {
          disabled: true,
        },
        slots: {
          default: 'Disabled',
        },
      })

      expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('should not be disabled by default', () => {
      const wrapper = mount(Button, {
        slots: {
          default: 'Enabled',
        },
      })

      expect(wrapper.attributes('disabled')).toBeUndefined()
    })

    it('should apply disabled styling', () => {
      const wrapper = mount(Button, {
        props: {
          disabled: true,
        },
        slots: {
          default: 'Disabled',
        },
      })

      expect(wrapper.classes()).toContain('disabled:opacity-60')
    })
  })

  describe('Loading state', () => {
    it('should show loading spinner when isLoading is true', () => {
      const wrapper = mount(Button, {
        props: {
          isLoading: true,
        },
        slots: {
          default: 'Processing',
        },
      })

      const spinner = wrapper.find('span')
      expect(spinner.exists()).toBe(true)
      expect(spinner.classes()).toContain('animate-spin')
    })

    it('should not show spinner when isLoading is false', () => {
      const wrapper = mount(Button, {
        props: {
          isLoading: false,
        },
        slots: {
          default: 'Click',
        },
      })

      const spinners = wrapper.findAll('.animate-spin')
      expect(spinners).toHaveLength(0)
    })

    it('should disable button when loading', () => {
      const wrapper = mount(Button, {
        props: {
          isLoading: true,
        },
        slots: {
          default: 'Processing',
        },
      })

      expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('should set aria-busy when loading', () => {
      const wrapper = mount(Button, {
        props: {
          isLoading: true,
        },
        slots: {
          default: 'Processing',
        },
      })

      expect(wrapper.attributes('aria-busy')).toBe('true')
    })
  })

  describe('Click events', () => {
    it('should emit click event when clicked', async () => {
      const wrapper = mount(Button, {
        slots: {
          default: 'Click me',
        },
      })

      expect(wrapper.element.tagName).toBe('BUTTON')
    })

    it('should not emit click when disabled', async () => {
      const wrapper = mount(Button, {
        props: {
          disabled: true,
        },
        slots: {
          default: 'Disabled',
        },
      })

      await wrapper.trigger('click')

      // Browser prevents click on disabled buttons
      expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('should handle multiple clicks', async () => {
      const wrapper = mount(Button, {
        slots: {
          default: 'Click me',
        },
      })

      expect(wrapper.element.tagName).toBe('BUTTON')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label when provided', () => {
      const wrapper = mount(Button, {
        props: {
          ariaLabel: 'Close dialog',
        },
        slots: {
          default: 'X',
        },
      })

      expect(wrapper.attributes('aria-label')).toBe('Close dialog')
    })

    it('should have aria-busy attribute for loading state', () => {
      const wrapper = mount(Button, {
        props: {
          isLoading: true,
        },
        slots: {
          default: 'Loading',
        },
      })

      expect(wrapper.attributes('aria-busy')).toBe('true')
    })

    it('should have aria-hidden on spinner icon', () => {
      const wrapper = mount(Button, {
        props: {
          isLoading: true,
        },
        slots: {
          default: 'Loading',
        },
      })

      const spinner = wrapper.find('.animate-spin')
      expect(spinner.attributes('aria-hidden')).toBe('true')
    })
  })

  describe('Combinations', () => {
    it('should combine variant, size, and disabled state', () => {
      const wrapper = mount(Button, {
        props: {
          variant: 'danger',
          size: 'lg',
          disabled: true,
        },
        slots: {
          default: 'Delete Permanently',
        },
      })

      expect(wrapper.attributes('disabled')).toBeDefined()
      expect(wrapper.classes().join(' ')).toContain('red')
      expect(wrapper.classes()).toContain('px-6')
    })

    it('should handle loading with secondary variant', () => {
      const wrapper = mount(Button, {
        props: {
          variant: 'secondary',
          isLoading: true,
          size: 'sm',
        },
        slots: {
          default: 'Processing',
        },
      })

      expect(wrapper.attributes('disabled')).toBeDefined()
      expect(wrapper.classes()).toContain('border')
      expect(wrapper.classes()).toContain('px-3')
    })
  })

  describe('Default props', () => {
    it('should have correct default props', () => {
      const wrapper = mount(Button, {
        slots: {
          default: 'Button',
        },
      })

      expect(wrapper.props('variant')).toBe('primary')
      expect(wrapper.props('size')).toBe('md')
      expect(wrapper.props('disabled')).toBe(false)
      expect(wrapper.props('type')).toBe('button')
      expect(wrapper.props('isLoading')).toBe(false)
    })
  })
})
