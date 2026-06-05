<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCmsStore } from '@/stores/cms'

type SearchResult = {
  id: string
  label: string
  type: 'Listing' | 'User' | 'Category' | 'Media'
  meta: string
  icon: string
  to: string
}

type SearchCategory = {
  name: string
  icon: string
  results: SearchResult[]
}

const emit = defineEmits<{
  open: []
  close: []
}>()

const props = withDefaults(
  defineProps<{
    modelValue: string
    open: boolean
  }>(),
  {
    modelValue: '',
    open: false,
  },
)

const router = useRouter()
const cms = useCmsStore()
const searchQuery = ref(props.modelValue)
const isLoading = ref(false)
const selectedResultIndex = ref(-1)

// Watch for external open/close
watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      selectedResultIndex.value = -1
    }
  },
)

// Watch search query changes
watch(
  () => props.modelValue,
  (newVal) => {
    searchQuery.value = newVal
  },
)

/**
 * Search across Listings, Users, Categories, and Media
 * Returns categorized results
 */
function performSearch(query: string): SearchCategory[] {
  if (query.trim().length < 2) return []

  const lowerQuery = query.toLowerCase()
  const categories: SearchCategory[] = []

  // Search Listings
  const listingResults = cms.listings
    .filter((l) => l.title.toLowerCase().includes(lowerQuery))
    .slice(0, 3)
    .map((l) => ({
      id: l.title,
      label: l.title,
      type: 'Listing' as const,
      meta: l.city,
      icon: 'pi pi-building',
      to: `/listings?search=${encodeURIComponent(l.title)}`,
    }))

  if (listingResults.length > 0) {
    categories.push({
      name: 'Listings',
      icon: 'pi pi-building',
      results: listingResults,
    })
  }

  // Search Users
  const userResults = cms.users
    .filter((u) => u.name.toLowerCase().includes(lowerQuery) || u.email.toLowerCase().includes(lowerQuery))
    .slice(0, 3)
    .map((u) => ({
      id: `user-${u.id}`,
      label: u.name,
      type: 'User' as const,
      meta: u.email,
      icon: 'pi pi-user',
      to: `/users?id=${u.id}`,
    }))

  if (userResults.length > 0) {
    categories.push({
      name: 'Users',
      icon: 'pi pi-user',
      results: userResults,
    })
  }

  // Search Categories
  const categoryResults = cms.categories
    .filter((c) => c.name.toLowerCase().includes(lowerQuery))
    .slice(0, 3)
    .map((c) => ({
      id: `category-${c.id}`,
      label: c.name,
      type: 'Category' as const,
      meta: c.slug,
      icon: 'pi pi-tag',
      to: `/categories?id=${c.id}`,
    }))

  if (categoryResults.length > 0) {
    categories.push({
      name: 'Categories',
      icon: 'pi pi-tag',
      results: categoryResults,
    })
  }

  // Search Media
  const mediaResults = cms.media
    .filter((m) => m.name.toLowerCase().includes(lowerQuery))
    .slice(0, 3)
    .map((m) => ({
      id: `media-${m.id}`,
      label: m.name,
      type: 'Media' as const,
      meta: m.type,
      icon: 'pi pi-image',
      to: `/media?id=${m.id}`,
    }))

  if (mediaResults.length > 0) {
    categories.push({
      name: 'Media',
      icon: 'pi pi-image',
      results: mediaResults,
    })
  }

  return categories
}

const searchCategories = computed(() => performSearch(searchQuery.value))

const allResults = computed(() => searchCategories.value.flatMap((c) => c.results))

/**
 * Navigate to search result and close dropdown
 */
async function selectResult(result: SearchResult) {
  await router.push(result.to)
  emit('close')
  searchQuery.value = ''
}

/**
 * Handle keyboard navigation
 */
function handleKeydown(event: KeyboardEvent) {
  if (!props.open) return

  switch (event.key) {
    case 'Escape':
      emit('close')
      break
    case 'ArrowDown':
      event.preventDefault()
      selectedResultIndex.value = Math.min(selectedResultIndex.value + 1, allResults.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedResultIndex.value = Math.max(selectedResultIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedResultIndex.value >= 0) {
        selectResult(allResults.value[selectedResultIndex.value])
      }
      break
  }
}
</script>

<template>
  <div class="global-search" @keydown="handleKeydown">
    <label class="relative block w-full">
      <i
        class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-(--admin-muted) pointer-events-none transition-opacity"
        :class="{ 'opacity-0 hidden': searchQuery.length > 0 }"
        aria-hidden="true"
      ></i>
      <input
        v-model="searchQuery"
        class="cms-input pl-10 rounded-full w-full pr-10"
        placeholder="Search listings, users, categories..."
        autocomplete="off"
        @focus="$emit('open')"
      />
      <!-- Clear button -->
      <button
        v-if="searchQuery.length > 0"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-(--admin-muted) hover:text-(--admin-primary) transition-colors p-0 border-0 bg-transparent cursor-pointer"
        type="button"
        aria-label="Clear search"
        @click="searchQuery = ''"
      >
        <i class="pi pi-times text-sm" aria-hidden="true"></i>
      </button>
    </label>

    <!-- Search Results Dropdown -->
    <Transition name="dropdown-fade">
      <div v-if="open && searchQuery.trim().length >= 2" class="global-search__dropdown">
        <!-- Loading State -->
        <div v-if="isLoading" class="global-search__hint">
          <i class="pi pi-spin pi-spinner" aria-hidden="true"></i> Searching...
        </div>

        <!-- No Results -->
        <div v-else-if="allResults.length === 0" class="global-search__hint">
          <i class="pi pi-inbox" aria-hidden="true"></i> No results found
        </div>

        <!-- Categorized Results -->
        <template v-else>
          <div v-for="(category, _catIndex) in searchCategories" :key="category.name" class="border-t border-(--admin-border) first:border-t-0">
            <!-- Category Header -->
            <div class="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase text-(--admin-muted)">
              <i :class="category.icon" aria-hidden="true"></i>
              {{ category.name }}
            </div>

            <!-- Category Results -->
            <button
              v-for="(result, _resIndex) in category.results"
              :key="result.id"
              class="global-search__item"
              type="button"
              :class="{ 'bg-(--admin-soft)': selectedResultIndex === allResults.indexOf(result) }"
              @click="selectResult(result)"
              @mouseenter="selectedResultIndex = allResults.indexOf(result)"
            >
              <span class="flex items-center gap-2">
                <i :class="result.icon" aria-hidden="true"></i>
                <span class="global-search__item-title">{{ result.label }}</span>
              </span>
              <span class="global-search__item-meta">{{ result.meta }}</span>
            </button>
          </div>
        </template>
      </div>
    </Transition>

    <!-- Hint Text -->
    <p v-if="open && searchQuery.trim().length < 2" class="global-search__hint mt-1 text-xs">
      <i class="pi pi-info-circle" aria-hidden="true"></i> Type at least 2 characters to search
    </p>
  </div>
</template>

<style scoped>
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
