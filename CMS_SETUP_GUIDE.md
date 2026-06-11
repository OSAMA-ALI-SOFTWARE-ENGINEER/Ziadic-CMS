# CMS Setup & Implementation Guide

## Overview

The Kukaqka CMS system includes:
- **Backend API**: Laravel 13 controllers for managing page content and blog workflows
- **Database**: Three new tables for pages, blog workflows, and activity logging
- **Admin UI**: Separate Vue 3 admin application for content management
- **Frontend Integration**: Dynamic page loading from CMS API

---

## Phase 1: Database Setup

### Run Migrations

```bash
cd C:\laragon\www\Ziadic\admin
php artisan migrate
```

This creates three tables:
1. **page_contents** - Static pages with JSON content and SEO fields
2. **blog_publish_workflows** - Blog approval workflow states
3. **content_audits** - Activity log for all content changes

### Expected Database Structure

#### page_contents
```
id, page_slug (unique), page_title, page_type, content (JSON), 
sections (JSON), seo_fields (JSON), meta (JSON), status, 
updated_by (FK), created_at, updated_at
```

#### blog_publish_workflows
```
id, post_id (FK), status, submitted_by (FK), reviewed_by (FK),
review_notes, reviewed_at, published_at, created_at, updated_at
```

#### content_audits
```
id, user_id (FK), model_type, model_id, action, changes (JSON),
ip_address, user_agent, created_at
```

---

## Phase 2: Backend API Verification

### 1. Verify Controllers Exist
- `admin/app/Http/Controllers/Admin/PageContentController.php`
- `admin/app/Http/Controllers/Admin/BlogWorkflowController.php`
- `admin/app/Http/Controllers/Admin/ContentLibraryController.php`

### 2. Verify Routes in `admin/routes/api.php`

```php
Route::prefix('v1/admin')->middleware('auth:sanctum')->group(function () {
    // Page content
    Route::apiResource('page-content', PageContentController::class);
    Route::patch('page-content/{slug}/publish', [PageContentController::class, 'publish']);
    Route::patch('page-content/{slug}/unpublish', [PageContentController::class, 'unpublish']);
    Route::get('page-content/{slug}/audit', [PageContentController::class, 'audit']);

    // Blog workflow
    Route::apiResource('blog-workflow', BlogWorkflowController::class);
    Route::patch('blog-workflow/posts/{post}/submit', [BlogWorkflowController::class, 'submit']);
    Route::patch('blog-workflow/posts/{post}/approve', [BlogWorkflowController::class, 'approve']);
    Route::patch('blog-workflow/posts/{post}/reject', [BlogWorkflowController::class, 'reject']);
    Route::patch('blog-workflow/posts/{post}/publish', [BlogWorkflowController::class, 'publish']);
    Route::patch('blog-workflow/posts/{post}/unpublish', [BlogWorkflowController::class, 'unpublish']);
    Route::patch('blog-workflow/posts/{post}/archive', [BlogWorkflowController::class, 'archive']);

    // Content library
    Route::get('content-library', [ContentLibraryController::class, 'index']);
    Route::get('content-library/stats', [ContentLibraryController::class, 'stats']);
});
```

### 3. Test Endpoints

```bash
# Start Laravel
cd C:\laragon\www\Ziadic\admin
php artisan serve --port=8000

# In another terminal, test the API
curl http://localhost:8000/api/v1/admin/content-library \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Phase 3: Admin UI Setup

### 1. Install Dependencies

```bash
cd C:\laragon\www\Ziadic\admin\admin-ui
npm install
```

### 2. Verify Admin UI Files Structure

```
admin-ui/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── style.css
│   ├── router/
│   │   └── index.ts
│   ├── stores/
│   │   └── auth.ts
│   ├── layouts/
│   │   └── AdminLayout.vue
│   ├── pages/
│   │   ├── DashboardPage.vue
│   │   ├── auth/
│   │   │   └── AdminLoginPage.vue
│   │   └── content/
│   │       ├── ContentLibraryPage.vue
│   │       ├── PageContentEditorPage.vue
│   │       └── BlogWorkflowPage.vue
```

### 3. Start Development Server

```bash
cd C:\laragon\www\Ziadic\admin\admin-ui
npm run dev
```

Runs on `http://localhost:5174`

### 4. Test Admin UI Login

- Navigate to `http://localhost:5174/admin/login`
- Use credentials:
  - Email: `admin@kukaqka.com`
  - Password: `password`
- Should redirect to `/admin` dashboard

---

## Phase 4: Content Management Features

### Content Library Page (`/admin/content/library`)

**Features:**
- View all pages, posts, and services
- Search and filter by type, status
- Stat cards showing totals and publication status
- Edit and Preview buttons

**Action Links:**
- Edit: Navigate to appropriate editor
- Preview: Open in new browser tab

### Page Content Editor (`/admin/content/pages/{slug}`)

**Tabs:**
1. **Content** - Main page content, title, type
2. **SEO** - SEO title, description, keywords, OG image
3. **Settings** - Status, slug, last updated date

