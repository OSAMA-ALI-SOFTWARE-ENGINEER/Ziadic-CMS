# Settings & Upload API Endpoints

This document outlines the backend endpoints needed for the Enterprise Settings Management System.

## Overview

The frontend expects these endpoints to handle settings management and file uploads. The system gracefully degrades if endpoints don't exist yet (for development), but requires them for production.

---

## Endpoints

### 1. **Upload Image** (Primary Priority)
**POST** `/api/v1/admin/upload`

Handles file uploads for logos, favicons, and media assets.

#### Request
- **Content-Type**: `multipart/form-data`
- **Body Parameters**:
  - `file` (File, required) - Image file
  - `category` (string, optional) - Upload category: `logo`, `favicon`, `og-image`, `branding`

#### Response (Success)
```json
{
  "url": "/storage/media/2026-06-03/main-logo-abc123.png",
  "filename": "main-logo-abc123.png",
  "size": 45678,
  "mime_type": "image/png"
}
```

#### Response (Error)
```json
{
  "message": "File must be an image",
  "errors": {
    "file": ["Only image files are allowed"]
  }
}
```

#### Validation Rules
- Only image MIME types: `image/*`
- Max file size: **5MB**
- Allowed formats: JPG, PNG, GIF, WebP
- Store in: `/storage/media/{date}/{filename}`

#### Implementation Notes
- Generate unique filename to avoid conflicts
- Create directory if it doesn't exist
- Store metadata in database for auditing
- Return absolute URL or relative path (frontend accepts both)

---

### 2. **Load Branding Settings**
**GET** `/api/v1/admin/settings/branding`

Fetch saved branding configuration.

#### Response (Success)
```json
{
  "mainLogo": "/storage/media/2026-06-03/logo-main.png",
  "darkLogo": "/storage/media/2026-06-03/logo-dark.png",
  "lightLogo": "/storage/media/2026-06-03/logo-light.png",
  "favicon": "/storage/media/2026-06-03/favicon.ico",
  "appleTouchIcon": "/storage/media/2026-06-03/apple-touch.png",
  "loginPageLogo": "/storage/media/2026-06-03/login-logo.png"
}
```

#### Response (No Settings - Return 404)
The frontend will use defaults if this returns 404.

---

### 3. **Save Branding Settings**
**POST** `/api/v1/admin/settings/branding`

Save branding configuration.

#### Request
```json
{
  "mainLogo": "/storage/media/2026-06-03/logo-main.png",
  "darkLogo": "/storage/media/2026-06-03/logo-dark.png",
  "lightLogo": "/storage/media/2026-06-03/logo-light.png",
  "favicon": "/storage/media/2026-06-03/favicon.ico",
  "appleTouchIcon": "/storage/media/2026-06-03/apple-touch.png",
  "loginPageLogo": "/storage/media/2026-06-03/login-logo.png"
}
```

#### Response
Same as GET response above.

---

### 4. **Load Theme Settings**
**GET** `/api/v1/admin/settings/theme`

Fetch saved theme configuration.

#### Response (Success)
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

### 5. **Save Theme Settings**
**POST** `/api/v1/admin/settings/theme`

Save theme configuration. Same request/response format as GET above.

---

### 6. **Load SEO Settings**
**GET** `/api/v1/admin/settings/seo`

Fetch saved SEO configuration.

#### Response (Success)
```json
{
  "defaultMetaTitle": "Kukaqka CMS",
  "defaultMetaDescription": "Admin Control Panel",
  "defaultKeywords": "cms, admin, dashboard",
  "robotsMetaTag": "index, follow",
  "openGraphTitle": "",
  "openGraphDescription": "",
  "openGraphImage": "",
  "twitterTitle": "",
  "twitterDescription": "",
  "twitterCardImage": "",
  "sitemapURL": "",
  "robotsTxt": "User-agent: *\nAllow: /",
  "canonicalURL": "",
  "googleVerificationCode": "",
  "bingVerificationCode": ""
}
```

---

### 7. **Save SEO Settings**
**POST** `/api/v1/admin/settings/seo`

Save SEO configuration. Same request/response format as GET above.

---

### 8. **Load Payment Settings**
**GET** `/api/v1/admin/settings/payments`

Fetch saved payment configuration.

#### Response (Success)
```json
{
  "status": "coming-soon"
}
```

