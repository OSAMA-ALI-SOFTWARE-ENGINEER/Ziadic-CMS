<script setup lang="ts">
interface Props {
  isOpen: boolean
  title: string
  message: string
  itemName: string
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <!-- Modal -->
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden animate-in">
      <!-- Header -->
      <div class="bg-red-50 px-6 py-4 border-b border-red-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <i class="pi pi-exclamation-circle text-red-600 text-lg"></i>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
            <p class="text-sm text-gray-600 mt-1">This action cannot be undone</p>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div class="px-6 py-4">
        <p class="text-gray-700">
          {{ message }}
          <span v-if="itemName" class="font-semibold text-gray-900">"{{ itemName }}"</span>
          ?
        </p>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
        <button
          @click="handleCancel"
          :disabled="isLoading"
          class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          @click="handleConfirm"
          :disabled="isLoading"
          class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <i :class="isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-trash'"></i>
          {{ isLoading ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-in {
  animation: slideIn 0.2s ease-out;
}
</style>
