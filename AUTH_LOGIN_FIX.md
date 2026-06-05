# Authentication & Login Fix

## Issues
1. ❌ **422 Unprocessable Content on login** - Validation failing
2. ❌ **401 Unauthorized on settings** - Not authenticated
3. ❌ **Cannot access settings page**

## Root Causes
- Database hasn't been migrated properly
- No test users exist in database
- Login credentials not provided or invalid format

---

## Step-by-Step Fix

### Step 1: Run All Migrations
```bash
php artisan migrate:fresh
```

**WARNING:** This clears the database! Only use in development.

### Step 2: Seed Test User (Optional)
```bash
php artisan db:seed
```

Or manually create a user via Tinker:
```bash
php artisan tinker
```

Then in Tinker:
```php
use App\Models\User;

User::create([
    'name' => 'Admin User',
    'email' => 'admin@example.com',
    'password' => bcrypt('password123'),
    'email_verified_at' => now(),
]);

exit;
```

### Step 3: Restart Laravel Server
```bash
php artisan serve
```

### Step 4: Test Login
1. Go to `http://localhost:5173/admin/login`
2. Email: `admin@example.com`
3. Password: `password123`
4. Click **Sign in**

### Step 5: Access Settings
1. You should be redirected to dashboard
2. Click **Settings** in sidebar
3. ✅ Settings page should load without 401 errors

---

## Expected Flow

```
Login Page
    ↓ (POST /api/v1/auth/login with email + password)
Database (check user exists, verify password)
    ↓
Token generated (Sanctum)
    ↓
Dashboard (authenticated)
    ↓ (Click Settings)
GET /api/v1/admin/settings/branding (with token)
    ↓
Settings loaded ✨
```

---

## Troubleshooting

### Still Getting 422 on Login?
**Cause:** Invalid email/password format or user doesn't exist

**Fix:**
```bash
# Check if users table exists
php artisan tinker
> DB::table('users')->get()

# If empty, create a user
> use App\Models\User;
> User::create(['name' => 'Admin', 'email' => 'admin@test.com', 'password' => bcrypt('password'), 'email_verified_at' => now()])
> exit
```

### Still Getting 401 on Settings?
**Cause:** Token not being sent or token expired

**Fix:**
1. Check browser DevTools → Application → Cookies
2. Look for `XSRF-TOKEN` or `sanctum_session`
3. If missing, login again
4. Check Laravel logs: `tail -f storage/logs/laravel.log`

### Database Migration Errors?
**Cause:** Migration files not run or schema issues

**Fix:**
```bash
# Check migration status
php artisan migrate:status

# If issues, reset and migrate fresh
php artisan migrate:fresh --seed

# Verify tables created
php artisan tinker
> DB::table('admin_settings')->count()
```

---

## Database Check

Verify these tables exist:
```bash
php artisan tinker

> DB::table('users')->get()
> DB::table('admin_settings')->get()
> exit
```

Should return:
```
=> Illuminate\Support\Collection {#123
     all: [
       {#124
         +"id": 1,
         +"name": "Admin User",
         +"email": "admin@example.com",
         ...
       },
     ],
   }
```

---

## Login Test Credentials

After running the setup steps above, use:
- **Email:** `admin@example.com`
- **Password:** `password123`

Or replace with your own:
```bash
php artisan tinker
> use App\Models\User;
> User::create(['name' => 'Your Name', 'email' => 'your@email.com', 'password' => bcrypt('yourpassword'), 'email_verified_at' => now()])
```

---

## Complete Setup Checklist

- [ ] Run `php artisan migrate:fresh`
- [ ] Create test user (Tinker or Seeder)
- [ ] Restart Laravel server (`php artisan serve`)
- [ ] Clear browser cache (Ctrl+Shift+Del)
- [ ] Go to `http://localhost:5173/admin/login`
- [ ] Login with credentials
- [ ] Click Settings
- [ ] ✅ Settings page loads without errors

---

## What's Happening Now vs What Should Happen

### Now (❌ Broken)
```
Click Settings
    ↓
No token (not logged in)
    ↓
GET /api/v1/admin/settings/branding (no token)
    ↓
401 Unauthorized
    ↓
Redirect to login
```

### After Fix (✅ Working)
```
Login successful (token created)
    ↓
Click Settings
    ↓
GET /api/v1/admin/settings/branding (with token)
    ↓
200 OK (returns settings or empty if first time)
    ↓
Settings page renders with forms
    ↓
Upload logo → Works!
```

---

## Laravel Auth Architecture

The app uses **Laravel Sanctum** for API authentication:

1. **Login** → POST `/api/v1/auth/login`
   - Validates email/password
   - Creates token in `personal_access_tokens` table
   - Returns token to frontend

2. **Protected Routes** → Protected by `auth:sanctum` middleware
   - Frontend sends token in `Authorization: Bearer {token}` header
   - Middleware validates token
   - Request allowed if valid

3. **Settings Routes** → `POST/GET /api/v1/admin/settings/*`
   - Protected by `auth:sanctum` middleware
   - Require valid token

---

## If You Still Have Issues

1. **Check Laravel logs:**
   ```bash
   tail -50 storage/logs/laravel.log
   ```

2. **Check database directly:**
   ```bash
   php artisan tinker
   > DB::table('users')->pluck('email')
   > exit
   ```

3. **Check Sanctum tokens:**
   ```bash
   php artisan tinker
   > DB::table('personal_access_tokens')->get()
   > exit
   ```

4. **Check if migration ran:**
   ```bash
   php artisan migrate:status
   ```

---

**Ready to try?** Run the 3 commands in Step 1-3 above! 🚀
