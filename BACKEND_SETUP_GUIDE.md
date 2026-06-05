# Backend Settings API - Setup Guide

## Overview

I've created the complete backend implementation for the Settings Management System. Follow these steps to get everything working.

---

## Files Created

### 1. Controllers
- **`app/Http/Controllers/Admin/UploadController.php`**
  - Handles file uploads
  - Stores files in `storage/app/public/media/{date}/`
  - Returns accessible URL

- **`app/Http/Controllers/Admin/AdminSettingsController.php`**
  - GET/POST endpoints for each settings section
  - Validates data based on section
  - Stores settings in database as JSON

### 2. Database Migration
- **`database/migrations/2024_01_01_000000_create_admin_settings_table.php`**
  - Creates `admin_settings` table
  - Columns: `id`, `section` (unique), `data` (JSON), `timestamps`

### 3. Routes
- **`admin/routes/api.php`** - Updated with:
  - `POST /api/v1/admin/upload` - File upload
  - `GET /api/v1/admin/settings/{section}` - Load settings
  - `POST /api/v1/admin/settings/{section}` - Save settings

---

## Setup Instructions

### Step 1: Run the Migration

```bash
php artisan migrate
```

This creates the `admin_settings` table in your database.

### Step 2: Create Storage Symlink

```bash
php artisan storage:link
```

This creates a symlink so uploaded files are accessible via `public/storage/`.

### Step 3: Set File Permissions

Ensure the `storage` directory is writable:

```bash
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
```

### Step 4: Test the API

Use Postman or cURL to test:

```bash
# Test upload
curl -X POST http://localhost:8000/api/v1/admin/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.png" \
  -F "category=logo"

# Test get settings
curl -X GET http://localhost:8000/api/v1/admin/settings/branding \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test save settings
curl -X POST http://localhost:8000/api/v1/admin/settings/branding \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mainLogo": "/storage/media/2026-06-03/logo.png",
    "darkLogo": "/storage/media/2026-06-03/dark-logo.png"
  }'
```

---

## API Endpoints

### File Upload
**POST** `/api/v1/admin/upload`

Request:
```
Content-Type: multipart/form-data
file: (image file)
category: logo|favicon|og-image|branding (optional)
Authorization: Bearer {token}
```

Response (201):
```json
{
  "url": "/storage/media/2026-06-03/logo-abc123.png",
  "filename": "logo-abc123.png",
  "size": 45678,
  "mime_type": "image/png"
}
```

---

### Branding Settings
**GET** `/api/v1/admin/settings/branding`
**POST** `/api/v1/admin/settings/branding`

Request Body:
```json
{
  "mainLogo": "/storage/media/.../logo.png",
  "darkLogo": "/storage/media/.../dark-logo.png",
  "lightLogo": "/storage/media/.../light-logo.png",
  "favicon": "/storage/media/.../favicon.ico",
  "appleTouchIcon": "/storage/media/.../apple-touch.png",
  "loginPageLogo": "/storage/media/.../login-logo.png"
}
```

---

### Theme Settings
**GET** `/api/v1/admin/settings/theme`
**POST** `/api/v1/admin/settings/theme`

Request Body:
```json
{
  "primaryColor": "#465fff",
  "secondaryColor": "#8B5CF6",
  "accentColor": "#EC4899",
  "successColor": "#10B981",
  "warningColor": "#F59E0B",
  "errorColor": "#EF4444",
  "backgroundColor": "#FFFFFF",
  "sidebarColor": "#F9FAFB",
  "headerColor": "#FFFFFF",
  "cardColor": "#FFFFFF",
  "buttonColor": "#465fff",
  "fontFamily": "Inter, system-ui, sans-serif",
  "headingFont": "Poppins, system-ui, sans-serif",
  "bodyFont": "Inter, system-ui, sans-serif",
  "sidebarWidth": 280,
  "cardBorderRadius": 12,
  "containerWidth": 1280,
  "isCollapsedDefault": false,
  "isFixedHeader": true,
  "isFixedSidebar": true,
  "themeMode": "light"
}
```

---

### SEO Settings
**GET** `/api/v1/admin/settings/seo`
**POST** `/api/v1/admin/settings/seo`

