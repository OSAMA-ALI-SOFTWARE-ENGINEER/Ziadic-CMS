# Step-by-Step Deployment Guide for Kukaqka CMS

## Overview
This guide walks you through deploying your Kukaqka CMS to Hostinger with:
- **Admin Panel:** admin.kukaqka.com
- **Public Website:** kukaqka.com

---

# PART A: LOCAL PREPARATION (Your Computer)

## Step A1: Prepare Environment Files

### 1. Open `admin/.env.production`

Located at: `c:\laragon\www\Ziadic\admin\.env.production`

### 2. Fill in Your Details

Replace these placeholders:

```env
# 1. Generate APP_KEY (do this in terminal)
APP_KEY=base64:GENERATE_THIS_LOCALLY_FIRST
```

**To generate APP_KEY, run in terminal:**
```bash
cd c:\laragon\www\Ziadic\admin
php artisan key:generate --env=production
```

You'll see output like:
```
base64:abc123xyz789abc123xyz789abc123xyz789=
```

Copy this and paste into `.env.production`:
```env
APP_KEY=base64:abc123xyz789abc123xyz789abc123xyz789=
```

---

### 3. Update Database Credentials

```env
# From Hostinger Control Panel → MySQL Databases
DB_HOST=localhost
DB_DATABASE=kukaqka_prod        # Your database name
DB_USERNAME=kukaqka_admin       # Your DB username
DB_PASSWORD=YOUR_STRONG_PASSWORD # Your DB password
```

---

### 4. Update Email Settings

```env
# For Hostinger email
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com    # Hostinger SMTP
MAIL_PORT=587
MAIL_USERNAME=your-email@kukaqka.com   # Your email
MAIL_PASSWORD=YOUR_EMAIL_PASSWORD      # Email password
MAIL_FROM_ADDRESS=hello@kukaqka.com
MAIL_FROM_NAME=Kukaqka
```

---

### 5. Verify URLs

```env
APP_URL=https://admin.kukaqka.com/api/v1
FRONTEND_URL=https://kukaqka.com
```

✅ Your `.env.production` is now complete!

**⚠️ IMPORTANT: Never commit `.env.production` to Git!**

---

## Step A2: Build Your Project

### Method 1: Using Build Script (Recommended)

Open **PowerShell** or **Command Prompt** in the project root:

```bash
cd c:\laragon\www\Ziadic
powershell -ExecutionPolicy Bypass -File BUILD_FOR_PRODUCTION.ps1
```

This will:
1. Generate APP_KEY (if needed)
2. Install admin npm dependencies
3. Build admin frontend
4. Install frontend npm dependencies
5. Build frontend
6. Generate deployment summary

**Expected Output:**
```
✓ Admin frontend built successfully
  Output: admin/dist/
✓ Frontend built successfully
  Output: frontend/dist/
```

### Method 2: Manual Build (Step-by-Step)

#### Build Admin Panel

```bash
cd c:\laragon\www\Ziadic\admin

# Generate key first time only
php artisan key:generate --env=production

# Install Node dependencies
npm install

# Build for production
npm run build
```

**Look for:** `admin/dist/` folder with files

#### Build Public Frontend

```bash
cd c:\laragon\www\Ziadic\frontend

# Install dependencies
npm install

# Build
npm run build
```

**Look for:** `frontend/dist/` folder with files

---

## Step A3: Verify Build Files

### Check Admin Files

```bash
ls c:\laragon\www\Ziadic\admin\dist\
# Should contain: index.html, assets/ folder
```

### Check Frontend Files

```bash
ls c:\laragon\www\Ziadic\frontend\dist\
# Should contain: index.html, assets/ folder
```

✅ If both have files, you're ready to upload!

---

# PART B: HOSTINGER SETUP

## Step B1: Create Subdomain

### In Hostinger Control Panel:

1. Go to **Domains** → Click your domain `kukaqka.com`
2. Click **Manage** → **Subdomains** tab
3. Click **+ Create New Subdomain**

**Fill in:**
- **Subdomain Name:** `admin`
- **Document Root:** `/home/username/public_html/admin/public`
- Click **Create**

Wait 5-10 minutes for DNS to propagate.

### Verify Subdomain

Open: `https://admin.kukaqka.com`

