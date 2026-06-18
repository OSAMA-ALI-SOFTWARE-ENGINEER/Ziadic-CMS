# Payments Integration Guide

## Overview

The Payments page is now **conditional** - it displays a "Coming Soon" banner until enabled via System Settings. This guide shows you how to implement the backend integration.

---

## How It Works

1. **Payments Page** checks: `GET /api/v1/admin/settings/payments-enabled`
2. If `enabled: true` → Shows full payment interface
3. If `enabled: false` (or endpoint missing) → Shows "Coming Soon" banner
4. User instructions: Go to **Settings → System Settings** to enable

---

## Implementation Steps

### Step 1: Add Database Field

Add a settings column to track payment module status:

```php
// In a migration file: create_settings_table.php (if not exists)
Schema::create('settings', function (Blueprint $table) {
    $table->id();
    $table->string('key')->unique(); // 'payments_enabled'
    $table->text('value')->nullable(); // 'true' or 'false'
    $table->timestamps();
});

// Or add to existing settings
Schema::table('settings', function (Blueprint $table) {
    $table->string('payments_enabled')->default('false')->after('some_field');
});
```

### Step 2: Create Settings Controller Endpoint

```php
// admin/app/Http/Controllers/Admin/SettingsController.php

<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class SettingsController extends Controller
{
    /**
     * Check if payments module is enabled
     */
    public function paymentsEnabled()
    {
        try {
            $setting = DB::table('settings')
                ->where('key', 'payments_enabled')
                ->first();
            
            return response()->json([
                'enabled' => $setting ? $setting->value === 'true' : false,
                'key' => 'payments_enabled'
            ]);
        } catch (\Exception $e) {
            return response()->json(['enabled' => false], 200);
        }
    }

    /**
     * Update settings
     */
    public function updateSetting(Request $request, $key)
    {
        $validated = $request->validate([
            'value' => 'required|string'
        ]);

        DB::table('settings')->updateOrInsert(
            ['key' => $key],
            ['value' => $validated['value'], 'updated_at' => now()]
        );

        return response()->json([
            'message' => 'Setting updated successfully',
            'key' => $key,
            'value' => $validated['value']
        ]);
    }
}
```

### Step 3: Add API Route

```php
// admin/routes/api.php

Route::prefix('admin')->group(function () {
    Route::get('settings/payments-enabled', [SettingsController::class, 'paymentsEnabled']);
    Route::post('settings/{key}', [SettingsController::class, 'updateSetting']);
});
```

### Step 4: Update System Settings Page

Add toggle switch to the System Settings tab in `admin/src/pages/SettingsPage.vue`:

```vue
<!-- In System Settings section -->
<div class="settings-group">
  <div class="setting-item">
    <div class="setting-label">
      <h3>Payment Integration</h3>
      <p>Enable payment processing and transaction management</p>
    </div>
    <div class="setting-control">
      <label class="toggle-switch">
        <input
          v-model="settings.paymentsEnabled"
          type="checkbox"
          @change="savePaymentsSetting"
        />
        <span class="toggle-slider"></span>
      </label>
      <span class="status-text">
        {{ settings.paymentsEnabled ? 'Enabled' : 'Disabled' }}
      </span>
    </div>
  </div>
</div>
```

### Step 5: Add Handler in Settings Script

```typescript
// In SettingsPage.vue <script setup>

import { ref, onMounted } from 'vue'
import axios from 'axios'

const settings = ref({
  paymentsEnabled: false
})

const apiBase = () => {
  // your API base function
}

async function loadPaymentsSetting() {
  try {
    const response = await axios.get(`${apiBase()}/api/v1/admin/settings/payments-enabled`)
    settings.value.paymentsEnabled = response.data.enabled
  } catch (error) {
    console.error('Failed to load payments setting:', error)
    settings.value.paymentsEnabled = false
  }
}

async function savePaymentsSetting() {
  try {
    await axios.post(`${apiBase()}/api/v1/admin/settings/payments_enabled`, {
      value: settings.value.paymentsEnabled ? 'true' : 'false'
    })
    console.log('Payments setting saved')
  } catch (error) {
    console.error('Failed to save payments setting:', error)
  }
}

onMounted(() => {
  loadPaymentsSetting()
})
```

---

## Testing

### Test 1: Coming Soon Banner
- Leave the endpoint returning `enabled: false`
- Navigate to Payments page
- Should see beautiful "Coming Soon" banner ✅

### Test 2: Enable Payments
- In System Settings, enable "Payment Integration"
- Navigate to Payments page
- Should see stats cards and payment table ✅

### Test 3: Disable Payments
- In System Settings, disable "Payment Integration"
- Navigate to Payments page
- Should show "Coming Soon" banner again ✅

---

## Database Seed (Optional)

For testing, add this to your seeders:

```php
// database/seeders/SettingsSeeder.php

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('settings')->insertOrIgnore([
            [
                'key' => 'payments_enabled',
                'value' => 'false', // Set to 'true' to enable by default
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
```

---

## Future Implementation

When ready to implement actual payments:

1. Create `PaymentTransaction` model
2. Implement payment gateway integration (Stripe, PayPal, etc.)
3. Create endpoints:
   - `GET /api/v1/admin/payments` - List transactions
   - `POST /api/v1/admin/payments/{id}/refund` - Process refund
   - `POST /api/v1/admin/payments/export` - Export CSV

4. Update PaymentPage.vue to use real data instead of mock data

---

## Key Points

✅ **Graceful Fallback**: If endpoint doesn't exist, defaults to disabled
✅ **User-Friendly**: Clear instructions on how to enable
✅ **Clean UI**: Beautiful coming soon banner
✅ **Responsive**: Works on all device sizes
✅ **No Breaking Changes**: Existing functionality preserved

---

## Toggle CSS (Optional Styling)

For the toggle switch in System Settings:

```css
.toggle-switch {
  display: inline-block;
  position: relative;
  width: 50px;
  height: 26px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 26px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #3b82f6;
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}
```

---

**Questions?** Check the PaymentsPage.vue code for the exact implementation pattern.
