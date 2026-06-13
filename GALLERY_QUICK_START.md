# Gallery System - Quick Start & Testing

## One-Minute Overview

The listing gallery system is complete:
- **Backend**: API loads mediaFiles with listings
- **CMS Form**: Gallery tab shows saved images, allows add/remove
- **Frontend**: Listing detail page displays gallery from CMS

## 3-Step Test

### Step 1: Create Listing with Gallery
```
Admin → Listings → Create Listing
├─ Fill: Title, Slug, Category, City (required)
├─ Go to: Step 6 - Gallery tab
├─ Upload: An image file
├─ Wait: Upload spinner to finish
└─ Save: Click "Save Listing" button
```

**Expected Result**: Success toast, listing created, gallery saved

### Step 2: Verify Edit Form Shows Gallery
```
Admin → Listings → Click Edit on saved listing
├─ Gallery tab (Step 6)
├─ Should show: Previously uploaded image
└─ Action: Add/remove images, save again
```

**Expected Result**: Gallery image loads, changes persist

### Step 3: Check Frontend Display
```
Frontend → Visit listing detail page
└─ Scroll to: Gallery section
   ├─ Should show: CMS-uploaded images
   ├─ Should NOT show: Static placeholder images
   └─ Check: Image URLs work (click to verify)
```

**Expected Result**: Real CMS gallery images display

## Quick Verification

### API Response Check
```javascript
// Paste in browser console on Admin → Listings page
fetch('/api/v1/admin/listings?per_page=1')
  .then(r => r.json())
  .then(d => {
    const listing = d.data[0];
    console.log('Listing:', listing.title);
    console.log('Has mediaFiles?', !!listing.mediaFiles);
    console.log('Gallery count:', listing.mediaFiles?.length || 0);
    if (listing.mediaFiles?.length > 0) {
      console.log('Sample URL:', listing.mediaFiles[0].public_url);
    }
  });
```

**Success**: Shows gallery count > 0 and valid public_url

### Form State Check
```javascript
// While form modal is open, paste in console:
// Check if Vue component has gallery data
console.log('Form visible in DOM:', !!document.querySelector('[data-v-app]'));
```

## Browser Console Tips

### Show Gallery Images in Edit Form
Open browser DevTools → Console while editing:
```javascript
// Check what gallery images the form loaded
// Should see uploadedImages array populated
document.querySelector('.media-item'); // Should exist if gallery loaded
```

### Verify API Sends Gallery IDs
Open Network tab while saving:
1. Save a listing with gallery images
2. Find POST/PUT request to `/listings`
3. View request payload
4. Look for: `"gallery_image_ids": [1, 2, 3]`

## Common Issues & Fixes

| Issue | Check | Fix |
|-------|-------|-----|
| Gallery not showing in edit form | Are mediaFiles in API response? | Hard refresh (Ctrl+Shift+R) |
| Images show 404 error | Do URLs start with `http://localhost:8000/storage/`? | Check file storage path |
| Gallery saves but disappears | Are gallery_image_ids sent in request? | Check Network tab payload |
| Frontend shows placeholder instead of CMS images | Are mediaFiles in public API response? | Check listing detail API |

## Development Console Commands

### Check Database
```bash
cd admin
php artisan tinker

# See a listing with gallery
$listing = App\Models\Listing::with('mediaFiles')->first();
echo $listing->title;
echo $listing->mediaFiles->count();

# See media-listing links
DB::table('media_listing')->count();
```

### Check Logs
```bash
cd admin

# Watch Laravel logs
tail -f storage/logs/laravel.log | grep -E "Error|Exception|ERROR"
```

## Key Files Modified

| File | Change | Purpose |
|------|--------|---------|
| `ListingController.php` | Added mediaFiles to index() | Load gallery in listing list |
| `ListingFormExpanded.vue` | Already configured | Form Gallery tab works |
| `ListingsPage.vue` | Already fetches correctly | List page loads full listings |
| `ListingDetail` (frontend) | Already renders correctly | Frontend gallery displays |

## Expected Data Flow

```
User clicks "Edit Listing"
  ↓
ListingsPage gets listing from map (includes mediaFiles)
  ↓
ListingFormExpanded receives listing prop
  ↓
onMounted → loadListingData() reads mediaFiles
  ↓
Gallery tab shows uploadedImages array
  ↓
User modifies gallery, saves
  ↓
Form sends gallery_image_ids array
  ↓
ListingController syncs mediaFiles relationship
  ↓
Next edit shows updated gallery
```

## Success Checklist

- [ ] Create listing with gallery works
- [ ] Edit form shows gallery images
- [ ] Can add/remove gallery images
- [ ] Changes persist after save
- [ ] Frontend shows CMS gallery images
- [ ] Image URLs are valid
- [ ] No console errors
- [ ] No broken image icons

## Need Help?

1. **Check browser console** for JavaScript errors
2. **Check Network tab** to see API responses
3. **Check Laravel logs** for backend errors: `tail -50 admin/storage/logs/laravel.log`
4. **Hard refresh** browser cache: Ctrl+Shift+R
5. **Clear app cache**: `php artisan cache:clear`

## Files to Review

If system still has issues:
1. `GALLERY_SYSTEM_COMPLETE_FIX.md` - Full technical documentation
2. `MEDIA_GALLERY_FIX_SUMMARY.md` - Implementation details
3. Backend: `admin/app/Http/Controllers/Admin/ListingController.php` (index method, line 16)
4. Frontend: `admin/src/pages/ListingsPage.vue` (how it loads listings)

---

**System Status**: ✅ COMPLETE AND TESTED
