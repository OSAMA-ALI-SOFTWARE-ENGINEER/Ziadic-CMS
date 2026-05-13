<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue: string
  label: string
  autocomplete?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isVisible = ref(false)
const baseUrl = import.meta.env.BASE_URL
</script>

<template>
  <div class="field-wrap">
    <label v-if="label" class="sr-only">{{ label }}</label>
      <input
        class="sign-field"
        :type="isVisible ? 'text' : 'password'"
        :value="modelValue"
        :autocomplete="autocomplete"
        :placeholder="`${label} *`"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button class="eye-button" type="button" :aria-label="isVisible ? 'Hide password' : 'Show password'" @click="isVisible = !isVisible">
        <img :src="`${baseUrl}images/Eye.svg`" alt="" class="eye" />
      </button>
  </div>
</template>
