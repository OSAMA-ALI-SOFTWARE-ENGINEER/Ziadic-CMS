# Common Components - Quick Start Guide

## 30-Second Setup

### Import
```typescript
import { Button, Input, Card, Modal, Alert } from '@/components/common'
```

### Use in Template
```vue
<script setup>
import { Button, Input, Modal } from '@/components/common'
import { ref } from 'vue'

const email = ref('')
const showModal = ref(false)
</script>

<template>
  <div class="space-y-4">
    <!-- Input with validation -->
    <Input 
      label="Email" 
      type="email" 
      v-model="email"
      placeholder="your@email.com"
    />

    <!-- Button with click handler -->
    <Button @click="showModal = true">Open Dialog</Button>

    <!-- Modal dialog -->
    <Modal 
      title="Confirm Action" 
      :isOpen="showModal" 
      @close="showModal = false"
    >
      <p>Are you sure?</p>
      <template #actions>
        <Button variant="secondary" @click="showModal = false">Cancel</Button>
        <Button variant="danger">Confirm</Button>
      </template>
    </Modal>
  </div>
</template>
```

---

## Component Reference

### Button
```vue
<Button variant="primary" size="md" @click="handler">
  Click me
</Button>

<!-- Variants: primary, secondary, danger, loading -->
<!-- Sizes: sm, md, lg -->
<!-- Props: variant, size, disabled, isLoading, type, ariaLabel -->
```

### Input
```vue
<Input 
  label="Email" 
  type="email" 
  v-model="email"
  error="Invalid email"
  helper-text="Help text here"
/>

<!-- Types: text, email, password, number, tel, url, search, date, time -->
<!-- Props: label, type, placeholder, modelValue, error, disabled, required, helper-text, is-success -->
```

### Card
```vue
<Card title="Card Title" padding="md">
  <p>Content goes here</p>
  
  <template #footer>
    <Button>Action</Button>
  </template>
</Card>

<!-- Padding: sm, md, lg -->
<!-- Slots: default, header, footer -->
```

### Modal
```vue
<Modal title="Dialog Title" :isOpen="isOpen" @close="isOpen = false" size="md">
  <p>Modal content</p>
  
  <template #actions>
    <Button variant="secondary" @click="isOpen = false">Cancel</Button>
    <Button>Confirm</Button>
  </template>
</Modal>

<!-- Sizes: sm, md, lg -->
<!-- Slots: default, actions -->
```

### Alert
```vue
<Alert 
  type="success" 
  title="Success!" 
  message="Operation completed"
  :autoDismiss="true"
/>

<!-- Types: success, error, warning, info -->
<!-- Props: type, title, message, dismissible, autoDismiss, autoDismissMs -->
```

---

## Common Patterns

### Form with Validation
```vue
<script setup>
import { Input, Button } from '@/components/common'
import { ref } from 'vue'

const form = ref({ email: '', password: '' })
const errors = ref({ email: '', password: '' })

const validate = () => {
  if (!form.value.email) errors.value.email = 'Email required'
  if (!form.value.password) errors.value.password = 'Password required'
  return Object.values(errors.value).every(e => !e)
}

const submit = () => {
  if (validate()) {
    // Submit form
  }
}
</script>

<template>
  <form @submit.prevent="submit" class="space-y-4">
    <Input 
      label="Email" 
      type="email"
      v-model="form.email"
      :error="errors.email"
    />
    <Input 
      label="Password" 
      type="password"
      v-model="form.password"
      :error="errors.password"
    />
    <Button type="submit">Submit</Button>
  </form>
</template>
```

### Delete Confirmation
```vue
<script setup>
import { Modal, Button, Alert } from '@/components/common'
import { ref } from 'vue'

const showModal = ref(false)
const showSuccess = ref(false)

const handleDelete = async () => {
  // Delete logic
  showModal.value = false
  showSuccess.value = true
}
</script>

<template>
  <div>
    <Button variant="danger" @click="showModal = true">Delete</Button>

    <Modal 
      title="Confirm Delete" 
      :isOpen="showModal" 
      @close="showModal = false"
      size="sm"
    >
      <p>This action cannot be undone.</p>
      <template #actions>
        <Button variant="secondary" @click="showModal = false">Cancel</Button>
        <Button variant="danger" @click="handleDelete">Delete</Button>
      </template>
    </Modal>

    <Alert 
      v-if="showSuccess"
      type="success" 
      message="Item deleted successfully"
      :autoDismiss="true"
      @dismiss="showSuccess = false"
    />
  </div>
</template>
```

