# Ziadic / Kukaqka Project

This repository contains the public Vue 3 frontend and the Laravel 13 backend API/CMS foundation.

## Project Structure

```text
Ziadic/
  README.md                 Main setup and run guide
  DEPLOYMENT.md             Hostinger deployment notes
  frontend/                 Public Vue 3 website
    src/                    Vue source code
    public/                 Static assets, legacy Webflow HTML/assets
    dist/                   Production build output
    package.json            Frontend scripts and dependencies
  admin/                    Laravel 13 backend API and CMS foundation
    app/                    Laravel models, providers, application code
    bootstrap/              Laravel bootstrap/cache files
    config/                 Laravel config
    database/
      migrations/           Database schema migrations
      seeders/              Default roles, permissions, CMS seed data
    public/                 Laravel public document root
    routes/                 API and console routes
    composer.json           Backend PHP dependencies
```

## Requirements

Frontend:

- Node.js
- npm

Backend:

- Laragon with PHP 8.4 recommended
- Composer
- MySQL 8
- PHP extensions: `zip`, `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`

Important for Windows/Laragon: PowerShell must use Laragon PHP, not XAMPP PHP.

Check:

```powershell
php -v
where php
```

Expected first PHP path:

```text
C:\laragon\bin\php\php-8.4.21\php.exe
```

If `where php` shows `C:\xampp\php\php.exe` first, move this Laragon path above XAMPP in Windows Environment Variables:

```text
C:\laragon\bin\php\php-8.4.21
```

## First-Time Setup

Install frontend dependencies:

```powershell
cd C:\laragon\www\Ziadic\frontend
npm install
```

Install backend dependencies:

```powershell
cd C:\laragon\www\Ziadic\admin
C:\laragon\bin\php\php-8.4.21\php.exe C:\composer\composer.phar install
```

Create backend `.env`:

```powershell
cd C:\laragon\www\Ziadic\admin
copy .env.example .env
C:\laragon\bin\php\php-8.4.21\php.exe artisan key:generate
```

Update database settings in `admin/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=zaidic
DB_USERNAME=root
DB_PASSWORD=
```

Create the database in MySQL/Laragon, then run migrations and seeders:

```powershell
cd C:\laragon\www\Ziadic\admin
C:\laragon\bin\php\php-8.4.21\php.exe artisan migrate --seed
```

Default admin seed values are controlled by `admin/.env`:

```env
ADMIN_NAME="Super Admin"
ADMIN_EMAIL=admin@kukaqka.com
ADMIN_PASSWORD=password
```

## Run The Project

Start backend API:

```powershell
cd C:\laragon\www\Ziadic\admin
C:\laragon\bin\php\php-8.4.21\php.exe artisan serve --host=127.0.0.1 --port=8000
```

Backend health check:

```text
http://127.0.0.1:8000/api/v1/health
```

Start frontend website in a second terminal:

```powershell
cd C:\laragon\www\Ziadic\frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

Frontend URL:

```text
http://127.0.0.1:5173/
```

## Build Frontend

```powershell
cd C:\laragon\www\Ziadic\frontend
npm run build
```

Production files are generated in:

```text
frontend/dist/
```

The build includes:

- `index.html`
- `404.html` fallback for direct route support
- `.htaccess` for Apache/Hostinger SPA routing
- compiled assets

## Backend Modules Included

The backend schema currently includes:

- Users
- Roles and permissions
- Sanctum API tokens
- Listings
- Categories and tags
- Countries and cities
- Listing images/gallery
- Listing hours, facilities, contacts
- Listing approval workflow
- Pages
- Blog posts
- Services
- Team members
- FAQs
- Plans, subscriptions, payments
- Settings
- Contact messages
- Notifications
- Queue tables
- Activity logs
- Spatie Media Library table

## Useful Commands

Backend:

```powershell
cd C:\laragon\www\Ziadic\admin
C:\laragon\bin\php\php-8.4.21\php.exe artisan migrate:fresh --seed
C:\laragon\bin\php\php-8.4.21\php.exe artisan route:list
C:\laragon\bin\php\php-8.4.21\php.exe artisan cache:clear
```

Frontend:

```powershell
cd C:\laragon\www\Ziadic\frontend
npm run dev
npm run build
npm run preview
```

## Notes

- `frontend/` is the public Vue website.
- `admin/` is now the Laravel backend API/CMS foundation.
- Horizon was not installed because the current Horizon package line does not resolve with Laravel 13 yet. Redis queues can still be configured, and Horizon can be added when a Laravel 13-compatible release is available.
- Do not commit `.env`, `vendor/`, `node_modules/`, or generated build/cache files.
