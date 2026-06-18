# Step-by-Step Deployment Guide - Kukaqka CMS

## Overview
This guide provides a complete step-by-step process to deploy the Kukaqka CMS application to a production server.

---

## Phase 1: Pre-Deployment Preparation

### Step 1.1: Verify Code Quality
```bash
# Check for any remaining console logs
grep -r "console\." admin/src frontend/src --include="*.vue" --include="*.ts" | grep -v "cloud.google.com"

# Verify no test files exist
find . -name "test_*.php" -o -name "*.test.ts" -o -name "*.spec.ts" | grep -v node_modules
```

### Step 1.2: Update Environment Files
Create production environment files:

**admin/.env.production**
```env
APP_NAME="Kukaqka CMS"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=your-database-host
DB_PORT=3306
DB_DATABASE=kukaqka_production
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=cookie

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-email-user
MAIL_PASSWORD=your-email-password
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"

# OAuth Configuration (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-domain.com/api/v1/auth/google/callback

FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=https://your-domain.com/api/v1/auth/facebook/callback

# App Security
APP_KEY=base64:your-generated-app-key
```

### Step 1.3: Generate Application Key
```bash
cd admin
php artisan key:generate --env=production
```

### Step 1.4: Install PHP Dependencies
```bash
cd admin
composer install --optimize-autoloader --no-dev
```

---

## Phase 2: Database Preparation

### Step 2.1: Create Production Database
```sql
CREATE DATABASE kukaqka_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kukaqka_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON kukaqka_production.* TO 'kukaqka_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 2.2: Run Database Migrations
```bash
cd admin
php artisan migrate --env=production --force
```

### Step 2.3: Seed Initial Data
```bash
cd admin
php artisan db:seed --env=production
```

**Note:** This will create default roles (super-admin, admin, staff, client) and initial users.

### Step 2.4: Verify Database Setup
```bash
# Check roles table
php artisan tinker
>>> App\Models\Role::all();
```

---

## Phase 3: Frontend Build

### Step 3.1: Install Admin Frontend Dependencies
```bash
cd admin
npm install
```

### Step 3.2: Build Admin Frontend for Production
```bash
cd admin
npm run build
```

This creates optimized production bundles in `admin/dist/`.

### Step 3.3: Install Public Frontend Dependencies (if applicable)
```bash
cd frontend
npm install
```

### Step 3.4: Build Public Frontend for Production
```bash
cd frontend
npm run build
```

---

## Phase 4: Server Configuration

### Step 4.1: Web Server Setup (Nginx Example)
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    root /var/www/kukaqka/public;
    index index.php;

    # Laravel default location
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Admin panel routes
    location /admin {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM configuration
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Deny access to .env and other sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ /\.env {
        deny all;
    }
}

# HTTP redirect to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Step 4.2: PHP-FPM Configuration
Ensure PHP-FPM is configured with proper settings:
- `memory_limit`: 512M
- `upload_max_filesize`: 100M
- `post_max_size`: 100M
- `max_execution_time`: 300

### Step 4.3: File Permissions
```bash
# Set correct permissions
chown -R www-data:www-data /var/www/kukaqka
chmod -R 755 /var/www/kukaqka
chmod -R 775 /var/www/kukaqka/storage
chmod -R 775 /var/www/kukaqka/bootstrap/cache
chmod 644 /var/www/kukaqka/.env.production
```

### Step 4.4: Enable SSL/TLS Certificate
Use Let's Encrypt for free SSL:
```bash
certbot certonly --webroot -w /var/www/kukaqka/public -d your-domain.com
```

---

## Phase 5: Cache and Storage Setup

### Step 5.1: Configure Redis (Optional but Recommended)
```bash
# Install Redis
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Step 5.2: Setup Storage Links
```bash
cd admin
php artisan storage:link
```

### Step 5.3: Clear Application Cache
```bash
cd admin
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

## Phase 6: Final Deployment Steps

### Step 6.1: Set Application Mode
```bash
# Ensure APP_ENV is set to production in .env
APP_ENV=production
APP_DEBUG=false
```

### Step 6.2: Optimize Laravel Application
```bash
cd admin
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### Step 6.3: Setup Queue Worker (if using)
```bash
# For background jobs, setup supervisor
sudo nano /etc/supervisor/conf.d/kukaqka-worker.conf
```

