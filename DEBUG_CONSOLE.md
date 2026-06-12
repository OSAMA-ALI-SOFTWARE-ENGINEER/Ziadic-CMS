# Console Debugging Tool

## Step 1: Open Browser Console
**Press**: F12
**Go to**: Console tab
**Keep it open**

---

## Step 2: Paste This Test Script

Copy and paste this entire script into the console and press Enter:

```javascript
console.log('=== SUBMISSION LISTING DEBUG TEST ===');

// Test 1: Check axios
console.log('1. Checking axios configuration:');
console.log('   baseURL:', axios.defaults.baseURL);
console.log('   withCredentials:', axios.defaults.withCredentials);

// Test 2: Check authentication
console.log('\n2. Checking authentication:');
axios.get('/api/v1/auth/me')
  .then(r => {
    console.log('   ✅ Authenticated as:', r.data.name);
  })
  .catch(e => {
    console.log('   ❌ Not authenticated. Status:', e.response?.status);
  });

// Test 3: Test submissions API
console.log('\n3. Testing /api/v1/admin/submissions:');
axios.get('/api/v1/admin/submissions')
  .then(r => {
    console.log('   ✅ SUCCESS - Got response:');
    console.log('   Status:', r.status);
    console.log('   Data length:', r.data.data?.length || 0);
    console.log('   Full response:', r.data);
  })
  .catch(e => {
    console.log('   ❌ FAILED - Error details:');
    console.log('   Status:', e.response?.status);
    console.log('   Message:', e.response?.data?.message);
    console.log('   Error:', e.message);
    console.log('   Full response:', e.response?.data);
  });

console.log('\n=== END TEST ===');
console.log('Check above for ✅ (success) or ❌ (failure) markers');
```

---

## Step 3: Read the Output

Look for:
- ✅ = Good
- ❌ = Problem

**Example output:**
```
1. Checking axios configuration:
   baseURL: http://127.0.0.1:8000
   withCredentials: true

2. Checking authentication:
   ✅ Authenticated as: Super Admin

3. Testing /api/v1/admin/submissions:
   ✅ SUCCESS - Got response:
   Status: 200
   Data length: 33
   Full response: {data: [...], links: [...], ...}
```

---

## Step 4: Report Results

**If you see ✅ everywhere:**
→ API is working fine
→ Problem is in the component
→ Report the component error shown on page

**If you see ❌:**
→ There's an API issue
→ Report the status code and error message

---

## Common Errors and Meanings

| Status | Meaning | Solution |
|--------|---------|----------|
| 401 | Not authenticated | Login again |
| 403 | No permission | Check user role |
| 404 | Route not found | Routes not registered |
| 405 | Wrong HTTP method | Check PATCH vs POST |
| 500 | Server error | Check Laravel logs |
| CORS error | Browser security | Check CORS config |

---

## Share This With Us

When you run the script, copy the entire console output and share it.

This will tell us exactly what's failing!

---

**Version**: 2.0 with Enhanced Debugging
**Date**: 2026-06-12
