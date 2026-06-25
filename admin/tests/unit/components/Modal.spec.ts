import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Modal from '@/components/common/Modal.vue'

describe('Modal Component', () => {
  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
        },
        slots: {
          default: '<p>Modal Content</p>',
        },
      })

      expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Test Modal')
    })

    it('should not render modal when isOpen is false', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: false,
          title: 'Test Modal',
        },
      })

      expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    })

    it('should render modal title', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Confirm Delete',
        },
      })

      expect(wrapper.find('h2').text()).toBe('Confirm Delete')
    })

    it('should render modal content slot', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test',
        },
        slots: {
          default: 'Modal content here',
        },
      })

      expect(wrapper.text()).toContain('Modal content here')
    })
  })

  describe('Close button', () => {
    it('should show close button by default', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
        },
      })

      expect(wrapper.find('[aria-label="Close modal"]').exists()).toBe(true)
    })

    it('should hide close button when showCloseButton is false', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
          showCloseButton: false,
        },
      })

      expect(wrapper.find('[aria-label="Close modal"]').exists()).toBe(false)
    })

    it('should emit close event when close button clicked', async () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
        },
      })

      await wrapper.find('[aria-label="Close modal"]').trigger('click')

      expect(wrapper.emitted('close')).toHaveLength(1)
    })
  })

  describe('Backdrop click', () => {
    it('should emit close event on backdrop click by default', async () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
        },
      })

      await wrapper.find('[class*="fixed"]').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should not close on backdrop click when disabled', async () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
          closeOnBackdropClick: false,
        },
      })

      const backdrop = wrapper.find('[class*="fixed"]')
      await backdrop.trigger('click')

      expect(wrapper.emitted('close')).toBeUndefined()
    })

    it('should not close when clicking modal content', async () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
        },
        slots: {
          default: '<p>Content</p>',
        },
      })

      const dialog = wrapper.find('[role="dialog"]')
      await dialog.trigger('click')

      expect(wrapper.emitted('close')).toBeUndefined()
    })
  })

  describe('Keyboard navigation', () => {
    it('should emit close on ESC key', async () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
        },
      })

      await wrapper.find('[class*="fixed"]').trigger('keydown', {
        key: 'Escape',
      })

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should not close on ESC when disableEscapeClose is true', async () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
          disableEscapeClose: true,
        },
      })

      await wrapper.find('[class*="fixed"]').trigger('keydown', {
        key: 'Escape',
      })

      expect(wrapper.emitted('close')).toBeUndefined()
    })

    it('should ignore other keys', async () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
        },
      })

      await wrapper.find('[class*="fixed"]').trigger('keydown', {
        key: 'Enter',
      })

      expect(wrapper.emitted('close')).toBeUndefined()
    })
  })

  describe('Body scroll locking', () => {
    it('should lock body scroll when modal opens', async () => {
      // Initialize document.body.style.overflow
      document.body.style.overflow = ''

      const wrapper = mount(Modal, {
        props: {
          isOpen: false,
          title: 'Test Modal',
          lockBodyScroll: true,
        },
      })

      // Change isOpen to trigger the watch
      await wrapper.setProps({ isOpen: true })

      expect(document.body.style.overflow).toBe('hidden')

      // Cleanup
      document.body.style.overflow = ''
    })

    it('should unlock body scroll when modal closes', async () => {
      // Initialize document.body.style.overflow
      document.body.style.overflow = ''

      const wrapper = mount(Modal, {
        props: {
          isOpen: false,
          title: 'Test Modal',
          lockBodyScroll: true,
        },
      })

      // Change isOpen to trigger the watch
      await wrapper.setProps({ isOpen: true })

      expect(document.body.style.overflow).toBe('hidden')

      await wrapper.setProps({ isOpen: false })

      expect(document.body.style.overflow).toBe('')
    })

    it('should not lock scroll when lockBodyScroll is false', () => {
      const initialOverflow = document.body.style.overflow
      mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
          lockBodyScroll: false,
        },
      })

      expect(document.body.style.overflow).toBe(initialOverflow)
    })
  })

  describe('Sizes', () => {
    it('should apply small size classes', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Small Modal',
          size: 'sm',
        },
      })

      const dialog = wrapper.find('[role="dialog"]')
      expect(dialog.classes()).toContain('max-w-sm')
    })

    it('should apply medium size classes', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Medium Modal',
          size: 'md',
        },
      })

      const dialog = wrapper.find('[role="dialog"]')
      expect(dialog.classes()).toContain('max-w-lg')
    })

    it('should apply large size classes', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Large Modal',
          size: 'lg',
        },
      })

      const dialog = wrapper.find('[role="dialog"]')
      expect(dialog.classes()).toContain('max-w-2xl')
    })

    it('should default to medium size', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Default Modal',
        },
      })

      const dialog = wrapper.find('[role="dialog"]')
      expect(dialog.classes()).toContain('max-w-lg')
    })
  })

  describe('Actions slot', () => {
    it('should render actions footer when slot is provided', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Confirm',
        },
        slots: {
          actions: '<button>Cancel</button><button>Confirm</button>',
        },
      })

      expect(wrapper.find('footer').exists()).toBe(true)
      expect(wrapper.findAll('button').length).toBeGreaterThan(1)
    })

    it('should not render footer when no actions slot', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Info',
        },
        slots: {
          default: 'Content',
        },
      })

      expect(wrapper.find('footer').exists()).toBe(false)
    })
  })

  describe('Z-index', () => {
    it('should set custom z-index', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
          zIndex: 100,
        },
      })

      const backdrop = wrapper.find('[class*="fixed"]')
      expect(backdrop.attributes('style')).toContain('z-index')
    })

    it('should default to z-index 50', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
        },
      })

      const backdrop = wrapper.find('[class*="fixed"]')
      expect(backdrop.attributes('style')).toContain('50')
    })
  })

  describe('Accessibility', () => {
    it('should have dialog role', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
        },
      })

      expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    })

    it('should have aria-modal', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
        },
      })

      const dialog = wrapper.find('[role="dialog"]')
      expect(dialog.attributes('aria-modal')).toBe('true')
    })

    it('should have aria-labelledby pointing to title', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
        },
      })

      const dialog = wrapper.find('[role="dialog"]')
      const titleId = wrapper.find('h2').attributes('id')
      expect(dialog.attributes('aria-labelledby')).toBe(titleId)
    })

    it('should have aria-describedby when ariaDescription provided', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
          ariaDescription: 'Are you sure?',
        },
      })

      const dialog = wrapper.find('[role="dialog"]')
      expect(dialog.attributes('aria-describedby')).toBeTruthy()
    })

    it('should render ariaDescription in sr-only', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
          ariaDescription: 'Hidden description',
        },
      })

      const srOnly = wrapper.find('.sr-only')
      expect(srOnly.exists()).toBe(true)
      expect(srOnly.text()).toBe('Hidden description')
    })
  })

  describe('Transitions', () => {
    it('should use modal-fade transition', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
        },
      })

      // Check if transition component is present
      expect(wrapper.html()).toContain('modal-fade')
    })
  })

  describe('Header and footer', () => {
    it('should have header with border', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
        },
      })

      const header = wrapper.find('header')
      expect(header.classes().join(' ')).toContain('border')
    })

    it('should have footer with border when actions exist', () => {
      const wrapper = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Test Modal',
        },
        slots: {
          actions: '<button>Action</button>',
        },
      })

      const footer = wrapper.find('footer')
      expect(footer.classes().join(' ')).toContain('border')
    })
  })

  describe('Multiple modals', () => {
    it('should handle independent z-indexes', () => {
      const modal1 = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Modal 1',
          zIndex: 50,
        },
      })

      const modal2 = mount(Modal, {
        props: {
          isOpen: true,
          title: 'Modal 2',
          zIndex: 100,
        },
      })

      const z1 = modal1.find('[class*="fixed"]').attributes('style')
      const z2 = modal2.find('[class*="fixed"]').attributes('style')

      expect(z1).toContain('50')
      expect(z2).toContain('100')
    })
  })
})
