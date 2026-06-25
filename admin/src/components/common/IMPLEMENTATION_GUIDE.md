# Common Components - Implementation Guide

## Overview

This guide explains how to use the foundation components library in your application and how to refactor existing code to use them.

## Quick Start

### 1. Install/Setup (Already Done)
The components are already created and ready to use:
- `Button.vue` - Versatile button component
- `Input.vue` - Text input with validation
- `Card.vue` - Card container
- `Modal.vue` - Modal dialog
- `Alert.vue` - Alert notifications

### 2. Basic Import

```typescript
// In any component
import { Button, Input, Card, Modal, Alert } from '@/components/common'

// Or individual imports
import Button from '@/components/common/Button.vue'
import { ButtonVariant, ButtonSize } from '@/components/common'
```

### 3. Usage Examples

#### Button in a Page
```vue
<script setup lang="ts">
import { Button } from '@/components/common'
import { ref } from 'vue'

const isLoading = ref(false)

const handleClick = async () => {
  isLoading.value = true
  // Do something
  isLoading.value = false
}
</script>

<template>
  <Button @click="handleClick" :isLoading="isLoading">
    {{ isLoading ? 'Processing...' : 'Click Me' }}
  </Button>
</template>
```

#### Form with Input and Validation
```vue
<script setup lang="ts">
import { Input, Button } from '@/components/common'
import { ref } from 'vue'

const email = ref('')
const error = ref('')

const validateEmail = (value: string) => {
  if (!value) {
    error.value = 'Email is required'
  } else if (!value.includes('@')) {
    error.value = 'Invalid email format'
  } else {
    error.value = ''
  }
}

const handleEmailChange = (value: string) => {
  email.value = value
  validateEmail(value)
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <Input
      label="Email"
      type="email"
      :modelValue="email"
      @update:modelValue="handleEmailChange"
      :error="error"
      helper-text="We'll never share your email"
    />
    <Button type="submit" class="mt-4">Submit</Button>
  </form>
</template>
```

#### Card Layout
```vue
<script setup lang="ts">
import { Card, Button } from '@/components/common'
</script>

<template>
  <Card title="User Information">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-semibold">Name</label>
        <p>John Doe</p>
      </div>
      <div>
        <label class="block text-sm font-semibold">Email</label>
        <p>john@example.com</p>
      </div>
    </div>
    <template #footer>
      <Button variant="secondary" size="sm">Edit</Button>
      <Button size="sm">Save</Button>
    </template>
  </Card>
</template>
```

#### Modal Dialog
```vue
<script setup lang="ts">
import { Modal, Button, Input } from '@/components/common'
import { ref } from 'vue'

const isOpen = ref(false)
const formData = ref({ name: '' })

const handleClose = () => {
  isOpen.value = false
}

const handleSave = () => {
  // Save logic here
  handleClose()
}
</script>

<template>
  <Button @click="isOpen = true">Open Form</Button>

  <Modal 
    title="User Form" 
    :isOpen="isOpen" 
    @close="handleClose"
    size="md"
  >
    <Input
      label="Name"
      v-model="formData.name"
      placeholder="Enter name"
    />

    <template #actions>
      <Button variant="secondary" @click="handleClose">Cancel</Button>
      <Button @click="handleSave">Save</Button>
    </template>
  </Modal>
</template>
```

#### Alert Notifications
```vue
<script setup lang="ts">
import { Alert, Button } from '@/components/common'
import { ref } from 'vue'

const showSuccess = ref(false)

const handleSuccess = () => {
  showSuccess.value = true
  // Auto-dismiss after 4 seconds
}
</script>

<template>
  <Button @click="handleSuccess">Trigger Success</Button>

  <Alert
    v-if="showSuccess"
    type="success"
    title="Success!"
    message="Operation completed successfully"
    :autoDismiss="true"
    @dismiss="showSuccess = false"
  />
</template>
```

---

