# File Upload Authentication Fix

## Problem
When uploading images in Settings → Branding tab, the user was getting auto-logged out. This was caused by incorrect Content-Type header handling in the file upload request.

## Root Cause
The upload service was explicitly setting `Content-Type: multipart/form-data` without the boundary parameter, which broke the request and caused authentication to fail.

## Solution
### Frontend Fix (services/upload.ts)
✅ **Removed explicit Content-Type header** - Let axios set it automatically with proper boundary
✅ **Added 401 error handling** - Now properly detects and handles authentication errors

### Backend Fix (UploadController.php)
✅ **Improved validation** - Better error messages
✅ **Added file checks** - Validates file actually exists and is valid
✅ **Error logging** - Logs issues to Laravel logs for debugging
✅ **Proper HTTP status codes** - 400, 422, 500 for different errors

## What Changed

### Before (Broken)
```typescript
const response = await api.post('/admin/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data', // ❌ Missing boundary!
  },
})
```

### After (Fixed)
```typescript
const response = await api.post('/admin/upload', formData)
// ✅ Axios automatically sets correct multipart header with boundary
```

## How to Test

### Step 1: Ensure Migration is Run
```bash
php artisan migrate
```

### Step 2: Create Storage Link
```bash
php artisan storage:link
```

### Step 3: Restart Laravel Server
```bash
php artisan serve
```

### Step 4: Test Upload in Browser
1. Go to `http://localhost:5173/admin/settings`
2. Click on **Branding** tab
3. Click **"browse"** on Main Logo
4. Select an image file (PNG or JPG)
5. ✅ Image should upload and show preview instantly
6. Click **"Save Changes"**
7. ✅ Should show success message (no logout!)
8. Refresh page
9. ✅ Logo should still be there!

### Step 5: Test with cURL (Optional)
```bash
# Get your auth token first from browser DevTools or login endpoint
TOKEN="your_auth_token_here"

curl -X POST http://localhost:8000/api/v1/admin/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/image.png" \
  -F "category=logo"
```

Expected response:
```json
{
  "url": "/storage/media/2026-06-03/logo-abc123.png",
  "filename": "logo-abc123.png",
  "size": 45678,
  "mime_type": "image/png",
  "path": "media/2026-06-03/logo-abc123.png"
}
```

## Why This Works

### Authentication Flow
```
1. Frontend sends request with FormData
2. Axios interceptor adds Authorization header automatically
3. Laravel middleware checks token (auth:sanctum)
4. Token is valid → Request proceeds
5. File uploaded successfully
6. Response returned with image URL
7. Frontend displays preview
```

### Content-Type Flow (Fixed)
```
Before ❌:
FormData + explicit Content-Type: multipart/form-data
→ Missing boundary parameter
→ Server can't parse multipart data
→ 422 or 500 error
→ Frontend thinks auth failed
→ Logout triggered

After ✅:
FormData + no explicit header
→ Axios sets: Content-Type: multipart/form-data; boundary=---xyz123
→ Server parses correctly
→ File uploads successfully
→ 201 response with URL
→ No logout!
```

## Key Fixes

| Issue | Fix | Result |
|-------|-----|--------|
| Auto-logout on upload | Removed explicit Content-Type header | ✅ Upload works, user stays logged in |
| 401 errors hidden | Added explicit 401 handling | ✅ Clear error message if auth fails |
| Server errors unclear | Added error logging | ✅ Backend logs show what went wrong |
| Validation errors | Improved validation messages | ✅ Clear feedback on invalid files |

## Troubleshooting

### Still Getting 401/Auto-logout?
1. **Check token validity:**
   - Open DevTools → Application → Cookies
   - Look for `XSRF-TOKEN` and session cookie
   - If missing, log out and log back in

2. **Check Laravel logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

3. **Test with cURL:**
   ```bash
   curl -X POST http://localhost:8000/api/v1/admin/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@image.png"
   ```

### File Upload Returns 500?
1. **Check permissions:**
   ```bash
   chmod -R 775 storage/
   chmod -R 775 bootstrap/cache/
   ```

2. **Check disk space:**
   ```bash
   df -h
   ```

3. **Check logs:**
   ```bash
   tail -50 storage/logs/laravel.log
   ```

### File Uploads but Returns 404?
1. **Verify storage link:**
   ```bash
   php artisan storage:link
   ```

2. **Check file exists:**
   ```bash
   ls -la storage/app/public/media/
   ```

## Files Modified

| File | Changes |
|------|---------|
| `src/services/upload.ts` | Removed explicit Content-Type header, added 401 handling |
| `app/Http/Controllers/Admin/UploadController.php` | Improved validation, error logging, status codes |

## Testing Checklist

- [ ] Run `php artisan migrate`
- [ ] Run `php artisan storage:link`
- [ ] Restart Laravel server
- [ ] Upload image in Settings → Branding
- [ ] Verify image shows in preview
- [ ] Click "Save Changes" - no logout
- [ ] Refresh page - logo persists
- [ ] Check `/storage/media/` directory for files
- [ ] Check database `admin_settings` table for branding data
- [ ] Test with different image formats (PNG, JPG, GIF)
- [ ] Test oversized file (>5MB) - should show error

## Success Indicators

✅ Image uploads without logout  
✅ Preview appears instantly  
✅ "Save Changes" button works  
✅ Data persists after refresh  
✅ Files stored in `storage/app/public/media/`  
✅ Data stored in `admin_settings` table  
✅ No errors in browser console  
✅ No errors in Laravel logs  

## Summary

**The issue was:** Explicit Content-Type header broke multipart form-data parsing
**The fix was:** Let axios set the header automatically with boundary parameter
**The result:** File uploads work, authentication stays valid, user doesn't get logged out

---

**Ready to test?** Follow the test steps above! 🚀