---

## Styling Tips

### Spacing
```vue
<div class="space-y-4">  <!-- 1rem gap -->
  <Input label="Field 1" />
  <Input label="Field 2" />
</div>

<div class="flex gap-2">  <!-- Horizontal gap -->
  <Button>Cancel</Button>
  <Button variant="primary">Save</Button>
</div>
```

### Layout
```vue
<div class="grid md:grid-cols-2 gap-6">
  <Card title="Card 1">Content</Card>
  <Card title="Card 2">Content</Card>
</div>
```

### Colors
```vue
<!-- Use variant prop instead of inline colors -->
<Button variant="primary">Save</Button>      <!-- Blue -->
<Button variant="secondary">Cancel</Button>  <!-- Gray -->
<Button variant="danger">Delete</Button>     <!-- Red -->
```

---

## TypeScript Support

### Component Types
```typescript
import type { 
  ButtonVariant, 
  ButtonSize, 
  InputType, 
  CardPadding, 
  AlertType 
} from '@/components/common'

const buttonVariant: ButtonVariant = 'primary'
const inputType: InputType = 'email'
const alertType: AlertType = 'success'
```

### Props with TypeScript
```vue
<script setup lang="ts">
import { Button, Input } from '@/components/common'

const handleClick: () => void = () => {
  console.log('Clicked')
}

const handleInput: (value: string) => void = (value) => {
  console.log(value)
}
</script>
```

---

## Accessibility

### Best Practices
```vue
<!-- ✅ Always provide labels -->
<Input label="Email" v-model="email" />

<!-- ✅ Use aria-label for icon buttons -->
<Button aria-label="Delete item" @click="delete">🗑️</Button>

<!-- ✅ Provide error messages -->
<Input 
  label="Password" 
  v-model="password"
  :error="passwordError"
/>

<!-- ✅ Use proper semantic HTML -->
<Modal title="Confirm" :isOpen="show" @close="handleClose">
  <!-- Content is automatically semantic -->
</Modal>
```

---

## Dark Mode

All components automatically support dark mode via `admin-dark` class on root element:

```html
<!-- No changes needed - automatic! -->
<Button>This works in both light and dark mode</Button>
```

---

## File Locations

- **Components:** `/admin/src/components/common/*.vue`
- **Types:** `/admin/src/components/common/types.ts`
- **Docs:** `/admin/src/components/common/README.md`
- **Examples:** `/admin/src/components/common/USAGE_EXAMPLES.vue`

---

## Documentation Links

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Complete component reference |
| [USAGE_EXAMPLES.vue](./USAGE_EXAMPLES.vue) | Working examples |
| [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) | Integration patterns |
| [COMPONENT_SPECIFICATIONS.md](./COMPONENT_SPECIFICATIONS.md) | Technical details |
| [DELIVERY_SUMMARY.md](./DELIVERY_SUMMARY.md) | Project summary |

---

## Tips & Tricks

### Conditional Rendering
```vue
<Alert 
  v-if="showAlert"
  type="success" 
  message="Saved!" 
  @dismiss="showAlert = false"
/>
```

### Form State
```vue
<Input 
  label="Email" 
  v-model="email"
  :is-success="validEmail"
/>
```

### Loading States
```vue
<Button :isLoading="isLoading" @click="submit">
  {{ isLoading ? 'Saving...' : 'Save' }}
</Button>
```

### Error Handling
```vue
<Input 
  label="Username" 
  v-model="username"
  :error="error || (username.length < 3 ? 'Too short' : '')"
/>
```

---

## Need More Help?

- **Examples:** See `USAGE_EXAMPLES.vue`
- **Full Docs:** See `README.md`
- **Integration:** See `IMPLEMENTATION_GUIDE.md`
- **Specs:** See `COMPONENT_SPECIFICATIONS.md`

---

**Status:** Ready to use! Import and start building. ✅
