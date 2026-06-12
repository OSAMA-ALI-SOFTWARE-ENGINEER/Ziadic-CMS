# Next Steps - Follow This Exactly

## What You Need to Do

### STEP 1: Check if servers are running
```
✅ Is backend running on port 8000?
   → Open http://127.0.0.1:8000/api/v1/health
   → Should show {"status":"ok"}

✅ Is admin frontend running on port 5175?
   → Open http://127.0.0.1:5175
   → Should show login page or dashboard
```

---

### STEP 2: Open the browser DevTools
```
Press: F12
Go to: Console tab
Keep it open while testing
```

---

### STEP 3: Login
```
URL: http://127.0.0.1:5175/admin/login
Email: admin@kukaqka.com
Password: password
```

---

### STEP 4: Click "Submitted Listings" in sidebar

**Now look at TWO places:**

#### A. Check the Page
- Does it load?
- Do you see a table?
- Do you see a spinner?
- Do you see an error?

#### B. Check Browser Console (F12)
- Are there any RED error messages?
- Copy the exact error text

---

### STEP 5: Report Back

**Send us a screenshot of:**

1. **The admin page** showing what you see (table, error, spinner, etc.)
2. **The browser console** (F12 → Console tab) showing any errors

**Also run this in console** and tell us the output:
```javascript
axios.get('/api/v1/admin/submissions')
  .then(r => console.log('SUCCESS - Data:', r.data))
  .catch(e => console.log('ERROR - Status:', e.response?.status, 'Message:', e.response?.data))
```

---

## What We're Looking For

**If it works:**
```
✅ Table loads with submissions
✅ No red errors in console
✅ Approve/Reject/Delete buttons work
✅ Page responds immediately
```

**If it doesn't work, we need:**
```
- Exact error message (copy from console)
- HTTP status code (401, 404, 500, etc.)
- Screenshot of the error
```

---

## Key Information

The code was updated with **better error messages**. Now when something fails, you'll see:

```
Error: {error message} (404)
```

Instead of just:
```
Error: Failed to load submissions
```

This makes debugging much easier.

---

## Don't Do This
❌ Don't assume it's still broken - test it first  
❌ Don't skip the console errors - they're the clue  
❌ Don't change code without knowing the error  

## Do This
✅ Test the page  
✅ Check console for red errors  
✅ Report exact error message  
✅ Send screenshot  

---

## Questions to Answer

When you test, tell us:

1. **Does the Submissions page load?**
   - Yes / No / Shows spinner

2. **Is there an error message?**
   - What does it say? (copy-paste exactly)

3. **What's the HTTP status?**
   - 200 (success) / 401 (auth) / 404 (not found) / 500 (server error)

4. **Does the table show data?**
   - Yes / No / "No records found"

---

## Testing The Fix

```
1. Open browser DevTools (F12)
2. Go to Console tab
3. Paste this:

axios.get('/api/v1/admin/submissions')
  .then(r => {
    console.log('✅ SUCCESS!');
    console.log('Data:', r.data);
    console.log('Records:', r.data.data?.length || 0);
  })
  .catch(e => {
    console.log('❌ FAILED');
    console.log('Status:', e.response?.status);
    console.log('Error:', e.response?.data?.message);
    console.log('Full response:', e.response?.data);
  })

4. Press Enter
5. Tell us what you see
```

---

## Expected Behavior After Fix

**Before click:**
- Sidebar shows "Submitted Listings" with badge "33"

**After click:**
- Page loads immediately (1-2 seconds)
- DataTable shows submissions
- Can search/filter
- Can click actions (Approve, Reject, Delete)
- Actions work and show success toast
- Sidebar badge updates

---

**Version**: 2.0 (With Enhanced Error Logging)  
**Status**: Ready for Testing  
**Date**: 2026-06-12
