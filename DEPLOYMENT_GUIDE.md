# Kukaqka CMS - Hostinger Deployment Guide

## Deployment Architecture

```
Domain: kukaqka.com (Public Frontend)
Subdomain: admin.kukaqka.com (Admin Panel + API Backend)

Directory Structure on Hostinger:
public_html/
├── index.html (Frontend SPA)
├── assets/
├── .htaccess (SPA routing)
└── ... (public frontend files)

admin.kukaqka.com/
├── public/
│   ├── admin/
│   │   ├── index.html (Admin SPA)
│   │   ├── assets/
│   │   └── ... (admin frontend files)
│   └── index.php (Laravel entry point)
├── app/
├── config/
├── routes/
├── .env (production env)
└── ... (Laravel backend files)
```

---

## Step 1: Prepare Hostinger Server

### 1.1 Create Subdomain (admin.kukaqka.com)

1. Go to **Hostinger Control Panel** → **Domains**
2. Find your domain `kukaqka.com`
3. Click **Manage** → **Subdomains** tab
4. Click **Create New Subdomain**
   - **Subdomain Name:** `admin`
   - **Document Root:** `/home/username/public_html/admin` (or similar)
   - Click **Create**

### 1.2 Create Database

1. Go to **MySQL Databases** section
2. Create new database:
   - **Database Name:** `kukaqka_prod` (or similar)
   - **Username:** Create new user (e.g., `kukaqka_admin`)
   - **Password:** Use strong password (save it!)

### 1.3 Enable Required PHP Extensions

1. Go to **PHP Configuration**
2. Ensure these are enabled:
   - ✅ PDO (MySQL)
   - ✅ OpenSSL
   - ✅ ZIP
   - ✅ JSON
   - ✅ MBString
   - ✅ Fileinfo
3. Set **PHP Version:** 8.2+

---

## Step 2: Prepare Local Build Files

### 2.1 Create Production Environment Files

**Create `admin/.env.production`:**

```env
APP_NAME="Kukaqka Admin API"
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:YOUR_APP_KEY_HERE

# Update these with your Hostinger domain
APP_URL=https://admin.kukaqka.com/api/v1
FRONTEND_URL=https://kukaqka.com

# Production Database
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=kukaqka_prod
DB_USERNAME=kukaqka_admin
DB_PASSWORD=YOUR_DB_PASSWORD_HERE

# Redis (optional - remove if not available)
CACHE_STORE=file
QUEUE_CONNECTION=database
SESSION_DRIVER=database

# Email Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=587
MAIL_USERNAME=your-email@kukaqka.com
MAIL_PASSWORD=YOUR_EMAIL_PASSWORD
MAIL_FROM_ADDRESS=hello@kukaqka.com
MAIL_FROM_NAME="Kukaqka"

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=notice

# Other
SCOUT_DRIVER=database
```

**Create `admin/.env.build`** (for build process):

```env
VITE_API_URL=https://admin.kukaqka.com/api/v1/admin
```

### 2.2 Generate Laravel App Key

```bash
cd admin
php artisan key:generate --env=production
# Copy the generated key to .env.production (APP_KEY)
```

### 2.3 Build Admin Frontend

```bash
cd admin

# Install dependencies
npm install

# Build for production
npm run build

# This creates dist/ folder with compiled admin panel
```

### 2.4 Build Public Frontend (Optional)

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# This creates dist/ folder with public website
```

---

## Step 3: Upload Files to Hostinger

### 3.1 Connect via SFTP

Use **FileZilla** or **Hostinger File Manager**:

**Credentials:**
- Host: Your Hostinger SFTP address
- Username: Your cPanel username
- Password: Your cPanel password
- Port: 22 (SFTP)

### 3.2 Upload Directory Structure

**For Admin Panel (admin.kukaqka.com):**

```bash
# Upload entire admin folder EXCEPT:
# ❌ node_modules/
# ❌ .env (create fresh on server)
# ❌ dist/ (will create after build)