Should show: Default page or 404 (this is normal, we'll upload soon)

---

## Step B2: Create Database

### In Hostinger Control Panel:

1. Go to **MySQL Databases**
2. Click **+ Create New Database**

**Fill in:**
- **Database Name:** `kukaqka_prod`
- Click **Create**

### Create Database User

1. Click **+ Create New User**

**Fill in:**
- **Username:** `kukaqka_admin`
- **Password:** Use strong password (save this!)
- Click **Create**

### Grant Permissions

1. Find newly created user in list
2. Click **Manage Permissions**
3. Check the database `kukaqka_prod`
4. Click **Update Permissions**

✅ Database ready!

---

## Step B3: Check PHP Version & Extensions

### In Hostinger Control Panel:

1. Go to **PHP Configuration**
2. Verify **PHP Version: 8.2+** (Set if needed)

3. Scroll down to **PHP Extensions** - Verify enabled:
   - ✅ PDO
   - ✅ PDO_MySQL
   - ✅ OpenSSL
   - ✅ ZIP
   - ✅ JSON
   - ✅ MBString
   - ✅ Fileinfo

4. Click **Save** if you made changes

---

# PART C: UPLOAD FILES TO HOSTINGER

## Step C1: Connect via SFTP

### Using FileZilla (Recommended)

1. Download **FileZilla**: https://filezilla-project.org/
2. Open FileZilla
3. Go to **File** → **Site Manager**
4. Click **New Site**

**Fill in:**
```
Host:           Your Hostinger SFTP address
Port:           22 (or what Hostinger provided)
Protocol:       SFTP
Username:       Your cPanel username
Password:       Your cPanel password
```

5. Click **Connect**

### Using Hostinger File Manager (Web-based)

1. Go to **Hostinger Control Panel** → **File Manager**
2. Navigate to `/home/username/public_html/`
3. Use the web interface to upload

---

## Step C2: Upload Admin Backend Files

### Navigate in SFTP to:
```
/home/username/public_html/admin/
```

### Upload these folders/files:

```
admin/
├── app/                    ✓ Upload
├── bootstrap/              ✓ Upload
├── config/                 ✓ Upload
├── database/               ✓ Upload
├── public/                 ✓ Upload (IMPORTANT!)
├── resources/              ✓ Upload
├── routes/                 ✓ Upload
├── .env                    ✓ Upload (from .env.production)
├── artisan                 ✓ Upload
├── composer.json           ✓ Upload
├── composer.lock           ✓ Upload
├── .htaccess              ✓ Upload (if exists)
│
├── vendor/                 ✗ DO NOT UPLOAD (install on server)
├── node_modules/          ✗ DO NOT UPLOAD (installed locally)
├── src/                    ✗ NOT NEEDED (source files)
├── dist/                   ✗ NOT NEEDED (already in public/admin/)
└── ...other files
```

---

## Step C3: Upload Admin Frontend Build

### Rename Files

In `admin/dist/`, you should have:
```
dist/
├── index.html
├── assets/
│   ├── index-XXXXX.js
│   ├── index-XXXXX.css
│   └── ...
└── ...
```

### Upload to Server

Navigate in SFTP to:
```
/home/username/public_html/admin/public/
```

Create folder `admin` (if doesn't exist)

```
/home/username/public_html/admin/public/admin/
```

Upload everything from `admin/dist/` into this folder:
```
admin/public/admin/
├── index.html              ✓ Upload
├── assets/                 ✓ Upload
└── ...
```

---

## Step C4: Upload Public Frontend

### Navigate in SFTP to:
```
/home/username/public_html/
```

Upload everything from `frontend/dist/`:
```
public_html/
├── index.html              ✓ Upload
├── assets/                 ✓ Upload
├── .htaccess              ✓ Upload (create if needed)
└── ...
```

---

## Step C5: Create .htaccess Files

### For SPA Routing (Frontend)

Create file: `/public_html/.htaccess`

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteCond %{REQUEST_FILENAME} -f
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  RewriteRule ^ index.html [QSA,L]
</IfModule>
```

### For Laravel API (Admin Backend)

Create file: `/public_html/admin/public/.htaccess`

```apache
<IfModule mod_rewrite.c>
  <IfModule mod_negotiation.c>
    Options -MultiViews
  </IfModule>

  RewriteEngine On

  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)/$ /$1 [L,R=301]

  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^ index.php [L]
</IfModule>
```

---

# PART D: SERVER CONFIGURATION (SSH)

## Step D1: Connect via SSH

### Open Terminal/Command Prompt

```bash
ssh username@your-hostinger-ip
# Or: ssh username@hostinger-domain.com
```

You'll be prompted for password (your cPanel password)

### Using Hostinger Terminal

1. Go to **Hostinger Control Panel** → **Advanced** → **Terminal**
2. Paste commands below

---

## Step D2: Install PHP Dependencies

```bash
# Navigate to admin folder
cd ~/public_html/admin

# Install Composer dependencies (optimized for production)
composer install --no-dev --optimize-autoloader
```

**Wait for completion** (usually 1-2 minutes)

Expected output:
```
Installing dependencies from lock file
...
✓ Success!
```

---

## Step D3: Copy Admin Frontend Files

```bash
# Create admin folder if it doesn't exist
mkdir -p ~/public_html/admin/public/admin

# Copy built files (if not already uploaded via SFTP)
# Note: Only run if you haven't uploaded via SFTP yet
# cp -r admin/dist/* ~/public_html/admin/public/admin/
```

---

## Step D4: Setup Environment File

```bash
cd ~/public_html/admin

# Create .env file (copy from .env.production)
cp .env.production .env

# Edit .env to update for server
nano .env
```

**Update in nano editor:**

```env
# Press Ctrl+X to save when done

APP_DEBUG=false
APP_ENV=production

# Verify database details
DB_HOST=localhost
DB_DATABASE=kukaqka_prod
DB_USERNAME=kukaqka_admin
DB_PASSWORD=YOUR_PASSWORD_HERE

# Email settings
MAIL_HOST=smtp.hostinger.com
MAIL_USERNAME=your-email@kukaqka.com
MAIL_PASSWORD=YOUR_EMAIL_PASSWORD
```

Press: **Ctrl + O** (save) → **Enter** → **Ctrl + X** (exit)

---

## Step D5: Setup Database

```bash
cd ~/public_html/admin

# Run migrations (creates database tables)
php artisan migrate --force
```

You should see:
```
✓ Tables created successfully
```

---

## Step D6: Create Admin User (Important!)

```bash
# Enter interactive shell
php artisan tinker

# Create admin user (copy-paste this):
$user = App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@kukaqka.com',
    'password' => bcrypt('your-strong-password'),
]);
$user->assignRole('super-admin');