**Features:**
- Character limits on SEO fields (60 for title, 160 for description)
- Save Changes button
- Publish/Unpublish buttons
- Success notifications

### Blog Workflow Page (`/admin/blog-workflow`)

**Features:**
- Filter blog posts by status (All, Pending Review, Approved, Published, Rejected, Archived)
- View submission and review information
- Approve/Reject pending articles
- Publish/Unpublish articles
- Archive old articles
- View review notes

**Workflow States:**
```
draft → pending_review → approved → published
  ↘ rejected (with notes)
  ↘ archived
```

---

## Phase 5: Frontend Integration

### Update Home Page

In `frontend/src/pages/HomePage.vue`:

```vue
<script setup>
import { ref, onMounted } from 'vue'

const pageContent = ref(null)

async function loadPageContent() {
  try {
    const response = await fetch('http://localhost:8000/api/v1/admin/page-content/home')
    if (response.ok) {
      pageContent.value = await response.json()
    }
  } catch (err) {
    console.error('Error loading page:', err)
  }
}

onMounted(loadPageContent)
</script>

<template>
  <div v-if="pageContent">
    <h1>{{ pageContent.page_title }}</h1>
    <p>{{ pageContent.content.description }}</p>
  </div>
  <div v-else>Loading...</div>
</template>
```

Repeat for About, Contact, and other pages using appropriate slugs.

---

## API Reference

### Page Content Endpoints

```
GET    /api/v1/admin/page-content               - List all pages
GET    /api/v1/admin/page-content/{slug}        - Get page by slug
PATCH  /api/v1/admin/page-content/{slug}        - Update page
PATCH  /api/v1/admin/page-content/{slug}/publish    - Publish page
PATCH  /api/v1/admin/page-content/{slug}/unpublish  - Unpublish page
GET    /api/v1/admin/page-content/{slug}/audit      - View change history
```

### Blog Workflow Endpoints

```
GET    /api/v1/admin/blog-workflow                   - List all workflows
GET    /api/v1/admin/blog-workflow/posts/{post}      - Get post workflow
PATCH  /api/v1/admin/blog-workflow/posts/{post}/submit   - Submit for review
PATCH  /api/v1/admin/blog-workflow/posts/{post}/approve  - Approve article
PATCH  /api/v1/admin/blog-workflow/posts/{post}/reject   - Reject with notes
PATCH  /api/v1/admin/blog-workflow/posts/{post}/publish  - Publish article
PATCH  /api/v1/admin/blog-workflow/posts/{post}/unpublish - Unpublish article
PATCH  /api/v1/admin/blog-workflow/posts/{post}/archive   - Archive article
```

### Content Library Endpoints

```
GET    /api/v1/admin/content-library      - List all content (pages, posts, services)
GET    /api/v1/admin/content-library/stats - Get content statistics
```

---

## Content Structure

### Page Content JSON Example

```json
{
  "page_slug": "home",
  "page_title": "Home",
  "page_type": "static",
  "content": {
    "description": "Welcome to Kukaqka",
    "hero_title": "Discover Amazing Places",
    "hero_subtitle": "Find unique locations worldwide"
  },
  "sections": [
    {
      "type": "featured_listings",
      "title": "Featured Places",
      "count": 6
    }
  ],
  "seo_fields": {
    "seo_title": "Kukaqka - Discover Amazing Places",
    "seo_description": "Browse and explore unique places worldwide",
    "seo_keywords": "places, travel, discover",
    "og_image": "/og-image.jpg"
  },
  "meta": {
    "layout_type": "default",
    "show_newsletter": true
  },
  "status": "published"
}
```

---

## Troubleshooting

### Admin UI Won't Load
- Check that `npm install` completed without errors
- Verify Tailwind CSS is compiled: check `node_modules/tailwindcss`
- Clear browser cache and reload

### API 401 Unauthorized
- Ensure token is correctly stored in `localStorage`
- Log out and log in again to refresh token

### API 404 Page Not Found
- Verify routes are defined in `admin/routes/api.php`
- Check that controllers exist in correct paths
- Run `php artisan route:list` to see all registered routes

### Database Migration Errors
- Ensure you're in the `admin/` directory
- Check database connection in `.env`
- Run `php artisan migrate:refresh` to reset (⚠️ deletes all data)

---

## Next Steps

1. ✅ Run database migrations
2. ✅ Start Laravel backend (`php artisan serve`)
3. ✅ Install admin-ui dependencies (`npm install`)
4. ✅ Start admin UI (`npm run dev`)
5. ✅ Log in with demo credentials
6. ⚠️ **Create initial page content** - Add pages for home, about, contact
7. ⚠️ **Update frontend pages** - Integrate with CMS API
8. ⚠️ **Test workflows** - Create, edit, publish content
9. ⚠️ **Monitor activity** - Check audit logs for all changes

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs: `storage/logs/laravel.log`
3. Check browser console for frontend errors
4. Verify all migrations ran: `php artisan migrate:status`
