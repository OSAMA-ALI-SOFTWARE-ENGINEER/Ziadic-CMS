# Routes API Prefix Fix - Complete Authentication Fix

## Problem Found & Fixed ✅

### The Issue
The frontend was calling:
- `POST http://localhost:8000/api/v1/auth/login`
- `GET http://localhost:8000/api/v1/admin/settings/branding`

But the Laravel routes were registered as:
- `POST /v1/auth/login` (missing `/api` prefix!)
- `GET /v1/admin/settings/branding` (missing `/api` prefix!)

**Result:** 404 errors → 422 validation error shown instead

### The Fix
Updated `admin/routes/api.php` to add `/api` prefix to all route groups:

```php
// BEFORE (Wrong ❌)
Route::prefix('v1')->group(...)
Route::prefix('v1/auth')->group(...)
Route::prefix('v1/public')->group(...)
Route::prefix('v1/admin')->group(...)

// AFTER (Fixed ✅)
Route::prefix('api/v1')->group(...)
Route::prefix('api/v1/auth')->group(...)
Route::prefix('api/v1/public')->group(...)
Route::prefix('api/v1/admin')->group(...)
```

---

## What This Means

Now the routes are correctly registered as:

| Method | Old Route (❌ Wrong) | New Route (✅ Fixed) |
|--------|---|---|
| POST | `/v1/auth/login` | `/api/v1/auth/login` |
| POST | `/v1/auth/register` | `/api/v1/auth/register` |
| POST | `/v1/auth/logout` | `/api/v1/auth/logout` |
| GET | `/v1/auth/me` | `/api/v1/auth/me` |
| GET | `/v1/admin/settings/{section}` | `/api/v1/admin/settings/{section}` |
| POST | `/v1/admin/settings/{section}` | `/api/v1/admin/settings/{section}` |
| POST | `/v1/admin/upload` | `/api/v1/admin/upload` |

---

## Files Changed

1. **admin/routes/api.php**
   - Changed prefix from `v1` to `api/v1` in 4 places
   - Frontend API calls now match backend routes

---

## Quick Test Steps

### Step 1: Clear Routes Cache
```bash
cd admin
php artisan route:cache
# or
php artisan route:clear
```

### Step 2: Verify Routes Are Registered Correctly
```bash
php artisan route:list | grep auth
```

You should see:
```
POST     api/v1/auth/login
POST     api/v1/auth/register
POST     api/v1/auth/logout (Protected by: Sanctum)
GET      api/v1/auth/me (Protected by: Sanctum)
```

### Step 3: Create a Test User
```bash
php artisan tinker

# Copy & paste:
use App\Models\User;
User::create([
    'name' => 'Admin User',
    'email' => 'admin@example.com',
    'password' => bcrypt('password123'),
    'status' => 'active'
]);

# List users to verify
User::all();

exit
```

### Step 4: Restart Laravel Server
```bash
php artisan serve
```

### Step 5: Restart Vite Dev Server
```bash
cd admin
npm run dev
```

### Step 6: Test Login
1. Open browser: `http://localhost:5173/admin/login`
2. Email: `admin@example.com`
3. Password: `password123`
4. Click "Sign in"

### Step 7: Check DevTools
1. Open DevTools → Network tab
2. Look for the POST request
3. Should see: `POST http://localhost:8000/api/v1/auth/login 200 OK` ✅
4. (Not 404 or 422)

### Step 8: Access Settings
1. If login succeeds, you'll redirect to dashboard
2. Click "Settings" in sidebar
3. Settings should load without 401 errors

---

## Why This Was Failing

### Old Flow (Broken ❌)
```
Frontend calls: POST /api/v1/auth/login
        ↓
Laravel routes: /v1/auth/login (no /api prefix)
        ↓
404 Not Found
        ↓
API interceptor catches 404
        ↓
Frontend falls back to preview auth (hardcoded users)
        ↓
22 error or unexpected behavior
```

### New Flow (Working ✅)
```
Frontend calls: POST /api/v1/auth/login
        ↓
Laravel routes: /api/v1/auth/login (matches!)
        ↓
AuthController::login validates email/password
        ↓
Creates Sanctum token
        ↓
Returns 200 with token
        ↓
Frontend stores token in localStorage
        ↓
All subsequent API calls include Authorization header
        ↓
Admin settings endpoints return 200 (not 401)
```

