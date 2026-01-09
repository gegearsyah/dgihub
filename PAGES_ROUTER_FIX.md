# Pages Router Fix - Build Conflict Resolved

## Problem
Next.js doesn't allow both App Router and Pages Router routes for the same path. We had:
- `src/app/api/v1/auth/login/route.ts` (App Router)
- `src/pages/api/v1/auth/login.ts` (Pages Router)

Both matching `/api/v1/auth/login` caused a build conflict.

## Solution
Removed the App Router routes and kept only Pages Router routes:
- ✅ Deleted `src/app/api/v1/auth/login/`
- ✅ Deleted `src/app/api/v1/auth/register/`
- ✅ Kept `src/pages/api/v1/auth/login.ts`
- ✅ Kept `src/pages/api/v1/auth/register.ts`

## Build Status
✅ Build successful! Routes are now:
- `/api/v1/auth/login` (Pages Router - Dynamic)
- `/api/v1/auth/register` (Pages Router - Dynamic)

## Testing on Vercel

### 1. Deploy to Vercel
```bash
git add .
git commit -m "Fix: Use Pages Router for auth endpoints"
git push
```

### 2. Verify Vercel Settings
- **Root Directory**: `.` (or empty)
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)

### 3. Test the Routes
```bash
# Test login
curl -X POST https://your-app.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test register
curl -X POST https://your-app.vercel.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","password":"password123","fullName":"Test User","userType":"TALENTA"}'
```

## If Still Getting 405 Errors

### Option 1: Check Vercel Build Logs
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Check "Build Logs" tab
4. Look for any errors or warnings

### Option 2: Clear Vercel Build Cache
1. Vercel Dashboard → Settings → General
2. Scroll to "Build & Development Settings"
3. Click "Clear Build Cache"
4. Redeploy

### Option 3: Use Express Backend (Alternative)
If Pages Router still doesn't work, use the standalone Express backend:
- Location: `backend-express/`
- Deploy to: Render.com (free tier)
- See: `ALTERNATIVE_BACKEND_DEPLOYMENT.md`

## Current Route Structure

### App Router (src/app/api/)
- `/api/v1/auth/profile` ✅
- `/api/v1/health` ✅
- `/api/v1/industri/jobs` ✅
- `/api/v1/mitra/courses` ✅
- `/api/v1/talenta/*` ✅

### Pages Router (src/pages/api/)
- `/api/v1/auth/login` ✅ (NEW - should work on Vercel)
- `/api/v1/auth/register` ✅ (NEW - should work on Vercel)

## Why Pages Router?
Pages Router API routes (`pages/api/*`) are more stable on Vercel and have better compatibility with older Next.js configurations. They use the standard Node.js runtime without requiring special configuration.

## Next Steps
1. ✅ Build is working locally
2. ⏳ Deploy to Vercel
3. ⏳ Test login/register endpoints
4. ⏳ If still 405, check Vercel dashboard settings
