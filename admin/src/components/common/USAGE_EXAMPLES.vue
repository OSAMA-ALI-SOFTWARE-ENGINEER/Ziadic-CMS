<script setup lang="ts">
/**
 * Common Components - Usage Examples
 *
 * This file demonstrates all the common components with real-world examples.
 * Use this as a reference for implementing these components in your pages.
 */

import { ref } from 'vue'
import Button from './Button.vue'
import Input from './Input.vue'
import Card from './Card.vue'
import Modal from './Modal.vue'
import Alert from './Alert.vue'

// Example 1: Button variations
const isLoading = ref(false)

const handleAsyncClick = async () => {
  isLoading.value = true
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 2000))
  isLoading.value = false
}

// Example 2: Form with Input and validation
const formData = ref({
  email: '',
  password: '',
  username: '',
})

const formErrors = ref({
  email: '',
  password: '',
  username: '',
})

const validateForm = () => {
  formErrors.value = { email: '', password: '', username: '' }

  if (!formData.value.email) {
    formErrors.value.email = 'Email is required'
  } else if (!formData.value.email.includes('@')) {
    formErrors.value.email = 'Invalid email format'
  }

  if (!formData.value.password) {
    formErrors.value.password = 'Password is required'
  } else if (formData.value.password.length < 8) {
    formErrors.value.password = 'Password must be at least 8 characters'
  }

  if (!formData.value.username) {
    formErrors.value.username = 'Username is required'
  }

  return !Object.values(formErrors.value).some(err => err)
}

const handleSubmit = async () => {
  if (validateForm()) {
    isLoading.value = true
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    isLoading.value = false
    showSuccessAlert.value = true
  }
}

// Example 3: Modal for confirmations
const showDeleteModal = ref(false)
const itemToDelete = ref('Sample Item')

const handleDelete = () => {
  showDeleteModal.value = false
  showSuccessAlert.value = true
}

// Example 4: Alert notifications
const showSuccessAlert = ref(false)
const showErrorAlert = ref(false)
const showWarningAlert = ref(false)

const triggerError = () => {
  showErrorAlert.value = true
}
</script>

