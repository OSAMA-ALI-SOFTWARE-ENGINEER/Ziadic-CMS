# Quick Testing Guide - Media Library & Gallery Fix

## Step 1: Verify Media Library API
Open browser console (F12) and test:
```javascript
// Check if media API returns correct data
fetch('/api/v1/admin/custom-media?per_page=5')
  .then(r => r.json())
  .then(data => {
    console.log('Media count:', data.data.length);
    console.log('Sample media:', data.data[0]);
    console.log('Public URL:', data.data[0].public_url);
  });
```

**Expected**: 
- Should see 8+ media records
- Each should have `public_url` field
- URL should be like: `http://localhost:8000/storage/uploads/...`

## Step 2: Test Media Library Display
1. Go to Admin CMS → Media
2. Check the Media Library page displays images
3. Click copy URL button - should copy the public_url
4. Click open link - should open image in new tab

**Expected**: Images load without errors

## Step 3: Test Listing Form Gallery Tab
1. Go to Admin CMS → Listings
2. Click Create New Listing
3. Fill in Basics tab (title, slug, category, city)
4. Go to Gallery tab (Step 6)
5. Upload an image from your computer
6. Wait for image to upload (spinner should finish)
7. Image preview should show
8. Click Save Listing

**Expected**: 
- Upload completes without errors
- Image preview displays
- Browser console shows no errors
- Listing saves successfully

## Step 4: Test Gallery Persistence
1. Go to Admin CMS → Listings
2. Find the listing you just created
3. Click Edit
4. Go to Gallery tab (Step 6)
5. Check that the image is still there

**Expected**: 
- Previous gallery image loads and displays
- Image URL works
- No broken image icons

## Step 5: Test Gallery Updates
1. While editing the listing:
2. Add another image to the gallery
3. Save the listing again
4. Edit the listing again
5. Gallery tab should have both images

**Expected**: 
- Both images persist
- Can add more images without losing existing ones
- Can remove individual images

## Browser Console Debugging

If images don't load, check console for errors like:
```
Gallery image failed to load: {...} public_url
Image failed to load: {...} http://localhost:8000/storage/uploads/...
```

### Common Issues

**Issue**: "public_url is undefined"
- **Fix**: Clear browser cache (Ctrl+Shift+Delete)
- **Reason**: Old API response cached

**Issue**: Images show 404 Not Found
- **Fix**: Check if storage/uploads directory exists
- **Command**: `ls -la admin/storage/app/public/uploads/`
- **Fix**: If missing, create it: `mkdir -p admin/storage/app/public/uploads/`

**Issue**: Upload returns 500 error
- **Fix**: Check Laravel logs: `tail -50 admin/storage/logs/laravel.log`
- **Reason**: Usually file permissions or activity logging issue

## Database Verification

Run this in PHP console to verify data:
```bash
php artisan tinker
```

```php
// Check media records exist
$count = App\Models\CustomMedia::count();
echo "Media records: $count\n";

// Check a media file
$media = App\Models\CustomMedia::first();
echo "File path: " . $media->file_path . "\n";
echo "Public URL: " . $media->public_url . "\n";

// Check media_listing links
$links = DB::table('media_listing')->count();
echo "Media-listing links: $links\n";
```

**Expected**:
- Media records: 8+
- File path: `storage/uploads/...`
- Public URL: `http://localhost:8000/storage/uploads/...`
- Media-listing links: > 0 after saving a listing with gallery

## Advanced: API Response Test

```bash
# Test media API directly
curl "http://localhost:8000/api/v1/admin/custom-media?per_page=1" \
  -H "Accept: application/json" | jq '.data[0] | {id, file_name, public_url}'

# Test listing API
curl "http://localhost:8000/api/v1/admin/listings/1" \
  -H "Accept: application/json" | jq '.mediaFiles | length'
```

## Success Checklist

- [ ] Media Library page shows images
- [ ] Media URLs are accessible
- [ ] Upload completes without errors
- [ ] Gallery images persist after save
- [ ] Can add/remove gallery images
- [ ] Editing listing shows previous gallery images
- [ ] No errors in browser console
- [ ] No broken image icons

## Next Steps

If all tests pass:
1. Create several listings with different gallery images
2. Test on the public frontend (if available)
3. Verify listing detail page shows gallery
4. Test on different browsers

If tests fail:
1. Check browser console for specific errors
2. Check Laravel logs: `tail -100 admin/storage/logs/laravel.log`
3. Clear caches: `php artisan cache:clear && npm run build`
4. Refresh browser: Ctrl+Shift+R (hard refresh)
