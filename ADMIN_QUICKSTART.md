# Admin Dashboard & User System - Quick Start Guide

## Prerequisites
- Backend API running at `http://localhost:8000`
- Frontend dev server running at `http://localhost:5173`
- Valid admin account in database

## Running the Application

### Backend
```powershell
cd C:\laragon\www\Ziadic\admin
php artisan serve --host=127.0.0.1 --port=8000
```

### Frontend
```powershell
cd C:\laragon\www\Ziadic\frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

## Accessing the System

### Public Site
```
http://127.0.0.1:5173/
```

### Login
```
http://127.0.0.1:5173/login
```
Use your admin credentials created during seeding:
- Email: `admin@kukaqka.com` (default)
- Password: `password` (default)

### User Dashboard
After login, visit:
```
http://127.0.0.1:5173/dashboard
```
Shows:
- Your profile information
- Quick links to browse site
- Admin dashboard access (if you're an admin)

### Admin Dashboard
```
http://127.0.0.1:5173/admin/dashboard
```

Only accessible if:
1. You're logged in
2. You have `admin` or `super-admin` role

**Pages:**
- `/admin/dashboard` - Stats, recent listings, activity
- `/admin/listings` - Manage all listings
- `/admin/users` - Manage users and roles
- `/admin/activity` - View audit trail
- `/admin/settings` - Configure site

## Using the Admin Dashboard

### Dashboard Overview
View at-a-glance metrics:
- Total listings
- Published listings
- Pending approvals (need action)
- Total users
- Newsletter subscribers
- Recent listings feed
- Recent admin activity

### Managing Listings

#### View All Listings
1. Go to `/admin/listings`
2. See all listings in table format
3. Status colors indicate state (Draft, Pending, Approved, Published, Rejected)

#### Filter Listings
- **By Status:** Select from dropdown
- **Search:** Type in search box for title or business name
- **Refresh:** Click refresh to reload

#### Approve a Listing
1. Find listing with status "Pending"
2. Click ✓ (checkmark) button
3. Confirm in dialog
4. Status changes to "Approved"

#### Reject a Listing
1. Find listing with status "Pending"
2. Click ✗ (X) button
3. Confirm in dialog
4. Status changes to "Rejected"

#### Publish a Listing
1. Find listing with status "Approved"
2. Click → (send) button
3. Confirm in dialog
4. Status changes to "Published" and becomes visible to public

### Managing Users

#### View Users
1. Go to `/admin/users`
2. See all registered users
3. View: name, email, phone, join date

#### Assign User Role
1. Find user in table
2. Click role dropdown (shows current role)
3. Select new role:
   - **Super Admin** - Full system access
   - **Admin** - Admin dashboard access
   - **Editor** - Can edit content
   - **User** - Regular user (default)
4. Role updates immediately

### Viewing Activity Log

1. Go to `/admin/activity`
2. Timeline shows all admin actions
3. For each action, see:
   - Action type (created, updated, deleted, published, etc.)
   - Description
   - Date and time
   - Changes made (if applicable)

### Configuring Settings

1. Go to `/admin/settings`
2. **Branding & Site Info** section:
   - Site Name: Display name
   - Site Description: Meta description
   - Site URL: Full domain
   - Support Email: Support contact
   - Contact Email: Public contact email
   - Phone: Business phone
   - Address: Business address
3. Fill in your information
4. Click "Save Settings"
5. Toast notification confirms save

## User Dashboard Features

### After Login
User can access their dashboard at `/admin/dashboard`:

1. **Profile Information**
   - Name
   - Email
   - Phone (if set)
   - Account Status

2. **Admin Access**
   - If user is admin, button to access admin dashboard
   - Direct link to `/admin/dashboard`

3. **Quick Links**
   - Browse Listings
   - About Us
   - Blog

4. **Navigation**
   - Click user avatar in header
   - See dropdown menu with:
     - Dashboard link
     - Admin dashboard link (if admin)
     - Logout button

## Features by User Role

### Super Admin
- ✅ Access all admin pages
- ✅ Approve/Reject/Publish listings
- ✅ Manage users and roles
- ✅ View activity log
- ✅ Update settings

### Admin
- ✅ Access all admin pages (same as Super Admin)
- ✅ Everything a Super Admin can do

### Editor
- ❌ No admin dashboard access
- ✅ Can only use public dashboard
- ✅ View profile
- ✅ Submit content (when listing form is built)

### User (Default)
- ❌ No admin dashboard access
- ✅ Public dashboard only
- ✅ Browse listings
- ✅ Read blog
- ✅ Submit listing (future feature)

## Common Tasks

### Approve Multiple Listings
1. Go to `/admin/listings`
2. Filter by Status: "Pending"
3. For each listing, click ✓ and confirm
4. *Future: Batch approve feature*

### Search for a Listing
1. Go to `/admin/listings`
2. Type in search box (searches title and business name)
3. Results filter in real-time

### Find Recently Joined Users
1. Go to `/admin/users`
2. Table shows all users sorted by join date
3. Newest users appear at bottom

### Check What Admins Did
1. Go to `/admin/activity`
2. Scroll timeline
3. Click on any action to see details
4. See who made what changes and when

## Troubleshooting

### Can't Access Admin Dashboard
**Check:**
1. Are you logged in? (see avatar in header)
   - No → Go to `/login` and login
2. Do you have admin role?
   - No → Ask a super admin to give you admin role
3. Is backend API running?
   - No → Start backend server

### Listings Not Loading
1. Check browser console (F12) for errors
2. Verify backend API is running
3. Try refresh button in listings page
4. Check network tab to see if API calls are working

### Can't Update Settings
1. Are you an admin? (required)
2. Check browser console for validation errors
3. Try saving with required fields only first

### Status Changes Not Showing
1. Click refresh button to reload
2. Page auto-updates via toast notification
3. Check browser console for errors

## API Endpoints Used

The admin dashboard calls these backend endpoints:

```
GET    /api/v1/admin/dashboard
GET    /api/v1/admin/listings
PATCH  /api/v1/admin/listings/{id}/approve
PATCH  /api/v1/admin/listings/{id}/reject
PATCH  /api/v1/admin/listings/{id}/publish
GET    /api/v1/admin/users
PATCH  /api/v1/admin/users/{id}/role
GET    /api/v1/admin/settings/{section}
POST   /api/v1/admin/settings/{section}
GET    /api/v1/admin/activity-logs
```

All require `Authorization: Bearer {token}` header (added automatically).

## Next Steps to Enhance

1. **Build Listing Details Page**
   - Click listing to view/edit details
   - See full description, images, contacts

2. **Add Post/Page Management**
   - Manage blog posts
   - Create/edit pages
   - Rich text editor

3. **Category Management**
   - CRUD for listing categories
   - Drag to reorder

4. **Newsletter Manager**
   - View subscribers
   - Send bulk emails
   - Track unsubscribes

5. **Public Listing Submission**
   - Multi-step form for users
   - Image upload
   - Admin approval workflow

6. **Media Manager**
   - Upload and organize files
   - Image gallery
   - Delete unused media

## Support

For issues or questions:
1. Check the `ADMIN_IMPLEMENTATION.md` file for technical details
2. Review your browser console (F12) for errors
3. Check backend logs for API errors
4. Verify database has test data
