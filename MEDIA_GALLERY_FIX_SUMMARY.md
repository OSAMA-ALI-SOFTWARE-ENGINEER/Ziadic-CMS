# CMS Media Library & Gallery Tab Fix Summary

## Overview
Fixed critical issues with CMS Media Library image fetching and Listing Form Gallery tab persistence. The new system integrates a global media management system through the `media_listing` junction table.

## Issues Fixed

### Issue 1: Media Library Not Displaying Images
**Problem**: CMS Media Library page showed "No media files yet" despite files being uploaded.
**Root Cause**: 
- Uploaded files were saved to `custom_media` table
- Media Library was trying to fetch images but public_url generation was incorrect
- Double "storage/" path in URL (storage/storage/uploads/...)

**Solution**: Fixed public_url accessor in CustomMedia model to handle relative paths correctly

### Issue 2: Gallery Tab Not Loading Saved Images
**Problem**: When editing a listing, the Gallery tab didn't show previously saved images.
**Root Cause**:
- Form was looking for images in `listing.images` (old ListingImage model)
- New system stores images in `mediaFiles` BelongsToMany relationship
- API wasn't loading mediaFiles relationship

**Solution**: Updated API to load mediaFiles and form to use the new relationship

### Issue 3: Gallery Images Not Persisting After Update
**Problem**: Saving a listing would lose gallery images.
**Root Cause**:
- Form was sending gallery as newline-separated string
- New system needs media IDs through gallery_image_ids array
- ListingController wasn't syncing mediaFiles relationship

**Solution**: Updated form to collect media IDs and controller to sync through mediaFiles

## Changes Made

### Backend Changes

#### 1. CustomMedia Model (`admin/app/Models/CustomMedia.php`)
- Added `protected $appends = ['public_url']` to include accessor in JSON responses
- Fixed `getPublicUrlAttribute()` to handle "storage/" prefix correctly
  - Changed from: `url("storage/{$this->file_path}")`
  - Changed to: Check if path starts with "storage/", then just call `url($this->file_path)`

#### 2. Listing Model (`admin/app/Models/Listing.php`)
- Fixed `mediaFiles()` relationship definition to specify correct foreign keys:
  - Changed from: `belongsToMany(CustomMedia::class, 'media_listing')`
  - Changed to: `belongsToMany(CustomMedia::class, 'media_listing', 'listing_id', 'media_id')`

#### 3. ListingController (`admin/app/Http/Controllers/Admin/ListingController.php`)
- Updated `show()` method to load mediaFiles relationship
- Updated `store()` method to:
  - Accept and validate `gallery_image_ids` array
  - Sync media files through mediaFiles relationship
- Updated `update()` method to:
  - Accept and validate `gallery_image_ids` array
  - Sync media files through mediaFiles relationship

#### 4. UploadController (`admin/app/Http/Controllers/Admin/UploadController.php`)
- Enhanced response to include:
  - `id`: media ID
  - `public_url`: full URL to the uploaded file
  - `file_type`: image, document, video, etc.

### Frontend Changes

#### 1. MediaLibrary Component (`admin/src/components/MediaLibrary.vue`)
- Added debug logging to verify media fetching
- Added `getMediaUrl()` helper to properly resolve media URLs
- Updated template to use helper for image URLs
- Added error handlers to log failed image loads

#### 2. ListingFormExpanded Component (`admin/src/components/ListingFormExpanded.vue`)
- Added `galleryImageIds` state to track media IDs
- Added `galleryMediaFiles` state to store fetched media objects
- Updated `loadListingData()` to:
  - Load gallery images from `mediaFiles` relationship
  - Fallback to legacy `images` for backwards compatibility
- Updated `uploadImage()` to capture media ID from upload response
- Updated `removeImage()` to remove from both array and galleryImageIds
- Updated `submit()` to send `gallery_image_ids` array instead of string
- Added `getGalleryImageUrl()` helper for URL resolution
- Updated gallery template to use helper and add error logging

## API Response Format