---

### 9. **Save Payment Settings**
**POST** `/api/v1/admin/settings/payments`

Save payment configuration. Same request/response format as GET above.

---

## Error Handling

### Standard Error Response
```json
{
  "message": "Validation failed",
  "errors": {
    "field_name": ["Error message 1", "Error message 2"]
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Resource created
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Resource not found (frontend will use defaults)
- `422` - Unprocessable entity
- `500` - Server error

---

## Implementation Priority

### Phase 1 (MVP)
1. ✅ Upload endpoint (`POST /api/v1/admin/upload`)
2. ✅ Branding settings CRUD
3. ✅ Theme settings CRUD
4. ✅ SEO settings CRUD
5. ✅ Payment settings placeholder

### Phase 2 (Enhancement)
- Settings audit log (who changed what, when)
- Settings versioning (rollback to previous settings)
- Settings preview before saving
- Bulk settings export/import

---

## Database Schema Example (Laravel)

```php
// Migration: create_admin_settings_table
Schema::create('admin_settings', function (Blueprint $table) {
    $table->id();
    $table->string('section')->index(); // branding, theme, seo, payments
    $table->json('data');
    $table->unsignedBigInteger('updated_by')->nullable();
    $table->timestamps();
    $table->unique('section');
    $table->foreign('updated_by')->references('id')->on('users');
});

// Model
class AdminSetting extends Model {
    protected $casts = [
        'data' => 'json',
    ];
    
    public static function getSection($section) {
        return static::where('section', $section)->first()?->data ?? [];
    }
    
    public static function updateSection($section, $data) {
        return static::updateOrCreate(
            ['section' => $section],
            ['data' => $data, 'updated_by' => auth()->id()]
        );
    }
}
```

---

## Testing the Endpoints

### With cURL
```bash
# Upload an image
curl -X POST http://localhost:8000/api/v1/admin/upload \
  -F "file=@/path/to/logo.png" \
  -F "category=logo" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Save branding settings
curl -X POST http://localhost:8000/api/v1/admin/settings/branding \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "mainLogo": "/storage/media/2026-06-03/logo.png"
  }'
```

### With Postman
1. Import the collection from `postman_collection.json`
2. Set `{{base_url}}` to `http://localhost:8000`
3. Set `{{token}}` to your auth token
4. Run requests in order

---

## Frontend Integration Status

✅ **Complete & Ready**
- Settings form UI
- Validation (Zod schemas)
- File upload handling
- API call abstraction
- Error handling
- Default values
- Unsaved changes detection

🔄 **Pending Backend**
- Actually storing files to disk
- Persisting settings in database
- File access control

---

## Notes for Backend Developer

1. **Authentication**: All endpoints require `Authorization: Bearer {token}` header
2. **File Storage**: Consider using Laravel's built-in storage (disk: 'public' or 's3')
3. **Image Processing**: Consider resizing uploaded images for optimization
4. **Validation**: Use Zod schemas (or PHP validation) matching frontend schemas
5. **Response Format**: Always return consistent JSON structure
6. **CORS**: Enable CORS for `/api/v1/*` routes if frontend is on different domain
7. **Rate Limiting**: Consider rate limiting file uploads (prevent abuse)
8. **Audit Trail**: Log all settings changes for compliance

---

## Quick Start for Laravel

```php
// Route
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/upload', [UploadController::class, 'store']);
    Route::get('/settings/{section}', [SettingsController::class, 'show']);
    Route::post('/settings/{section}', [SettingsController::class, 'update']);
});

// Controller
class UploadController extends Controller {
    public function store(Request $request) {
        $file = $request->validate(['file' => 'required|image|max:5120']);
        $path = $file['file']->store('media/' . now()->format('Y-m-d'), 'public');
        return response()->json(['url' => Storage::url($path)]);
    }
}

class SettingsController extends Controller {
    public function show($section) {
        $setting = AdminSetting::where('section', $section)->first();
        return $setting ? $setting->data : response()->json(['message' => 'Not found'], 404);
    }
    
    public function update($section, Request $request) {
        AdminSetting::updateSection($section, $request->all());
        return response()->json(['message' => 'Updated']);
    }
}
```

---

Generated for: Ziadic CMS Admin Panel
Last Updated: 2026-06-03