## Refactoring Existing Pages

### Before: Using inline HTML
```vue
<!-- OLD WAY -->
<button 
  class="bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-primary-strong)] text-white shadow-lg hover:shadow-xl px-4 py-2.5 text-sm rounded-lg font-semibold"
  @click="handleClick"
>
  Click me
</button>
```

### After: Using Button component
```vue
<!-- NEW WAY -->
<Button @click="handleClick">Click me</Button>
```

### Before: Using custom input styling
```vue
<!-- OLD WAY -->
<div class="flex flex-col gap-1.5">
  <label class="text-sm font-semibold">Email</label>
  <input
    type="email"
    class="cms-input block w-full px-3 py-2.5"
    v-model="email"
    placeholder="Enter email"
  />
  <p v-if="error" class="text-xs font-medium text-red-500">{{ error }}</p>
</div>
```

### After: Using Input component
```vue
<!-- NEW WAY -->
<Input
  label="Email"
  type="email"
  v-model="email"
  :error="error"
  placeholder="Enter email"
/>
```

---

## Integration Patterns

### Pattern 1: Form with Validation
```typescript
// composables/useForm.ts
import { ref, computed } from 'vue'
import type { ValidationError, FormState } from '@/components/common/types'

export function useForm(initialState: FormState) {
  const formData = ref({ ...initialState })
  const errors = ref<Record<string, string>>({})

  const isValid = computed(() => {
    return Object.values(errors.value).every(error => !error)
  })

  const setError = (field: string, message: string) => {
    errors.value[field] = message
  }

  const clearError = (field: string) => {
    errors.value[field] = ''
  }

  const validate = () => {
    // Your validation logic
  }

  return {
    formData,
    errors,
    isValid,
    setError,
    clearError,
    validate,
  }
}

// Usage in component
<script setup lang="ts">
import { useForm } from '@/composables/useForm'
import { Input, Button } from '@/components/common'

const { formData, errors, isValid, validate } = useForm({
  email: '',
  password: '',
})

const handleSubmit = async () => {
  if (validate()) {
    // Submit form
  }
}
</script>
```

### Pattern 2: Confirmation Dialog
```typescript
// composables/useConfirmDialog.ts
import { ref } from 'vue'

export function useConfirmDialog() {
  const isOpen = ref(false)
  const message = ref('')
  const onConfirm = ref<(() => void) | null>(null)

  const open = (msg: string, callback: () => void) => {
    message.value = msg
    onConfirm.value = callback
    isOpen.value = true
  }

  const confirm = () => {
    if (onConfirm.value) {
      onConfirm.value()
    }
    isOpen.value = false
  }

  const cancel = () => {
    isOpen.value = false
  }

  return {
    isOpen,
    message,
    open,
    confirm,
    cancel,
  }
}

// Usage in component
<script setup lang="ts">
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { Modal, Button } from '@/components/common'

const { isOpen, message, open, confirm, cancel } = useConfirmDialog()

const handleDelete = (item: any) => {
  open(`Delete "${item.name}"?`, () => {
    // Perform deletion
  })
}
</script>

<template>
  <Modal :isOpen="isOpen" title="Confirm Action" @close="cancel" size="sm">
    <p>{{ message }}</p>
    <template #actions>
      <Button variant="secondary" @click="cancel">Cancel</Button>
      <Button variant="danger" @click="confirm">Delete</Button>
    </template>
  </Modal>
</template>
```