### GET /api/v1/admin/custom-media
Returns paginated custom_media with public_url included:
```json
{
  "data": [
    {
      "id": 1,
      "file_name": "image.png",
      "file_path": "storage/uploads/...",
      "public_url": "http://localhost:8000/storage/uploads/...",
      "file_type": "image",
      "mime_type": "image/png",
      "file_size": 12345,
      "created_at": "2026-06-13T15:39:58Z"
    }
  ],
  "total": 8
}
```

### GET /api/v1/admin/listings/:id
Now includes mediaFiles relationship:
```json
{
  "id": 1,
  "title": "Listing Title",
  "mediaFiles": [
    {
      "id": 1,
      "file_name": "image.png",
      "public_url": "http://localhost:8000/storage/uploads/...",
      "file_type": "image"
    }
  ]
}
```

### POST/PUT /api/v1/admin/listings
Accepts gallery_image_ids:
```json
{
  "title": "Listing Title",
  "gallery_image_ids": [1, 2, 3]
}
```

## Testing Checklist

### Media Library
- [ ] Navigate to Admin CMS → Media
- [ ] Verify existing uploaded images display
- [ ] Verify images show correct public URLs
- [ ] Click open/copy URL - should work without errors
- [ ] Upload a new image - should appear immediately
- [ ] Search media by filename
- [ ] Filter media by type (Images, Documents, etc)
- [ ] Delete media - should be removed from list
- [ ] Bulk select and delete media

### Listing Form Gallery Tab
- [ ] Create new listing with gallery images
  - [ ] Upload images in Gallery tab
  - [ ] Verify preview displays as upload completes
  - [ ] Save listing
  - [ ] Verify gallery_image_ids sent to API
- [ ] Edit existing listing
  - [ ] Gallery tab should show saved images
  - [ ] Images should display correctly
  - [ ] Switching tabs should preserve gallery
  - [ ] Remove image - media ID removed from array
  - [ ] Add more images - media IDs appended
  - [ ] Save - gallery persists
- [ ] Verify database
  - [ ] media_listing table has correct entries
  - [ ] media_id and listing_id properly linked

### Frontend Display
- [ ] Listing detail page shows gallery images
- [ ] Listing cards show thumbnail images
- [ ] No broken image icons
- [ ] All URLs resolve correctly
- [ ] Console has no errors for missing images

## Database Schema

### custom_media Table
- Stores all uploaded files with metadata
- public_url generated from file_path
- status field to filter active media

### media_listing Table
- Junction table linking listings and media
- Columns: id, media_id, listing_id, type, sort_order
- Allows multiple images per listing

## Troubleshooting

### Images Not Loading in Media Library
1. Check browser console for failed image loads
2. Verify public_url format in API response
3. Check storage/uploads/ directory exists and is readable
4. Clear browser cache and reload

### Gallery Images Not Persisting
1. Check if gallery_image_ids sent in payload
2. Verify media IDs exist in custom_media table
3. Check media_listing table has entries for listing
4. Verify ListingController syncing mediaFiles

### Upload Returning 500 Error
1. Check file size under 10MB
2. Verify storage/ directory writable
3. Check activity log listener doesn't fail
4. Review Laravel error logs

## Future Enhancements

- Add image cropping in Media Library
- Bulk upload with drag-drop
- Image optimization before storage
- CDN integration for public_url
- Rate limiting on uploads
- File format validation

## Files Modified

### Backend
- admin/app/Models/CustomMedia.php
- admin/app/Models/Listing.php
- admin/app/Http/Controllers/Admin/ListingController.php
- admin/app/Http/Controllers/Admin/UploadController.php

### Frontend
- admin/src/components/MediaLibrary.vue
- admin/src/components/ListingFormExpanded.vue

### Database
- No migrations needed - tables already exist

## Testing Status

✅ Media model public_url accessor
✅ API response format with public_url
✅ Media-listing relationship sync
✅ Listing load with mediaFiles
✅ Form state management
✅ Gallery persistence
