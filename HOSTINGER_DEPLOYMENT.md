# Kukaqka CMS - Hostinger Deployment Guide

## Quick Overview

This guide will walk you through deploying your Kukaqka CMS application on Hostinger server in 5 main steps.

**Pre-requisites:**
- Hostinger shared hosting or VPS account
- FTP/SFTP access credentials
- MySQL database created in Hostinger
- Domain configured in Hostinger

---

## STEP 1: Prepare Your Build Files

### 1.1 Verify Builds Are Complete
```bash
# Check build outputs
ls -la admin/dist/          # Admin CMS frontend
ls -la frontend/dist/       # Public frontend
```

### 1.2 Backup Current Files (if upgrading)
```bash
# On your Hostinger server via FTP:
# Download /public_html/ to local backup
```

---

## STEP 2: Upload Backend Files via FTP

### 2.1 Connect via FTP
- Use your Hostinger FTP credentials
- Connect to: `ftp.yourdomain.com` or IP provided
- Username & Password from Hostinger panel

### 2.2 Upload Backend Files
Follow this structure:

```
public_html/
├── api/                          # Create this folder
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── storage/
│   ├── public/
│   ├── vendor/
│   ├── .env                      # IMPORTANT: Create this
│   ├── .htaccess
│   └── index.php
│
└── public/                       # Create this folder
    ├── index.html                # From frontend/dist
    ├── assets/                   # From frontend/dist
    └── images/
```

### 2.3 Upload Steps (Recommended Order)
1. Create `/api` folder in public_html
2. Upload all backend files from `admin/` to `/api/` (EXCEPT node_modules)
3. Create `/public` folder in public_html  
4. Upload contents of `frontend/dist/` to `/public/`

**Important Files to Upload:**
- `admin/app/` → `api/app/`
- `admin/config/` → `api/config/`
- `admin/database/` → `api/database/`
- `admin/routes/` → `api/routes/`
- `admin/storage/` → `api/storage/`
- `admin/public/` → `api/public/`
- `admin/vendor/` → `api/vendor/` (if possible, or run composer install)
- `admin/index.php` → `api/index.php`

---

## STEP 3: Configure Environment (.env)

### 3.1 Create .env File

Via FTP or Hostinger File Manager, create `api/.env`:

```env
APP_NAME="Kukaqka CMS"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_hostinger_db_name
DB_USERNAME=your_hostinger_db_user
DB_PASSWORD=your_hostinger_db_password

CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=cookie

MAIL_MAILER=smtp
MAIL_HOST=smtp.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=your_email@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_FROM_ADDRESS=noreply@yourdomain.com

APP_KEY=base64:YOUR_GENERATED_KEY_HERE
```

### 3.2 Generate APP_KEY
```bash
# Run this locally and copy the output
php artisan key:generate --show
```

---

## STEP 4: Database Setup

### 4.1 Access MySQL Database
- Go to Hostinger Control Panel
- Find MySQL Databases section
- Note your database credentials

### 4.2 Run Migrations

**Option A: Via SSH (Recommended)**
```bash
# SSH into your server
ssh username@yourdomain.com

cd public_html/api
php artisan migrate --force
php artisan db:seed
```

**Option B: Via File Manager**
- Create a file: `api/migrate.php`
- Paste below code:
```php
<?php
require 'vendor/autoload.php';
require 'bootstrap/app.php';

$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->call('migrate', ['--force' => true]);
$kernel->call('db:seed');
echo "Migrations completed!";
```
- Visit: `https://yourdomain.com/api/migrate.php`
- Delete the file afterward

---

## STEP 5: Configure Public Access

### 5.1 Setup .htaccess

Create `public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # API routes
    RewriteCond %{REQUEST_URI} ^/api
    RewriteRule ^api/(.*)$ /api/public/index.php?/$1 [L]

    # Public frontend
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /index.html [L]
</IfModule>
```

### 5.2 SSL Certificate
- Hostinger provides free SSL via AutoSSL
- Enable it in your Hostinger panel
- Redirect HTTP to HTTPS

### 5.3 File Permissions
Via SSH:
```bash
cd public_html/api
chmod 755 bootstrap/cache
chmod 755 storage
chmod 755 storage/logs
chmod 755 storage/app/public
chmod 644 .env
```

---

## Step 6: Verify Deployment

### 6.1 Test API
```bash
curl https://yourdomain.com/api/v1/health
# Should return: {"status":"ok"}
```

### 6.2 Test Admin Panel
- Visit: `https://yourdomain.com/api`
- Login with credentials from database seeding

### 6.3 Test Public Frontend
- Visit: `https://yourdomain.com`
- Check if pages load

### 6.4 Check Logs
```bash
# SSH into server
tail -f public_html/api/storage/logs/laravel.log
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 500 Error | Check `storage/logs/laravel.log` for errors |
| Database Connection Error | Verify DB credentials in `.env` |
| API Routes Not Working | Ensure `.htaccess` is present and mod_rewrite is enabled |
| CSS/JS Not Loading | Check that `frontend/dist/` was uploaded to `/public/` |
| Blank Admin Panel | Clear cache: `php artisan cache:clear` |
| Permission Denied | Run chmod commands from SSH |
| File Upload Fails | Check `storage/app/public` permissions |

---

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] .env file configured with correct credentials
- [ ] SSL certificate active (green HTTPS)
- [ ] API health endpoint responds
- [ ] Admin panel accessible
- [ ] Public frontend displays correctly
- [ ] File uploads working
- [ ] Error logs being written (not filling up)
- [ ] Backups configured in Hostinger
- [ ] Email service working (test by creating user)

---

## Directory Structure on Hostinger

```
public_html/
├── .htaccess                    # Main rewrite rules
├── index.html                   # Frontend entry (from frontend/dist)
├── favicon.ico
├── assets/                      # Frontend assets (from frontend/dist/assets)
│   ├── js/
│   ├── css/
│   └── images/
│
├── api/                         # Laravel backend
│   ├── .env                     # Configuration
│   ├── .htaccess               # API rewrite rules
│   ├── index.php               # API entry
│   ├── app/                    # Application logic
│   ├── config/                 # Configuration files
│   ├── database/               # Migrations and seeders
│   ├── routes/                 # API routes
│   ├── public/                 # Public assets for API
│   ├── storage/                # Logs and uploads
│   ├── vendor/                 # Composer dependencies
│   └── bootstrap/              # Bootstrap files
│
├── cgi-bin/                    # Created by Hostinger
└── ...other Hostinger files
```

---

## Quick Setup Command Summary

```bash
# 1. FTP Upload
# Upload admin/ to api/
# Upload frontend/dist/* to public/

# 2. SSH Commands
ssh username@yourdomain.com
cd public_html/api

# 3. Create .env
nano .env
# [paste configuration]

# 4. Install dependencies (if needed)
composer install --optimize-autoloader

# 5. Database
php artisan migrate --force
php artisan db:seed

# 6. Permissions
chmod 755 bootstrap/cache storage

# 7. Cache
php artisan cache:clear
php artisan config:clear
```

---

## Support

If you encounter issues:

1. Check `storage/logs/laravel.log` for detailed errors
2. Verify .env file has correct database credentials
3. Ensure all files uploaded correctly via FTP
4. Check Hostinger status page for service issues
5. Contact Hostinger support for server-level issues

---

**Deployment completed!** 🚀

Your Kukaqka CMS is now live on Hostinger.
