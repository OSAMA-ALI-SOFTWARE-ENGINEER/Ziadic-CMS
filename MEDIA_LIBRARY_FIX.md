# Media Library Upload & Fetch Issues - FIX & DEBUGGING

## What Was Fixed

### 1. Better Error Messages
- Upload errors now display in the UI with error message
- Fetch errors now display in the UI with error message
- Console logs show detailed error information

### 2. Better Upload Feedback
- Shows "Uploading..." status while uploading
- Spinner animation during upload
- Success/failure count after batch upload
- Resets file input after upload

### 3. Better Debugging
- Console logs show upload/fetch progress
- Console logs show API responses
- Console logs show file counts
- Error messages help identify root cause

## How to Debug Media Library Issues

### Step 1: Open DevTools
Press **F12** → Go to **Console** tab

### Step 2: Go to Media Library
Admin → Media

### Step 3: Check Initial Load
Look for this log in console:
```
MediaLibrary mounted, fetching media...
Fetching media from /custom-media...
API Response: {data: [...], total: X}
Media fetched successfully: {count: X, total: X}
```

**If you see this**: ✅ Fetch is working
**If you DON'T see this**: ❌ Fetch is broken (see Troubleshooting)

### Step 4: Try Uploading
1. Click upload area or drag files
2. Check console for logs:
   ```
   Uploading file: image.png
   File uploaded successfully: {id: 1, path: "...", ...}
   1 file(s) uploaded successfully
   Fetching media from /custom-media...
   ```

**If you see this**: ✅ Upload is working
**If you see an error message**: ❌ Note the error and see Troubleshooting

## Troubleshooting

### Problem 1: Fetch Error - No Media Loading
**Error in UI**: "Failed to load media"

**Console shows**: 
```
Failed to fetch media: error
```

**Root Causes**:
1. API endpoint wrong
2. Auth token missing
3. API returning wrong format

**Fix**:
```javascript
// Test API directly in console
fetch('/api/v1/admin/custom-media')
  .then(r => r.json())
  .then(d => console.log('API Response:', d))
  .catch(e => console.error('API Error:', e))
```

**Expected Response**:
```json
{
  "data": [{
    "id": 1,
    "file_name": "image.png",
    "public_url": "http://...",
    "file_type": "image"
  }],
  "total": 1
}
```

### Problem 2: Upload Error - Files Not Uploading
**Error in UI**: "Upload Error: ..."

**Console shows**:
```
Failed to upload file image.png: Error...
```

**Common Causes**:

#### A. File Too Large
```
Request failed with status code 422
```
- **Solution**: Use files < 10MB

#### B. Storage Not Writable
```
Call to undefined method ... on null
```
- **Solution**:
```bash
cd admin/storage/app/public
chmod -R 777 .
mkdir -p uploads
```

#### C. Auth Token Missing
```
401 Unauthorized
```
- **Solution**: 
  - Clear browser cache (Ctrl+Shift+Delete)
  - Log out and log back in
  - Refresh page (Ctrl+Shift+R)

#### D. No User Authentication
```
Call to undefined on User model
```
- **Solution**: Ensure you're logged in as admin

### Problem 3: Files Uploaded But Not Showing
**Upload succeeds** but **Media Library still empty**

**Cause**: Fetch runs before upload completes

**Solution**: Already fixed - fetch is called after upload completes

**Test**:
1. Upload a file
2. Wait for success message
3. Check Media Library - should appear

### Problem 4: Storage Directory Missing
**Error**: `Storage path does not exist`

**Fix**:
```bash
cd admin
php artisan storage:link

# Verify
ls -la storage/app/public/uploads/
```

## Testing Checklist

### Test 1: Can Fetch Existing Media
- [ ] Go to Media Library
- [ ] See "Fetching media..." log in console
- [ ] No error messages appear
- [ ] List shows existing uploaded files

### Test 2: Can Upload New Media
- [ ] Click upload or drag file
- [ ] See "Uploading..." status
- [ ] File upload completes
- [ ] See success message in console
- [ ] File appears in media list

### Test 3: Media in Database
- [ ] Uploaded file exists in storage:
  ```bash
  ls -la admin/storage/app/public/uploads/ | head -5
  ```
