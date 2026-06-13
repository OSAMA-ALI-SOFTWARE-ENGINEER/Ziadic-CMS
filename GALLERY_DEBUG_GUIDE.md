# Gallery Loading - Complete Debug Guide

## Quick Test (Right Now)

1. **Open DevTools**: Press F12
2. **Go to Listings page**: Admin → Listings
3. **Check Console**:
   - Look for logs like: `"Cached listing 1: Title - mediaFiles: 2"`
   - If you see this, mediaFiles ARE being loaded ✓

4. **Click Edit on any listing**:
   - Check console for: `"Listing prop changed, reloading data: 1"`
   - Then look for: `"Loading listing gallery - mediaFiles: [...]"`
   - If you see `"Found mediaFiles, count: 2"`, gallery should display ✓

5. **Check Gallery Tab**:
   - Step 6 - Gallery should show uploaded images
   - If blank, check console for: `"No gallery data found"`

## What Each Log Means

### ✅ Success Path
```
Cached listing 1: Bursa Modern Art Museum - mediaFiles: 2
  ↓
Click Edit
  ↓
Listing prop changed, reloading data: 1
  ↓
Loading listing gallery - mediaFiles: [{id: 17, ...}]
  ↓
Found mediaFiles, count: 2
  ↓
Gallery loaded, uploadedImages: [...]
  ↓
Gallery displays images in Edit form
```

### ❌ Problem Path 1: mediaFiles Not Cached
```
Cached listing 1: Bursa Modern Art Museum - mediaFiles: 0
  →  PROBLEM: API not returning mediaFiles
  →  FIX: Refresh page, restart server
```

### ❌ Problem Path 2: Prop Not Triggering
```
(No "Listing prop changed" log when clicking Edit)
  →  PROBLEM: Watcher not triggering
  →  FIX: Hard refresh (Ctrl+Shift+R)
```

### ❌ Problem Path 3: No Gallery Data
```
Loading listing gallery - mediaFiles: undefined
  ↓
No gallery data found
  →  PROBLEM: mediaFiles not in listing prop
  →  FIX: Check API response in Network tab
```

## Network Tab Debugging

1. **Open DevTools** → Network tab
2. **Go to Listings page** - watch for GET /listings request
3. **Click the request** → Response tab
4. **Search for "mediaFiles"** in the response
5. **Expected**: See array like `"mediaFiles": [{"id": 17, ...}]`

### If mediaFiles Not in Response
- API is not loading mediaFiles correctly
- Check: Does index() method have mediaFiles in eager load?
- Command: `grep -n "mediaFiles" /path/to/ListingController.php`

## Direct API Test

In browser console, run:
```javascript
// Test what API returns for a specific listing
fetch('/api/v1/admin/listings/1')
  .then(r => r.json())
  .then(d => {
    console.log('Listing 1 mediaFiles:', d.mediaFiles);
    console.log('Gallery count:', d.mediaFiles?.length || 0);
  });
```

**Expected Output**:
```
Listing 1 mediaFiles: Array(2)
  0: {id: 17, file_name: "7.png", public_url: "http://...", ...}
  1: {id: 18, file_name: "8.png", public_url: "http://...", ...}
Gallery count: 2
```

**If mediaFiles is undefined or empty**:
- API not loading relationship
- Check backend logs: `tail -50 admin/storage/logs/laravel.log`

## Database Verification

Run in PHP terminal:
```bash
cd admin && php artisan tinker
```

```php
// Check if listing has gallery images
$l = App\Models\Listing::with('mediaFiles')->find(1);
echo "Gallery count: " . $l->mediaFiles->count();

// Check media_listing table directly
$links = DB::table('media_listing')
  ->where('listing_id', 1)
  ->get();
echo "DB links: " . $links->count();
```

**Expected**: Gallery count > 0, DB links > 0

## Step-by-Step Fix Checklist

If gallery not showing:

- [ ] **Step 1**: Hard refresh browser (Ctrl+Shift+R)
- [ ] **Step 2**: Clear browser cache (DevTools → Application → Clear Data)
- [ ] **Step 3**: Check console logs for debug messages
- [ ] **Step 4**: Verify mediaFiles count in cache logs
- [ ] **Step 5**: Check Network tab for mediaFiles in API response
- [ ] **Step 6**: Test API directly with fetch command above
- [ ] **Step 7**: Verify database has media_listing entries
- [ ] **Step 8**: Check Laravel logs for errors

## Media Library Issues

If Media Library page not showing images:

### Check These:
1. **API Call**:
   ```javascript
   fetch('/api/v1/admin/custom-media')
     .then(r => r.json())
     .then(d => console.log('Media count:', d.data?.length || 0))
   ```

2. **Console Logs** (should see):
   ```
   Media fetched successfully: {count: 8, total: 8, sample: {...}}
   ```

3. **Network Tab**:
   - GET /custom-media request
   - Check Response for "data" array
   - Each media item should have "public_url"

4. **Storage Access**:
   ```bash
   # Check if files exist
   ls -la admin/storage/app/public/uploads/
   
   # Should show uploaded image files
   ```

5. **Permissions**:
   ```bash
   # Fix permissions if needed
   chmod -R 755 admin/storage/app/public/uploads/
   ```

## Common Fixes

### Gallery Still Empty After Edit?
```bash
# 1. Hard refresh
# (Ctrl+Shift+R in browser)

# 2. Clear all caches
cd admin
php artisan cache:clear
php artisan view:clear
php artisan config:clear

# 3. Restart Vite dev server (if running)
npm run dev
```

### Images Show But Broken (404)?
```bash
# 1. Verify files exist
ls admin/storage/app/public/uploads/ | head -5

# 2. Check public symlink
ls -la admin/storage/app/

# Should show: public -> ../../../public/storage
# If missing:
php artisan storage:link
```

### API Returns Error?
```bash
# Check Laravel logs
tail -100 admin/storage/logs/laravel.log | grep -i error

# Search for specific listing
tail -100 admin/storage/logs/laravel.log | grep "listing_id"
```

## Verification Commands

**Is backend returning mediaFiles?**
```bash
curl "http://localhost:8000/api/v1/admin/listings/1" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.mediaFiles | length'
```

**Does media file exist in storage?**
```bash
find admin/storage/app/public/uploads/ -name "*.png" | head -3
```

**Are mediaFiles linked in database?**
```bash
cd admin && sqlite3 database.sqlite "SELECT COUNT(*) FROM media_listing WHERE listing_id=1;"
```

## Success Indicators

✅ **All Good** when you see:
- Console logs show mediaFiles count > 0
- Edit listing → Gallery tab shows images
- Can add/remove images
- Changes save and persist
- Media Library displays all uploaded files
- All image URLs load without 404

## Still Having Issues?

1. **Restart everything**:
   ```bash
   # Stop Vite dev server (Ctrl+C)
   npm run dev  # Restart frontend
   # Laravel server should auto-reload
   ```

2. **Clear all state**:
   - Close browser completely
   - Clear browser cache
   - Open in new window
   - Navigate to admin page fresh

3. **Check error logs**:
   ```bash
   # Real-time log watching
   tail -f admin/storage/logs/laravel.log
   ```

4. **Test in incognito window**:
   - Opens without cached data
   - Shows true current state
   - Helps identify caching issues

## Report Format

If still stuck, provide:
1. Console logs (copy-paste from DevTools)
2. Network tab response (GET /listings)
3. Laravel log errors (tail -50 storage/logs/laravel.log)
4. Database query result (`SELECT COUNT(*) FROM media_listing WHERE listing_id=X`)
