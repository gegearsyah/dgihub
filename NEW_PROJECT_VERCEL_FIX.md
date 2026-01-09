# Fix 405 Errors for New Vercel Project (dgihub-test.vercel.app)

## 🔴 Critical Steps for New Project

Since you created a **new Vercel project** (`dgihub-test`), you need to configure it from scratch.

### Step 1: Verify Root Directory ⚠️ MOST IMPORTANT

1. Go to: https://vercel.com/dashboard
2. Click on your project (`dgihub-test` or similar)
3. Go to **Settings** → **General**
4. Scroll to **Root Directory**
5. **MUST BE EMPTY** or set to `.` (dot)
   - ❌ **WRONG**: `frontend/`, `frontend`, or any subdirectory
   - ✅ **CORRECT**: Empty (blank) or `.`

6. If it's wrong:
   - Click **Edit**
   - **Clear the field completely** (delete everything)
   - Click **Save**

### Step 2: Disable Vercel Authentication

Vercel Authentication can block API routes:

1. In Vercel Dashboard → Your Project → **Settings** → **General**
2. Scroll to **Vercel Authentication**
3. **Disable it** (turn it off)
4. Click **Save**

### Step 3: Verify Build Settings

1. Go to **Settings** → **General** → **Build & Development Settings**
2. Verify:
   - **Framework Preset**: `Next.js` (should be auto-detected)
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `.next` (should be auto-detected)
   - **Install Command**: `npm install` (should be auto-detected)
   - **Node.js Version**: `20.x` or `18.x`

3. **DO NOT** add `next export` to build command (this disables API routes)

### Step 4: Set Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Add all variables from your `env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `ALLOWED_ORIGINS` (optional, defaults to localhost)

3. Set them for **Production**, **Preview**, and **Development**

### Step 5: Clear Build Cache & Redeploy

1. Go to **Settings** → **General** → **Build & Development Settings**
2. Click **Clear Build Cache**
3. Go to **Deployments** tab
4. Click **⋯** (three dots) on latest deployment
5. Click **Redeploy**

---

## 🧪 Test Your Deployment

After making the above changes, test with these commands:

### Test 1: Simple GET Request
```bash
curl https://dgihub-test.vercel.app/api/test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test route works! API routes are functioning.",
  "timestamp": "2024-..."
}
```

**If you get 404 or 405:** Root Directory is still wrong!

### Test 2: POST Request
```bash
curl -X POST https://dgihub-test.vercel.app/api/test \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "POST method works!",
  "received": {"test":"data"},
  "timestamp": "2024-..."
}
```

### Test 3: Register Endpoint
```bash
curl -X POST https://dgihub-test.vercel.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test1234",
    "fullName": "Test User",
    "userType": "TALENTA"
  }'
```

**Expected Response:**
- ✅ `201 Created` with user data (if email is new)
- ✅ `409 Conflict` if email exists
- ❌ `405 Method Not Allowed` = Still misconfigured

---

## 🔍 Debugging: Check Deployment Logs

If still getting 405 errors:

1. Go to **Deployments** → Click on latest deployment
2. Check **Build Logs**:
   - Look for errors about routes not being found
   - Verify all API routes show as `ƒ` (Function routes)

3. Check **Function Logs**:
   - Go to **Functions** tab
   - Click on `/api/test` or `/api/v1/auth/register`
   - Check for runtime errors

4. Check **Runtime Logs**:
   - Look for any errors about routes or methods

---

## 🚨 Common Issues & Solutions

### Issue 1: Still Getting 404/405 After Fixing Root Directory

**Solution:**
- Make sure you **saved** the Root Directory change
- **Clear Build Cache** again
- **Redeploy** (don't just wait for auto-deploy)

### Issue 2: Routes Work Locally But Not on Vercel

**Solution:**
- Check if `vercel.json` exists and doesn't have conflicting settings
- Verify Git repository is connected correctly
- Ensure you're deploying from the **root** of the repository

### Issue 3: "Method Not Allowed" for All POST Requests

**Possible Causes:**
1. Root Directory still pointing to wrong location
2. Vercel Authentication enabled
3. Middleware blocking requests
4. Build cache with old configuration

**Solution:**
- Follow all steps above in order
- Check Vercel logs for specific error messages

---

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Root Directory is **empty** or `.` (not `frontend/`)
- [ ] Vercel Authentication is **disabled**
- [ ] Build Command is `npm run build` (no `next export`)
- [ ] All environment variables are set
- [ ] Build Cache has been cleared
- [ ] Project has been redeployed after changes
- [ ] `/api/test` returns JSON (not 404/405)
- [ ] `/api/test` POST works (not 405)

---

## 📞 If Still Not Working

If you've completed all steps and still get 405:

1. **Share Vercel Build Logs:**
   - Deployments → Latest → Build Logs
   - Copy the full output

2. **Share Function Logs:**
   - Deployments → Latest → Functions → Click on a route
   - Copy any error messages

3. **Verify Git Connection:**
   - Settings → Git
   - Ensure it's connected to the correct repository
   - Ensure it's pointing to root, not a subdirectory

4. **Try Manual Deploy:**
   ```bash
   npm i -g vercel
   vercel --prod
   ```
   When prompted for Root Directory, press Enter (leave empty)

---

## 🎯 Quick Fix Summary

**The #1 cause of 405 errors on new Vercel projects:**

1. ✅ **Root Directory** must be empty (not `frontend/`)
2. ✅ **Vercel Authentication** must be disabled
3. ✅ **Build Cache** must be cleared
4. ✅ **Redeploy** after making changes

**Your code is correct. This is a Vercel configuration issue.**

