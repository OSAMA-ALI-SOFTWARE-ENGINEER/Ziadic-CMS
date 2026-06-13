<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  images: string[]
  initialIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0,
})

const emit = defineEmits<{
  close: []
}>()

const currentIndex = ref(props.initialIndex)
const isVisible = ref(false)

const currentImage = computed(() => props.images[currentIndex.value] || '')
const hasNext = computed(() => currentIndex.value < props.images.length - 1)
const hasPrev = computed(() => currentIndex.value > 0)
const imageCount = computed(() => `${currentIndex.value + 1} / ${props.images.length}`)

function next() {
  if (hasNext.value) {
    currentIndex.value++
  }
}

function prev() {
  if (hasPrev.value) {
    currentIndex.value--
  }
}

function close() {
  emit('close')
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowRight') next()
  if (e.key === 'ArrowLeft') prev()
}

onMounted(() => {
  isVisible.value = true
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <Teleport to="body" v-if="isVisible">
    <!-- Backdrop -->
    <div
      class="gallery-preview-backdrop"
      @click="close"
    />

    <!-- Modal -->
    <div class="gallery-preview-modal" @click.stop>
      <!-- Close button -->
      <button
        class="gallery-preview-close"
        aria-label="Close gallery preview"
        @click="close"
      >
        ✕
      </button>

      <!-- Main image -->
      <div class="gallery-preview-container">
        <img
          :src="currentImage"
          :alt="`Gallery image ${currentIndex + 1}`"
          class="gallery-preview-image"
        />

        <!-- Navigation arrows -->
        <button
          v-if="hasPrev"
          class="gallery-preview-nav gallery-preview-prev"
          aria-label="Previous image"
          @click="prev"
        >
          ‹
        </button>

        <button
          v-if="hasNext"
          class="gallery-preview-nav gallery-preview-next"
          aria-label="Next image"
          @click="next"
        >
          ›
        </button>
      </div>

      <!-- Image counter -->
      <div class="gallery-preview-counter">{{ imageCount }}</div>
    </div>

    <style scoped>
      .gallery-preview-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 999;
      }

      .gallery-preview-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        max-width: 90vw;
        max-height: 90vh;
        background: #fff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      }

      .gallery-preview-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        min-height: 400px;
      }

      .gallery-preview-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .gallery-preview-close {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 40px;
        height: 40px;
        border: none;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        font-size: 24px;
        border-radius: 50%;
        cursor: pointer;
        z-index: 1001;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .gallery-preview-close:hover {
        background: rgba(0, 0, 0, 0.9);
      }

      .gallery-preview-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 48px;
        height: 48px;
        border: none;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        font-size: 32px;
        cursor: pointer;
        z-index: 1001;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        border-radius: 4px;
      }

      .gallery-preview-nav:hover {
        background: rgba(0, 0, 0, 0.9);
      }

      .gallery-preview-prev {
        left: 16px;
      }

      .gallery-preview-next {
        right: 16px;
      }

      .gallery-preview-counter {
        position: absolute;
        bottom: 16px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 1001;
      }

      @media (max-width: 768px) {
        .gallery-preview-modal {
          max-width: 95vw;
          max-height: 95vh;
        }

        .gallery-preview-nav {
          width: 40px;
          height: 40px;
          font-size: 24px;
        }

        .gallery-preview-close {
          width: 36px;
          height: 36px;
          font-size: 20px;
        }
      }
    </style>
  </Teleport>
</template>
