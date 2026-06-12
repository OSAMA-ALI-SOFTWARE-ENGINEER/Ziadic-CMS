# Capture Console Errors - Step by Step

## DO THIS NOW:

### Step 1: Open Console
```
Press: F12
Go to: Console tab
```

### Step 2: Click "Submitted Listings"
Watch the console for messages

### Step 3: Copy ALL Red Errors

**Right-click** in console area → **"Copy all"**

Or scroll up and manually copy every red error line

### Step 4: Paste Errors Here

Share the complete error text with us

---

## What We're Looking For

Red error messages that look like:

```
❌ [404] GET /api/v1/admin/submissions
❌ [401] PATCH /api/v1/admin/submissions/1/approve
❌ [500] GET /api/v1/admin/submissions
```

Or CORS errors like:

```
Access to XMLHttpRequest has been blocked by CORS policy
Mixed Content: The page at 'https://...' was loaded over HTTPS
Failed to fetch
```

---

## Recent Improvements

We added better error logging that shows:

```
🚀 Initializing app...
✅ CSRF cookie established
✅ [200] GET /sanctum/csrf-cookie
✅ [200] GET /api/v1/admin/submissions
```

Or errors:

```
❌ [401] GET /api/v1/admin/submissions
   Error: Unauthenticated
```

---

## Quick Copy

Open DevTools console and paste this to see all recent logs:

```javascript
// Show all console logs from this session
console.log('=== APP INITIALIZATION LOGS ===');

// Test auth
axios.get('/api/v1/auth/me')
  .then(r => console.log('✅ Auth OK:', r.data.name))
  .catch(e => console.log('❌ Auth Failed:', e.response?.status, e.message));

// Test submissions API
axios.get('/api/v1/admin/submissions')
  .then(r => console.log('✅ Submissions API OK:', r.data.data?.length))
  .catch(e => console.log('❌ Submissions API Failed:', e.response?.status, e.message));

console.log('=== END ===');
```

---

## Send Us:

1. **Complete error message** (copy from console)
2. **HTTP Status Code** (401, 404, 500, etc.)
3. **Screenshot** of console showing errors
4. **URL** you're accessing (should be `/admin/submissions`)

---

Example of what to send:

```
Error captured:
❌ [401] GET /api/v1/admin/submissions
   Error: Unauthenticated

Status: 401
Screenshot: [attached]
URL: http://127.0.0.1:5175/admin/submissions
```

---

We'll fix it with this information!
