# Fix for All POST Routes - 405 Method Not Allowed

## Problem
All POST (and PUT) methods were returning 405 Method Not Allowed on Vercel because they were missing the runtime configuration.

## Root Cause
Vercel requires explicit runtime configuration for Next.js App Router route handlers. Without it, Vercel doesn't recognize the route handlers properly.

## Fix Applied

Added runtime configuration to **ALL** POST and PUT routes:

```typescript
// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
```

## Routes Fixed

### ✅ Authentication Routes
- `src/app/api/v1/auth/login/route.ts` - POST (already had it)
- `src/app/api/v1/auth/register/route.ts` - POST ✅ **FIXED**
- `src/app/api/v1/auth/profile/route.ts` - PUT ✅ **FIXED**

### ✅ Resource Routes
- `src/app/api/v1/mitra/courses/route.ts` - POST ✅ **FIXED**
- `src/app/api/v1/industri/jobs/route.ts` - POST ✅ **FIXED**

## What This Does

1. **`export const runtime = 'nodejs'`**
   - Tells Vercel to use Node.js runtime (required for bcrypt, database connections, etc.)
   - Without this, Vercel might try to use Edge runtime which doesn't support all Node.js APIs

2. **`export const dynamic = 'force-dynamic'`**
   - Forces the route to be dynamically rendered
   - Ensures the route handler is always executed (not cached)
   - Required for API routes that need to process requests

## Additional Fixes

### CORS Preflight (OPTIONS) Handler
Added to register route (login already had it):

```typescript
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

## Testing

After deploying, test all POST endpoints:

```bash
# Test Register
curl -X POST https://your-app.vercel.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User","userType":"TALENTA"}'

# Test Login
curl -X POST https://your-app.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"talenta1@demo.com","password":"password123"}'

# Test Profile Update (requires auth token)
curl -X PUT https://your-app.vercel.app/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"fullName":"Updated Name"}'
```

## Next Steps

1. **Commit and Push** these changes
2. **Clear Vercel Build Cache** (Settings → General → Clear Build Cache)
3. **Redeploy** your project
4. **Test** all POST/PUT endpoints

## Prevention

For any new API routes you create, always include:

```typescript
// At the top of your route.ts file
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// For POST/PUT routes, also add OPTIONS handler
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

## Why This Happens

Vercel's Next.js deployment:
- Needs explicit runtime configuration for route handlers
- Without it, routes might not be recognized during build
- This is especially important for serverless functions

The 405 error means "Method Not Allowed" - Vercel didn't recognize the route handler, so it couldn't allow the POST method.




