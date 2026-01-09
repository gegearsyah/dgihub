# Vercel 405 Method Not Allowed - Complete Fix Guide

## Why This Happens

Vercel doesn't "disable" POST methods. The 405 error means Vercel isn't recognizing your route handler. This typically happens because:

1. **Route file not being built correctly** - The route handler isn't included in the build
2. **Build cache issues** - Old cached build is being used
3. **Route file location** - File might not be in the correct location
4. **Export issues** - Route handler not properly exported

## Complete Fix Steps

### Step 1: Verify Route File Location

Make sure your route file is at:
```
src/app/api/v1/auth/login/route.ts
```

NOT at:
- `app/api/v1/auth/login/route.ts` (missing `src/`)
- `pages/api/v1/auth/login/route.ts` (Pages Router, not App Router)
- `frontend/src/app/api/v1/auth/login/route.ts` (old frontend folder)

### Step 2: Verify Route File Exports

Your `route.ts` file MUST export the HTTP method handler:

```typescript
// ✅ CORRECT
export async function POST(request: NextRequest) {
  // ...
}

// ❌ WRONG - won't work
export default async function handler(req, res) {
  // This is Pages Router syntax
}
```

### Step 3: Clear Vercel Build Cache

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **General**
3. Scroll to **"Clear Build Cache"**
4. Click **"Clear Build Cache"**
5. **Redeploy** your project

### Step 4: Check Build Logs

1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Click on the latest deployment
3. Check **Build Logs** for:
   - Any TypeScript errors
   - Any warnings about route handlers
   - Any missing files

Look for lines like:
```
✓ Compiled /api/v1/auth/login successfully
```

If you see errors about the route file, fix them.

### Step 5: Verify Route is in Build Output

After building locally, check if the route file is compiled:

```bash
npm run build
```

Then check:
```
.next/server/app/api/v1/auth/login/route.js
```

This file should exist. If it doesn't, the route isn't being built.

### Step 6: Test Locally First

Before deploying to Vercel, test locally:

```bash
npm run build
npm run start
```

Then test:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

If this works locally but not on Vercel, it's a deployment issue.

### Step 7: Check for Duplicate Routes

Make sure you don't have duplicate route files:
- `src/app/api/v1/auth/login/route.ts` ✅ (use this one)
- `frontend/src/app/api/v1/auth/login/route.ts` ❌ (delete this if it exists)

### Step 8: Verify Vercel Project Settings

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **General**
2. Check:
   - **Framework Preset**: Should be "Next.js"
   - **Root Directory**: Should be `.` (root) or empty
   - **Build Command**: Should be `npm run build` or `next build`
   - **Output Directory**: Should be `.next` or empty

### Step 9: Add Explicit Route Config (If Still Not Working)

If the above doesn't work, try adding this to your route file:

```typescript
// At the top of route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // For Vercel Pro, increase timeout if needed
```

### Step 10: Check Vercel Function Logs

1. Go to **Vercel Dashboard** → Your Project → **Functions**
2. Look for `/api/v1/auth/login`
3. Check the logs for any errors

## Common Issues and Solutions

### Issue 1: Route File Not Found
**Symptom**: 404 or 405 error
**Solution**: Verify file location and rebuild

### Issue 2: TypeScript Errors During Build
**Symptom**: Build fails or route not included
**Solution**: Fix TypeScript errors, ensure all imports are correct

### Issue 3: Middleware Blocking Request
**Symptom**: 405 error even though route exists
**Solution**: Check `src/middleware.ts` - make sure it's not blocking the route

### Issue 4: Old Build Cache
**Symptom**: Changes not reflected after deployment
**Solution**: Clear build cache and redeploy

### Issue 5: Wrong Next.js Version
**Symptom**: Route handlers not working
**Solution**: Ensure you're using Next.js 13+ (App Router)

## Quick Diagnostic Commands

```bash
# 1. Check if route file exists
ls -la src/app/api/v1/auth/login/route.ts

# 2. Build locally and check output
npm run build
ls -la .next/server/app/api/v1/auth/login/

# 3. Test locally
npm run start
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Still Not Working?

If none of the above works:

1. **Check Vercel Support**: Contact Vercel support with:
   - Your deployment URL
   - Build logs
   - Function logs
   - Route file structure

2. **Try Alternative Approach**: Create a simple test route:
   ```typescript
   // src/app/api/test/route.ts
   export async function POST() {
     return Response.json({ message: 'Test successful' });
   }
   ```
   If this works, the issue is specific to your login route.

3. **Check for Conflicting Files**: Make sure there's no `pages/api/` folder that might be interfering.

4. **Verify Environment Variables**: Ensure all required env vars are set in Vercel.

## Prevention

To prevent this in the future:

1. Always test locally before deploying
2. Clear build cache when making route changes
3. Keep route files in `src/app/api/` (not `pages/api/`)
4. Use proper TypeScript types
5. Export handlers correctly (not default exports)




