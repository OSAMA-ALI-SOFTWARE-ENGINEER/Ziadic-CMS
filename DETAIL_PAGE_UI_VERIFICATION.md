# Listing Detail Page - UI Verification Guide

## ✅ Update Complete

The Vue.js listing detail page has been updated to match the **exact original Webflow design** while maintaining full CMS data binding.

---

## 📐 Layout Structure

### Page Flow (Top to Bottom):
```
1. Page Banner Section
   └─ Title "Bursa Modern Art Museum"

2. Date/Time Information Bar
   ├─ Clock icon + Time (09:00 - 18:00)
   ├─ Calendar icon + Days (Monday - Saturday)
   └─ Calendar icon + Weekend (Weekend: Sunday)

3. Main Content Container
   ├─ Featured Image (full width)
   │
   └─ Two-Column Layout
      ├─ Left Column (2fr):
      │  ├─ Summary Text
      │  ├─ Gallery Heading
      │  ├─ Gallery Grid (4 images)
      │  └─ Load More Button
      │
      └─ Right Column (1fr):
         ├─ Contact Information Card
         │  ├─ Phone (with tel: link)
         │  ├─ Email (with mailto: link)
         │  ├─ Website (external link)
         │  └─ Address
         │
         └─ Schedule Information Card
            ├─ Time (with icon)
            ├─ Days (with icon)
            └─ Weekend (with icon)
```

---

## 🎨 Visual Elements

### Contact Information Section
- **White background** with subtle shadow
- **Icons** (SVG inline) on the left:
  - 🏠 House icon for phone
  - ✉️ Envelope icon for email
  - 🌐 Globe icon for website
  - 📍 Map pin icon for address