- [ ] File record exists in database:
  ```bash
  cd admin && php artisan tinker
  $count = App\Models\CustomMedia::count();
  echo $count;  # Should show > 0
  ```

### Test 4: Media in Gallery Form
- [ ] Create/edit listing
- [ ] Go to Gallery tab
- [ ] Click upload
- [ ] Uploaded media should appear
- [ ] Can select media for listing

## Console Debug Commands

### Check API Response Format
```javascript
fetch('/api/v1/admin/custom-media')
  .then(r => r.json())
  .then(d => {
    console.log('Total media:', d.total);
    console.log('Data array:', d.data);
    console.log('Sample:', d.data?.[0]);
  })
```

### Check if Files Exist in Storage
```bash
cd admin/storage/app/public
find . -name "*" -type f | head -10
```

### Check Database
```bash
cd admin && php artisan tinker
$media = App\Models\CustomMedia::orderByDesc('created_at')->first();
echo $media->file_name;
echo $media->public_url;
```

### Check File Permissions
```bash
ls -la admin/storage/app/public/uploads/ | head -5
# Should show -rw-r--r-- permissions
```

## API Endpoints

### Upload File
```
POST /api/v1/admin/upload
Content-Type: multipart/form-data

file: <binary file data>
related_module: "admin-upload"
```

**Success Response** (201):
```json
{
  "id": 1,
  "path": "storage/uploads/filename.png",
  "url": "http://localhost:8000/storage/uploads/filename.png",
  "public_url": "http://localhost:8000/storage/uploads/filename.png",
  "file_name": "filename.png",
  "file_type": "image"
}
```

### Fetch Media List
```
GET /api/v1/admin/custom-media?page=1&per_page=20
```

**Success Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "file_name": "image.png",
      "file_path": "storage/uploads/...",
      "public_url": "http://localhost:8000/storage/uploads/...",
      "file_type": "image",
      "created_at": "2026-06-14T10:00:00Z"
    }
  ],
  "total": 1,
  "per_page": 20,
  "current_page": 1
}
```

## Quick Fixes

### Issue: Nothing Loading
```bash
# 1. Clear caches
cd admin
php artisan cache:clear
php artisan view:clear

# 2. Hard refresh browser
# Ctrl+Shift+R

# 3. Check storage
php artisan storage:link
chmod -R 755 storage/app/public
```

### Issue: Upload Works But Fetch Fails
```javascript
// Check if API endpoint is correct
// Should be /custom-media not /admin/custom-media

// Test:
fetch('/api/v1/admin/custom-media')
  .then(r => console.log('Status:', r.status))
```

### Issue: Permissions Error
```bash
# Fix storage permissions
cd admin
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
```

## Status Indicators

✅ **Everything Working**:
- Console shows successful fetch log
- No error messages in UI
- Can upload files
- Files appear in Media Library

⚠️ **Partial Working**:
- Fetch works but upload fails → Check permissions
- Upload works but fetch fails → Check API endpoint
- List shows but images broken → Check public_url generation

❌ **Nothing Working**:
- Check API is returning data (Network tab)
- Check storage directory exists
- Check auth token is valid
- Check console for specific errors

## Next Steps

1. **Hard refresh**: Ctrl+Shift+R
2. **Check console**: F12 → Console tab
3. **Go to Media**: Admin → Media
4. **Look for logs**: Should see fetch/upload logs
5. **Test upload**: Upload a small image
6. **Check errors**: See if error message appears

If you see an **error message in the UI**, copy it and let me know!
If you see **console logs**, share what you see!

## Summary of Changes

| Component | Change | Purpose |
|-----------|--------|---------|
| MediaLibrary.vue | Added error state vars | Track and display errors |
| MediaLibrary.vue | Improved onUpload() | Better error handling, logging |
| MediaLibrary.vue | Improved fetchMedia() | Better error handling, logging |
| MediaLibrary.vue | Added error UI | Show errors to user |
| MediaLibrary.vue | Added upload feedback | Show "Uploading..." status |

The Media Library now provides **clear error messages** to help you identify and fix issues!
