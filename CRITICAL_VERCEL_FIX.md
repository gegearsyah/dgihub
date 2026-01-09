# 🚨 CRITICAL: Vercel Root Directory Fix

## The Real Problem

The `frontend` folder is deleted, but **Vercel might still be configured to build from `frontend/` directory**. This is the #1 cause of 405 errors!

## ⚠️ IMMEDIATE ACTION REQUIRED

### Step 1: Check Vercel Root Directory Setting

1. Go to: **https://vercel.com/dashboard**
2. Select your project: **dgihub-vjyf**
3. Click **Settings** → **General**
4. Scroll to **"Root Directory"**
5. **CHECK WHAT IT SAYS:**

   - ❌ **If it says `frontend`** → THIS IS THE PROBLEM!
   - ✅ **If it's empty or `.`** → This is correct

### Step 2: Fix Root Directory (If Needed)

If Root Directory is set to `frontend`:

1. Click **"Edit"** next to Root Directory
2. **Delete** the value (make it empty) OR type `.`
3. Click **"Save"**
4. **This will trigger a new deployment**

### Step 3: Clear Build Cache

1. Still in Settings → General
2. Scroll to **"Clear Build Cache"**
3. Click **"Clear Build Cache"**
4. Click **"Redeploy"** button (or push a new commit)

## Why This Causes 405 Errors

If Root Directory is set to `frontend/`:
- Vercel looks for routes in `frontend/src/app/api/`
- But your routes are in `src/app/api/` (root)
- Vercel can't find the routes → 405 Method Not Allowed

## Verification

After fixing, check the build logs:

1. Go to **Deployments** → Latest deployment
2. Click **Build Logs**
3. Should see:
   ```
   Installing dependencies...
   Running "npm run build"...
   ```
4. Should NOT see:
   ```
   Installing dependencies from frontend/package.json
   ```

## If Root Directory is Already Correct

If Root Directory is already `.` or empty, then:

1. **Clear Build Cache** (most important!)
2. **Redeploy**
3. Check that all routes have `export const runtime = 'nodejs'`
4. Verify routes are in `src/app/api/` (not `frontend/src/app/api/`)

## Quick Test After Fix

```bash
curl -X POST https://dgihub-vjyf.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"talenta1@demo.com","password":"password123"}'
```

Should return 200 OK, not 405!

## Summary

**Most likely cause**: Vercel Root Directory is set to `frontend/` instead of `.`

**Fix**: Change Root Directory to `.` in Vercel Settings → General

**Then**: Clear build cache and redeploy




