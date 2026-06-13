# CMS Data Testing & Verification Guide

## 🔍 Current Data Issues Identified

### 1. **Mixed Data Sources**
- Some listings use `days`/`hours` (fallback)
- Others use `open_days`/`open_time`/`close_time` (CMS)
- Need consistent field priority

### 2. **Image URL Inconsistency**
- Some images: `storage/uploads/...` (relative)
- Others: `http://localhost:8000/storage/uploads/...` (absolute)
- Need unified `getImageUrl()` function

### 3. **Contact Information**
- Primary fields: `contact_phone`, `contact_email`, `contact_website`
- Fallback fields: `phone`, `email`, `website_url`
- Some listings have empty strings, some have null

### 4. **Address/Location**
- Using `contact_address` for display
- Some listings have incomplete addresses (e.g., "J2XQ+33")

### 5. **Gallery Images**
- Mixed absolute and relative URLs
- Need normalization on both frontend and backend

---

## ✅ Testing Checklist

### Phase 1: API Response Validation

#### Test 1.1: List All Listings
```bash
curl http://localhost:8000/api/v1/public/listings
```

**Verify:**
- [ ] All listings have `title`
- [ ] All listings have `slug`
- [ ] `contact_address` is populated for all
- [ ] `contact_phone` has correct format (or null)
- [ ] `contact_email` is valid email (or empty/null)
- [ ] `contact_website` is valid URL (or empty/null)
- [ ] `image` path is consistent (all relative or all absolute)
- [ ] `gallery` images are consistent format
- [ ] `days` and `hours` are populated
- [ ] `open_days`, `open_time`, `close_time` match database

#### Test 1.2: Single Listing Detail
```bash
curl http://localhost:8000/api/v1/public/listings/bursa-modern-art-museum
```

**Verify:**
- [ ] All fields from list endpoint present
- [ ] `gallery` array contains full URLs (absolute)
- [ ] `gallery_heading` matches CMS input
- [ ] `contact_*` fields reflect admin input
- [ ] No null values where CMS data should exist

#### Test 1.3: Popular Listings
```bash
curl http://localhost:8000/api/v1/public/listings/popular
```

**Verify:**
- [ ] Only returns listings with `is_popular: true`
- [ ] Sorted by `popular_order` ascending
- [ ] All required fields present
- [ ] Max 3 listings returned (per code)

---

### Phase 2: Frontend Data Binding

#### Test 2.1: Listings Page
Navigate to: `http://localhost:5174/listings`

**Verify:**
- [ ] All listings load without errors
- [ ] Images display (no 404 or broken)
- [ ] Category badge shows correct value
- [ ] Address shows `contact_address` (not location)
- [ ] Hours show correct format: "Days / Time" (e.g., "Monday - Saturday / 06:00 AM - 10:00 PM")
- [ ] No console errors
- [ ] Filters work correctly

#### Test 2.2: Individual Listing Detail
Navigate to: `http://localhost:5174/listings/bursa-modern-art-museum`

**Verify Gallery:**
- [ ] Gallery title matches CMS `gallery_heading`
- [ ] Gallery images load and display correctly
- [ ] Gallery images are clickable (open preview)
- [ ] Preview modal shows all images
- [ ] Keyboard navigation works (arrow keys, ESC)

**Verify Contact Info:**
- [ ] Phone displays correct value from CMS
- [ ] Email is clickable mailto link
- [ ] Website is clickable and opens in new tab
- [ ] All contact info matches admin form input

**Verify Schedule:**
- [ ] Days show `open_days` from CMS
- [ ] Hours show `open_time - close_time` (formatted)
- [ ] Not showing fallback defaults

**Verify Popular Carousel:**
- [ ] Shows at bottom before CTA
- [ ] Only shows 3 listings max
- [ ] Doesn't include current listing
- [ ] Responsive: 3 desktop, 2 tablet, 1 mobile
- [ ] All cards show images, titles, locations

#### Test 2.3: Home Page Popular Section
Navigate to: `http://localhost:5174/`

