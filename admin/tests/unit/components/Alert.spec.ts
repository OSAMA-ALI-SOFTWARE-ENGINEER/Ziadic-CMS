import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Alert from '@/components/common/Alert.vue'

describe('Alert Component', () => {
  describe('Rendering', () => {
    it('should render alert when visible is true', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          message: 'Success!',
          visible: true,
        },
      })

      expect(wrapper.find('[role="status"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Success!')
    })

    it('should not render alert when visible is false', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          visible: false,
        },
      })

      expect(wrapper.find('[role="status"]').exists()).toBe(false)
    })

    it('should render message', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'info',
          message: 'Information message',
        },
      })

      expect(wrapper.text()).toContain('Information message')
    })

    it('should render title when provided', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          title: 'Success',
          message: 'Operation completed',
        },
      })

      expect(wrapper.text()).toContain('Success')
      expect(wrapper.text()).toContain('Operation completed')
    })
  })

  describe('Alert types', () => {
    it('should render success alert with correct styles', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          message: 'Done!',
        },
      })

      const alert = wrapper.find('[role="status"]')
      expect(alert.classes().join(' ')).toContain('green')
    })

    it('should render error alert with alert role', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'error',
          message: 'Error occurred',
        },
      })

      const alert = wrapper.find('[role="alert"]')
      expect(alert.exists()).toBe(true)
      expect(alert.classes().join(' ')).toContain('red')
    })

    it('should render warning alert', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'warning',
          message: 'Warning',
        },
      })

      const alert = wrapper.find('[role="status"]')
      expect(alert.classes().join(' ')).toContain('yellow')
    })

    it('should render info alert', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'info',
          message: 'Info',
        },
      })

      const alert = wrapper.find('[role="status"]')
      expect(alert.classes().join(' ')).toContain('blue')
    })
  })

  describe('Icons', () => {
    it('should show default icon for type', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          message: 'Success',
        },
      })

      expect(wrapper.html()).toContain('pi pi-check-circle')
    })

    it('should show custom icon when provided', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          message: 'Custom icon',
          icon: 'pi pi-star',
        },
      })

      expect(wrapper.html()).toContain('pi pi-star')
    })

    it('should hide icon when aria-hidden', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'info',
          message: 'Info',
        },
      })

      const icon = wrapper.find('i')
      expect(icon.attributes('aria-hidden')).toBe('true')
    })
  })

  describe('Dismiss button', () => {
    it('should show dismiss button by default', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          message: 'Message',
        },
      })

      expect(wrapper.find('[aria-label*="Dismiss"]').exists()).toBe(true)
    })

    it('should hide dismiss button when dismissible is false', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          message: 'Message',
          dismissible: false,
        },
      })

      expect(wrapper.find('[aria-label*="Dismiss"]').exists()).toBe(false)
    })

    it('should emit dismiss event when button clicked', async () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          message: 'Message',
        },
      })

      await wrapper.find('[aria-label*="Dismiss"]').trigger('click')

      expect(wrapper.emitted('dismiss')).toHaveLength(1)
    })

    it('should hide alert after dismiss', async () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          message: 'Message',
        },
      })

      expect(wrapper.find('[role="status"]').exists()).toBe(true)

      await wrapper.find('[aria-label*="Dismiss"]').trigger('click')

      await wrapper.vm.$nextTick()

      // Alert should be hidden after dismiss
      expect(wrapper.vm.isVisible).toBe(false)
    })
  })

  describe('Auto-dismiss', () => {
    it('should auto-dismiss after delay', async () => {
      vi.useFakeTimers()

      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          message: 'Message',
          autoDismiss: true,
          autoDismissMs: 3000,
        },
      })

      expect(wrapper.vm.isVisible).toBe(true)

      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isVisible).toBe(false)

      vi.useRealTimers()
    })

    it('should not auto-dismiss when disabled', async () => {
      vi.useFakeTimers()

      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          message: 'Message',
          autoDismiss: false,
        },
      })

      vi.advanceTimersByTime(5000)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isVisible).toBe(true)

      vi.useRealTimers()
    })

    it('should respect custom autoDismissMs', async () => {
      vi.useFakeTimers()

      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          message: 'Message',
          autoDismiss: true,
          autoDismissMs: 5000,
        },
      })

      vi.advanceTimersByTime(4000)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isVisible).toBe(true)

      vi.advanceTimersByTime(1000)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isVisible).toBe(false)

      vi.useRealTimers()
    })

    it('should clear auto-dismiss timer on manual dismiss', async () => {
      vi.useFakeTimers()

      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          message: 'Message',
          autoDismiss: true,
          autoDismissMs: 3000,
        },
      })

      await wrapper.find('[aria-label*="Dismiss"]').trigger('click')
      vi.advanceTimersByTime(3000)

      expect(wrapper.vm.isVisible).toBe(false)

      vi.useRealTimers()
    })
  })

  describe('Visibility prop', () => {
    it('should update visibility when prop changes', async () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          message: 'Message',
          visible: true,
        },
      })

      expect(wrapper.vm.isVisible).toBe(true)

      await wrapper.setProps({ visible: false })

      expect(wrapper.vm.isVisible).toBe(false)
    })

    it('should default to visible', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'success',
        },
      })

      expect(wrapper.vm.isVisible).toBe(true)
    })
  })

  describe('Content slot', () => {
    it('should render default slot content', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'success',
        },
        slots: {
          default: '<strong>Important:</strong> Read this!',
        },
      })

      expect(wrapper.text()).toContain('Important:')
      expect(wrapper.text()).toContain('Read this!')
    })

    it('should not render slot when no content', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          message: 'Message',
        },
      })

      expect(wrapper.text()).toContain('Message')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-live for status role', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          message: 'Message',
        },
      })

      const alert = wrapper.find('[role="status"]')
      expect(alert.attributes('aria-live')).toBe('polite')
    })

    it('should have aria-live assertive for error role', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'error',
          message: 'Error',
        },
      })

      const alert = wrapper.find('[role="alert"]')
      expect(alert.attributes('aria-live')).toBe('assertive')
    })

    it('should have aria-atomic', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'info',
          message: 'Info',
        },
      })

      const alert = wrapper.find('[role="status"]')
      expect(alert.attributes('aria-atomic')).toBe('true')
    })

    it('should have aria-label when provided', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          message: 'Message',
          ariaLabel: 'Custom label',
        },
      })

      const alert = wrapper.find('[role="status"]')
      expect(alert.attributes('aria-label')).toBe('Custom label')
    })
  })

  describe('Transitions', () => {
    it('should use alert-fade transition', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'success',
          message: 'Message',
        },
      })

      expect(wrapper.html()).toContain('alert-fade')
    })
  })

  describe('Multiple alerts', () => {
    it('should handle independent auto-dismiss timers', async () => {
      vi.useFakeTimers()

      const alert1 = mount(Alert, {
        props: {
          type: 'success',
          message: 'Alert 1',
          autoDismiss: true,
          autoDismissMs: 2000,
        },
      })

      const alert2 = mount(Alert, {
        props: {
          type: 'error',
          message: 'Alert 2',
          autoDismiss: true,
          autoDismissMs: 4000,
        },
      })

      vi.advanceTimersByTime(2000)
      await alert1.vm.$nextTick()
      expect(alert1.vm.isVisible).toBe(false)
      expect(alert2.vm.isVisible).toBe(true)

      vi.advanceTimersByTime(2000)
      await alert2.vm.$nextTick()
      expect(alert2.vm.isVisible).toBe(false)

      vi.useRealTimers()
    })
  })

  describe('Color variants', () => {
    it('should apply correct colors for each type', () => {
      const types = ['success', 'error', 'warning', 'info'] as const

      types.forEach((type) => {
        const wrapper = mount(Alert, {
          props: {
            type,
            message: 'Message',
          },
        })

        const alert = wrapper.find('[role]')
        const classes = alert.classes().join(' ')

        expect(classes).toContain(
          type === 'error' ? 'red' : type === 'warning' ? 'yellow' : type === 'success' ? 'green' : 'blue'
        )
      })
    })
  })

  describe('Default props', () => {
    it('should have correct defaults', () => {
      const wrapper = mount(Alert, {
        props: {
          type: 'success',
        },
      })

      expect(wrapper.props('dismissible')).toBe(true)
      expect(wrapper.props('autoDismiss')).toBe(false)
      expect(wrapper.props('autoDismissMs')).toBe(4000)
      expect(wrapper.props('visible')).toBe(true)
    })
  })
})
