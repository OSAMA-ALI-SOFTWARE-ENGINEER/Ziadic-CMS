<script setup lang="ts">
const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Listing', to: '/listings' },
  { label: 'Blogs', to: '/blogs' },
  { label: 'Contact Us', to: '/contact' },
]
</script>

<template>
  <header class="sticky top-0 z-50 bg-[var(--body-background-color)]/95 backdrop-blur">
    <div class="container">
      <div class="flex min-h-[92px] items-center justify-between gap-8">
        <RouterLink to="/" aria-label="Zaidic home">
          <img src="/assets/images/logo_2.svg" alt="Zaidic" class="h-auto w-[152px]" />
        </RouterLink>

        <nav aria-label="Primary navigation" class="hidden items-center gap-9 lg:flex">
          <RouterLink
            v-for="item in navItems"
            :key="item.label"
            :to="item.to"
            class="text-[17px] font-medium text-[var(--primary-color-80)] transition-colors hover:text-[var(--coral)]"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <RouterLink to="/pricing" class="primary-button hidden lg:inline-flex">Get Started</RouterLink>

        <button
          class="inline-flex h-12 w-12 items-center justify-center rounded-[8px] border border-[var(--border-color)] text-[var(--primary-color)] lg:hidden"
          type="button"
          aria-label="Open menu"
        >
          <i class="pi pi-bars" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  </header>
</template>
