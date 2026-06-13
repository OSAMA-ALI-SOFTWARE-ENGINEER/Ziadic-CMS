# ✅ Quick Test Checklist - mediaFiles API Fix

## Pre-Test
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] Clear any previous logs (Console → Right-click → Clear messages)

---

## Test 1: Upload Gallery Image

### Action
1. Go to **Admin → Listings → Create New**
2. Fill in: Title, Slug, City, Category
3. Go to **Step 6 - Gallery**
4. Upload ONE image

### What to See in Console
```
✅ Upload response: {id: 17, ...}
✅ Captured media ID: 17
✅ Added to galleryImageIds, now have: 1 items
```

- [ ] All three ✅ messages appear
- [ ] Image preview shows in gallery

### If Problem
- [ ] Check if error message in console
- [ ] Open Network tab → find upload request → check Response
- [ ] Share error message

---

## Test 2: Save Listing

### Action
Click **Save Listing**

### What to See in Console
```
📤 Saving listing with payload: {
  gallery_image_ids: [17],
  ...
}
```

- [ ] Shows `gallery_image_ids: [17]` (not empty)
- [ ] Form saves without errors
- [ ] Page refreshes or shows success

### If Problem
- [ ] Check Network tab → Save request → Payload
- [ ] Look for `gallery_image_ids` field
- [ ] Share Network request details

---

## Test 3: Check Backend Logs

### Action
Run this command:
```bash
cd c:/laragon/www/Ziadic
tail -20 admin/storage/logs/laravel.log
```

### What to See
```
🎨 Gallery sync on create {"listing_id":22,"received_ids":[17],"count":1}
🎨 Gallery synced on create - verify {"synced_count":1,"verified_count":1}
```

- [ ] See both 🎨 lines
- [ ] Both show count: 1
- [ ] No error messages before them

### If Problem
- [ ] `received_ids` shows []: Frontend not sending
- [ ] Only one line appears: Sync might be failing
- [ ] No lines at all: Check if logging is enabled

---

## Test 4: Edit Listing & Verify Gallery

### Action
1. Go to **Listings** page
2. Click **Edit** on the listing you just created
3. Go to **Gallery** tab

### What to See
- [ ] Image appears in gallery
- [ ] Shows thumbnail preview
- [ ] Shows correct image name

### Console Should Show
```
loadListingData called for: 22 mediaFiles: 1
✅ Found mediaFiles, count: 1
```

- [ ] These messages appear
- [ ] mediaFiles count: 1

### If Gallery Empty
- [ ] Check Network tab → GET /listings/22 → Response
- [ ] Search for `mediaFiles` in response
- [ ] Should show: `"mediaFiles": [{id: 17, ...}]`

---

## Test 5: Add More Images to Same Listing

### Action (Still editing same listing)
1. Upload second image
2. Save

### What to See
- [ ] Second image preview appears
- [ ] Both images show in gallery
- [ ] Save completes

### Check Logs Again
```bash
tail -20 admin/storage/logs/laravel.log
```

- [ ] Shows sync with count: 2
- [ ] Verified count: 2

### Edit Again
- [ ] Both images still there

---

## Test 6: Test Different Listing

### Action
1. Go to **Listings → Edit** different listing
2. Upload image
3. Save
4. Go back and edit first listing

### What to See
- [ ] Second listing has its own image
- [ ] First listing still has its images
- [ ] No images from other listings appear

---

## ✅ All Tests Passing
If all tests above show ✅, the fix is working perfectly!

---

## 🚨 Troubleshooting Quick Links

| Problem | Check |
|---------|-------|
| No ✅ messages in console | Check if upload API is working |
| gallery_image_ids empty in payload | Check if ID was captured |
| Backend logs show count: 0 | Database or sync issue |
| mediaFiles not in API response | Check Network tab → Response |
| Images disappear on re-edit | Hard refresh or cache issue |

---

## What to Share If Broken

If any test fails, share:

1. **Screenshot** of console showing error
2. **Backend log** (from command above)
3. **Network Response** (F12 → Network → GET /listings/X → Response)
4. **Which step** failed (1-6)

Example:
```
Step: Test 4 - Edit Listing
Error: Gallery is empty
Console shows: [screenshot]
Backend logs: [paste output]
Network Response: [paste JSON]
```

---

## Expected Success Timeline

```
0-5 sec:   Upload image → See ✅ Captured media ID
5-10 sec:  Save listing → See 📤 Saving payload
10-15 sec: Backend processes → Check logs
15-20 sec: Edit listing again → Gallery appears ✓
```

Total time: ~20 seconds for full test

---

## Quick Sanity Checks

```bash
# All tests passing = all should return > 0

# Check media_listing has entries
cd admin && php artisan tinker
DB::table('media_listing')->count()

# Check a specific listing
$l = App\Models\Listing::with('mediaFiles')->find(22);
echo $l->mediaFiles->count();

# Check CustomMedia exists
App\Models\CustomMedia::find(17)->first()
```

---

## API Response Check

While editing listing in **Step 4**, open DevTools Network tab:
1. Find the request to `/api/v1/admin/listings/22`
2. Click it → Response tab
3. Should contain:
   ```json
   "mediaFiles": [
     {
       "id": 17,
       "file_name": "...",
       "public_url": "...",
       "pivot": {...}
     }
   ]
   ```

- [ ] mediaFiles array present
- [ ] Contains at least 1 object
- [ ] Has id, file_name, public_url fields

---

**Ready to test? Start with Test 1 and go through the checklist!** ✅
