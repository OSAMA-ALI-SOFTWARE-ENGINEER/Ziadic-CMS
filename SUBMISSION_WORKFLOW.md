# Listing Submission Workflow - Implementation Guide

**Status**: ✅ Fully Implemented & Fixed (2026-06-12)

This document describes the complete submission workflow from frontend user submission through admin review and publishing.

---

## Overview

```
User submits listing → Backend validates → Admin reviews → Approve/Reject/Publish
      (Frontend)         (API)              (Admin UI)      (Status change)
```

---

## Database Schema

### `listing_submissions` Table
Stores frontend user-submitted listings awaiting review.

```sql
id, title, business_name, description, category_id, city_id, contact_name, 
contact_email, contact_phone, website, image_path, status, rejection_reason,
reviewed_by, reviewed_at, created_at, updated_at, deleted_at
```

**Status Values**:
- `pending` - Initial submission awaiting review
- `approved` - Admin approved, ready to publish
- `published` - Live on platform
- `rejected` - Rejected with reason

### `activity_logs` Table
Audit trail of all actions on submissions.

```sql
id, action, user_id, user_name, user_role, related_id, related_type,
old_value (json), new_value (json), ip_address, created_at
```

**Action Values**:
- `listing.submitted` - User created submission
- `listing.approved` - Admin approved
- `listing.rejected` - Admin rejected
- `listing.published` - Admin published
- `listing.updated` - Admin edited submission
- `listing.deleted` - Admin deleted submission

---

## Models

### ListingSubmission
**Location**: `admin/app/Models/ListingSubmission.php`

```php
class ListingSubmission extends Model {
    // Relationships
    public function category(): BelongsTo
    public function city(): BelongsTo
    public function reviewer(): BelongsTo  // User who reviewed it
    
    // Actions
    public function approve(): void        // Sets status='approved', marks reviewed
    public function reject($reason): void  // Sets status='rejected', stores reason
}
```

### ActivityLog
**Location**: `admin/app/Models/ActivityLog.php`

Flexible model supporting both old and new schema formats. Logs all submission actions.

---

## API Endpoints

All endpoints are authenticated with Sanctum token (`auth:sanctum` middleware).

### Public Submission (Unprotected)
```
POST /api/v1/public/submit-listing
Body: { title, business_name, description, category_id, city_id, contact_name, contact_email, ... }
Response: { id, status: 'pending', ... }
```

### Admin Submissions (Protected)

#### List Submissions
```
GET /api/v1/admin/submissions
Response: Paginated list (20 per page), excluding 'published'
```

#### View Submission
```
GET /api/v1/admin/submissions/{id}
Response: Full submission object
```

#### Edit Submission
```
PUT /api/v1/admin/submissions/{id}
Body: { title, business_name, description, ... }
Response: Updated submission with activity log entry
```

#### Approve Submission
```
POST /api/v1/admin/submissions/{id}/approve
Response: { message: 'Submission approved.' }
Effect: status → 'approved', reviewed_by → auth user, reviewed_at → now()
```

#### Reject Submission
```
POST /api/v1/admin/submissions/{id}/reject
Body: { reason: 'string' }
Response: { message: 'Submission rejected.' }
Effect: status → 'rejected', rejection_reason → reason
```

#### Publish Submission
```
POST /api/v1/admin/submissions/{id}/publish
Response: { message: 'Submission published.' }
Effect: status → 'published'
Note: Currently just sets status. Future: Copy to main listings table.
```

#### Delete Submission
```
DELETE /api/v1/admin/submissions/{id}
Response: { message: 'Submission deleted.' }
Effect: Soft delete (marked deleted_at)
```

---

## Controllers

### PublicListingSubmissionController
**Location**: `admin/app/Http/Controllers/PublicListingSubmissionController.php`

Handles public submissions from frontend (unprotected).

```php
public function store(Request $request)
    // Validates input
    // Creates ListingSubmission with status='pending'
    // Logs activity: 'listing.submitted'
    // Returns submission data
```

### SubmittedListingController
**Location**: `admin/app/Http/Controllers/Admin/SubmittedListingController.php`

Handles admin actions on submissions (protected, requires auth).

```php
public function index()          // List non-published submissions
public function show($id)        // View single submission
public function update()         // Edit submission fields
public function approve($id)     // Set status to 'approved'
public function reject()         // Set status to 'rejected' with reason
public function publish($id)     // Set status to 'published'
public function destroy($id)     // Soft delete
```

---

## Routes

**Location**: `admin/routes/api.php`

### Admin Routes (Protected)
```php
Route::prefix('v1/admin')->middleware('auth:sanctum')->group(function () {
    Route::get('submissions', [SubmittedListingController::class, 'index']);
    Route::get('submissions/{id}', [SubmittedListingController::class, 'show']);
    Route::put('submissions/{id}', [SubmittedListingController::class, 'update']);
    Route::post('submissions/{id}/approve', [SubmittedListingController::class, 'approve']);
    Route::post('submissions/{id}/reject', [SubmittedListingController::class, 'reject']);
    Route::post('submissions/{id}/publish', [SubmittedListingController::class, 'publish']);
    Route::delete('submissions/{id}', [SubmittedListingController::class, 'destroy']);
});
```

---

## Admin Dashboard UI

### SubmittedListingsPage.vue
**Location**: `admin/admin-ui/src/pages/SubmittedListingsPage.vue`

Main admin interface for managing submissions.

**Features**:
- ✅ List all pending/approved/rejected submissions (excludes published)
- ✅ Status badges with color coding
- ✅ View, Approve, Reject, Publish, Delete buttons
- ✅ Error/success message display
- ✅ Loading state while fetching
- ✅ Empty state message
- ✅ Responsive table layout
- ✅ Dynamic API base URL support

