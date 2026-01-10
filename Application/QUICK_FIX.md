# 🚨 QUICK FIX - 404 & Loading Issue

## The Problem
- Site shows only "Loading..." at https://vocatio-test.vercel.app/
- `/api/test` returns 404
- **Root Directory is NOT set in Vercel**

## ✅ THE FIX (2 Minutes)

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Click on your project: **vocatio-test**

### Step 2: Set Root Directory
1. Click **Settings** (top menu)
2. Click **General** (left sidebar)
3. Scroll down to **"Root Directory"**
4. Click **"Edit"** button
5. Type: `Application` (exactly this, no quotes)
6. Click **"Save"**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait for build to complete

## ✅ Verify It Works

After redeploy, test:
- Homepage: https://vocatio-test.vercel.app/ (should load, not stuck on "Loading...")
- API Test: https://vocatio-test.vercel.app/api/test (should return JSON, not 404)

## 📸 Visual Guide

```
Vercel Dashboard
  └─ Your Project (vocatio-test)
      └─ Settings
          └─ General
              └─ Root Directory: [Application] ← Set this!
```

## ⚠️ Common Mistakes

- ❌ `./Application` (don't use `./`)
- ❌ `Application/` (no trailing slash)
- ❌ `application` (must be capital A)
- ❌ Forgetting to redeploy after change

## 🎯 That's It!

Once Root Directory is set to `Application` and you redeploy, everything should work.

---

**This is a Vercel configuration issue, not a code issue. Your code is correct!**