# Exit tinker
exit
```

**Save your password!** You'll need it to login.

---

## Step D7: Set File Permissions

```bash
cd ~/public_html/admin

# Set directory permissions
chmod -R 755 .
chmod -R 777 storage bootstrap/cache

# Set owner (if permission denied, skip this)
chown -R nobody:nobody .
```

---

## Step D8: Cache Configuration

```bash
cd ~/public_html/admin

# Cache all configuration (important for performance!)
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Clear all old caches
php artisan cache:clear
```

---

# PART E: TESTING & VERIFICATION

## Step E1: Test API Connection

Open terminal and run:

```bash
# Test if API responds
curl -i https://admin.kukaqka.com/api/v1/health
```

Should return: **200 OK**

Or open in browser:
```
https://admin.kukaqka.com/api/v1/health
```

Should show:
```json
{"status":"ok"}
```

---

## Step E2: Test Admin Panel

Open in browser:
```
https://admin.kukaqka.com
```

You should see:
- ✅ Login page loads
- ✅ No 404 or 500 errors

### Login

```
Email: admin@kukaqka.com
Password: (the one you created in Step D6)
```

You should see:
- ✅ Dashboard loads
- ✅ Can navigate to different sections
- ✅ No console errors (F12 → Console tab)

---

## Step E3: Test Public Website

Open in browser:
```
https://kukaqka.com
```

You should see:
- ✅ Homepage loads
- ✅ No 404 errors
- ✅ Links work properly

---

## Step E4: Check Server Logs

```bash
ssh to server
cd ~/public_html/admin

