# Submission Listing - Diagnostic Guide

**Purpose**: Identify and fix the actual issue causing the submissions page to fail

---

## Step-by-Step Troubleshooting

### 1. **Check Backend is Running**
```bash
# Terminal 1
cd C:\laragon\www\Ziadic\admin
php artisan serve --host=127.0.0.1 --port=8000
```

**Verify**: http://127.0.0.1:8000/api/v1/health should show `{"status":"ok"}`

---

### 2. **Check Frontend is Running**
```bash
# Terminal 2
cd C:\laragon\www\Ziadic\admin
npm run dev
```

**Verify**: Browser shows admin UI running on `http://127.0.0.1:5175`

---

### 3. **Login to Admin**
```
URL: http://127.0.0.1:5175/admin/login
Email: admin@kukaqka.com
Password: password
```

**Verify**: You're logged in and can see dashboard

---

### 4. **Click "Submitted Listings"**
- Look at the page - does it load or show spinner?
- Open **Browser DevTools** (F12)
- Go to **Console** tab

---

### 5. **Check Console Error Messages**

**Look for red error messages like:**
```
Failed to load submissions (401)
Failed to load submissions (404)
Failed to load submissions (500)
```

---

## Error Code Reference

| Code | Meaning | Solution |
|------|---------|----------|
| **401** | Unauthorized - Not authenticated | Login again, clear cookies |
| **403** | Forbidden - No permission | Check user role/permissions |
| **404** | Not found - Route doesn't exist | Verify routes: `php artisan route:list` |
| **405** | Method not allowed | Check HTTP verb (PATCH vs POST) |
| **500** | Server error | Check Laravel logs: `storage/logs/laravel.log` |

---

## Advanced Debugging

### A. Check Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Click "Submitted Listings"
4. Look for `/api/v1/admin/submissions` request
5. Click it and check:
   - **Status**: Should be 200
   - **Response**: Should show JSON with submissions data
   - **Headers**: Should include authorization cookie

---

### B. Check Browser Console
```javascript
// Paste into console and press Enter:
axios.get('/api/v1/admin/submissions')
  .then(r => console.log('SUCCESS:', r.data))
  .catch(e => console.log('ERROR:', e.response?.status, e.response?.data))
```

**What you should see:**
- SUCCESS: Array of submissions
- ERROR: Status code and error message

---

### C. Check Laravel Logs
```bash
cd C:\laragon\www\Ziadic\admin
tail -f storage/logs/laravel.log
```

Look for entries like:
```
[ERROR] POST /api/v1/admin/submissions ...
```

---

### D. Test API Directly
```bash
# In Terminal 3, test with curl:

# 1. Get CSRF token
curl -X GET http://127.0.0.1:8000/sanctum/csrf-cookie -c cookies.txt

# 2. Login
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kukaqka.com","password":"password"}' \
  -b cookies.txt -c cookies.txt

# 3. Get submissions (look for token in login response)
curl -X GET http://127.0.0.1:8000/api/v1/admin/submissions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -b cookies.txt
```

---

## Common Issues & Fixes

### Issue #1: 401 Unauthorized
**Symptom**: Error says "401" or "Unauthorized"

**Causes**:
- Not logged in
- Session expired
- Cookie not set

**Fixes**:
1. Clear browser cookies: DevTools → Application → Clear cookies
2. Logout and login again
3. Try incognito window

---

### Issue #2: 404 Not Found
**Symptom**: Error says "404" or "Route not found"

**Causes**:
- Routes not registered
- Wrong endpoint URL

**Fixes**:
```bash
# Check if routes exist:
php artisan route:list | grep submissions

# Should show:
GET|HEAD   /api/v1/admin/submissions
PATCH      /api/v1/admin/submissions/{id}/approve
PATCH      /api/v1/admin/submissions/{id}/reject
DELETE     /api/v1/admin/submissions/{id}
```

If not showing, run:
```bash
php artisan route:clear
php artisan route:cache
```

---

### Issue #3: 405 Method Not Allowed
**Symptom**: Error says "405" or "Method Not Allowed"

**Cause**: Wrong HTTP verb (POST instead of PATCH)

**Fix**: Verify in `admin/routes/api.php`:
```php
// Should be PATCH, not POST:
Route::patch('submissions/{id}/approve', ...);
Route::patch('submissions/{id}/reject', ...);
Route::patch('submissions/{id}/publish', ...);
```

---

### Issue #4: 500 Internal Server Error
**Symptom**: Error says "500" or blank page

**Causes**:
- Database not migrated
- Missing model/controller
- Syntax error

**Fixes**:
1. Check migrations: `php artisan migrate:status`
2. Run migrations: `php artisan migrate`
3. Check logs: `tail storage/logs/laravel.log`
4. Check syntax: `php -l admin/routes/api.php`

---

### Issue #5: No Data Displaying
**Symptom**: Page loads but shows "No records found" or blank table

**Causes**:
- No submissions in database
- API returning empty array

**Fix**:
1. Click "Seed 10" button in admin UI to create test data
2. Or run: `curl -X POST http://127.0.0.1:8000/api/debug/submissions/seed?count=10`
3. Refresh page

---

## What Success Looks Like

✅ **All these checks pass**:

```
[✅] Backend running on port 8000
[✅] Frontend running on port 5175
[✅] Can login successfully
[✅] Click "Submitted Listings" → page loads in 1-2 seconds
[✅] DataTable shows submissions (or empty state if no data)
[✅] No red error messages in console
[✅] Network tab shows /api/v1/admin/submissions returning 200
[✅] Approve button works → status changes
[✅] Reject button works → shows modal
[✅] Delete button works → shows confirmation
[✅] Toast notifications appear
```

---

## Still Having Issues?

**Collect this info:**
1. Screenshot of error message
2. Browser console error (right-click → Inspect → Console)
3. Network request details (DevTools → Network → click failing request)
4. Laravel log excerpt: `tail -100 storage/logs/laravel.log`
5. Output of: `php artisan route:list | grep submissions`

---

## Quick Reset
If everything seems broken:

```bash
# 1. Stop servers (Ctrl+C in terminals)

# 2. Clear caches
cd C:\laragon\www\Ziadic\admin
php artisan cache:clear
php artisan route:clear
php artisan config:clear

# 3. Reinstall dependencies
composer install
npm install

# 4. Migrate fresh (WARNING: deletes data)
php artisan migrate:fresh --seed

# 5. Start servers again
php artisan serve --host=127.0.0.1 --port=8000
cd ../admin
npm run dev
```

---

**Last Updated**: 2026-06-12
**Updated Sections**: Error logging with actual error details
