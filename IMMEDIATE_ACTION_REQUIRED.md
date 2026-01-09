# ⚠️ IMMEDIATE ACTION REQUIRED - Fix 405 Errors

## Your New Project: dgihub-test.vercel.app

Since you created a **new Vercel project**, you need to configure it properly. The 405 errors are caused by **Vercel configuration**, not your code.

---

## 🚨 DO THIS NOW (5 minutes):

### 1. Check Root Directory (MOST CRITICAL)

1. Open: https://vercel.com/dashboard
2. Click on your project (`dgihub-test`)
3. Go to **Settings** → **General**
4. Find **"Root Directory"**
5. **IT MUST BE EMPTY!**
   - If it says `frontend/` or anything else → **DELETE IT** (leave blank)
   - Click **Save**

### 2. Disable Vercel Authentication

1. Still in **Settings** → **General**
2. Find **"Vercel Authentication"**
3. **Turn it OFF** (disable it)
4. Click **Save**

### 3. Clear Cache & Redeploy

1. Go to **Settings** → **General** → **Build & Development Settings**
2. Click **"Clear Build Cache"**
3. Go to **Deployments** tab
4. Click **⋯** (three dots) on the latest deployment
5. Click **"Redeploy"**

---

## ✅ Test After Fixing

Run this in PowerShell (or use the test script):

```powershell
# Test GET
Invoke-WebRequest -Uri "https://dgihub-test.vercel.app/api/test" -Method GET

# Test POST
$body = @{ test = "data" } | ConvertTo-Json
Invoke-WebRequest -Uri "https://dgihub-test.vercel.app/api/test" -Method POST -Body $body -ContentType "application/json"
```

**Expected:** Both should return JSON (status 200), not 405.

---

## 🔍 Why This Happens

When you create a new Vercel project:
- Vercel might auto-detect the wrong root directory
- Or it might have default settings that block API routes
- The Root Directory setting tells Vercel where to look for your `src/` folder

**If Root Directory is wrong:**
- Vercel looks in `frontend/src/app/api/` (doesn't exist)
- Your actual routes are in `src/app/api/` (root level)
- Result: Routes not found → 405 errors

---

## 📋 Quick Checklist

Before testing, verify:

- [ ] Root Directory is **EMPTY** (not `frontend/`)
- [ ] Vercel Authentication is **DISABLED**
- [ ] Build Cache has been **CLEARED**
- [ ] Project has been **REDEPLOYED**

---

## 🆘 Still Not Working?

If you've done all the above and still get 405:

1. **Check Build Logs:**
   - Deployments → Latest → Build Logs
   - Look for: `ƒ /api/test` (should show as Function route)
   - If you see `○ /api/test` (Static) or nothing → Root Directory is wrong

2. **Check Function Logs:**
   - Deployments → Latest → Functions tab
   - Click on `/api/test`
   - Check for errors

3. **Verify Git Connection:**
   - Settings → Git
   - Make sure it's connected to the correct repo
   - Make sure it's pointing to root (not a subdirectory)

---

## 💡 Alternative: Use Vercel CLI

If dashboard changes don't work:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy manually
vercel --prod

# When asked for Root Directory, press Enter (leave empty)
```

---

**Remember: Your code is correct. This is 100% a Vercel configuration issue.**

The Root Directory setting is the #1 cause of 405 errors on new projects.

