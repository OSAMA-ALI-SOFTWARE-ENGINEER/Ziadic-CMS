<script setup lang="ts">
defineProps<{
  isDark: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button class="theme-switch" type="button" :aria-pressed="isDark" aria-label="Toggle background theme" @click="$emit('toggle')">
    <span class="theme-switch__track">
      <span class="theme-switch__thumb" :class="{ 'theme-switch__thumb--dark': isDark }">
        <i :class="isDark ? 'pi pi-moon' : 'pi pi-sun'" aria-hidden="true"></i>
      </span>
    </span>
  </button>
</template>