Request Body:
```json
{
  "defaultMetaTitle": "Kukaqka CMS",
  "defaultMetaDescription": "Admin Control Panel",
  "defaultKeywords": "cms, admin, dashboard",
  "robotsMetaTag": "index, follow",
  "openGraphTitle": "Kukaqka",
  "openGraphDescription": "Admin Panel",
  "openGraphImage": "/storage/media/.../og-image.png",
  "twitterTitle": "Kukaqka",
  "twitterDescription": "Admin Panel",
  "twitterCardImage": "/storage/media/.../twitter.png",
  "sitemapURL": "https://example.com/sitemap.xml",
  "robotsTxt": "User-agent: *\nAllow: /",
  "canonicalURL": "https://example.com",
  "googleVerificationCode": "xyz",
  "bingVerificationCode": "abc"
}
```

---

### Payment Settings
**GET** `/api/v1/admin/settings/payments`
**POST** `/api/v1/admin/settings/payments`

Request Body:
```json
{
  "status": "coming-soon"
}
```

---

## Frontend Integration

The frontend will **automatically detect** when the backend is ready:

1. Makes API call → Real backend returns data
2. Frontend stores in database and displays success
3. Data persists across page reloads

**No frontend changes needed!** It already has the mock API fallback.

---

## File Storage

Uploaded files are stored in:
```
storage/app/public/media/
  └── 2026-06-03/
      ├── logo-abc123.png
      ├── favicon-def456.ico
      └── ...
```

Accessible via:
```
/storage/media/2026-06-03/logo-abc123.png
```

---

## Database Schema

```sql
CREATE TABLE admin_settings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  section VARCHAR(255) UNIQUE NOT NULL,
  data JSON,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  INDEX(section)
);
```

Example rows:
```
| id | section   | data                          |
|----|-----------|-------------------------------|
| 1  | branding  | {"mainLogo": "...", ...}     |
| 2  | theme     | {"primaryColor": "#465fff"...}|
| 3  | seo       | {"defaultMetaTitle": "..."}  |
| 4  | payments  | {"status": "coming-soon"}    |
```

---

## Troubleshooting

### 404 Errors on Upload
**Problem:** `POST /api/v1/admin/upload 404 Not Found`

**Solution:** 
- Verify the route is added to `routes/api.php`
- Check the UploadController exists at `app/Http/Controllers/Admin/UploadController.php`
- Restart Laravel server: `php artisan serve`

### Files Not Saving to Database
**Problem:** Settings POST returns 200 but data doesn't persist

**Solution:**
- Run migration: `php artisan migrate`
- Check database connection in `.env`
- Verify `admin_settings` table exists: `php artisan tinker` → `DB::table('admin_settings')->get()`

### File Upload Failing
**Problem:** `500 error` on file upload

**Solution:**
- Create storage symlink: `php artisan storage:link`
- Fix permissions: `chmod -R 775 storage/`
- Check disk space available

### Images Not Accessible
**Problem:** Upload succeeds but image returns 404

**Solution:**
- Run storage link: `php artisan storage:link`
- Check `.env` APP_URL is correct
- Verify files exist in `storage/app/public/media/`

---

## Testing Workflow

### 1. Upload a Logo
```bash
curl -X POST http://localhost:8000/api/v1/admin/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@logo.png" \
  -F "category=logo"
```

Expected response:
```json
{
  "url": "/storage/media/2026-06-03/logo-abc123.png",
  "filename": "logo-abc123.png",
  "size": 45678,
  "mime_type": "image/png"
}
```

### 2. Save Branding Settings
```bash
curl -X POST http://localhost:8000/api/v1/admin/settings/branding \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mainLogo": "/storage/media/2026-06-03/logo-abc123.png"
  }'
```

### 3. Load Settings
```bash
curl -X GET http://localhost:8000/api/v1/admin/settings/branding \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected: Returns your saved settings

### 4. Test Frontend
- Open `http://localhost:5173/admin/settings`
- Upload a logo → Should show in preview
- Edit colors → Should save to database
- Refresh page → Settings should persist

---

## Next Steps

1. ✅ Run migration
2. ✅ Create storage symlink
3. ✅ Test API with cURL
4. ✅ Test frontend upload
5. ✅ Verify data persists in database

---

## Need Help?

Check:
- Laravel logs: `storage/logs/laravel.log`
- Database: `php artisan tinker` → `DB::table('admin_settings')->get()`
- Routes: `php artisan route:list | grep settings`

---

## Architecture

```
Frontend (Vue 3)
    ↓ (API call)
Upload/Settings Endpoint
    ↓
AdminSettingsController / UploadController
    ↓
File System / Database
    ↓
Data Persisted ✨
```

When all 5 endpoints are implemented, the frontend automatically switches from **mock API** to **real backend**!

---

Generated: 2026-06-03