- **Red color** (#c41e3a) for icons
- **Clickable links**:
  - Phone: `tel:` protocol
  - Email: `mailto:` protocol
  - Website: External link (target="_blank")
- **Address**: Plain text display

### Schedule Information Section
- Same card styling as contact
- **Three items**:
  - Clock icon + Time (09:00 - 18:00)
  - Calendar icon + Days (Monday - Saturday)
  - Calendar icon + Weekend (Weekend: Sunday)
- All fetched from CMS fields:
  - `open_time` and `close_time` (formatted)
  - `open_days` (fallback: `days`)
  - `weekend_text`

### Gallery Section
- **Heading**: From `gallery_heading` CMS field
- **Grid**: Auto-fit responsive (4 images initially)
- **Images**: Clickable for preview modal
- **Load More**: Shows when > 4 images
- **Button text**: "Load More (X more)"

---

## 🔄 Responsive Breakpoints

### Desktop (1200px+)
- Two-column layout (2fr 1fr)
- Gallery grid: 4 images
- Contact/Schedule: Side panel
- Full spacing and padding

### Tablet (768px - 1023px)
- **Still two-column** (responsive columns)
- Gallery grid: 2 images per row
- Contact/Schedule: Still in sidebar
- Reduced gap (30px → 24px)

### Mobile (< 768px)
- **Single-column layout**
- Gallery grid: 2 images per row
- Contact/Schedule: Below gallery (full width)
- Reduced padding
- Adjusted font sizes

### Extra Small (< 480px)
- Gallery grid: 1 image per row
- All sections: Single column
- Minimal padding (16px)
- Compact font sizes

---

## 📋 Testing Checklist

### Visual Layout
- [ ] Banner shows at top with pink gradient
- [ ] Title is large and centered
- [ ] Date/time bar shows below banner
- [ ] Featured image displays (responsive width)
- [ ] Two-column layout visible on desktop
- [ ] Gallery on left, contact info on right
- [ ] Contact and schedule cards have white background

### Contact Information
- [ ] Phone displays with phone icon
- [ ] Phone is clickable (tel: link)
- [ ] Email displays with envelope icon
- [ ] Email is clickable (mailto: link)
- [ ] Website displays with globe icon
- [ ] Website opens in new tab
- [ ] Address displays with map pin icon
- [ ] All icons are red (#c41e3a)

### Schedule Information
- [ ] Time shows (09:00 - 18:00 format)
- [ ] Days show (Monday - Saturday)
- [ ] Weekend info shows
- [ ] All have proper icons
- [ ] All icons are red

### Gallery
- [ ] Gallery heading shows: "Gallery" or custom from CMS
- [ ] Gallery grid shows images (4 initially)
- [ ] Images are square (1:1 aspect ratio)
- [ ] Images are responsive
- [ ] Gallery grid has proper gaps
- [ ] Images are clickable
- [ ] Load More button shows (if > 4 images)
- [ ] Load More shows correct count

### Gallery Preview Modal
- [ ] Click image opens full preview
- [ ] Modal is centered
- [ ] Image counter shows (e.g., "1 / 12")
- [ ] Arrow keys navigate
- [ ] ESC closes modal
- [ ] Click X button closes
- [ ] Click backdrop closes

### Data Binding
- [ ] Title from listing.title
- [ ] Summary from listing.summary
- [ ] Contact phone from listing.contact_phone (fallback: listing.phone)
- [ ] Contact email from listing.contact_email (fallback: listing.email)
- [ ] Contact website from listing.contact_website (fallback: listing.website_url)
- [ ] Contact address from listing.contact_address (fallback: listing.location)
- [ ] Time from listing.open_time/close_time (fallback: listing.hours)
- [ ] Days from listing.open_days (fallback: listing.days)
- [ ] Weekend from listing.weekend_text
- [ ] Gallery heading from listing.gallery_heading
- [ ] Gallery images from listing.gallery array

### Responsive Testing
- [ ] **Desktop (1400px)**: Two-column layout
  - Gallery: 4 images wide
  - Contact: Right sidebar
  - Proper spacing

- [ ] **Tablet (768px)**: Two-column but responsive
  - Gallery: 2 images wide
  - Contact: Right sidebar
  - Medium spacing

- [ ] **Mobile (375px)**: Single column
  - Gallery: 1-2 images wide
  - Contact: Below gallery
  - Full width

### Browser Console
- [ ] No errors (F12 → Console)
- [ ] Console logs show: "[CMS] Listing loaded: [title]"
- [ ] No failed API requests (Network tab)

---

## 🧪 Manual Testing Steps

### Test 1: Load Listing Detail Page
```
1. Navigate to: http://localhost:5174/listings/bursa-modern-art-museum
2. Wait for page to load
3. Check browser console for errors
4. Verify all sections visible
```

### Test 2: Verify Contact Information
```
1. Scroll to right column
2. Look for "Contact Information" heading
3. Check that all fields display:
   - Phone: +923485033323 (with icon)
   - Email: osama.infiniti@gmail.com (with icon)
   - Website: osama-ali.com (with icon)
   - Address: 234 Gallery Street, Tirana, Albania (with icon)
4. Click phone → should open phone dialer
5. Click email → should open mail client
6. Click website → should open in new tab
```

### Test 3: Verify Schedule Information
```
1. Below Contact Information
2. Look for "Schedule Information" heading
3. Check that all fields display:
   - Time: 09:00 - 18:00 (with clock icon)
   - Days: Monday - Saturday (with calendar icon)
   - Weekend: Weekend: Sunday (with calendar icon)
4. All icons should be red
```

### Test 4: Gallery and Preview
```
1. Scroll to left column
2. See "Gallery" heading
3. See 4 images in grid
4. Click first image
5. Modal opens with full image
6. Counter shows "1 / 2"
7. Press arrow right
8. Next image shows, counter updates
9. Press ESC
10. Modal closes
```

### Test 5: Responsive Testing
```
1. Open DevTools (F12)
2. Click "Responsive Design Mode" (Ctrl+Shift+M)
3. Test at 1400px:
   - Two-column layout
   - Contact/Schedule on right
4. Test at 768px:
   - Two-column still visible
   - Gallery: 2 per row
5. Test at 375px:
   - Single column layout
   - Contact below gallery
   - Gallery: 1-2 per row
```

---

## 📊 Field Mapping

| CMS Field | Section | Display | Priority |
|-----------|---------|---------|----------|
| `title` | Banner | Large heading | Primary |
| `location` | (not shown) | - | - |
| `summary` | Left column | Text paragraph | Primary |
| `image` | Featured image | Full width | Primary |
| `gallery` | Gallery | Image grid | Primary |
| `gallery_heading` | Gallery | Section title | Default: "Gallery" |
| `contact_phone` | Contact Info | Phone link | contact_phone > phone |
| `contact_email` | Contact Info | Email link | contact_email > email |
| `contact_website` | Contact Info | Website link | contact_website > website_url |
| `contact_address` | Contact Info | Text | contact_address > location |
| `open_time` | Schedule | Hours start | Primary |
| `close_time` | Schedule | Hours end | Primary |
| `open_days` | Schedule | Days | open_days > days |
| `weekend_text` | Schedule | Weekend | Default: "Weekend: Sunday" |
| `category` | (not shown) | - | - |
| `hours` | Schedule (fallback) | Time | Fallback for open_time/close_time |
| `days` | Schedule (fallback) | Days | Fallback for open_days |

---

## ✨ Key Differences from Old Design

### ✅ Maintained
- Exact same layout structure
- Same color scheme (red #c41e3a)
- Same spacing and padding
- Same responsive behavior
- Same heading styles
- Same gallery grid

### ✅ Improved
- Contact icons now **always visible** (no hiding)
- Gallery preview modal **works with Vue data**
- Load More button **fully functional**
- All data **real-time from CMS** (not hardcoded)
- No HTML template dependency
- Better TypeScript typing
- Cleaner Vue.js code

### ❌ Removed
- Webflow HTML template
- DOM manipulation for population
- LegacyWebflowPage dependency
- ListingDetailPopulator workarounds

---

## 🚀 Performance

### Data Fetching
- **Single API call**: `GET /api/v1/public/listings`
- **In-page parsing**: Find listing by slug
- **No extra API calls**: All data in single response
- **Async loading**: Proper loading states

### Image Handling
- **Normalized URLs**: All images absolute
- **Lazy loading**: Browser default (loading="lazy")
- **Object-fit**: Proper image scaling
- **Responsive**: Works at all breakpoints

### Rendering
- **Computed properties**: gallery deduplication
- **Conditional rendering**: v-if for sections
- **No excessive re-renders**: Minimal reactivity
- **Proper event handling**: Click handlers

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Contact icons not showing | CSS issue | Check styles compiled |
| Contact info links not working | href missing | Verify contact fields filled |
| Gallery not clickable | onClick not bound | Check openGalleryPreview function |
| Load More not working | visibleGalleryCount not updating | Check ref reactivity |
| Images showing 404 | URL not normalized | Verify getImageUrl() working |
| Modal not opening | showGalleryPreview not toggling | Check Vue devtools state |
| Wrong data showing | Stale cache | Hard refresh Ctrl+Shift+R |

---

## ✅ Sign-Off Checklist

- [ ] Page loads without errors
- [ ] Banner displays title correctly
- [ ] Date/time bar shows all info
- [ ] Featured image displays
- [ ] Two-column layout visible on desktop
- [ ] Contact information displays all 4 fields
- [ ] All contact links are clickable
- [ ] All icons are visible and red
- [ ] Schedule information displays
- [ ] Gallery shows 4 images initially
- [ ] Load More button shows (if applicable)
- [ ] Gallery images are clickable
- [ ] Preview modal opens and works
- [ ] Keyboard navigation works (arrow keys, ESC)
- [ ] Responsive at 375px, 768px, 1400px
- [ ] No console errors
- [ ] All data from CMS (not hardcoded)

---

## 📞 Troubleshooting

### Page Not Loading
1. Check browser console (F12)
2. Look for error messages
3. Check network tab for failed API calls
4. Verify backend is running (http://localhost:8000)

### Contact Info Not Showing
1. Hard refresh page (Ctrl+Shift+R)
2. Check API response: http://localhost:8000/api/v1/public/listings/bursa-modern-art-museum
3. Verify CMS has contact data filled in
4. Check browser console for Vue errors

### Layout Looks Wrong
1. Clear browser cache
2. Check responsive design mode (Ctrl+Shift+M)
3. Verify CSS compiled (check dist/assets/)
4. Check for conflicting styles

### Images Not Loading
1. Check image URLs in Network tab
2. Verify getImageUrl() is working
3. Check API returns absolute URLs
4. Verify images exist on server

---

**Status**: ✅ **READY FOR TESTING**

The detail page now displays with the exact original Webflow layout,
but with full Vue.js dynamic data binding from CMS.

Test the page and verify all sections display correctly!