**Verify:**
- [ ] Popular section shows correct listings
- [ ] Images load and display
- [ ] Links work correctly
- [ ] Card styling matches detail page carousel

---

### Phase 3: CMS Admin Verification

#### Test 3.1: Create New Listing
1. Go to Admin → Listings
2. Click "Create New"
3. Fill in all fields:
   - Title, Slug, Category, City
   - Contact Phone: "+1 (555) 123-4567"
   - Contact Email: "test@example.com"
   - Contact Website: "https://example.com"
   - Contact Address: "123 Main St, City, Country"
   - Gallery Images: Upload 5+ images
   - Gallery Heading: "Custom Gallery Title"
   - Open Days: "Monday - Friday"
   - Open Time: "09:00"
   - Close Time: "17:00"
4. Save

**Verify in Admin:**
- [ ] All fields saved
- [ ] Gallery images appear in edit mode
- [ ] Contact info displays correctly

**Verify in API:**
```bash
curl http://localhost:8000/api/v1/public/listings/{new-slug}
```
- [ ] Contact fields return exactly as entered
- [ ] Gallery heading matches input
- [ ] Open days/time are correct
- [ ] Gallery images are absolute URLs

**Verify on Frontend:**
- [ ] Title displays correctly
- [ ] Contact info matches admin input
- [ ] Gallery shows 4 images initially
- [ ] Load More appears if >4 images
- [ ] Gallery heading matches CMS
- [ ] Schedule shows open times (not fallback)
- [ ] Popular carousel excludes this listing (if not popular)

#### Test 3.2: Edit Existing Listing
1. Go to Admin → Listings
2. Edit "Bursa Modern Art Museum"
3. Change:
   - Title: Append " - UPDATED"
   - Contact Email: Change to "new@example.com"
   - Gallery: Remove 1 image, add 1 new
   - Gallery Heading: Change to "Art Gallery"
4. Save

**Verify Frontend (hard refresh Ctrl+Shift+R):**
- [ ] Title shows updated value immediately
- [ ] Contact email is new value
- [ ] Gallery shows correct image count
- [ ] Gallery heading shows "Art Gallery"
- [ ] No stale data cached

---

### Phase 4: Data Consistency Tests

#### Test 4.1: Image URL Normalization
Check all image fields:
```javascript
// In browser console on any page with listings
const listings = document.querySelectorAll('[class*="listing"]')
listings.forEach(el => {
  const img = el.querySelector('img')
  if (img) console.log('Image src:', img.src)
})
```

