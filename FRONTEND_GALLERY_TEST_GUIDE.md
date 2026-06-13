# Frontend Gallery Real-Time Test Guide

## What Was Fixed
The frontend listing detail page now fetches gallery images dynamically from the CMS API instead of using static data.

## Quick Test (5 minutes)

### Step 1: Hard Refresh
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### Step 2: Upload Gallery Image in Admin
1. Go to **http://localhost:8000/admin** → Listings
2. Click **Create New** or **Edit** existing listing
3. Go to **Step 6 - Gallery** tab
4. Upload ONE image
5. Click **Save Listing**
6. **Wait** for save to complete

### Step 3: Check API Response
Open terminal and run:
```bash
curl "http://localhost:8000/api/v1/public/listings" | jq '.[0].gallery'
```

You should see:
```json
[
  "http://localhost:8000/storage/uploads/...",
  "http://localhost:8000/storage/uploads/..."
]
```

**Key**: Full URLs starting with `http://localhost:8000/storage`

### Step 4: View Frontend Listing
1. Go to **http://localhost:5176/listings** (frontend)
2. Click on the listing you just edited
3. Scroll to **Gallery** section
4. **Images should appear** ✓

### Step 5: Verify Real-Time Updates
1. Go back to admin CMS
2. Edit the same listing → **Add 2 more images** → Save
3. Refresh frontend (F5)
4. Gallery should now show **all images** ✓

## Detailed Test Flow

### Test Case 1: New Listing with Gallery

#### Setup
1. Admin: Create new listing
2. Fill: Title, Slug, City, Category
3. Go to Gallery → Upload 3 images
4. Save

#### Verify
1. API returns gallery array with 3 URLs
2. Frontend shows all 3 images
3. Images load without errors
4. Click images → should zoom/expand

### Test Case 2: Existing Listing Add Gallery

#### Setup
1. Admin: Go to old listing (without gallery)
2. Go to Gallery → Upload 1 image
3. Save

#### Verify
1. Before edit: Gallery showed nothing or fallback
2. After edit: Gallery shows the image
3. Frontend fetches real-time data

### Test Case 3: Multiple Galleries Across Listings

#### Setup
1. Listing A: Add image #1
2. Listing B: Add image #2
3. Listing C: Add images #3, #4, #5

#### Verify
1. Listing A shows only image #1
2. Listing B shows only image #2
3. Listing C shows images #3, #4, #5
4. No cross-listing image mixing

### Test Case 4: Remove Gallery Images

#### Setup
1. Listing with 3 images
2. Edit → Delete 2 images → Save

#### Verify
1. Frontend shows only 1 image
2. Deleted images don't appear
3. Refresh confirms change persisted

## API Testing

### Get All Public Listings with Gallery
```bash
curl "http://localhost:8000/api/v1/public/listings" | jq '.[0] | {slug, title, gallery}'
```

Expected output:
```json
{
  "slug": "my-listing",
  "title": "My Listing",
  "gallery": [
    "http://localhost:8000/storage/uploads/abc123.png",
    "http://localhost:8000/storage/uploads/def456.png"
  ]
}
```

### Get Popular Listings with Gallery
```bash
curl "http://localhost:8000/api/v1/public/listings/popular" | jq '.[0] | {title, gallery_count: (.gallery | length)}'
```

Expected output:
```json
{
  "title": "Popular Place",
  "gallery_count": 2
}
```

### Get Single Listing by Slug
```bash
curl "http://localhost:8000/api/v1/public/listings/my-listing-slug" | jq '{title, gallery}'
```

Expected output:
```json
{
  "title": "My Listing",
  "gallery": [
    "http://localhost:8000/storage/uploads/xyz789.png"
  ]
}
```

## Browser DevTools Testing

### Network Tab Check
1. Open DevTools (F12)
2. Go to **Network** tab
3. Go to frontend listing detail page
4. Look for request to `/api/v1/public/listings`
5. Click request → **Response** tab
6. Search for `"gallery"`
7. Should show full URLs, not relative paths

### Console Check
1. Open DevTools (F12)
2. Go to **Console** tab
3. Go to frontend listing detail page
4. Should show NO errors
5. Look for logs like:
   ```
   Gallery images: {
     count: X,
     availableImages: Y,
     images: [...]
   }
   ```

## Expected vs Actual

### ✅ SUCCESS