# View real-time logs
tail -f storage/logs/laravel.log
```

Should show:
```
[2024-01-15] local.INFO: ...
```

No ERROR or EXCEPTION entries = Good!

---

## Step E5: Check Browser Console

### Admin Panel (https://admin.kukaqka.com)

1. Open in browser
2. Press **F12** → **Console** tab
3. Should show **0 errors** (maybe some warnings)

### Public Website (https://kukaqka.com)

1. Open in browser
2. Press **F12** → **Console** tab
3. Should show **0 errors**

---

# PART F: POST-DEPLOYMENT

## Step F1: Enable SSL Certificate

### Hostinger Auto-SSL (Usually enabled by default)

1. Go to **Security** → **SSL**
2. Click **AutoSSL** → **Manage**
3. Should show: "SSL Certificate Active"

If not:
1. Click **Install AutoSSL**
2. Wait 15-30 minutes
3. Refresh page to verify

---

## Step F2: Setup Automated Backups

### In Hostinger Control Panel:

1. Go to **Backups**
2. Click **Automatic Backups**
3. Select: **Daily** or **Weekly**
4. Click **Enable**

---

## Step F3: Configure Cron Job (Optional but Recommended)

```bash
# SSH to server
ssh username@host
cd ~/public_html/admin

# Edit crontab
crontab -e

# Add this line at the end:
* * * * * cd ~/public_html/admin && php artisan schedule:run >> /dev/null 2>&1

# Save: Ctrl+O → Enter → Ctrl+X
```

This runs Laravel's scheduler every minute.

---

## Step F4: Create Git Ignore for Sensitive Files

Make sure these are in your `.gitignore` (they should be):

```
.env
.env.production
vendor/
node_modules/
dist/
storage/logs/
```

---

# Summary Checklist

## Before Deployment

- [ ] Update `.env.production` with all credentials
- [ ] Run build script successfully
- [ ] Verify `admin/dist/` and `frontend/dist/` have files

## On Hostinger

- [ ] Create subdomain `admin.kukaqka.com`
- [ ] Create database `kukaqka_prod` and user
- [ ] Verify PHP 8.2+ and required extensions
- [ ] Upload admin backend files via SFTP
- [ ] Upload admin frontend files to `public/admin/`
- [ ] Upload public frontend files to `public_html/`

## Server Configuration (SSH)

- [ ] Run `composer install --no-dev`
- [ ] Create `.env` file from template
- [ ] Run `php artisan migrate --force`
- [ ] Create admin user with `php artisan tinker`
- [ ] Set permissions with `chmod`
- [ ] Cache everything with `php artisan config:cache`

## Testing

- [ ] Test API: `https://admin.kukaqka.com/api/v1/health`
- [ ] Test admin login: `https://admin.kukaqka.com`
- [ ] Test frontend: `https://kukaqka.com`
- [ ] Check console for errors (F12)
- [ ] Check server logs for errors

## Post-Deployment

- [ ] Enable SSL certificate
- [ ] Setup automatic backups
- [ ] Setup cron job (optional)
- [ ] Change default password

---

# Troubleshooting

## Issue: Admin panel shows blank page

```bash
# SSH to server
cd ~/public_html/admin
php artisan config:clear
php artisan cache:clear
tail -f storage/logs/laravel.log
# Check logs for errors
```

## Issue: API returns 404

```bash
# Check routes
php artisan route:cache

# Check .env APP_URL
grep APP_URL .env

# Should be: https://admin.kukaqka.com/api/v1
```

## Issue: Database connection error

```bash
# Verify credentials
grep DB_ .env

# Test connection
php artisan tinker
# DB::connection()->getPdo();
# exit
```

## Issue: Files not uploading

```bash
# Check storage permissions
chmod -R 777 storage

# Check if folder exists
ls -la storage/
```

## Issue: CORS errors in browser

```bash
# Update CORS config
nano config/cors.php

# Add your domains to 'allowed_origins':
'allowed_origins' => [
    'https://kukaqka.com',
    'https://admin.kukaqka.com',
],

# Save and cache
php artisan config:cache
```

---

# Important Reminders

⚠️ **SECURITY:**
- Never commit `.env` files
- Change default admin password
- Enable 2FA if available
- Use strong database password
- Keep software updated

📧 **BACKUPS:**
- Enable automatic backups
- Test backup restoration
- Keep .git history safe

🔍 **MONITORING:**
- Check logs regularly
- Monitor error rates
- Test functionality weekly
- Update content regularly

---

## You're Done! 🎉

Your Kukaqka CMS is now live!

```
✅ Admin Panel:     https://admin.kukaqka.com
✅ Public Website:  https://kukaqka.com
✅ API Backend:     https://admin.kukaqka.com/api/v1
```

For help, see:
- Full Guide: `DEPLOYMENT_GUIDE.md`
- Quick Checklist: `QUICK_DEPLOYMENT_CHECKLIST.md`
- Logs: SSH → `tail -f ~/public_html/admin/storage/logs/laravel.log`

