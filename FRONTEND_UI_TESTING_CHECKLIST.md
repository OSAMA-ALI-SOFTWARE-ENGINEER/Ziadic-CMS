# Frontend UI Improvements - Quick Testing Checklist

## ⚡ Quick 10-Minute Test

### 1. Hard Refresh
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### 2. Test Listing Cards (5 minutes)

#### Home Page
- [ ] Visit `http://localhost:5176/` (Home)
- [ ] Scroll to Popular Listings section
- [ ] Cards display with:
  - [ ] Image thumbnail
  - [ ] Title (max 2 lines)
  - [ ] Location with 📍 icon
  - [ ] Days and hours with icons
  - [ ] Summary text (2 lines)
  - [ ] "View Details →" CTA
  - [ ] Hover zoom effect on image
  - [ ] Smooth box shadow on hover

#### Listings Page
- [ ] Visit `http://localhost:5176/listings` (Listings)
- [ ] Cards should look **identical** to Home page
- [ ] Same spacing, colors, typography
- [ ] Same hover effects

### 3. Test Gallery Features (3 minutes)

#### Gallery Title
- [ ] Go to listing detail: `http://localhost:5176/listings/[any-listing-slug]`
- [ ] Check gallery heading (should be from CMS or "Vibrant Gallery")
- [ ] Not hardcoded

#### Gallery Images
- [ ] Gallery section visible
- [ ] Shows up to 4 images initially
- [ ] All images are unique (no duplicates)
- [ ] Images load without 404 errors

#### Load More
- [ ] If listing has > 4 images:
  - [ ] "Load More (X more)" button visible
  - [ ] Click button → shows next batch
  - [ ] Counter updates correctly
  - [ ] Button disappears when all shown
- [ ] If ≤ 4 images:
  - [ ] All shown, no Load More button

#### Gallery Preview
- [ ] Click any gallery image
- [ ] Modal opens (fullscreen preview)
- [ ] Image displays centered and large
- [ ] Shows counter: "X / Y"
- [ ] Close button (✕) in top-right
- [ ] Previous/Next arrows (if applicable)
- [ ] Click arrow or press → key → next image
- [ ] Press ← key → previous image
- [ ] Press ESC → closes modal
- [ ] Click backdrop → closes modal

### 4. Test Popular Carousel (2 minutes)

#### Bottom Section
- [ ] Scroll to bottom of listing detail page
- [ ] "Popular Places You Might Like" section visible
- [ ] Shows 3 cards on desktop
- [ ] Uses same ListingCard design
- [ ] Does NOT include current listing

#### Responsiveness
- [ ] On tablet (800px width): shows 2 cards
- [ ] On mobile (375px width): shows 1 card

### 5. Console Check (immediately)

Open DevTools (F12) → Console:
- [ ] No red errors
- [ ] Look for logs like:
  ```
  All listings fetched: X
  Found listing: [slug]
  Gallery deduped: Y unique images
  Popular listings loaded: Z
  ```
- [ ] No failed API requests

---

## ✅ Full QA Checklist (30 minutes)

### Visual Design (8 min)
#### Listing Cards
- [ ] Cards have 12px border radius
- [ ] Card image is square (1:1 aspect ratio)
- [ ] Image has proper object-fit: cover
- [ ] Text hierarchy clear (title > location > hours)
- [ ] Category badge in top-left of content
- [ ] Spacing: 16px padding inside card
- [ ] Box shadow visible (not too dark, not too light)
- [ ] Hover shadow darker/larger

#### Gallery
- [ ] Gallery images are square in grid
- [ ] Proper gap between images (20px desktop)
- [ ] Load More button centered
- [ ] Modal is centered on screen
- [ ] Modal max-width respects viewport (90vw)