**Verify:**
- [ ] All URLs are absolute (start with http://)
- [ ] All URLs have base: `http://localhost:8000/storage/uploads/`
- [ ] No relative paths
- [ ] No 404 errors in Network tab

#### Test 4.2: Contact Field Priority
Test listing with both `phone` and `contact_phone`:

```bash
curl http://localhost:8000/api/v1/public/listings \
  | jq '.[] | select(.id == 8) | {phone, contact_phone}'
```

**Expected Output:**
```json
{
  "phone": null,
  "contact_phone": "+923485645657"
}
```

**Verify on Frontend:**
- [ ] Displays the contact_phone value
- [ ] Not showing phone field

#### Test 4.3: Address Consistency
Check all listings:

```bash
curl http://localhost:8000/api/v1/public/listings \
  | jq '.[] | {title, contact_address, location}'
```

**Verify:**
- [ ] `contact_address` is populated for display
- [ ] No listings showing "null" or empty address
- [ ] Format is "Street, City, Country"

---

### Phase 5: Responsive Design Tests

#### Test 5.1: Desktop (1400px)
- [ ] Listings grid: 3 columns
- [ ] Popular carousel: 3 cards
- [ ] Images display at full quality
- [ ] All text readable

#### Test 5.2: Tablet (768px)
- [ ] Listings grid: 2 columns
- [ ] Popular carousel: 2 cards
- [ ] Filters stack properly
- [ ] Touch-friendly button sizes

#### Test 5.3: Mobile (375px)
- [ ] Listings grid: 1 column
- [ ] Popular carousel: 1 card
- [ ] Gallery modal fits screen
- [ ] All buttons tappable (min 44px)

---

### Phase 6: Error Handling

#### Test 6.1: Invalid Listing
Navigate to: `http://localhost:5174/listings/nonexistent-listing`

**Verify:**
- [ ] Shows 404 or "Not Found" message
- [ ] No console errors
- [ ] Can navigate back

#### Test 6.2: Network Error
1. Open DevTools → Network
2. Set throttle to "Offline"
3. Refresh page

**Verify:**
- [ ] Shows "Unable to load" message
- [ ] Can retry when online
- [ ] No infinite loading

#### Test 6.3: Missing Data
Test listing with minimal data:

**Verify:**
- [ ] Uses fallback values appropriately
- [ ] Doesn't show "null" or "undefined"
- [ ] Layout doesn't break

---

## 📊 Data Validation Checklist

| Field | Source | Format | Fallback | Status |
|-------|--------|--------|----------|--------|
| `title` | CMS | String | N/A | ✅ |
| `slug` | CMS | String | N/A | ✅ |
| `category` | CMS | String | "Featured" | ✅ |
| `image` | CMS | URL | `/placeholder.png` | ⚠️ |
| `contact_address` | CMS | String | `location` | ⚠️ |
| `contact_phone` | CMS | String | `phone` | ⚠️ |
| `contact_email` | CMS | String | `email` | ⚠️ |
| `contact_website` | CMS | URL | `website_url` | ⚠️ |
| `open_days` | CMS | String | `days` | ⚠️ |
| `open_time` | CMS | Time | "09:00" | ⚠️ |
| `close_time` | CMS | Time | "18:00" | ⚠️ |
| `gallery_heading` | CMS | String | "Vibrant Gallery" | ✅ |
| `gallery` | CMS | Array | `[image]` | ✅ |

---

## 🔧 Frontend Fixes Needed

### 1. **Consolidate Image URL Function**
Remove duplicate `getImageUrl` from ListingsPage.vue, use shared utility from `@/utils/imageUrl.ts`

### 2. **Standardize Contact Field Priority**
Ensure all pages use:
```typescript
const phone = listing.contact_phone || listing.phone || 'Not available'
const email = listing.contact_email || listing.email || 'Not available'
const website = listing.contact_website || listing.website_url || null
```

### 3. **Normalize Schedule Display**
Use:
```typescript
const days = listing.open_days || listing.days || 'Monday - Saturday'
const time = listing.open_time && listing.close_time
  ? `${listing.open_time.substring(0, 5)} - ${listing.close_time.substring(0, 5)}`
  : listing.hours || '09:00 AM - 06:00 PM'
```

### 4. **Verify Image Normalization**
Backend should return all image URLs as absolute. Update if needed:
```php
$gallery = $listing->mediaFiles
    ->map(fn($media) => $media->public_url) // Already absolute
    ->filter()
    ->values();
```

---

## 📋 Sign-Off Checklist

Before deploying:

- [ ] All API endpoints return valid JSON
- [ ] All image URLs are absolute and load
- [ ] Contact info displays correctly
- [ ] Schedule/hours show CMS data (not fallback)
- [ ] Gallery title is from CMS
- [ ] Popular carousel positioned correctly
- [ ] All pages responsive (375px, 768px, 1400px)
- [ ] No console errors
- [ ] No 404 image requests
- [ ] Admin → Edit → Save → Frontend shows updates in real-time
- [ ] Create new listing flows work end-to-end

---

## 🐛 Known Issues & Status

| Issue | Status | Action |
|-------|--------|--------|
| Image URL mixing (relative/absolute) | 🔴 | Need normalization |
| Contact field inconsistency | 🔴 | Need consolidation |
| Duplicate getImageUrl function | 🟡 | Should be unified |
| Gallery preview modal z-index | 🟢 | Fixed |
| Popular carousel positioning | 🟢 | Fixed |
| Gallery enhancement on Webflow | 🟢 | Fixed |
| Contact info fetching in real-time | 🟡 | Improved, needs testing |

---

**Created**: 2026-06-14  
**Last Updated**: 2026-06-14  
**Test Status**: Ready for execution