### Pattern 3: Notification System
```typescript
// composables/useNotification.ts
import { ref } from 'vue'
import type { AlertType } from '@/components/common/types'

interface Notification {
  id: string
  type: AlertType
  title?: string
  message: string
  duration?: number
}

const notifications = ref<Notification[]>([])

export function useNotification() {
  const add = (type: AlertType, message: string, title?: string, duration = 4000) => {
    const id = Math.random().toString(36).slice(2)
    notifications.value.push({
      id,
      type,
      title,
      message,
      duration,
    })

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }
  }

  const remove = (id: string) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  const success = (message: string, title = 'Success') => add('success', message, title)
  const error = (message: string, title = 'Error') => add('error', message, title)
  const warning = (message: string, title = 'Warning') => add('warning', message, title)
  const info = (message: string, title = 'Info') => add('info', message, title)

  return {
    notifications,
    add,
    remove,
    success,
    error,
    warning,
    info,
  }
}

// Usage in component
<script setup lang="ts">
import { useNotification } from '@/composables/useNotification'
import { Alert } from '@/components/common'

const { notifications, success, error } = useNotification()

const handleSave = async () => {
  try {
    await saveData()
    success('Changes saved successfully')
  } catch (err) {
    error('Failed to save changes')
  }
}
</script>

<template>
  <div class="space-y-2">
    <Alert
      v-for="notif in notifications"
      :key="notif.id"
      :type="notif.type"
      :title="notif.title"
      :message="notif.message"
      @dismiss="remove(notif.id)"
    />
  </div>
</template>
```

---

## Accessibility Checklist

When using these components, ensure:

- [ ] Buttons have descriptive labels or `ariaLabel`
- [ ] Input fields have associated labels
- [ ] Error messages are properly announced
- [ ] Forms have proper `for` attributes on labels
- [ ] Modals have proper `aria-modal` and role
- [ ] Alerts use proper `role="alert"` or `role="status"`
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Color is not the only indicator of state
- [ ] Focus indicators are visible
- [ ] All interactive elements are reachable

---

## Performance Considerations

### Component Lazy Loading
```typescript
// For large component pages
const Button = defineAsyncComponent(() => 
  import('@/components/common/Button.vue')
)
```

### Avoid Unnecessary Re-renders
```vue
<!-- Bad: Creates new ref on every render -->
<script setup>
const items = ref(Array(1000).fill(null))
</script>

<!-- Good: Computed with memoization -->
<script setup>
const items = computed(() => 
  Array(1000).fill(null)
)
</script>
```

---

## Testing Components

### Unit Test Example
```typescript
// Button.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/common/Button.vue'

describe('Button Component', () => {
  it('renders with default variant', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' }
    })
    expect(wrapper.text()).toContain('Click me')
  })

  it('emits click event', async () => {
    const wrapper = mount(Button)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('shows loading spinner when isLoading=true', () => {
    const wrapper = mount(Button, {
      props: { isLoading: true }
    })
    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true)
  })
})
```

---

## Migration Checklist

When refactoring an existing page:

- [ ] Replace inline button styles with `<Button>` component
- [ ] Replace inline input styles with `<Input>` component
- [ ] Wrap sections with `<Card>` component
- [ ] Move confirmation dialogs to `<Modal>`
- [ ] Move notifications to `<Alert>`
- [ ] Update form validation logic
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Verify responsive design
- [ ] Test on mobile devices

---

## Troubleshooting

### Components not importing?
- Check path is correct: `@/components/common`
- Ensure TypeScript is configured with path alias

### Styles not applying?
- Verify Tailwind CSS is loaded
- Check CSS custom properties in style.css
- Ensure `admin-dark` class is applied for dark mode

### Accessibility issues?
- Use the ARIA Inspector extension
- Test with keyboard only (no mouse)
- Test with screen reader (NVDA, JAWS)

---

## Next Steps

1. **Start small**: Use Button and Input in one page
2. **Expand gradually**: Add Card, Modal, Alert
3. **Create composables**: Build useForm, useConfirmDialog
4. **Refactor pages**: Replace inline styles with components
5. **Document patterns**: Create examples for team
6. **Establish standards**: Define when/how to use each component

---

## Resources

- Component documentation: See `README.md`
- Usage examples: See `USAGE_EXAMPLES.vue`
- Type definitions: See `types.ts`
- Style guide: Check `admin/src/style.css`
