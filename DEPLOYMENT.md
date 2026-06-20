# Kukaqka CMS - Complete Deployment Guide (All-In-One)

**Date:** June 19, 2026  
**Status:** ✅ READY FOR PRODUCTION DEPLOYMENT  
**Hostinger Setup:** ✓ Optimized for Laravel best practices

---

## 📋 TABLE OF CONTENTS

1. [Quick Overview](#quick-overview)
2. [Hostinger Architecture](#hostinger-architecture)
3. [Step 1: Prepare Build Files](#step-1-prepare-build-files)
4. [Step 2: Domain Configuration](#step-2-domain-configuration)
5. [Step 3: Upload Frontend](#step-3-upload-frontend)
6. [Step 4: Upload Backend](#step-4-upload-backend)
7. [Step 5: Configure Environment](#step-5-configure-environment)
8. [Step 6: Install Dependencies](#step-6-install-dependencies)
9. [Step 7: Database Setup](#step-7-database-setup)
10. [Step 8: Server Configuration](#step-8-server-configuration)
11. [Step 9: Verification](#step-9-verification)
12. [Troubleshooting](#troubleshooting)

---

## QUICK OVERVIEW

**Your Domains:**
- Main Site: `https://kukaqka.com` → Frontend (Vue.js)
- Admin Panel: `https://admin.kukaqka.com` → Admin CMS (Vue.js) + API (Laravel)
- API Endpoints: `https://admin.kukaqka.com/api/v1/...`

**Test Credentials:**
```
Email:    admin@kukaqka.com
Password: password
```

**Expected Data After Deploy:**
- Dashboard: 8 listings, 1 post
- Articles: 4 articles with authors & categories
- Media: 3 media files
- Subscribers: 5 newsletter subscribers
- Users: 4 test users (Super Admin, Admin, Staff, Client)

---

## HOSTINGER ARCHITECTURE

### Your Hostinger Setup (Follows Laravel Best Practices)

Your Hostinger configuration is optimized for Laravel:

```
Main Domain: kukaqka.com
Document Root: /home/u899288128/domains/kukaqka.com/public_html

Admin Subdomain: admin.kukaqka.com
Document Root: /home/u899288128/domains/kukaqka.com/public_html/admin/public
                                                                            ↑
                                                    Points directly to Laravel public directory
```

### Key Points About Your Setup

✅ **Admin subdomain points directly to Laravel's `public` directory**
- No `.htaccess` rewrites needed from `/admin` to `/admin/public`
- Hostinger automatically serves from the correct directory
- This is Laravel best practice architecture

✅ **Frontend and Backend are properly separated**
- Main domain serves Vue.js SPA from `/public_html/`
- Admin domain serves Laravel app from `/public_html/admin/public/`
- Both can operate independently

✅ **Storage and Media uploads will work correctly**
- Laravel's `storage:link` creates symlink in `/public_html/admin/public/storage`
- Media files in `/public_html/admin/storage/app/public` are accessible via symlink
- No additional configuration needed

### Correct Directory Structure

```
public_html/
├── index.html                    (Frontend entry point)
├── favicon.svg
├── icons.svg
├── .htaccess                     (Frontend SPA routing)
├── assets/                       (17 optimized JS/CSS files)
├── images/                       (5 static images)
│
└── admin/                        (Laravel application root)
    ├── app/                      (Application code)
    ├── bootstrap/                (Bootstrap files)
    ├── config/                   (Configuration)
    ├── database/                 (Migrations & seeders)
    ├── routes/                   (API routes)
    ├── storage/                  (Logs, cache, uploads)
    ├── vendor/                   (Composer dependencies)
    ├── artisan                   (Laravel CLI)
    ├── composer.json
    ├── composer.lock
    ├── .env                      (Environment configuration - CREATE THIS)
    │
    └── public/                   (Document root for admin.kukaqka.com)
        ├── index.php             (Laravel entry point)
        ├── .htaccess             (Laravel public .htaccess)
        ├── assets/               (Optional: API static assets)
        └── storage/              (Symlink to ../storage/app/public)
```

---

## STEP 1: PREPARE BUILD FILES

### 1.1 Frontend Build Location
```
Local Path: C:\laragon\www\Ziadic\admin\dist\
Contents:
├── index.html          (entry point - 694 bytes)
├── favicon.svg         (9.3 KB)
├── icons.svg           (5.0 KB)
├── assets/             (17 optimized JS/CSS files - 2MB)
├── images/             (5 static images)
└── .htaccess           (SPA routing configuration)
```

### 1.2 Verify Build Contents
Before uploading, confirm all files exist:
```
✓ index.html exists
✓ favicon.svg exists
✓ icons.svg exists
✓ .htaccess exists
✓ assets/ folder has 17 files
✓ images/ folder has 5 files
```

**Check Asset Paths (CRITICAL):**
```
index.html should contain:
<script type="module" src="/assets/index-C2VunAhD.js"></script>
<link rel="stylesheet" href="/assets/index-DwUiAbi2.css">
<link rel="icon" href="/favicon.svg">

NOT:
/admin/assets/...
/admin/favicon.svg
```

---

## STEP 2: DOMAIN CONFIGURATION

### 2.1 Hostinger Control Panel Setup

**For Main Domain (kukaqka.com):**
1. Go to **Hostinger Control Panel** → **Domains**
2. Ensure `kukaqka.com` is set as main domain
3. Document Root: `/public_html/`
4. Wait for DNS propagation (5-30 minutes)

**For Admin Subdomain (admin.kukaqka.com):**
1. Go to **Hostinger Control Panel** → **Subdomains**
2. Subdomain configuration should be:
   - Name: `admin`
   - Domain: `kukaqka.com`
   - Document Root: `/public_html/admin/public/`
   - **IMPORTANT:** Points DIRECTLY to `/admin/public/`, not `/admin/`
3. Wait for DNS propagation (5-30 minutes)

### 2.2 Verify Domains Resolve
```bash
# Test from your computer
ping kukaqka.com
ping admin.kukaqka.com

# Should resolve to your Hostinger IP
```

---

## STEP 3: UPLOAD FRONTEND

### 3.1 FTP Connection Details
```
FTP Host:     ftp.kukaqka.com (or your Hostinger FTP host)
FTP Port:     21 (or 22 for SFTP)
Username:     Your Hostinger FTP username
Password:     Your Hostinger FTP password
```

### 3.2 Using FileZilla (Free FTP Client)

1. **Download & Install:** https://filezilla-project.org/
2. **Connect:**
   - Host: `ftp.kukaqka.com`
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21
3. **Navigate to:** `/public_html/`
4. **Upload Process:**
   - Delete any existing content in `/public_html/` (except `/admin/` folder)
   - Drag & drop from `C:\laragon\www\Ziadic\admin\dist\`:
     - `index.html`
     - `favicon.svg`
     - `icons.svg`
     - `assets/` folder (entire)
     - `images/` folder (entire)
     - `.htaccess` file

### 3.3 Using Command Line (SFTP)

```bash
cd C:\laragon\www\Ziadic\admin\dist

# Connect to Hostinger
sftp -P 22 your_username@kukaqka.com

# Navigate to target directory
cd /public_html

# Upload all files
put index.html
put favicon.svg
put icons.svg
put .htaccess
put -r assets
put -r images

# Verify upload
ls -la
```

### 3.4 Verify Frontend Upload
```bash
# Test URLs (should return 200 OK)
curl -I https://kukaqka.com/
curl -I https://kukaqka.com/favicon.svg
curl -I https://kukaqka.com/assets/index-C2VunAhD.js
```

---

## STEP 4: UPLOAD BACKEND

### 4.1 Backend Files to Upload

Upload entire `admin/` folder (except node_modules) to `/public_html/admin/`:

```
/public_html/admin/
├── app/                  ✓ Copy entire folder
├── bootstrap/            ✓ Copy entire folder
├── config/               ✓ Copy entire folder
├── database/             ✓ Copy entire folder
├── routes/               ✓ Copy entire folder
├── storage/              ✓ Copy entire folder
├── vendor/               ✓ Copy entire folder (or run composer install)
├── artisan               ✓ Copy file
├── composer.json         ✓ Copy file
├── composer.lock         ✓ Copy file
├── .env                  ✗ CREATE NEW (see step 5)
│
└── public/               ✓ Copy entire folder
    ├── index.php         ✓ Copy file (Laravel entry point)
    ├── .htaccess         ✓ Copy file (Laravel public)
    ├── assets/           (Optional)
    └── storage/          (Will be created by storage:link)
```

### 4.2 Upload via FTP

1. In FileZilla, navigate to `/public_html/`
2. Create `admin/` folder
3. Upload all backend files and folders
4. Skip `node_modules/` folder completely

### 4.3 Verify Backend Upload
```bash
# Test if Laravel is accessible
curl -I https://admin.kukaqka.com/api/v1/health
# May show 404 until migrations run, but should not error
```

---

## STEP 5: CONFIGURE ENVIRONMENT

### 5.1 Create .env File on Hostinger

1. **Via FTP File Manager (easiest):**
   - Go to Hostinger Control Panel → File Manager
   - Navigate to `/public_html/admin/`
   - Create new file: `.env`
   - Paste content below

2. **Via SSH:**
   ```bash
   ssh your_username@kukaqka.com
   cd /public_html/admin
   nano .env
   # Paste content below, then Ctrl+X, Y, Enter
   ```

### 5.2 .env File Content

```env
APP_NAME="Kukaqka CMS"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://admin.kukaqka.com

# Database - Get these from Hostinger Control Panel
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=kukaqka_cms
DB_USERNAME=kukaqka_user
DB_PASSWORD=your_strong_password_here

# Cache & Queue
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=cookie

# Email Configuration (Optional)
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=587
MAIL_USERNAME=your_email@kukaqka.com
MAIL_PASSWORD=your_email_password
MAIL_FROM_ADDRESS=noreply@kukaqka.com
MAIL_FROM_NAME="Kukaqka CMS"

# API Base URL
APP_API_URL=https://admin.kukaqka.com/api/v1

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://kukaqka.com,https://admin.kukaqka.com

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://admin.kukaqka.com/api/v1/auth/google/callback

FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=https://admin.kukaqka.com/api/v1/auth/facebook/callback

# Generate this with: php artisan key:generate
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
```

### 5.3 Create Database on Hostinger

1. Go to **Hostinger Control Panel** → **MySQL Databases**
2. Create new database:
   - **Database Name:** `kukaqka_cms`
   - **Username:** `kukaqka_user`
   - **Password:** Generate strong password
   - **Hostname:** `localhost`
3. Note the credentials and update `.env` file

---

## STEP 6: INSTALL DEPENDENCIES

### 6.1 Install Composer Dependencies

Run these commands via SSH:

```bash
ssh your_username@kukaqka.com
cd /public_html/admin

# Install composer dependencies (production optimized)
composer install --optimize-autoloader --no-dev

# Generate application key
php artisan key:generate

# Update your .env with the generated APP_KEY
nano .env
# Find and update: APP_KEY=base64:... (from the key:generate output)
```

---

## STEP 7: DATABASE SETUP

### 7.1 Run Migrations and Seeding

Run these commands via SSH:

```bash
ssh your_username@kukaqka.com
cd /public_html/admin

# Run database migrations
php artisan migrate --force

# Seed database with test data
php artisan db:seed

# Create storage symlink (MANDATORY for media uploads)
php artisan storage:link

# Clear and optimize configuration
php artisan optimize:clear
php artisan config:cache
php artisan route:cache

# Clear cache
php artisan cache:clear
```

### 7.2 Verify Database

```bash
ssh your_username@kukaqka.com
cd /public_html/admin
php artisan tinker

# Check users
> User::count()
# Should show: 4

# Check articles
> Article::count()
# Should show: 4

# Check media
> CustomMedia::count()
# Should show: 3

# Check subscribers
> NewsletterSubscriber::count()
# Should show: 5

# Exit
> exit
```

### 7.3 Verify Storage Link

```bash
ssh your_username@kukaqka.com

# Check storage symlink exists
ls -la /public_html/admin/public/storage
# Should show: storage -> ../storage/app/public

# Check if accessible via web
curl -I https://admin.kukaqka.com/storage/
# Should return 200 OK
```

---

## STEP 8: SERVER CONFIGURATION

### 8.1 Create .htaccess for Frontend

Create file: `/public_html/.htaccess`

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Skip admin subdomain
  RewriteCond %{HTTP_HOST} ^admin\. [NC]
  RewriteRule ^ - [L]

  # Force HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Allow existing files and directories
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Route all other requests to index.html (Vue Router)
  RewriteRule ^ index.html [L]
</IfModule>
```

### 8.2 Verify Laravel's .htaccess in Public Directory

**IMPORTANT:** Your subdomain points directly to `/public_html/admin/public/`

The `.htaccess` in `/public_html/admin/public/` should already be present from your upload and contain:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

**NO rewrite rule to `/admin/public/` is needed** because the subdomain already points there.

### 8.3 Set File Permissions

```bash
ssh your_username@kukaqka.com

# Set directory permissions
chmod 755 /public_html/admin/bootstrap/cache
chmod 755 /public_html/admin/storage
chmod 755 /public_html/admin/storage/logs
chmod 755 /public_html/admin/storage/app
chmod 755 /public_html/admin/storage/app/public
chmod 755 /public_html/admin/bootstrap

# Set .env permissions
chmod 644 /public_html/admin/.env

# Frontend permissions
chmod 755 /public_html/assets
```

### 8.4 Enable SSL/HTTPS

1. Go to **Hostinger Control Panel** → **SSL Certificates**
2. Click **Manage** on your domain
3. Enable **AutoSSL** or **Free SSL** (Let's Encrypt)
4. Wait for automatic installation (5-15 minutes)
5. Verify: Visit `https://kukaqka.com` (should show green lock)

---

## STEP 9: VERIFICATION

### 9.1 Verify Critical Paths

Verify these files/directories exist on the server:

```bash
ssh your_username@kukaqka.com

# Check Laravel entry point
ls -la /public_html/admin/public/index.php
# Should exist and be readable

# Check .env configuration
ls -la /public_html/admin/.env
# Should exist and be readable

# Check storage directory
ls -la /public_html/admin/storage/
# Should have: app, framework, logs directories

# Check storage symlink
ls -la /public_html/admin/public/storage
# Should show: storage -> ../storage/app/public
```

### 9.2 Test Frontend Load

```bash
# Test main website
curl -I https://kukaqka.com/
# Expected: 200 OK

# Test favicon
curl -I https://kukaqka.com/favicon.svg
# Expected: 200 OK

# Test asset
curl -I https://kukaqka.com/assets/index-C2VunAhD.js
# Expected: 200 OK
```

### 9.3 Test Admin Panel Load

```bash
# Test admin panel
curl -I https://admin.kukaqka.com/
# Expected: 200 OK (HTML page for login)

# Test API health
curl https://admin.kukaqka.com/api/v1/health
# Expected: {"status":"ok"}
```

### 9.4 Test Login

1. Visit: `https://admin.kukaqka.com`
2. Login with:
   - Email: `admin@kukaqka.com`
   - Password: `password`
3. Should redirect to dashboard

### 9.5 Test Data Load

After login, verify in browser:

**Check Dashboard Tab:**
- ✓ Published Listings: 8
- ✓ Pending Reviews: 0
- ✓ CMS Posts: 1

**Check Blog Articles Tab:**
- ✓ Should show 4 articles
- ✓ Each with author name
- ✓ Each with category

**Check Media Tab:**
- ✓ Should show 3 media files
- ✓ museum.jpg, restaurant.jpg, spa.jpg

**Check Subscriptions Tab:**
- ✓ Should show 5 subscriber emails

**Check Listings Tab:**
- ✓ Should show 8 listings
- ✓ Click museum → should show image
- ✓ Click restaurant → should show image
- ✓ Click spa → should show image

### 9.6 Check Error Logs

```bash
ssh your_username@kukaqka.com

# View latest errors
tail -50 /public_html/admin/storage/logs/laravel.log

# Watch real-time logs
tail -f /public_html/admin/storage/logs/laravel.log
```

---

## TROUBLESHOOTING

### Issue 1: Blank Page on https://admin.kukaqka.com

**Cause:** .htaccess not working or index.php not found

**Solution:**
```bash
ssh your_username@kukaqka.com

# Verify index.php exists
ls -la /public_html/admin/public/index.php

# Verify .htaccess exists
ls -la /public_html/admin/public/.htaccess

# Test direct access
curl -I https://admin.kukaqka.com/index.php
# Should return 200 OK
```

### Issue 2: API Returns 500 Error

**Cause:** Database connection failed or .env not found

**Solution:**
```bash
ssh your_username@kukaqka.com
cd /public_html/admin

# Check .env exists and is readable
ls -la /public_html/admin/.env

# Test database connection
php artisan tinker
> DB::connection()->getPdo()
# Should not throw error

# Check error logs
tail -20 /public_html/admin/storage/logs/laravel.log
```

### Issue 3: Login Returns 422 Error

**Cause:** User doesn't exist or database not seeded

**Solution:**
```bash
ssh your_username@kukaqka.com
cd /public_html/admin

# Check users exist
php artisan tinker
> User::pluck('email')
# Should show: ['superadmin@kukaqka.com', 'admin@kukaqka.com', ...]

# If empty, run seeder
> exit
php artisan db:seed
```

### Issue 4: Images Not Loading in Listings

**Cause:** Storage symlink not created or broken

**Solution:**
```bash
ssh your_username@kukaqka.com

# Check symlink
ls -la /public_html/admin/public/storage
# Should show: storage -> ../storage/app/public

# If missing, create it
cd /public_html/admin
php artisan storage:link

# Verify it works
curl -I https://admin.kukaqka.com/storage/
# Should return 200 OK
```

### Issue 5: CORS Errors in Console

**Cause:** CORS_ALLOWED_ORIGINS not configured

**Solution:**
```bash
ssh your_username@kukaqka.com

# Check .env
cat /public_html/admin/.env | grep CORS

# Should have:
# CORS_ALLOWED_ORIGINS=https://kukaqka.com,https://admin.kukaqka.com

# Update if needed and clear cache
cd /public_html/admin
php artisan cache:clear
php artisan config:clear
```

### Issue 6: SSL Certificate Not Working

**Cause:** Let's Encrypt not installed or DNS not configured

**Solution:**
1. Wait 15+ minutes for AutoSSL to generate
2. Go to Hostinger Control Panel → SSL Certificates
3. Manually request new certificate if needed
4. Verify DNS propagation: `nslookup kukaqka.com`

### Issue 7: File Upload Fails (Media)

**Cause:** Storage permissions wrong or symlink missing

**Solution:**
```bash
ssh your_username@kukaqka.com

# Check storage directory structure
ls -la /public_html/admin/storage/app/public

# Should exist and have 755 permissions
chmod 755 /public_html/admin/storage/app/public
chmod 755 /public_html/admin/storage/app

# Verify symlink
php artisan storage:link

# Check it's accessible
curl -I https://admin.kukaqka.com/storage/
```

---

## QUICK CHECKLIST

### Pre-Deployment
- [ ] Admin build created (`dist/` folder)
- [ ] Domains configured in Hostinger (main domain + subdomain)
- [ ] Admin subdomain points to `/public_html/admin/public/`
- [ ] FTP credentials obtained
- [ ] Database name and credentials chosen

### During Deployment
- [ ] Frontend files uploaded to `/public_html/`
- [ ] Backend files uploaded to `/public_html/admin/`
- [ ] `.env` created in `/public_html/admin/`
- [ ] `.htaccess` in `/public_html/` (frontend SPA routing)
- [ ] `.htaccess` in `/public_html/admin/public/` (Laravel public)
- [ ] `composer install --optimize-autoloader --no-dev` completed
- [ ] `php artisan key:generate` completed
- [ ] `php artisan migrate --force` completed
- [ ] `php artisan db:seed` completed
- [ ] `php artisan storage:link` completed
- [ ] `php artisan optimize:clear` completed
- [ ] `php artisan config:cache` completed
- [ ] `php artisan route:cache` completed
- [ ] SSL certificates enabled for both domains
- [ ] File permissions set (755 for dirs, 644 for .env)

### Post-Deployment
- [ ] `https://kukaqka.com` loads (no blank page)
- [ ] `https://admin.kukaqka.com` loads login page
- [ ] `/public_html/admin/public/index.php` exists
- [ ] `/public_html/admin/.env` exists
- [ ] `/public_html/admin/public/storage` symlink exists
- [ ] `/public_html/admin/storage/app/public` accessible
- [ ] Can login with `admin@kukaqka.com` / `password`
- [ ] Dashboard shows 8 listings, 1 post
- [ ] Articles tab shows 4 articles with authors
- [ ] Media tab shows 3 files
- [ ] Subscriptions tab shows 5 subscribers
- [ ] Listings show with associated images (symlink working)
- [ ] Browser console has no errors
- [ ] Network tab shows 200 OK for all assets
- [ ] API health check returns `{"status":"ok"}`
- [ ] File uploads to media library work correctly

---

## CREDENTIALS SUMMARY

**Hostinger SSH:**
```
Host:     kukaqka.com
Port:     22
Username: your_username
Password: [Your SSH password]
```

**Hostinger FTP:**
```
Host:     ftp.kukaqka.com
Port:     21 (or 22)
Username: [Your FTP username]
Password: [Your FTP password]
```

**Database:**
```
Host:     localhost
Database: kukaqka_cms
User:     kukaqka_user
Password: [Your DB password]
```

**Admin Panel:**
```
URL:      https://admin.kukaqka.com
Email:    admin@kukaqka.com
Password: password
Role:     Admin (full access)
```

**Domains:**
```
Main Site:     https://kukaqka.com
Admin Panel:   https://admin.kukaqka.com
API Base:      https://admin.kukaqka.com/api/v1
API Health:    https://admin.kukaqka.com/api/v1/health
```

---

## SUPPORT COMMANDS

**Test API:**
```bash
# Health check
curl https://admin.kukaqka.com/api/v1/health

# Login test
curl -X POST https://admin.kukaqka.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kukaqka.com","password":"password"}'

# Get dashboard data
curl -H "Authorization: Bearer TOKEN" \
  https://admin.kukaqka.com/api/v1/admin/dashboard
```

**View Logs:**
```bash
ssh your_username@kukaqka.com
tail -f /public_html/admin/storage/logs/laravel.log
```

**Database Check:**
```bash
ssh your_username@kukaqka.com
cd /public_html/admin && php artisan tinker
> User::count()
> Article::count()
> CustomMedia::count()
> exit
```

---

## STATUS: ✅ READY FOR DEPLOYMENT

Your Hostinger setup follows Laravel best practices. Follow these steps in order for successful deployment.

**Total Deployment Time:** ~30-45 minutes

**Critical Steps:**
1. Upload frontend files (10 min)
2. Upload backend files (5 min)
3. Create .env (2 min)
4. Run composer install (3 min)
5. Run migrations & seeding (2 min)
6. Create storage link (1 min)
7. Test login (2 min)

**Key Reminders:**
- ✓ No rewrite rule needed to `/admin/public` (subdomain points there directly)
- ✓ Storage symlink is MANDATORY for media/gallery uploads
- ✓ Run all artisan commands in `/public_html/admin/` directory
- ✓ .htaccess in `/public_html/admin/public/` comes from Laravel (already in your build)

Good luck with your deployment! 🚀
