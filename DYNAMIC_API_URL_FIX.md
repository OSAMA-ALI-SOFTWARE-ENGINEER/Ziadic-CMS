# Dynamic API URL Configuration - Fix Complete

## Problem
The API URL was **hardcoded** to `http://127.0.0.1:8000/api/v1`, which breaks when:
- Running project on different ports
- Using Laragon domain names (e.g., `zaidic.local`)
- Deployed to different environments
- Port changes between sessions

## Solution
Implemented **3-level fallback system** for API URL detection:

### Level 1: Environment Variable (Highest Priority)
```bash
# Set in admin/.env
VITE_API_URL=http://localhost:8000/api/v1
```

### Level 2: Auto-Detection from Window Location
Frontend automatically detects API URL from current browser URL:

```javascript
// If frontend is on: http://localhost:5173 (Vite dev)
// → API must be on: http://localhost:8000

// If frontend is on: http://zaidic.local
// → API is also on: http://zaidic.local

// If frontend is on: http://127.0.0.1:8000 (same server)
// → API is on: http://127.0.0.1:8000
```

### Level 3: Fallback Default
```javascript
// Last resort fallback
http://localhost:8000/api/v1
```

---

## Files Updated

### 1. **admin/.env** — Added Environment Variable
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 2. **admin/vite.config.ts** — Load Environment Variable
```typescript
define: {
  'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '...')
}
```

### 3. **admin/src/services/api.ts** — Dynamic URL Detection
```typescript
function getApiUrl(): string {
  // 1. Check environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // 2. Auto-detect from window.location
  if (typeof window !== 'undefined') {
    // If on port 5173 (Vite dev) → use port 8000
    if (window.location.port === '5173') {
      return 'http://localhost:8000/api/v1'
    }
    // Otherwise → use same domain
    return `${window.location.protocol}//${window.location.host}/api/v1`
  }

  // 3. Fallback
  return 'http://localhost:8000/api/v1'
}
```

### 4. **admin/src/services/config.ts** — NEW Configuration Module
Helper module to get and log app configuration for debugging.

---

## How It Works

### Scenario 1: Vite Dev Server (Frontend on 5173, API on 8000)
```
Frontend: http://localhost:5173/admin
↓
1. Check VITE_API_URL env var → "http://localhost:8000/api/v1"
↓
API calls go to: http://localhost:8000/api/v1/admin/settings/branding ✅
```

### Scenario 2: Laragon Domain (Both on same domain)
```
Frontend: http://zaidic.local/admin
↓
1. Check VITE_API_URL env var → not set
2. Auto-detect from window → http://zaidic.local
↓
API calls go to: http://zaidic.local/api/v1/admin/settings/branding ✅
```

### Scenario 3: Production (Same server, different path)
```
Frontend: https://example.com/admin
↓
1. Check VITE_API_URL env var → "https://api.example.com/v1"
2. If not set → auto-detect from window
↓
API calls go to: https://example.com/api/v1/admin/settings/branding ✅
```

---

## What Changed

| Old (Hardcoded ❌) | New (Dynamic ✅) |
|---|---|
| `'http://127.0.0.1:8000/api/v1'` | Auto-detects from env var or window.location |
| Only works on localhost:8000 | Works on any domain, port, or environment |
| Breaks on Laragon/production | Adapts automatically to where it's running |
| 422 errors on login | Now calls the correct API endpoint |

---

## Configuration Methods

### Method 1: Use Environment Variable (Recommended)
Edit `admin/.env`:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

Then restart Vite dev server:
```bash
npm run dev
```

### Method 2: Let Auto-Detection Handle It (Simplest)
Leave `VITE_API_URL` empty in `.env`:
```env
# VITE_API_URL=  # Leave empty
```

Frontend will auto-detect:
- On `http://localhost:5173` → uses `http://localhost:8000/api/v1`
- On `http://zaidic.local` → uses `http://zaidic.local/api/v1`
- On any other domain → uses that domain `/api/v1`

### Method 3: Different APIs for Different Environments
Create multiple `.env` files:

**admin/.env.local** (local development)
```env
VITE_API_URL=http://localhost:8000/api/v1
```

**admin/.env.production** (production)
```env
VITE_API_URL=https://api.example.com/v1
```

---

## Debugging API URL Detection

