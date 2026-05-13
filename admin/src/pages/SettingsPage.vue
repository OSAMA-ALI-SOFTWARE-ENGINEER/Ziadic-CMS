<template>
  <section class="grid gap-6 lg:grid-cols-2">
    <form class="cms-card p-5">
      <h2 class="m-0 text-base font-semibold">Site settings</h2>
      <p class="m-0 mt-1 text-sm text-[var(--admin-muted)]">Global settings stored in the backend settings table.</p>
      <div class="mt-5 grid gap-4">
        <label class="grid gap-2 text-sm font-medium">
          Site name
          <input class="cms-input" value="Kukaqka" />
        </label>
        <label class="grid gap-2 text-sm font-medium">
          Site URL
          <input class="cms-input" value="http://kukaqka.com" />
        </label>
        <label class="grid gap-2 text-sm font-medium">
          Default SEO title
          <input class="cms-input" value="Kukaqka Directory" />
        </label>
      </div>
    </form>

    <section class="cms-card p-5">
      <h2 class="m-0 text-base font-semibold">Theme controls</h2>
      <p class="m-0 mt-1 text-sm text-[var(--admin-muted)]">The background switcher in the top bar stores the selected CMS theme locally.</p>
      <div class="mt-5 rounded-lg bg-[var(--admin-soft)] p-4 text-sm text-[var(--admin-muted)]">
        Use the sun/moon toggle in the top bar to switch the dashboard background and panel palette.
      </div>
    </section>
  </section>
</template>