**Color Coding**:
- 🟡 `pending` - Yellow (needs review)
- 🔵 `approved` - Blue (ready to publish)
- 🟢 `published` - Green (live)
- 🔴 `rejected` - Red (not approved)

### SubmissionDetailPage.vue
**Location**: `admin/admin-ui/src/pages/SubmissionDetailPage.vue`

Detailed view and edit page for individual submissions.

---

## Activity Logging

### ActivityLogger Support Class
**Location**: `admin/app/Support/ActivityLogger.php`

Central logging utility that handles both old and new schema formats.

```php
ActivityLogger::log(
    'listing.approved',           // action
    $submission,                  // subject model
    [],                          // changes array
    $request                     // request for IP/user
);
```

**Features**:
- Detects schema columns dynamically
- Supports legacy and new formats
- Logs user, role, IP address
- Broadcasts events for real-time updates
- Graceful fallback for missing broadcasting

---

## Testing the Workflow

### 1. Create Test Data
```bash
# Create 1 test submission
POST http://localhost:8000/api/debug/submissions/create

# Create 10 test submissions
POST http://localhost:8000/api/debug/submissions/seed?count=10
```

### 2. Admin Login
```bash
POST http://localhost:8000/api/v1/auth/login
Body: { email: 'admin@kukaqka.com', password: 'password' }
Response: { token: '...' }
```

### 3. View Submissions in Admin
```bash
GET http://localhost:8000/api/v1/admin/submissions
Header: Authorization: Bearer {token}
```

### 4. Approve a Submission
```bash
POST http://localhost:8000/api/v1/admin/submissions/1/approve
Header: Authorization: Bearer {token}
```

### 5. Verify Activity Log
```bash
GET http://localhost:8000/api/admin/debug/activity-logs
```

---

## Recent Fixes (2026-06-12)

### Round 1: Route & API Fixes
1. ✅ Removed duplicate API routes that caused conflicts
2. ✅ Added missing `destroy()` method to controller
3. ✅ Fixed route parameter naming consistency
4. ✅ Improved Vue component error handling
5. ✅ Added loading states and user feedback
6. ✅ Fixed API base URL configuration
7. ✅ Proper pagination response handling

**Files Modified**:
- `admin/routes/api.php` - Consolidated duplicate routes
- `admin/app/Http/Controllers/Admin/SubmittedListingController.php` - Added destroy() method
- `admin/admin-ui/src/pages/SubmittedListingsPage.vue` - Complete rewrite with error handling

### Round 2: Navigation & UI Fixes (admin/admin-ui)
1. ✅ Fixed Submitted Listings page not opening from sidebar
2. ✅ Added missing page titles for all submission pages
3. ✅ Implemented pending count badge in sidebar
4. ✅ Added auto-refresh of pending count (every 30 seconds)
5. ✅ Proper route detection for active menu item highlighting

**Files Modified**:
- `admin/admin-ui/src/layouts/AdminLayout.vue` - Complete navigation fixes

### Round 3: API Method & Parameter Fixes (admin/src - Production UI)
1. ✅ Fixed HTTP method mismatch (PATCH vs POST)
   - Routes now use `PATCH` for approve/reject/publish (matches UI calls)
   - Proper REST convention: PATCH for state modifications
2. ✅ Fixed rejection parameter name inconsistency
   - Changed from `rejection_reason` to `reason` (matches controller)

**Files Modified**:
- `admin/routes/api.php` - Changed POST to PATCH for submission actions
- `admin/src/pages/SubmissionsPage.vue` - Fixed rejection parameter name

---

## Common Issues & Solutions

### "Submissions table missing" Error
**Cause**: Migration hasn't run
**Fix**: 
```bash
cd admin
php artisan migrate
```

### "Unauthenticated" Error
**Cause**: Missing auth token for protected endpoints
**Fix**: All admin endpoints require Sanctum token. Use login endpoint first:
```bash
POST /api/v1/auth/login
Body: { email: 'admin@kukaqka.com', password: 'password' }
```

### API calls return 404
**Cause**: Routes not recognized or endpoint doesn't exist
**Fix**: Verify routes are loaded:
```bash
php artisan route:list | grep submissions
```

### Frontend can't reach backend API
**Cause**: CORS or dynamic URL misconfiguration
**Fix**: Set in `frontend/.env`:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### Activities not logged
**Cause**: activity_logs table missing or ActivityLogger not called
**Fix**: Ensure migration ran and ActivityLogger::log() is called in each controller action

---

## Development Commands

```bash
# Backend
cd admin
php artisan serve --host=127.0.0.1 --port=8000
php artisan migrate
php artisan route:list | grep submissions

# Admin Dashboard
cd admin/admin-ui
npm install
npm run dev -- --host 127.0.0.1 --port 5174
# Access: http://127.0.0.1:5174/submissions
```

---

## Next Steps

1. **Image Upload** - Implement Spatie Media Library for submission images
2. **Bulk Actions** - Add bulk approve/reject/delete in admin UI
3. **Filters** - Add status/date range filters
4. **Listing Integration** - Auto-copy approved submissions to main listings table
5. **Email Notifications** - Notify users when submission is approved/rejected
6. **Role-based Access** - Restrict admin actions by role

---

## Related Documentation

- `DEPLOYMENT.md` - How to deploy to production
- `DYNAMIC_API_URL_FIX.md` - API URL configuration
- `UPLOAD_FIX_GUIDE.md` - File upload setup
- Admin routes: `admin/routes/api.php`
- API Controllers: `admin/app/Http/Controllers/Admin/`
