# Image Loading Optimization Guide

## 🚀 Quick Fixes for Localhost Performance

### 1. **Frontend Image Optimization** ✅ (Already Implemented)
- Added `loading="lazy"` to all images
- Added `decoding="async"` for non-blocking rendering
- Images load on-demand as user scrolls

### 2. **Browser Caching Strategy**

Add to your `.htaccess` or server config:
```apache
# Cache images for 30 days
<FilesMatch "\.(jpg|jpeg|png|gif|webp|svg|ico|avif)$">
    Header set Cache-Control "public, max-age=2592000, immutable"
    Header set Expires "Thu, 31 Dec 2026 23:59:59 GMT"
</FilesMatch>

# Cache CSS/JS for 7 days
<FilesMatch "\.(css|js|woff|woff2)$">
    Header set Cache-Control "public, max-age=604800, immutable"
</FilesMatch>

# Don't cache HTML (always fresh)
<FilesMatch "\.html$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
</FilesMatch>
```

### 3. **API Response Caching**

Cache API responses in Laravel:
```php
// In routes/api.php
Route::get('api/v1/public/listings', function (Request $request) {
    return cache()->remember('public_listings', now()->addHours(1), function () {
        return Listing::query()
            ->with(['categories', 'city.country', 'images', 'mediaFiles'])
            ->where('status', 'published')
            ->get()
            ->map(fn(Listing $listing) => publicListingPayload($listing));
    });
})->middleware('throttle:60,1');
```

### 4. **Image Compression & Optimization**

#### Option A: Use ImageOptimizer (Recommended)
```bash
composer require spatie/image-optimizer
```

In your upload controller:
```php
use Spatie\ImageOptimizer\ImageOptimizer;

ImageOptimizer::optimize($imagePath);
```

#### Option B: Manual Image Resizing
```php
// In upload handler
use Intervention\Image\Facades\Image;

$image = Image::make($file)
    ->resize(1920, 1080, function ($constraint) {
        $constraint->aspectRatio();
        $constraint->upsize();
    })
    ->optimize()
    ->save();
```

### 5. **Database Query Optimization**

Use eager loading to reduce N+1 queries:
```php
// ✅ Good - Loads all relations at once
Listing::with(['images', 'mediaFiles', 'categories', 'city.country'])
    ->where('status', 'published')
    ->get();

// ❌ Bad - Multiple queries per listing
Listing::where('status', 'published')->get();
// Then accessing: $listing->images triggers another query
```

### 6. **Frontend Image Loading Performance**

#### Implement Intersection Observer for Lazy Loading
```vue
<script setup>
import { ref, onMounted } from 'vue'

const images = ref([])

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.src = entry.target.dataset.src
        observer.unobserve(entry.target)
      }
    })
  })

  document.querySelectorAll('img[data-src]').forEach(img => {
    observer.observe(img)
  })
})
</script>

<template>
  <img :data-src="imageUrl" loading="lazy" alt="">
</template>
```

### 7. **Network Tab Optimization**

Monitor image requests:
1. Open DevTools → Network tab
2. Check image load times
3. Target: Images should load in < 500ms on localhost

If slower:
- Reduce image resolution/quality
- Compress images with tools like TinyPNG
- Use WebP format (saves 25-35% file size)

### 8. **Server Configuration Optimization**

For Apache (add to `.htaccess`):
```apache
# Enable GZIP compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Enable mod_expires
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
</IfModule>
```

For Nginx (in nginx.conf):
```nginx
# Gzip compression
gzip on;
gzip_types text/plain text/css image/png image/jpeg application/json;
gzip_min_length 1000;

# Browser caching
expires 30d;
add_header Cache-Control "public, immutable";
```

### 9. **Quick Localhost Improvements**

```bash
# Clear Laravel cache
php artisan cache:clear
php artisan config:cache
php artisan route:cache

# Optimize autoloader
composer dump-autoload -o

# Use memory cache driver for dev
# In .env: CACHE_DRIVER=array
```

### 10. **Image Format Best Practices**

| Format  | Use Case | File Size |
|---------|----------|-----------|
| WebP    | Modern browsers | -30% |
| AVIF    | Best compression | -40% |
| JPG     | Photos | Standard |
| PNG     | Transparent/lossless | Larger |
| SVG     | Icons/logos | Scalable |

---

## 📊 Performance Checklist

- [ ] All `<img>` tags have `loading="lazy"`
- [ ] All `<img>` tags have `decoding="async"`
- [ ] Database queries use eager loading (`.with()`)
- [ ] API responses are cached
- [ ] Browser cache headers are set
- [ ] Images are compressed before upload
- [ ] GZIP compression is enabled
- [ ] Laravel cache is cleared and optimized
- [ ] Image load time < 500ms in DevTools
- [ ] No N+1 queries in Network tab

---

## 🔍 Testing Image Performance

### Command Line Testing
```bash
# Check image size
du -h /path/to/image.jpg

# Test with curl (includes timing)
curl -w "Time taken: %{time_total}s\n" -o /dev/null -s https://localhost:8000/storage/uploads/image.jpg
```

### Browser Testing
```javascript
// Run in Console
performance.mark('image-load-start')
// Load image
performance.mark('image-load-end')
performance.measure('image-load', 'image-load-start', 'image-load-end')
console.table(performance.getEntriesByName('image-load'))
```

---

## 💡 Pro Tips

1. **Use CDN for production** - Cloudflare, Imgix, or Cloudinary
2. **Implement picture element** for responsive images:
   ```html
   <picture>
     <source srcset="image.webp" type="image/webp">
     <source srcset="image.jpg" type="image/jpeg">
     <img src="image.jpg" alt="">
   </picture>
   ```

3. **Monitor with Lighthouse** - Chrome DevTools → Lighthouse
4. **Track metrics** - Use web-vitals.js for real monitoring

---

**Last Updated**: 2026-06-15  
**Status**: Ready for Implementation
