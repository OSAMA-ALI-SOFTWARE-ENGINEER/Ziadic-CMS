<script setup lang="ts">
import CmsTable from '@/components/CmsTable.vue'
import { contentRows } from '@/data/cms'
</script>

<template>
  <section class="grid gap-6 md:grid-cols-3">
    <article class="cms-card p-5">
      <i class="pi pi-file text-xl text-[var(--admin-primary)]"></i>
      <h2 class="m-0 mt-4 text-base font-semibold">Pages</h2>
      <p class="m-0 mt-1 text-sm text-[var(--admin-muted)]">Home, about, contact, and SEO-managed static pages.</p>
    </article>
    <article class="cms-card p-5">
      <i class="pi pi-book text-xl text-[var(--admin-primary)]"></i>
      <h2 class="m-0 mt-4 text-base font-semibold">Blog posts</h2>
      <p class="m-0 mt-1 text-sm text-[var(--admin-muted)]">Articles, authors, categories, tags, and publish workflow.</p>
    </article>
    <article class="cms-card p-5">
      <i class="pi pi-sitemap text-xl text-[var(--admin-primary)]"></i>
      <h2 class="m-0 mt-4 text-base font-semibold">Services</h2>
      <p class="m-0 mt-1 text-sm text-[var(--admin-muted)]">CMS-managed service pages for the public website.</p>
    </article>
  </section>

  <CmsTable title="Content library" description="Manage pages, services, blog posts, and publishing states." :rows="contentRows" mode="content" />
</template>
