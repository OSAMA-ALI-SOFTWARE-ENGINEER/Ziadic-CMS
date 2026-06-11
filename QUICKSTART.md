# Quick Start Guide - CMS Admin

**Get the CMS admin up and running in 2 minutes.**

---

## Terminal 1: Start Backend

```bash
cd C:\laragon\www\Ziadic\admin
php artisan serve --port=8000
```

**Expected output:**
```
Laravel development server started: http://127.0.0.1:8000
```

---

## Terminal 2: Start Admin UI

```bash
cd C:\laragon\www\Ziadic\admin\admin-ui
npm run dev
```

**Expected output:**
```
VITE v5.0.0  ready in 234 ms

➜  Local:   http://localhost:5174/
```

---

## Terminal 3 (Optional): Test Backend

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kukaqka.com",
    "password": "password"
  }'
```

---

## Step 1: Open Admin UI

Navigate to: **http://localhost:5174/admin/login**

---

## Step 2: Login

**Email:** `admin@kukaqka.com`  
**Password:** `password`

---

## Step 3: Explore

- **Dashboard** — View content stats
- **Content Library** — Browse all pages/posts
- **Page Editor** — Edit page content with SEO
- **Blog Workflow** — Manage article approvals

---

## Features Ready to Test

### Content Library
- Search and filter content
- View stats (total, published, drafts)
- Edit and preview content
- Pagination support

### Page Editor
- **Content Tab:** Edit title, type, main content
- **SEO Tab:** SEO title, description, keywords, OG image
- **Settings Tab:** Status, slug, updated date
- Save/Publish/Unpublish buttons

### Blog Workflow
- Filter by status (All, Pending, Approved, Published, Rejected, Archived)
- View submission/review info
- Approve/Reject articles
- Publish/Unpublish articles
- Add review notes

---

## Troubleshooting

**Admin UI won't load?**
```bash
cd C:\laragon\www\Ziadic\admin\admin-ui
npm install
```

**Backend 500 error?**
```bash
cd C:\laragon\www\Ziadic\admin
php artisan migrate
```

**Clear all cache:**
```bash
cd C:\laragon\www\Ziadic\admin
php artisan cache:clear
php artisan config:clear
```

---

## Next: Create Test Content

Once logged in:

1. Click "Content Library"
2. Look for existing pages or create new content
3. Edit page content and SEO
4. Click "Publish" to go live
5. Click "Preview" to see on frontend

---

## API Base URL

```
http://localhost:8000/api/v1/
```

**Example endpoint:**
```bash
curl http://localhost:8000/api/v1/admin/content-library \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## File Locations

**Backend:** `C:\laragon\www\Ziadic\admin\`  
**Admin UI:** `C:\laragon\www\Ziadic\admin\admin-ui\`  
**Frontend:** `C:\laragon\www\Ziadic\frontend\`  

---

**Ready? Start Terminal 1 & 2 above!** 🚀
