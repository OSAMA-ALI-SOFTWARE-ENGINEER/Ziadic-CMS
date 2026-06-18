# Quick Start Deployment Guide

## TL;DR - 5 Minute Overview

Your Kukaqka CMS application is **production-ready**. Follow these quick steps:

---

## Step 1: Prepare Your Server (30 mins)

```bash
# Install dependencies on your server
sudo apt-get update
sudo apt-get install php8.1-fpm php8.1-mysql mysql-server nginx nodejs npm

# Create app directory
mkdir /var/www/kukaqka
cd /var/www/kukaqka
```

---

## Step 2: Clone and Setup Backend (20 mins)

```bash
# Clone your repo
git clone <your-repo-url> .

# Setup PHP backend
cd admin
composer install --optimize-autoloader --no-dev

# Configure environment
cp .env.example .env
nano .env  # Edit with your production values

# Generate key and run migrations
php artisan key:generate --env=production
php artisan migrate --force
php artisan db:seed

# Optimize
php artisan config:cache
php artisan route:cache
php artisan optimize
```

---

## Step 3: Build Frontend (10 mins)

```bash
# Setup and build
npm install
npm run build

# Output goes to dist/ directory
```

---

## Step 4: Configure Web Server (15 mins)

**For Nginx:** Create `/etc/nginx/sites-available/kukaqka`

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.crt;
    ssl_certificate_key /path/to/key.key;
    
    root /var/www/kukaqka/public;
    index index.php;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/kukaqka /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 5: Set Permissions (5 mins)

```bash
chown -R www-data:www-data /var/www/kukaqka
chmod -R 755 /var/www/kukaqka
chmod -R 775 /var/www/kukaqka/storage
chmod -R 775 /var/www/kukaqka/bootstrap/cache
```

---

## Step 6: Verify Installation (5 mins)

```bash
# Test API
curl https://your-domain.com/api/v1/health

# Check logs
tail -f /var/www/kukaqka/storage/logs/laravel.log

# Login to admin panel
# Go to: https://your-domain.com/admin
```

---

## Environment Variables (.env)

**Minimum required:**

```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:xxxxx (generated with php artisan key:generate)

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=kukaqka_prod
DB_USERNAME=kukaqka_user
DB_PASSWORD=your-strong-password

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
```

---

## Default Admin Credentials

After seeding, use these to login:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@kukaqka.com | password |
| Admin | admin@kukaqka.com | password |
| Staff | staff@kukaqka.com | password |
| Client | client@kukaqka.com | password |

**⚠️ Change passwords immediately after first login!**

---

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| 500 error | Check `storage/logs/laravel.log` |
| Blank admin page | Run `npm run build` again |
| Database connection error | Verify .env credentials |
| File upload fails | Check storage permissions |
| Admin shows blank | Clear cache: `php artisan cache:clear` |

---

## Estimated Time to Deploy: **1-2 hours**

For detailed steps and troubleshooting, see **[DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md)**

---

## What's Included

✅ Full Admin CMS  
✅ User & Role Management  
✅ Media Library  
✅ Blog Articles  
✅ OAuth Integration  
✅ Activity Logging  
✅ Production-optimized code  
✅ Complete documentation  

---

## Security First!

Before going live:
- [ ] Change all default passwords
- [ ] Set APP_DEBUG=false
- [ ] Install SSL certificate
- [ ] Configure strong database password
- [ ] Setup backups
- [ ] Enable firewall

See full checklist in **[DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md)**

---

**That's it! You're ready to deploy. 🚀**

For detailed guidance, see: **[DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md)**