---

## Complete Setup Checklist

- [ ] Updated routes with `/api` prefix
- [ ] Run `php artisan route:cache`
- [ ] Create test user via Tinker
- [ ] Database migrations are run
- [ ] Restart Laravel: `php artisan serve`
- [ ] Restart Vite: `npm run dev`
- [ ] Clear browser cache (Ctrl+Shift+Del)
- [ ] Open `http://localhost:5173/admin/login`
- [ ] Login with test credentials
- [ ] ✅ Should see dashboard (not login page)
- [ ] Click Settings
- [ ] ✅ Settings should load with data

---

## Troubleshooting

### Still Getting 404?
1. Clear Laravel cache: `php artisan config:cache && php artisan route:cache`
2. Restart server: `php artisan serve`
3. Check routes: `php artisan route:list | grep api/v1`

### Still Getting 422?
1. User doesn't exist in database
2. Password is wrong
3. Email format invalid

**Fix:**
```bash
php artisan tinker
User::create(['name' => 'Test', 'email' => 'test@example.com', 'password' => bcrypt('password'), 'status' => 'active'])
exit
```

### Still Getting 401 on Settings?
1. Token not being sent with request
2. Token expired
3. User doesn't have permission

**Fix:**
1. Ensure you successfully logged in first
2. Check DevTools → Application → Local Storage
3. Look for `cms-token` key with a value
4. If missing, login again

### Routes Show `/v1` Not `/api/v1`?
1. Routes cache is stale
2. Run: `php artisan route:clear`
3. Restart server
4. Check again: `php artisan route:list`

---

## What the AuthController Does

The `AuthController` (at `admin/app/Http/Controllers/Auth/AuthController.php`) has 4 methods:

### 1. `login(Request $request)` — POST `/api/v1/auth/login`
- Validates `email` and `password` are provided
- Finds user by email
- Checks password with `password_verify()`
- Creates Sanctum API token
- Returns user data + token

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "phone": null,
    "status": "active",
    "roles": ["admin"]
  },
  "token": "1|abc123xyz..."
}
```

**Error Response (422):**
```json
{
  "message": "The provided credentials are incorrect.",
  "errors": {
    "email": ["The provided credentials are incorrect."]
  }
}
```

### 2. `logout(Request $request)` — POST `/api/v1/auth/logout` (Protected)
- Revokes current access token
- User can no longer use that token
- Returns success message

### 3. `me(Request $request)` — GET `/api/v1/auth/me` (Protected)
- Returns current authenticated user info
- Useful for checking if token is valid

### 4. `register(Request $request)` — POST `/api/v1/auth/register`
- Creates new user account
- Validates name, email, password
- Assigns "user" role
- Returns user data + token

---

## Database User Model

The `User` model needs these columns (from `users` table):

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Test user:**
```
email: admin@example.com
password: password123 (hashed as bcrypt)
name: Admin User
status: active
```

---

## Architecture Summary

```
Frontend (Vite on port 5173)
    ↓
api.ts Service (auto-detects API URL)
    ↓
POST /api/v1/auth/login (now routes correctly!)
    ↓
Laravel API Server (port 8000)
    ↓
AuthController::login
    ↓
Validate email/password
    ↓
Create Sanctum token
    ↓
Return token to frontend
    ↓
Frontend stores in localStorage
    ↓
All protected routes now work! ✨
```

---

## Next Steps After Login Works

1. ✅ Login with test credentials
2. ✅ Settings page loads
3. 🎨 Upload logos in Branding tab
4. 🎨 Change colors in Theme tab
5. 📝 Edit SEO meta tags
6. 💾 Save all changes (data persists in database)

---

## Summary

✅ **Problem:** Routes had wrong `/api` prefix  
✅ **Solution:** Added `/api` prefix to all 4 route groups  
✅ **Result:** Frontend API calls now match backend routes  
✅ **Status:** 422 errors should now show as real auth validation or successful login

**Ready to test?**
```bash
# 1. Clear route cache
php artisan route:cache

# 2. Create test user
php artisan tinker
# User::create([...])

# 3. Restart server
php artisan serve

# 4. Restart Vite
npm run dev

# 5. Login at http://localhost:5173/admin/login
```

🎉 Authentication should now work!
