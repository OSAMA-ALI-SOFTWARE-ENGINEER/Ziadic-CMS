# Kukaqka CMS - Admin Dashboard

A modern, real-time admin dashboard built with Vue 3, TypeScript, and Laravel. Manage listings, content, users, roles, and system settings with a beautiful, responsive interface.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Setup & Installation](#setup--installation)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Frontend Components](#frontend-components)
9. [Authentication & Authorization](#authentication--authorization)
10. [Real-time Features](#real-time-features)
11. [Development Guide](#development-guide)

---

## 📱 Project Overview

**Kukaqka CMS** is a comprehensive content management system designed for managing:
- 📍 **Listings** - Directory of places, businesses, and locations
- 📝 **Blog Articles** - Create and manage blog content with categories
- 👥 **Users & Roles** - User management with role-based access control (Spatie Permissions)
- 🏷️ **Categories** - Organize content with flexible category system
- ⚙️ **System Settings** - Configure app branding, SEO, theme, and payments
- 👤 **Profiles** - User profile management with auto-save
- 📊 **Activity Logs** - Track all system actions and changes
- 📸 **Media Library** - Upload and manage images and files

**Key Features:**
- ✅ Real-time auto-save with visual feedback
- ✅ Modern gradient UI with smooth animations
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Professional data management tables
- ✅ Modal dialogs with validation
- ✅ Skeleton loading states
- ✅ Toast notifications
- ✅ Clean, maintainable code architecture

---

## 🏗️ System Architecture

### Frontend → Backend Flow

```
┌─────────────────────┐
│   Vue 3 Component   │
│   (Dashboard Page)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Pinia Store       │ ← State Management
│   (auth, ui, cms)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   API Service       │ ← Axios Instance
│   (Interceptors)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Laravel API        │ ← REST Endpoints
│  (Controllers)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Database (MySQL)   │ ← Data Storage
└─────────────────────┘
```

### Request Flow with Interceptors

```
1. User Action (form submit, button click)
   ↓
2. Vue Component calls API
   ↓
3. Request Interceptor
   - Add Authorization Bearer token
   - Set Content-Type headers
   ↓
4. Axios sends to Laravel API
   ↓
5. Laravel Middleware (admin-auth)
   - Verify Sanctum token
   - Check user permissions
   ↓
6. Controller processes request
   - Validate input
   - Update database
   - Return response
   ↓
7. Response Interceptor
   - Handle 401 errors (clear session)
   - Show toast notifications
   ↓
8. Vue Component updates UI
   - Display success/error message
   - Update local state
   - Refresh data if needed
```

---

## 💻 Technology Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Tailwind CSS / UnoCSS** - Utility-first styling
- **PrimeVue** - Component library

### Backend
- **Laravel 11** - PHP web framework
- **Sanctum** - API authentication (token-based)
- **Spatie Permissions** - Role & permission management
- **Eloquent ORM** - Database abstraction
- **MySQL 8** - Relational database

### Development Tools
- **Vite** - Frontend build tool
- **Composer** - PHP package manager
- **NPM/YARN** - JavaScript package manager
- **Git** - Version control

---

## 📁 Project Structure

```
admin/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   └── AuthController.php
│   │   │   └── Admin/
│   │   │       ├── UserController.php
│   │   │       ├── RoleController.php
│   │   │       ├── CategoryController.php
│   │   │       ├── ActivityLogController.php
│   │   │       └── ... (other controllers)
│   │   ├── Middleware/
│   │   │   └── AdminAuth.php
│   │   └── Requests/ (Form validation)
│   ├── Models/
│   │   ├── User.php
│   │   ├── Category.php
│   │   ├── ActivityLog.php
│   │   └── ... (other models)
│   ├── Providers/
│   │   └── AppServiceProvider.php
│   └── Support/
│       └── ActivityLogger.php
│
├── database/
│   ├── migrations/
│   └── seeders/
│       ├── DatabaseSeeder.php
│       └── ... (other seeders)
│
├── routes/
│   └── api.php
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── stores/
│   ├── services/
│   ├── router/
│   └── main.ts
│
├── public/
│   └── index.html
│
└── README.md (this file)
```

---

## 🚀 Setup & Installation

### Prerequisites
- PHP 8.2+
- Node.js 18+
- MySQL 8+
- Composer
- NPM or Yarn

### Backend Setup

```bash
cd admin

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Configure database in .env
# Run migrations
php artisan migrate

# Seed database with test data
php artisan db:seed

# Start Laravel development server
php artisan serve
```

### Frontend Setup

```bash
# Install JavaScript dependencies
npm install

# Start Vite development server
npm run dev
```

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@kukaqka.com | password |
| Admin | admin@kukaqka.com | password |
| Staff | staff@kukaqka.com | password |
| Client | client@kukaqka.com | password |

---

## 📊 Database Schema

### Core Tables

#### `users`
- id, name, email, password
- phone, bio, department, location
- profile_picture, status
- email_verified_at, last_login_at
- timestamps, soft deletes

#### `roles` (Spatie)
- id, name, permissions (JSON)

#### `categories`
- id, name, slug, type, description
- is_active, sort_order
- timestamps

#### `listings`
- id, title, slug, description
- category_id, city_id, status
- timestamps

#### `activity_logs`
- id, user_id, action
- related_type, related_id
- properties (JSON), ip_address
- timestamps

---

## 🔌 API Endpoints

### Authentication (`/api/v1/auth`)
```
POST /login              - User login
POST /logout             - User logout
GET  /me                 - Get current user
```

### Admin Routes (`/api/v1/admin`)
```
GET    /users            - List users
POST   /users            - Create user
PUT    /users/{id}       - Update user
DELETE /users/{id}       - Delete user

GET    /roles            - List roles
POST   /roles            - Create role
PUT    /roles/{id}       - Update role

GET    /categories       - List categories
POST   /categories       - Create category
PUT    /categories/{id}  - Update category

GET    /settings/{section}   - Get settings
POST   /settings/{section}   - Update settings

GET    /activity-logs    - List activity logs
GET    /dashboard        - Dashboard stats

POST   /user/update-profile  - Update user profile
```

---

## 🎨 Frontend Components

### Page Components
- **LoginPage** - Authentication
- **DashboardPage** - Overview
- **UsersPage** - User management
- **RolesPage** - Role management
- **CategoriesPage** - Category management
- **ProfilePage** - User profile
- **SettingsPage** - System settings
- **ActivityLogsPage** - Activity tracking

### Layout Components
- **AdminLayout** - Main wrapper
- **GlobalSearch** - Search bar
- **ToastStack** - Notifications

---

## 🔐 Authentication & Authorization

### Token-based (Sanctum)
- Login creates API token
- Token stored in localStorage
- Request interceptor adds Authorization header
- Response interceptor handles 401 errors

### Role-based Access (Spatie)
- **Roles:** super-admin, admin, staff, client
- **Gates:** Check permissions via AppServiceProvider
- **Middleware:** admin-auth verifies token

---

## ⚡ Real-time Features

### Auto-save
- Debounced API calls (1 second)
- Loading spinner while saving
- Green checkmark on success
- Auto-hide after 2.5 seconds

### Activity Log Polling
- Polls every 10 seconds
- Real-time activity tracking

### Notifications
- Success, error, warning toasts
- Auto-dismiss

### Skeleton Loading
- Animated placeholders during load
- Smooth content transition

---

## 🚀 Common Tasks

### Login
1. Navigate to `/admin/login`
2. Enter test credentials
3. Token auto-stored

### Manage Users
1. Go to Users page
2. Click "Add User"
3. Fill form and save

### Create Category
1. Go to Categories
2. Click "Add Category"
3. Enter name (slug auto-generates)
4. Select type and save

### Update Profile
1. Click profile avatar
2. Edit fields (auto-saves)
3. Upload picture
4. Change password

---

## 📝 Development Guide

### Adding New Page
1. Create Vue component in `src/pages/`
2. Add route in `src/router/index.ts`
3. Create controller in `app/Http/Controllers/Admin/`
4. Register routes in `routes/api.php`

### Database Migration
```bash
php artisan make:migration create_table_name
php artisan migrate
```

### Adding Role/Permission
```php
$role = Role::create(['name' => 'editor']);
$role->givePermissionTo('edit:articles');
```

---

## 📱 Responsive Design

- **Mobile** (< 640px) - Single column
- **Tablet** (640px - 1024px) - Two columns
- **Desktop** (> 1024px) - Full layout
- **Large** (> 1280px) - Optimized spacing

---

## 🐛 Troubleshooting

### 401 Unauthorized
- Token expired → Login again

### 500 Server Error
- Check: `storage/logs/laravel.log`

### CORS Error
- Configure: `config/cors.php`

### Migration Failed
- Use: `php artisan migrate:refresh`

---

**Last Updated:** June 18, 2026  
**Version:** 1.0.0
