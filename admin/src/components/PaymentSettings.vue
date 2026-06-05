<script setup lang="ts">
</script>

<template>
  <div class="settings-section">
    <div class="grid gap-6">
      <!-- Section Header -->
      <div>
        <h2 class="m-0 text-base font-semibold">Payments Configuration</h2>
        <p class="m-0 mt-1 text-sm text-(--admin-muted)">Manage payment gateways and checkout settings.</p>
      </div>

      <!-- Coming Soon Placeholder -->
      <div class="rounded-lg border-2 border-dashed border-(--admin-border) bg-(--admin-soft) p-8 text-center">
        <i class="pi pi-credit-card text-4xl text-(--admin-muted) mb-4 block" aria-hidden="true"></i>
        <h3 class="m-0 text-base font-semibold text-(--admin-ink)">Coming Soon</h3>
        <p class="m-0 mt-2 text-sm text-(--admin-muted) max-w-sm mx-auto">
          Payment gateway integration and checkout configuration will be available in the next release.
        </p>
        <div class="mt-6 flex flex-col gap-2 sm:flex-row justify-center">
          <div class="p-3 rounded-lg bg-(--admin-bg) border border-(--admin-border)">
            <p class="m-0 text-xs font-semibold text-(--admin-muted) uppercase">Stripe</p>
            <p class="m-0 mt-1 text-sm text-(--admin-ink)">Coming Soon</p>
          </div>
          <div class="p-3 rounded-lg bg-(--admin-bg) border border-(--admin-border)">
            <p class="m-0 text-xs font-semibold text-(--admin-muted) uppercase">PayPal</p>
            <p class="m-0 mt-1 text-sm text-(--admin-ink)">Coming Soon</p>
          </div>
          <div class="p-3 rounded-lg bg-(--admin-bg) border border-(--admin-border)">
            <p class="m-0 text-xs font-semibold text-(--admin-muted) uppercase">Square</p>
            <p class="m-0 mt-1 text-sm text-(--admin-ink)">Coming Soon</p>
          </div>
        </div>
      </div>

      <!-- Info Box -->
      <div class="p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <div class="flex gap-3">
          <i class="pi pi-info-circle text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" aria-hidden="true"></i>
          <div>
            <p class="m-0 text-sm font-semibold text-blue-900 dark:text-blue-100">Payment Features Coming Soon</p>
            <p class="m-0 mt-1 text-sm text-blue-800 dark:text-blue-200">
              In the next phase, you'll be able to configure payment gateways, set up checkout flows, manage billing settings, and handle refund policies. Stay tuned!
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