#### Popular Carousel
- [ ] Section has gray background (#f9f9f9)
- [ ] Padding around section (60px top/bottom)
- [ ] Cards display in 3-column grid (desktop)
- [ ] Proper card spacing (30px gap)

### Gallery Features (12 min)
#### Image Deduplication
- [ ] Count unique images correctly
- [ ] Removes case-insensitive duplicates
- [ ] Preserves order of first occurrence

#### Load More
- [ ] Initial count is 4 (or less if < 4 total)
- [ ] Button text: "Load More (X more)"
- [ ] Each click adds 4 more
- [ ] Correct remaining count
- [ ] Disappears at exactly right time

#### Gallery Preview
- [ ] Opens fullscreen (max 90vw × 90vh)
- [ ] Image centered and scaled
- [ ] Counter position: bottom-center
- [ ] Close button position: top-right
- [ ] Nav arrows only show if applicable
- [ ] Keyboard shortcut help in console (optional)

#### Popular Carousel
- [ ] Fetches from /api/v1/public/listings/popular
- [ ] Excludes current listing
- [ ] Shows up to 12 listings (3×4 on desktop)
- [ ] All cards linked correctly
- [ ] No duplicates

### API Integration (5 min)
#### Inspect Network Requests
1. Open DevTools → Network
2. Filter: XHR
3. Refresh page
4. Check requests:

**GET /api/v1/public/listings**
- [ ] Returns 200 OK
- [ ] Response includes `gallery_heading`
- [ ] Response includes `gallery` array
- [ ] Response includes `is_popular` and `popular_order`

**GET /api/v1/public/listings/popular**
- [ ] Returns 200 OK
- [ ] Only includes `is_popular: true` listings
- [ ] Sorted by `popular_order`

#### Response Data
- [ ] `gallery_heading` is string (never undefined)
- [ ] `gallery` is array of URLs
- [ ] URLs are absolute (start with http://)
- [ ] No broken image URLs

### Responsiveness (5 min)
#### Desktop (1200px+)
- [ ] Gallery: 4+ columns
- [ ] Carousel: 3 columns
- [ ] Card size: ~280px width
- [ ] No overflow

#### Tablet (768px)
- [ ] Gallery: 3 columns
- [ ] Carousel: 2 columns
- [ ] Card size: ~200px width
- [ ] Proper padding

#### Mobile (375px)
- [ ] Gallery: 2 columns
- [ ] Carousel: 1 column
- [ ] Cards fill width minus padding
- [ ] Modal: 95vw width
- [ ] Modal: 95vh height

#### Test Responsiveness
1. Open DevTools
2. Click "Responsive Design Mode" or press Ctrl+Shift+M
3. Test widths: 375, 768, 1024, 1400
4. Check gallery columns change
5. Check carousel columns change

### Browser Compatibility (5 min)
Test in these browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

Check for:
- [ ] No red console errors
- [ ] Modal displays correctly
- [ ] Keyboard nav works (arrow keys, ESC)
- [ ] Hover effects visible
- [ ] Images load

### Backward Compatibility (5 min)
- [ ] Old listings without gallery still work
- [ ] Fallback placeholder displays
- [ ] Webflow template still gets populated
- [ ] Legacy images display if no mediaFiles
- [ ] No broken links
- [ ] All pages still accessible

---

## 🧪 Edge Case Testing (Optional)

### Test 1: Listing with NO gallery
- [ ] Gallery section might not show (or show empty)
- [ ] Popular carousel still works
- [ ] No console errors

### Test 2: Listing with 1 image
- [ ] Shows 1 image in gallery
- [ ] No Load More button
- [ ] Gallery preview still works
- [ ] Next/prev arrows hidden appropriately

### Test 3: Listing with MANY images (20+)
- [ ] First 4 show
- [ ] Load More shows large count
- [ ] Preview modal navigates all
- [ ] No lag when loading more
- [ ] Counter accurate (e.g., "20 / 20")

### Test 4: Listing with duplicate images
- [ ] Duplicates removed
- [ ] Console shows dedup count
- [ ] Grid shows only unique images

### Test 5: Missing gallery_heading
- [ ] Falls back to "Vibrant Gallery"
- [ ] No console errors

### Test 6: Slow Network
1. Open DevTools
2. Network tab
3. Set throttle to "Slow 3G"
4. Load page
- [ ] Images load progressively
- [ ] No placeholder flicker
- [ ] Modal still works (loads slower)

---

## 📱 Mobile-Specific Testing

### Touchscreen Tests
- [ ] Can swipe/tap images
- [ ] Gallery preview opens on tap
- [ ] Navigation buttons tappable
- [ ] Load More button easy to tap
- [ ] Modal has enough padding (buttons not hidden)

### Keyboard Tests (Accessibility)
- [ ] Tab through listing cards
- [ ] Tab through buttons (Load More, nav)
- [ ] Tab through carousel cards
- [ ] Focus visible on all interactive elements

---

## 🐛 Common Issues to Check

| Issue | Check | Solution |
|-------|-------|----------|
| Gallery not showing | API returns empty gallery array | Add images via CMS admin |
| Duplicates in gallery | Dedup function not called | Check ListingDetailPopulator |
| Preview modal too small | CSS breakpoint not applying | Check media queries |
| Load More button stuck | visibleGalleryCount not updating | Check Vue reactivity |
| Cards misaligned | CSS grid gaps | Verify spacing values |
| Popular carousel empty | fetchPopularListings fails | Check API /popular endpoint |
| Images 404 | URL missing base path | Check getImageUrl utility |

---

## 🎯 Final Sign-Off

Run this final check:

```bash
# 1. Check for console errors
# Open DevTools → Console
# Should be clean (no red errors)

# 2. Check network requests
# Open DevTools → Network → XHR
# Should see API calls returning 200 OK

# 3. Check responsive
# DevTools → Responsive Design Mode
# Test 375px, 768px, 1024px, 1400px

# 4. Check gallery
# Click 3+ images
# Preview modal should work smoothly
```

If all checks pass:
✅ **Frontend UI improvements are working correctly!**

---

## Rollback (if needed)
```bash
git revert 8e64f1c
# or
git checkout [previous-commit]
```

---

**Last Updated**: 2026-06-14
**Test Duration**: 10 min (quick) to 30 min (full)