# DO upload:
# ✅ app/
# ✅ config/
# ✅ database/
# ✅ routes/
# ✅ src/ (optional, not used in production)
# ✅ public/
# ✅ composer.json
# ✅ composer.lock
# ✅ artisan
```

**Upload Structure:**
```
/home/username/public_html/admin/
├── app/
├── bootstrap/
├── config/
├── database/
├── public/          ← Web root, contains:
│   ├── admin/       ← Upload admin/dist/ here
│   │   ├── index.html
│   │   └── assets/
│   └── index.php
├── routes/
├── .env.production  ← Upload as .env
├── composer.json
└── ... (other Laravel files)
```

**For Public Frontend (kukaqka.com):**

```bash
# Upload frontend/dist contents directly to public_html/
/home/username/public_html/
├── index.html
├── assets/
├── .htaccess  ← For SPA routing (see below)
└── ... (public website files)
```

### 3.3 Create `.htaccess` for Frontend SPA Routing

**Create `/public_html/.htaccess`:**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} -f
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Rewrite everything else to index.html
  RewriteRule ^ index.html [QSA,L]
</IfModule>
```

### 3.4 Create `.htaccess` for Admin Backend (Optional)

**Create `/admin/public/.htaccess`:**

```apache
<IfModule mod_rewrite.c>
  <IfModule mod_negotiation.c>
    Options -MultiViews
  </IfModule>

  RewriteEngine On

  # Redirect Trailing Slashes If Not A Folder...
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)/$ /$1 [L,R=301]

  # Handle Front Controller...
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^ index.php [L]
</IfModule>
```

---

## Step 4: Server Setup (via SSH/Terminal)

### 4.1 Connect via SSH

```bash
ssh username@your-hostinger-ip
# Or use Hostinger Terminal in cPanel
```

### 4.2 Install Composer Dependencies

```bash
cd ~/public_html/admin

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 4.3 Setup Database

```bash
# Run migrations
php artisan migrate --force

# (Optional) Seed initial data
php artisan db:seed --class=DatabaseSeeder

# Create initial admin user
php artisan tinker
# Then in tinker:
# $user = App\Models\User::create([
#   'name' => 'Admin',
#   'email' => 'admin@kukaqka.com',
#   'password' => bcrypt('your-password'),
# ]);
# $user->assignRole('super-admin');
# exit
```

### 4.4 Set File Permissions

```bash
cd ~/public_html/admin