Add:
```ini
[program:kukaqka-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/kukaqka/artisan queue:work redis --sleep=3 --tries=3
autostart=true
autorestart=true
numprocs=4
redirect_stderr=true
stdout_logfile=/var/log/kukaqka-worker.log
```

### Step 6.4: Setup Cron Job
```bash
# Add to crontab
crontab -e

# Add this line:
* * * * * cd /var/www/kukaqka && php artisan schedule:run >> /dev/null 2>&1
```

---

## Phase 7: Testing and Verification

### Step 7.1: Health Check
```bash
# Test API health endpoint
curl https://your-domain.com/api/v1/health
# Should return: {"status":"ok"}
```

### Step 7.2: Admin Panel Access
1. Navigate to `https://your-domain.com/admin`
2. Login with default credentials or your configured user
3. Verify all modules are accessible based on your role

### Step 7.3: Database Connection
```bash
# Test database connectivity
cd admin
php artisan migrate:status
```

### Step 7.4: File Upload Test
1. Go to Media section in admin panel
2. Upload a test file
3. Verify file is stored in `/storage/app/public/`

### Step 7.5: Email Configuration Test
```bash
cd admin
php artisan tinker
>>> Mail::raw('Test email', function($message) { $message->to('your-email@example.com')->subject('Test'); });
```

---

## Phase 8: Monitoring and Maintenance

### Step 8.1: Setup Logging
Configure log rotation:
```bash
# Create logrotate config
sudo nano /etc/logrotate.d/kukaqka

# Add:
/var/www/kukaqka/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### Step 8.2: Monitor Application
```bash
# Tail error logs
tail -f /var/www/kukaqka/storage/logs/laravel.log

# Monitor PHP-FPM
systemctl status php8.1-fpm
```

### Step 8.3: Regular Backups
```bash
# Create backup script
#!/bin/bash
BACKUP_DIR="/backups/kukaqka"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
mysqldump -u kukaqka_user -p kukaqka_production > $BACKUP_DIR/db_$DATE.sql

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/kukaqka/storage/app

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

---

## Troubleshooting

### Issue: 500 Internal Server Error
**Solution:**
```bash
cd admin
# Check error logs
tail -f storage/logs/laravel.log

# Check permissions
chmod -R 775 storage bootstrap/cache

# Clear cache
php artisan cache:clear
php artisan config:clear
```

### Issue: Admin panel shows blank page
**Solution:**
```bash
# Rebuild frontend
npm run build

# Clear browser cache (Ctrl+Shift+Del)
# Check browser console for errors
```

### Issue: Database connection error
**Solution:**
```bash
# Verify .env credentials
cat .env | grep DB_

# Test database connection
mysql -h DB_HOST -u DB_USERNAME -p DB_DATABASE

# Run migrations
php artisan migrate --env=production
```

### Issue: File upload fails
**Solution:**
```bash
# Check storage permissions
chmod -R 775 /var/www/kukaqka/storage

# Ensure symlink exists
php artisan storage:link

# Check disk space
df -h
```

---

## Post-Deployment Checklist

- [ ] Environment variables configured correctly
- [ ] Database migrations completed
- [ ] SSL/TLS certificate installed
- [ ] Frontend builds successful
- [ ] Admin panel accessible
- [ ] File uploads working
- [ ] Email configuration tested
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Cron jobs setup
- [ ] Queue worker running (if applicable)
- [ ] Cache cleared and optimized
- [ ] Error logs monitored
- [ ] Security headers configured
- [ ] Rate limiting enabled

---

## Security Checklist

- [ ] APP_DEBUG set to false
- [ ] APP_ENV set to production
- [ ] .env file has correct permissions (644)
- [ ] Sensitive files (.env, storage) denied in web server
- [ ] HTTPS/SSL enabled
- [ ] Database password is strong
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] SQL injection protection verified
- [ ] XSS protection enabled
- [ ] CSRF tokens verified
- [ ] Unauthorized access denied
- [ ] Regular security updates planned
- [ ] Backup and recovery plan documented

---

## Support and Updates

For issues or questions:
1. Check `storage/logs/laravel.log`
2. Review [Deployment Guide](DEPLOYMENT_GUIDE.md)
3. Check [README](README.md) for system requirements
4. Verify all prerequisites are met

---

**Last Updated:** June 19, 2026
**Version:** 1.0
