# Common Components Library

A comprehensive library of reusable, accessible, and well-documented foundation components for the Kukaqka CMS admin dashboard.

## Components

### 1. Button

A versatile button component with multiple variants, sizes, and states.

**Props:**
- `variant`: `'primary' | 'secondary' | 'danger' | 'loading'` (default: `'primary'`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `disabled`: `boolean` (default: `false`)
- `type`: `'button' | 'submit' | 'reset'` (default: `'button'`)
- `isLoading`: `boolean` (default: `false`)
- `ariaLabel`: `string` - for accessibility

**Events:**
- `@click` - emitted when button is clicked

**Usage:**
```vue
<Button variant="primary" size="md" @click="handleClick">Click me</Button>
<Button variant="secondary" :disabled="true">Disabled</Button>
<Button variant="danger" size="lg">Delete</Button>
<Button variant="loading" :isLoading="isLoading">Processing...</Button>
<Button size="sm" aria-label="Save changes">Save</Button>
```

**Features:**
- Smooth hover and active states
- Loading spinner animation
- Full keyboard accessibility
- Touch-friendly sizing

---

### 2. Input

A text input component with validation, error states, and accessibility features.

**Props:**
- `label`: `string` - label text
- `type`: `'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time'` (default: `'text'`)
- `placeholder`: `string`
- `modelValue`: `string | number` - current value (v-model)
- `error`: `string` - error message
- `disabled`: `boolean` (default: `false`)
- `required`: `boolean` (default: `false`)
- `maxlength`: `number`
- `minlength`: `number`
- `autocomplete`: `string`
- `id`: `string` - custom input ID
- `helperText`: `string` - helper text below label
- `isSuccess`: `boolean` (default: `false`)
- `ariaDescription`: `string` - for screen readers

**Events:**
- `@update:modelValue` - emitted when value changes
- `@blur` - emitted when input loses focus
- `@focus` - emitted when input receives focus

**Usage:**
```vue
<Input label="Email" type="email" v-model="email" />
<Input 
  label="Password" 
  type="password" 
  v-model="password" 
  error="Password is required" 
/>
<Input 
  label="Search" 
  placeholder="Enter search term" 
  v-model="search"
  helper-text="Type at least 3 characters"
/>
<Input 
  label="Username" 
  v-model="username"
  :is-success="validUsername"
/>
```

**Features:**
- Automatic ID generation
- Error message display with icon
- Success state with checkmark
- Helper text support
- Full ARIA support with `aria-describedby`
- Accessibility labels and descriptions

---

### 3. Card

A card container component with optional header, footer, and customizable padding.

**Props:**
- `title`: `string` - title for the card header
- `padding`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `showHeaderBorder`: `boolean` (default: `true`)
- `showFooterBorder`: `boolean` (default: `true`)
- `class`: `string` - additional CSS classes
- `ariaLabel`: `string` - for accessibility when no title

**Slots:**
- `#default` - main card content
- `#header` - custom header content (overrides title)
- `#footer` - footer content

**Usage:**
```vue
<Card title="Card Title">
  <p>Card content goes here</p>
</Card>

<Card padding="lg">
  <template #header>
    <h3>Custom Header</h3>
  </template>
  <p>Card content</p>
  <template #footer>
    <Button>Action</Button>
  </template>
</Card>

<Card>
  <template #header>
    <div class="flex justify-between">
      <h3>Stats</h3>
      <span class="text-muted">Last 30 days</span>
    </div>
  </template>
  <!-- Content here -->
  <template #footer>
    <Button variant="secondary">View More</Button>
  </template>
</Card>
```

**Features:**
- Flexible header/footer slots
- Consistent styling with design system
- Optional borders between sections
- Customizable padding

---

### 4. Modal

A reusable modal dialog component with keyboard support and accessibility features.

**Props:**
- `isOpen`: `boolean` - whether modal is visible
- `title`: `string` - modal title (required)
- `closeOnBackdropClick`: `boolean` (default: `true`)
- `showCloseButton`: `boolean` (default: `true`)
- `zIndex`: `number` (default: `50`)
- `ariaLabel`: `string` - custom aria label
- `ariaDescription`: `string` - for screen readers
- `disableEscapeClose`: `boolean` (default: `false`)
- `lockBodyScroll`: `boolean` (default: `true`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)

**Events:**
- `@close` - emitted when modal should close

**Slots:**
- `#default` - modal content
- `#actions` - footer action buttons

**Usage:**
```vue
<Modal 
  title="Confirm Action" 
  :isOpen="showModal" 
  @close="showModal = false"
>
  <p>Are you sure you want to delete this item?</p>
  <template #actions>
    <Button variant="secondary" @click="showModal = false">Cancel</Button>
    <Button variant="danger" @click="handleDelete">Delete</Button>
  </template>
</Modal>

<Modal 
  title="User Details" 
  :isOpen="showUserModal" 
  @close="showUserModal = false"
  size="lg"
>
  <form>
    <Input label="Name" v-model="user.name" />
    <Input label="Email" type="email" v-model="user.email" />
  </form>
  <template #actions>
    <Button @click="saveUser">Save</Button>
  </template>
</Modal>
```

**Features:**
- Keyboard navigation (ESC to close)
- Backdrop click to close (optional)
- Body scroll lock
- Multiple size options
- ARIA compliant
- Smooth animations

---

### 5. Alert

A notification/alert component with multiple types and auto-dismiss capability.

**Props:**
- `type`: `'success' | 'error' | 'warning' | 'info'` (required)
- `title`: `string` - alert title
- `message`: `string` - alert message
- `dismissible`: `boolean` (default: `true`)
- `autoDismiss`: `boolean` (default: `false`)
- `autoDismissMs`: `number` (default: `4000`) - milliseconds before auto-dismiss
- `visible`: `boolean` (default: `true`)
- `icon`: `string` - custom icon class
- `ariaLabel`: `string` - for accessibility

**Events:**
- `@dismiss` - emitted when alert is dismissed

**Slots:**
- `#default` - custom alert content

**Usage:**
```vue
<Alert 
  type="success" 
  title="Success" 
  message="Operation completed successfully" 
/>

<Alert 
  type="error" 
  message="An error occurred" 
  :autoDismiss="false" 
  @dismiss="clearAlert"
/>

<Alert 
  type="warning" 
  message="This is a warning" 
  :auto-dismiss="true"
  :auto-dismiss-ms="5000"
/>

<Alert type="info" title="Information">
  <p>This is an informational alert with custom content</p>
</Alert>
```

**Features:**
- 4 alert types with distinct styling
- Auto-dismiss with configurable duration
- Dismissible with button
- Proper ARIA roles (alert, status)
- Smooth enter/exit animations
- Dark mode support

---

## Importing Components

### Using the index export
```typescript
import { Button, Input, Card, Modal, Alert } from '@/components/common'
```

### Individual imports
```vue
<script setup lang="ts">
import Button from '@/components/common/Button.vue'
import Input from '@/components/common/Input.vue'
</script>
```

### In a Vue app setup
```typescript
import { createApp } from 'vue'
import { Button, Input, Card, Modal, Alert } from '@/components/common'

const app = createApp(App)

// Optional: register globally
app.component('Button', Button)
app.component('Input', Input)
app.component('Card', Card)
app.component('Modal', Modal)
app.component('Alert', Alert)
```

---

## Design System Integration

All components follow the established design system:

- **Colors**: Uses CSS custom properties (`--admin-primary`, `--admin-border`, etc.)
- **Spacing**: Uses Tailwind spacing scale
- **Typography**: Uses existing font configuration
- **Shadows**: Uses `cms-card` class and shadow variables
- **Radius**: Uses `--admin-radius` and `--admin-radius-sm`
- **Transitions**: Smooth 150-160ms transitions

### CSS Variables Used
```css
--admin-primary          /* Primary brand color */
--admin-primary-strong   /* Darker primary */
--admin-primary-glow     /* Glow effect color */
--admin-panel            /* White background */
--admin-bg               /* Page background */
--admin-soft             /* Soft background */
--admin-ink              /* Text color */
--admin-muted            /* Muted text */
--admin-border           /* Border color */
--admin-shadow           /* Small shadow */
--admin-shadow-lg        /* Large shadow */
```

---

## Accessibility

All components follow WCAG 2.1 AA standards:

- **Button**: Full keyboard support, proper ARIA labels
- **Input**: Label association, error descriptions, helper text support
- **Card**: Semantic HTML, optional ARIA labels
- **Modal**: ARIA dialog pattern, ESC key support, focus management
- **Alert**: ARIA live regions, proper roles (alert/status)

---

## TypeScript Support

All components are fully typed with TypeScript:

```typescript
// Component types available for export
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'loading'
type ButtonSize = 'sm' | 'md' | 'lg'
type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time'
type CardPadding = 'sm' | 'md' | 'lg'
type AlertType = 'success' | 'error' | 'warning' | 'info'
```

---

## Best Practices

1. **Button Usage**
   - Use `variant="primary"` for main actions
   - Use `variant="secondary"` for optional actions
   - Use `variant="danger"` only for destructive actions
   - Use `isLoading` during async operations

2. **Input Usage**
   - Always provide a `label` for accessibility
   - Show `error` messages immediately on validation failure
   - Use `helperText` to guide users
   - Validate in real-time for better UX

3. **Card Usage**
   - Use `title` for identification
   - Use slots for custom layouts
   - Keep content concise
   - Use footer for actions

4. **Modal Usage**
   - Always provide a clear `title`
   - Use `size` prop appropriately
   - Include action buttons in `#actions` slot
   - Consider `disableEscapeClose` for critical confirmations

5. **Alert Usage**
   - Use `success` for confirmations
   - Use `error` for failures (auto-set as alert role)
   - Use `warning` for cautions
   - Use `info` for informational messages
   - Consider `autoDismiss` for non-critical alerts

---

## Notes

- Components do not require external UI libraries (pure Vue 3 + Tailwind)
- PrimeIcons are used for icons (ensure they're imported)
- All components use Vue 3 Composition API with `<script setup>`
- Full JSDoc comments provided for IDE autocomplete
