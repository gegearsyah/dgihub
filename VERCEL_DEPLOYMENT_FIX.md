# Vercel 405 Method Not Allowed Fix

## Issue
Getting `405 Method Not Allowed` error on `/api/v1/auth/login` endpoint after deployment to Vercel.

## Fixes Applied

### 1. Added Runtime Configuration
Added explicit runtime configuration to the login route:
```typescript
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
```

### 2. Updated Middleware for Vercel
Updated `src/middleware.ts` to allow Vercel domains:
- Automatically allows requests from `*.vercel.app` and `*.vercel.sh` domains
- Ensures CORS headers are properly set for Vercel deployments

### 3. Verify Route File Structure
Ensure the route file is at:
```
src/app/api/v1/auth/login/route.ts
```

And exports the POST handler:
```typescript
export async function POST(request: NextRequest) {
  // ...
}
```

## Additional Steps to Fix

### 1. Clear Vercel Build Cache
1. Go to Vercel Dashboard → Your Project → Settings → General
2. Scroll to "Clear Build Cache"
3. Click "Clear Build Cache"
4. Redeploy

### 2. Verify Environment Variables
Make sure these are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `ALLOWED_ORIGINS` (optional, but recommended)

### 3. Check Build Logs
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Check the build logs for any errors
4. Look for any warnings about route handlers

### 4. Verify Route is Included in Build
The route should appear in the build output. Check:
- `.next/server/app/api/v1/auth/login/route.js` exists after build
- No TypeScript errors during build

### 5. Test Locally First
```bash
npm run build
npm run start
# Test the endpoint locally
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Common Causes

1. **Route Not Found**: File not in correct location or named incorrectly
2. **Build Cache**: Old build cache causing issues
3. **Runtime Mismatch**: Route needs explicit runtime configuration
4. **Middleware Blocking**: Middleware not allowing the request
5. **CORS Issues**: CORS headers not set correctly

## Verification

After deploying, test the endpoint:
```bash
curl -X POST https://your-app.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"talenta1@demo.com","password":"password123"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "token": "...",
    "refreshToken": "...",
    "user": {...}
  }
}
```

## If Still Not Working

1. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Your Project → Functions
   - Check logs for the `/api/v1/auth/login` function
   - Look for any errors

2. **Verify Next.js Version**:
   - Ensure you're using Next.js 13+ (App Router)
   - Check `package.json` for correct version

3. **Check for Duplicate Routes**:
   - Make sure there's no duplicate route file
   - Check both `src/app/api/` and `frontend/src/app/api/` (if frontend folder still exists)

4. **Try Alternative Route Structure**:
   If the issue persists, try creating a simpler test route:
   ```typescript
   // src/app/api/test/route.ts
   export async function POST() {
     return Response.json({ message: 'Test successful' });
   }
   ```

5. **Contact Vercel Support**:
   If none of the above works, contact Vercel support with:
   - Deployment URL
   - Build logs
   - Function logs
   - Route file structure