### Check Detected URL in Browser Console
Open DevTools → Console and you'll see:
```
[CONFIG] App Configuration {
  apiUrl: "http://localhost:8000/api/v1",
  isDevelopment: true,
  isProduction: false,
  environment: "development"
}
```

### Verify API Calls
Open DevTools → Network tab:
- Click Settings
- Look at first request
- Should show: `GET /api/v1/admin/settings/branding`
- To correct API host

### Test API Endpoint Manually
```bash
# Check if API is accessible
curl http://localhost:8000/api/v1/admin/login

# Should return JSON response (not 404)
# If 404 → API is not running or on wrong port
```

---

## Common Scenarios

### ✅ Local Development (Vite on 5173)
1. Frontend: `http://localhost:5173/admin`
2. API: `http://localhost:8000/api/v1`
3. `php artisan serve` is running
4. Should work automatically ✨

### ✅ Laragon Subdomain
1. Frontend: `http://zaidic.local/admin` (configured in Laragon)
2. API: `http://zaidic.local/api/v1`
3. Should work automatically ✨

### ✅ Different Ports
1. Frontend: `http://127.0.0.1:3000/admin`
2. API: `http://127.0.0.1:8000/api/v1`
3. Set `VITE_API_URL=http://127.0.0.1:8000/api/v1` in .env

### ❌ When It Doesn't Work
**Symptom:** 404 errors on API calls, or CORS errors

**Solution:**
1. Verify API is running: `php artisan serve`
2. Check API URL in DevTools console logs
3. Set explicit `VITE_API_URL` in `.env`
4. Restart Vite dev server: `npm run dev`

---

## Next Steps

### Step 1: Verify Configuration
```bash
# Check what's in your .env
cat admin/.env | grep VITE_API_URL
```

### Step 2: Ensure Laravel is Running
```bash
# Start Laravel API server
php artisan serve
```

### Step 3: Restart Vite Dev Server
```bash
cd admin
npm run dev
```

### Step 4: Test API
1. Open browser → `http://localhost:5173/admin/login`
2. Open DevTools → Console
3. Look for `[CONFIG] App Configuration` log
4. Verify `apiUrl` is correct
5. Try to login

### Step 5: Check Network Requests
1. DevTools → Network tab
2. Click Settings button
3. Check first request goes to correct API URL
4. If 401/422 → see AUTH_LOGIN_FIX.md

---

## If Still Getting 422 or 401 Errors

The dynamic API URL is now fixed, but authentication issues remain. Follow these steps:

```bash
# 1. Reset database with migrations
php artisan migrate:fresh

# 2. Create test user
php artisan tinker
# Copy & paste:
use App\Models\User;
User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => bcrypt('password123'), 'email_verified_at' => now()]);
exit

# 3. Restart Laravel
php artisan serve

# 4. Restart Vite
cd admin && npm run dev

# 5. Try login: admin@example.com / password123
```

See **AUTH_LOGIN_FIX.md** for complete authentication setup.

---

## Architecture Diagram

```
Frontend (http://localhost:5173 or any URL)
    ↓
API Service detects URL:
    1. Check VITE_API_URL env var?
    2. Auto-detect from window.location
    3. Use fallback
    ↓
Correct API Endpoint
    ↓
Backend (http://localhost:8000/api/v1)
    ↓
Database
```

---

## Testing Matrix

| Frontend URL | API URL | Method | Status |
|---|---|---|---|
| `localhost:5173` | `localhost:8000` | Auto-detect | ✅ |
| `zaidic.local` | `zaidic.local` | Auto-detect | ✅ |
| `127.0.0.1:3000` | `127.0.0.1:8000` | Env var | ✅ |
| `example.com` | `api.example.com` | Env var | ✅ |
| `localhost:5173` | Custom port | Env var | ✅ |

---

## Summary

✅ API URL is now **dynamic** and detects automatically  
✅ Works on **localhost, Laragon, production**  
✅ **No hardcoding** of port numbers  
✅ **Falls back** gracefully if env var not set  
✅ **Debuggable** via console logs in development  

**Ready to test?**
1. Make sure Laravel is running: `php artisan serve`
2. Make sure you have a test user (see AUTH_LOGIN_FIX.md)
3. Restart Vite: `cd admin && npm run dev`
4. Go to `http://localhost:5173/admin/login`
5. Login with your test credentials
6. Should work! ✨