# Set proper permissions
chmod -R 755 .
chmod -R 777 storage bootstrap/cache
chown -R nobody:nobody .
```

### 4.5 Copy Admin Frontend Build

```bash
# Copy your built admin dist files to public/admin/
cp -r admin/dist/* ~/public_html/admin/public/admin/

# Create admin directory if it doesn't exist
mkdir -p ~/public_html/admin/public/admin
```

---

## Step 5: Configure Environment Variables

### 5.1 Update `.env` on Server

**SSH into server and edit:**

```bash
cd ~/public_html/admin
nano .env
```

**Update these values:**
```env
APP_DEBUG=false
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY
APP_URL=https://admin.kukaqka.com/api/v1
FRONTEND_URL=https://kukaqka.com

DB_HOST=localhost
DB_DATABASE=kukaqka_prod
DB_USERNAME=kukaqka_admin
DB_PASSWORD=YOUR_DB_PASSWORD

# Remove or disable Redis if not available
CACHE_STORE=file
QUEUE_CONNECTION=database
```

---

## Step 6: Test Deployment

### 6.1 Test API

```bash
curl -i https://admin.kukaqka.com/api/v1/health
# Should return 200 OK
```

### 6.2 Test Admin Panel

- Navigate to: **https://admin.kukaqka.com/**
- Login with credentials created in Step 4.3

### 6.3 Test Public Frontend

- Navigate to: **https://kukaqka.com/**
- Should display without errors

### 6.4 Check Logs

```bash
cd ~/public_html/admin
tail -f storage/logs/laravel.log
```

---

## Step 7: SSL Certificate Setup

### 7.1 Enable Free SSL

1. Go to **Hostinger Control Panel** → **Security** → **SSL**
2. Install **AutoSSL** (usually enabled by default)
3. Wait 15-30 minutes for certificate to be issued
4. Verify HTTPS works: https://admin.kukaqka.com

### 7.2 Force HTTPS

**Update `.env`:**
```env
APP_URL=https://admin.kukaqka.com/api/v1
FRONTEND_URL=https://kukaqka.com
```

**Update `app/Http/Middleware/TrustProxies.php`** if needed:
```php
protected $proxies = '*';
protected $headers = Request::HEADER_X_FORWARDED_FOR | Request::HEADER_X_FORWARDED_HOST | Request::HEADER_X_FORWARDED_PROTO;
```

---

## Step 8: Optimize for Production

### 8.1 Enable Caching

```bash
cd ~/public_html/admin
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 8.2 Setup Cronjob (for scheduled tasks)

```bash
# Edit crontab
crontab -e

# Add this line:
* * * * * cd ~/public_html/admin && php artisan schedule:run >> /dev/null 2>&1
```

### 8.3 Setup Queue Workers (if using)

**Create a supervisor config file or use:**

```bash
# Manual (not recommended for production):
php artisan queue:work
```

---

## Troubleshooting

### Admin Panel Shows Blank Page

```bash
# Check Laravel logs
tail -f ~/public_html/admin/storage/logs/laravel.log

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Rebuild
php artisan config:cache
php artisan route:cache
```

### API 404 Errors

- Verify `.env` has correct `APP_URL`
- Check `.htaccess` is in place
- Run: `php artisan route:cache`

### Database Connection Error

```bash
# Check database credentials in .env
# Test connection:
php artisan tinker
# DB::connection()->getPdo();
# exit
```

### CORS Errors

**Update `config/cors.php`:**

```php
'allowed_origins' => [
    'https://kukaqka.com',
    'https://admin.kukaqka.com',
],
```

### File Upload Issues

```bash
# Ensure storage is writable
chmod -R 777 storage
chown -R nobody:nobody storage
```

---

## Deployment Checklist

- [ ] Create subdomain `admin.kukaqka.com` on Hostinger
- [ ] Create production database
- [ ] Generate Laravel app key
- [ ] Create `.env.production` file
- [ ] Build admin frontend (`npm run build`)
- [ ] Build public frontend (`npm run build`)
- [ ] Upload admin files via SFTP
- [ ] Upload frontend files to main domain
- [ ] Run `composer install --no-dev`
- [ ] Run database migrations
- [ ] Set file permissions (755/777)
- [ ] Enable SSL certificate
- [ ] Test API endpoints
- [ ] Test admin panel login
- [ ] Test public website
- [ ] Setup backup strategy
- [ ] Monitor logs regularly

---

## Useful Commands Reference

```bash
# SSH into Hostinger
ssh username@host

# Navigate to admin folder
cd ~/public_html/admin

# Check Laravel version
php artisan --version

# View logs
tail -f storage/logs/laravel.log

# Clear all caches
php artisan cache:clear && php artisan config:clear && php artisan view:clear

# Database commands
php artisan migrate --force
php artisan db:seed
php artisan tinker

# File permissions
chmod -R 755 .
chmod -R 777 storage bootstrap/cache
```

---

## Support & Monitoring

1. **Monitor API Health:** `https://admin.kukaqka.com/api/v1/health`
2. **Check Server Logs:** SSH → `tail -f storage/logs/laravel.log`
3. **Database Backups:** Use Hostinger automated backups
4. **Email Testing:** Send test email from settings
5. **Performance:** Monitor with Hostinger analytics

---

## Next Steps

After deployment:
1. ✅ Test all functionality
2. ✅ Set up regular backups
3. ✅ Configure email notifications
4. ✅ Monitor error logs
5. ✅ Setup domain email accounts
6. ✅ Test on multiple devices/browsers
7. ✅ Plan maintenance schedule

