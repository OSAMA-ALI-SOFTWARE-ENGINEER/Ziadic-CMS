<script setup lang="ts"></script>

<template>
  <!-- Coming Soon Banner -->
  <div class="cms-card relative overflow-hidden bg-linear-to-r from-(--admin-soft) to-transparent p-6">
    <div class="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-(--admin-primary) opacity-10 blur-3xl"></div>
    <div class="flex items-start gap-4">
      <span class="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-linear-to-br from-(--admin-primary) to-(--admin-primary-strong) text-xl text-white shadow-lg">
        <i class="pi pi-clock" aria-hidden="true"></i>
      </span>
      <div class="flex-1">
        <h3 class="m-0 text-base font-semibold text-(--admin-ink)">Payment Integration Coming Soon</h3>
        <p class="m-0 mt-1.5 text-sm text-(--admin-muted)">
          We're integrating advanced payment processing, invoicing, and subscription management. This feature will be available soon with support for multiple payment gateways.
        </p>
        <div class="mt-3 flex gap-2">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-(--admin-primary)/10 px-3 py-1 text-xs font-medium text-(--admin-primary)">
            <i class="pi pi-check" aria-hidden="true"></i>
            Payment Processing
          </span>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-(--admin-primary)/10 px-3 py-1 text-xs font-medium text-(--admin-primary)">
            <i class="pi pi-check" aria-hidden="true"></i>
            Invoicing
          </span>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-(--admin-primary)/10 px-3 py-1 text-xs font-medium text-(--admin-primary)">
            <i class="pi pi-check" aria-hidden="true"></i>
            Subscriptions
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
