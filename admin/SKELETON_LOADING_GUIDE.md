# Skeleton Loading Implementation Guide

This guide explains how skeleton placeholders have been implemented across the admin dashboard to improve UX with 2-second minimum loading states.

## ✅ Already Implemented

The following modules have complete skeleton loading implementation:

1. **DashboardPage.vue** - Metric cards, chart, and tables
2. **ListingsPage.vue** - Stats cards and listings table
3. **BlogArticlesPage.vue** - Blog articles table
4. **ApprovalsPage.vue** - Pending approvals table

## 📋 Implementation Pattern

### Step 1: Add Imports

```typescript
<script setup lang="ts">
import SkeletonCard from '@/components/SkeletonCard.vue'
import { withMinimumLoadingTime } from '@/utils/loadingHelper'
</script>
```

### Step 2: Update Load Function

```typescript
async function loadData() {
  try {
    loading.value = true

    // Wrap API calls with minimum loading time
    await withMinimumLoadingTime(
      (async () => {
        const response = await api.get('/endpoint')
        // Process data here
        items.value = response.data
      })(),
      2000  // 2-second minimum loading time
    )
  } catch (err) {
    // Error handling
  } finally {
    loading.value = false
  }
}
```

### Step 3: Update Template

For **metric/stat cards**:
```vue
<!-- Show skeleton while loading -->
<section v-if="loading && items.length === 0" class="grid gap-4 grid-cols-3">
  <SkeletonCard type="metric" :count="3" />
</section>

<!-- Show real data when loaded -->
<section v-else class="grid gap-4 grid-cols-3">
  <!-- Your card content here -->
</section>
```

For **tables**:
```vue
<!-- Show skeleton while loading -->
<div v-if="loading && items.length === 0" class="cms-card p-6">
  <SkeletonCard type="table-row" :count="10" />
</div>

<!-- Show real data when loaded -->
<DataTable v-else :rows="items" :columns="columns" />
```

For **charts**:
```vue
<!-- Show skeleton while loading -->
<div v-if="loading && data.length === 0">
  <SkeletonCard type="chart" />
</div>

<!-- Show real chart when loaded -->
<ChartComponent v-else :data="data" />
```

## 🎯 Skeleton Types Available

```typescript
type="metric"    // For stat cards (width: 100%, fixed height)
type="table-row" // For table rows (multiple columns)
type="chart"     // For chart placeholders (bar chart pattern)
type="text"      // For simple text placeholders
```

## ⚙️ Configuration

### Loading Duration
Default: **2000ms** (2 seconds)

To change, update the `withMinimumLoadingTime` call:
```typescript
await withMinimumLoadingTime(promise, 3000)  // 3 seconds
```

### Customize Skeleton Count
```vue
<SkeletonCard type="metric" :count="5" />  <!-- 5 skeleton cards -->
<SkeletonCard type="table-row" :count="15" />  <!-- 15 skeleton rows -->
```

## 📱 Pages Needing Updates

The following pages have a `loading` ref and should be updated:

1. **UsersPage.vue** - Users table
2. **SubmissionsPage.vue** - Submissions table
3. **SubscriptionsPage.vue** - Subscriptions table
4. **CategoriesPage.vue** - Categories table
5. **LocationManagementPage.vue** - Locations table
6. **ActivityLogsPage.vue** - Activity logs
7. **MediaPage.vue** - Media grid
8. **PaymentsPage.vue** - Payments table

## 🔄 Quick Update Commands

To apply the pattern, follow these steps for each page:

### 1. Add Imports (in script setup)
```typescript
import SkeletonCard from '@/components/SkeletonCard.vue'
import { withMinimumLoadingTime } from '@/utils/loadingHelper'
```

### 2. Update Load Function
Wrap data fetching with `withMinimumLoadingTime(..., 2000)`

### 3. Update Template
Wrap content sections with skeleton loading conditionals

## 🎨 Styling Notes

- Skeletons use a smooth pulsing animation
- Colors match the admin theme (gray-200, gray-300)
- Responsive and mobile-friendly
- Matches exact dimensions of real content

## 📊 UX Benefits

✅ Reduces perceived load time
✅ Provides visual feedback to users
✅ Professional appearance
✅ Consistent loading state across app
✅ Smooth transition to real content

## 💡 Best Practices

1. **Use consistent loading timing** - 2 seconds across all pages
2. **Show skeleton for first load** - Only when `items.length === 0 && loading`
3. **Match skeleton to content** - Use correct type for each data structure
4. **Count matters** - Show expected number of skeletons (e.g., 10 for table with 10 rows)

## 🚀 Future Enhancements

- Add skeleton variants for different content types
- Support skeleton animations beyond pulsing
- Add loading progress indicators
- Implement skeleton presets per page type

---

**Note:** All utilities are reusable and can be integrated into any Vue 3 component with a loading state.