**Admin CMS**
```
Listing "Bursa Modern Art Museum"
├── Gallery Tab
│   ├── Upload image1.png ✅
│   ├── Upload image2.png ✅
│   └── Save Listing ✅
```

**Backend**
```
GET /api/v1/public/listings/bursa-modern-art-museum

Response:
{
  "gallery": [
    "http://localhost:8000/storage/uploads/xyz1.png",
    "http://localhost:8000/storage/uploads/xyz2.png"
  ]
}
```

**Frontend**
```
Listing Detail Page
├── Gallery Section
│   ├── Image 1 displays ✅
│   ├── Image 2 displays ✅
│   └── Both load without errors ✅
```

### ❌ PROBLEM

If any step shows:
- Gallery empty on frontend
- Images showing old/wrong images
- API returning empty gallery array
- Hardcoded/static gallery instead of real data

Then see Troubleshooting below.

## Troubleshooting

### Problem 1: Gallery Empty on Frontend

**Check**: API Response
```bash
curl "http://localhost:8000/api/v1/public/listings/SLUG" | jq '.gallery'
```

If shows `[]`:
- Admin didn't upload images yet
- Gallery images not synced
- Check admin logs: `tail -50 admin/storage/logs/laravel.log | grep "🎨"`

If shows URLs:
- Problem is frontend rendering
- Check browser console (F12) for errors
- Hard refresh (Ctrl+Shift+R)

### Problem 2: Images Show as Placeholder

**Check**: Image URLs
- Right-click image → Open in new tab
- Should load the actual image
- If 404: Storage path issue

### Problem 3: Gallery Shows Wrong Images

**Check**: Listing slug
- Verify you're viewing correct listing
- Check API: `curl http://localhost:8000/api/v1/public/listings | jq '.[] | {slug, gallery_count: (.gallery | length)}'`
- Confirm each listing has correct images

### Problem 4: Images Not Updating After Admin Edit

**Check**: Cache
1. Hard refresh frontend: `Ctrl+Shift+R`
2. Check API returns new data
3. Clear browser cache if needed

**Check**: Admin Save
- Verify admin save completed
- Check backend logs: `tail -20 admin/storage/logs/laravel.log`
- Look for "🎨 Gallery synced"

## Quick Commands

```bash
# Check API has gallery data
curl "http://localhost:8000/api/v1/public/listings" | jq '.[0] | {id, title, gallery_count: (.gallery | length)}'

# Check specific listing
curl "http://localhost:8000/api/v1/public/listings/bursa-modern-art-museum" | jq '.gallery | length'

# Check backend logs
cd admin
tail -50 storage/logs/laravel.log | grep "Gallery"

# Check database
php artisan tinker
$listing = App\Models\Listing::with('mediaFiles')->first();
echo "mediaFiles: " . $listing->mediaFiles->count();
```

## Expected Output Summary

### ✅ Correct Implementation
```
Frontend Listing Detail Page
├── Gallery Section Title
└── Images Displayed
    ├── Image loads
    ├── Shows real CMS data
    ├── Sourced from /api/v1/public/listings API
    ├── URLs in format: http://localhost:8000/storage/uploads/...
    └── Updates when admin edits gallery
```

### ❌ Broken Implementation
```
Frontend Listing Detail Page
├── Gallery Section Title
└── No Images or Placeholder
    ├── Empty array from API
    ├── Shows static/hardcoded images
    ├── URLs are relative (not full paths)
    └── Doesn't update when admin edits
```

## Performance Expectations

- **API Response Time**: < 500ms
- **Images Load Time**: < 2s (depends on image size)
- **Gallery Render**: Immediate after load
- **Frontend Refresh**: < 1s to show updated gallery

## Testing Checklist

- [ ] Hard refresh frontend
- [ ] Admin uploads gallery image
- [ ] Admin saves listing
- [ ] API returns gallery array with full URLs
- [ ] Frontend loads and displays gallery images
- [ ] Admin adds more images
- [ ] Frontend reflects changes after refresh
- [ ] Different listings show different galleries
- [ ] No cross-listing image mixing
- [ ] All images load without 404 errors
- [ ] Gallery images are real CMS data (not hardcoded)

## Summary

Frontend gallery now:
✅ Fetches real-time data from CMS API
✅ Shows full gallery image URLs
✅ Updates when admin edits
✅ Works across multiple listings
✅ Falls back to legacy images if needed
✅ Displays without errors

**Ready to test!** 🚀
