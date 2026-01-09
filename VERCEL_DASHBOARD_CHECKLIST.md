# Vercel Dashboard Checklist - Fix 405 Errors

## ⚠️ CRITICAL: Root Directory Setting

### Location:
**Vercel Dashboard** → **Your Project** → **Settings** → **General** → **Root Directory**

### Current Setting (Check This):
- [ ] Is it **empty/blank**? ✅ CORRECT
- [ ] Is it set to `.` (dot)? ✅ CORRECT  
- [ ] Is it set to `frontend` or `frontend/`? ❌ **WRONG - THIS IS THE PROBLEM!**

### How to Fix:
1. Click **Edit** next to Root Directory
2. **Clear the field completely** (leave it blank)
3. Click **Save**
4. Go to **Deployments** tab
5. Click **⋯** (three dots) → **Redeploy**

---

## ✅ Other Settings to Verify

### Build & Development Settings
**Location:** Settings → General → Build & Development Settings

- [ ] **Framework Preset**: Should be "Next.js" (auto-detected)
- [ ] **Build Command**: Should be `npm run build` (auto-detected)
- [ ] **Output Directory**: Should be `.next` (auto-detected)
- [ ] **Install Command**: Should be `npm install` (auto-detected)
- [ ] **Node.js Version**: Should be 20.x or 18.x

### Environment Variables
**Location:** Settings → Environment Variables

Verify these are set (for Production, Preview, and Development):
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `JWT_SECRET`
- [ ] Any other variables from your `env.example`

---

## 🔄 After Making Changes

1. **Clear Build Cache:**
   - Settings → General → Build & Development Settings
   - Click **Clear Build Cache**

2. **Redeploy:**
   - Go to **Deployments** tab
   - Click **⋯** on latest deployment
   - Click **Redeploy**

3. **Test:**
   ```bash
   curl https://your-app.vercel.app/api/test
   ```
   Should return JSON, not 404/405.

---

## 📸 Screenshot Guide

When checking Root Directory, you should see:

```
Root Directory
[                    ]  ← Should be EMPTY or just a dot "."
```

NOT:

```
Root Directory
[frontend/          ]  ← This is WRONG!
```

---

## 🆘 Still Not Working?

If Root Directory is correct but still getting 405:

1. **Check Deployment Logs:**
   - Deployments → Latest → **Build Logs**
   - Look for errors about routes not being found

2. **Check Function Logs:**
   - Deployments → Latest → **Functions** tab
   - Click on a function (e.g., `/api/test`)
   - Check for runtime errors

3. **Verify Git Connection:**
   - Settings → Git
   - Ensure it's connected to the correct repository
   - Ensure it's pointing to the root, not a subdirectory

4. **Try Manual Deploy:**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

---

## ✅ Success Indicators

After fixing Root Directory and redeploying:

- ✅ `/api/test` returns JSON (not 404/405)
- ✅ `/api/v1/auth/register` accepts POST (not 405)
- ✅ `/api/v1/auth/login` accepts POST (not 405)
- ✅ All API routes show as `ƒ` (Function) in build output

---

**Remember: The Root Directory setting is the #1 cause of 405 errors after merging folders!**