<template>
  <div class="space-y-8 p-6">
    <!-- Section 1: Button Examples -->
    <Card title="Button Component Examples">
      <div class="space-y-4">
        <!-- Primary Button -->
        <div>
          <h4 class="mb-2 font-semibold">Primary Buttons</h4>
          <div class="flex flex-wrap gap-3">
            <Button size="sm">Small Button</Button>
            <Button size="md">Medium Button</Button>
            <Button size="lg">Large Button</Button>
          </div>
        </div>

        <!-- Secondary Button -->
        <div>
          <h4 class="mb-2 font-semibold">Secondary Buttons</h4>
          <div class="flex flex-wrap gap-3">
            <Button variant="secondary" size="sm">Small</Button>
            <Button variant="secondary" size="md">Medium</Button>
            <Button variant="secondary" size="lg">Large</Button>
          </div>
        </div>

        <!-- Danger Button -->
        <div>
          <h4 class="mb-2 font-semibold">Danger Buttons</h4>
          <div class="flex flex-wrap gap-3">
            <Button variant="danger" size="sm">Delete</Button>
            <Button variant="danger" size="md">Remove</Button>
            <Button variant="danger" size="lg">Confirm Delete</Button>
          </div>
        </div>

        <!-- Disabled and Loading -->
        <div>
          <h4 class="mb-2 font-semibold">States</h4>
          <div class="flex flex-wrap gap-3">
            <Button :disabled="true">Disabled</Button>
            <Button variant="secondary" :disabled="true">Disabled Secondary</Button>
            <Button :isLoading="isLoading" @click="handleAsyncClick">
              {{ isLoading ? 'Processing' : 'Click to Process' }}
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- Section 2: Input Examples -->
    <Card title="Input Component Examples">
      <div class="space-y-4">
        <Input
          label="Email Address"
          type="email"
          v-model="formData.email"
          placeholder="john@example.com"
          :error="formErrors.email"
          helper-text="We'll never share your email"
          autocomplete="email"
        />

        <Input
          label="Username"
          type="text"
          v-model="formData.username"
          placeholder="Enter your username"
          :error="formErrors.username"
          helper-text="Choose a unique username (3-20 characters)"
          :is-success="formData.username.length > 3 && !formErrors.username"
        />

        <Input
          label="Password"
          type="password"
          v-model="formData.password"
          placeholder="Enter a strong password"
          :error="formErrors.password"
          helper-text="Minimum 8 characters with uppercase, numbers, and symbols"
          autocomplete="current-password"
        />

        <Input
          label="Search Users"
          type="search"
          placeholder="Type to search..."
          helper-text="Search by name or email"
        />
      </div>
    </Card>

    <!-- Section 3: Form with Cards and Buttons -->
    <Card title="Complete Form Example">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <Input
          label="Full Name"
          type="text"
          v-model="formData.username"
          placeholder="John Doe"
          required
        />

        <Input
          label="Email"
          type="email"
          v-model="formData.email"
          placeholder="john@example.com"
          :error="formErrors.email"
          required
        />

        <Input
          label="Password"
          type="password"
          v-model="formData.password"
          placeholder="••••••••"
          :error="formErrors.password"
          required
        />

        <div class="flex gap-3 pt-4">
          <Button type="submit" size="md" :isLoading="isLoading">
            {{ isLoading ? 'Creating Account' : 'Create Account' }}
          </Button>
          <Button variant="secondary" type="reset" size="md">Clear</Button>
        </div>
      </form>
    </Card>

    <!-- Section 4: Card Variations -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- Card with no title -->
      <Card padding="sm">
        <h3 class="mb-2 font-semibold">Stats Card</h3>
        <p class="text-sm text-muted">This is a card with small padding and no border divisions</p>
      </Card>

      <!-- Card with custom header -->
      <Card padding="lg">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">Activity</h3>
            <Button variant="secondary" size="sm">See All</Button>
          </div>
        </template>
        <div class="space-y-2 text-sm">
          <p>• User logged in at 2:34 PM</p>
          <p>• New item created</p>
          <p>• Settings updated</p>
        </div>
        <template #footer>
          <Button variant="secondary" size="sm">View Full Log</Button>
        </template>
      </Card>
    </div>

    <!-- Section 5: Modal Examples -->
    <Card title="Modal & Confirmation Dialog">
      <div class="flex flex-wrap gap-3">
        <Button @click="showDeleteModal = true">Open Delete Confirmation</Button>
      </div>

      <Modal
        title="Delete Item"
        :isOpen="showDeleteModal"
        @close="showDeleteModal = false"
        size="sm"
      >
        <p class="mb-4">Are you sure you want to delete <strong>{{ itemToDelete }}</strong>?</p>
        <p class="text-sm text-muted">This action cannot be undone.</p>

        <template #actions>
          <Button variant="secondary" @click="showDeleteModal = false">Cancel</Button>
          <Button variant="danger" @click="handleDelete">Delete</Button>
        </template>
      </Modal>
    </Card>

    <!-- Section 6: Alert Examples -->
    <Card title="Alert Component Examples">
      <div class="flex flex-wrap gap-3 mb-6">
        <Button @click="showSuccessAlert = true">Show Success</Button>
        <Button variant="secondary" @click="triggerError">Show Error</Button>
        <Button variant="secondary" @click="showWarningAlert = true">Show Warning</Button>
      </div>

      <div class="space-y-3">
        <!-- Success Alert -->
        <Alert
          v-if="showSuccessAlert"
          type="success"
          title="Success!"
          message="Your changes have been saved successfully."
          :autoDismiss="true"
          :autoDismissMs="5000"
          @dismiss="showSuccessAlert = false"
        />

        <!-- Error Alert -->
        <Alert
          v-if="showErrorAlert"
          type="error"
          title="Error"
          message="An error occurred while processing your request. Please try again."
          :dismissible="true"
          @dismiss="showErrorAlert = false"
        />

        <!-- Warning Alert -->
        <Alert
          v-if="showWarningAlert"
          type="warning"
          title="Warning"
          message="You are about to perform an action that cannot be undone."
          @dismiss="showWarningAlert = false"
        />

        <!-- Info Alert with custom content -->
        <Alert
          type="info"
          title="Tip"
        >
          <template #default>
            <p>You can use custom content in alerts by using the default slot.</p>
          </template>
        </Alert>
      </div>
    </Card>

    <!-- Section 7: Responsive Layout Example -->
    <Card title="Responsive Grid Layout">
      <div class="grid gap-4 md:grid-cols-3">
        <Card padding="md">
          <h4 class="mb-2 font-semibold">Users</h4>
          <p class="text-3xl font-bold text-primary">1,234</p>
          <p class="text-sm text-muted">+12% this month</p>
        </Card>

        <Card padding="md">
          <h4 class="mb-2 font-semibold">Revenue</h4>
          <p class="text-3xl font-bold text-primary">$45,231</p>
          <p class="text-sm text-muted">+8% this month</p>
        </Card>

        <Card padding="md">
          <h4 class="mb-2 font-semibold">Conversions</h4>
          <p class="text-3xl font-bold text-primary">3.2%</p>
          <p class="text-sm text-muted">+0.3% this month</p>
        </Card>
      </div>
    </Card>

    <!-- Footer -->
    <div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
      <p>
        <strong>Note:</strong> This file is a demonstration of common components. You can use these as templates for your own implementations.
        Remove this file from your actual codebase.
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Example custom styling can go here if needed */
</style>
