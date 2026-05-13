<script setup lang="ts">
import StatusBadge from '@/components/StatusBadge.vue'

const payments = [
  { ref: 'PAY-1001', customer: 'Client Account', plan: 'Premium', amount: '$49.00', status: 'Paid', tone: 'success' as const },
  { ref: 'PAY-1002', customer: 'Business Owner', plan: 'Business', amount: '$99.00', status: 'Pending', tone: 'warning' as const },
  { ref: 'PAY-1003', customer: 'Client Account', plan: 'Free', amount: '$0.00', status: 'Cancelled', tone: 'neutral' as const },
]
</script>

<template>
  <section class="cms-card overflow-hidden">
    <div class="border-b border-[var(--admin-border)] px-5 py-4">
      <h2 class="m-0 text-base font-semibold">Payments</h2>
      <p class="m-0 mt-1 text-sm text-[var(--admin-muted)]">Transactions for listing plans and future subscriptions.</p>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full min-w-[680px] text-left text-sm">
        <thead class="bg-[var(--admin-table-head)] text-xs uppercase text-[var(--admin-muted)]">
          <tr>
            <th class="px-5 py-3">Reference</th>
            <th class="px-5 py-3">Customer</th>
            <th class="px-5 py-3">Plan</th>
            <th class="px-5 py-3">Amount</th>
            <th class="px-5 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in payments" :key="payment.ref" class="border-t border-[var(--admin-border)]">
            <td class="px-5 py-4 font-medium">{{ payment.ref }}</td>
            <td class="px-5 py-4 text-[var(--admin-muted)]">{{ payment.customer }}</td>
            <td class="px-5 py-4 text-[var(--admin-muted)]">{{ payment.plan }}</td>
            <td class="px-5 py-4 font-medium">{{ payment.amount }}</td>
            <td class="px-5 py-4"><StatusBadge :label="payment.status" :tone="payment.tone" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
