# Deployment Fix Guide - Method Not Allowed & Dark Theme

## Issues Fixed

### 1. ✅ Dark Theme Colors
**Problem**: Dark theme colors not working properly - text not visible, poor contrast

**Fixed**:
- Updated dark theme CSS variables in `globals.css`
- Changed text colors from `text-primary-foreground` to `text-foreground` and `text-muted-foreground`
- Updated HeroSection to use proper design system tokens
- Improved contrast for better readability

**Changes Made**:
- `globals.css`: Updated `.dark` theme variables with better contrast
- `HeroSection.tsx`: Replaced hardcoded colors with design system tokens

### 2. ⚠️ Method Not Allowed (405) Error

**Root Cause**: 
1. **Root Directory Not Set**: Vercel needs Root Directory set to `Application`
2. **Missing Runtime Config**: Some API routes need explicit runtime configuration
3. **CORS/Middleware Issues**: Middleware might be blocking requests

## Fix Steps

### Step 1: Set Root Directory in Vercel (CRITICAL)

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **General**
2. Scroll to **Root Directory**
3. Set it to: `Application`
4. Click **Save**
5. **Redeploy** the project

### Step 2: Verify Environment Variables

Ensure these are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

### Step 3: Check Build Logs

1. Go to **Deployments** tab
2. Click on latest deployment
3. Check **Build Logs** for errors
4. Check **Function Logs** for runtime errors

### Step 4: Test After Fix

After setting Root Directory and redeploying, test:

```bash
# Test health endpoint
curl https://vocatio-test.vercel.app/api/v1/health

# Test login endpoint
curl -X POST https://vocatio-test.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## API Routes Status

### App Router Routes (`/src/app/api/`)
- ✅ `GET /api/test` - Test endpoint (has runtime config)
- ✅ `GET /api/v1/health` - Health check (runtime config added)
- ✅ `GET /api/v1/talenta/certificates` - Get certificates
- ✅ `GET /api/v1/talenta/courses` - Get courses
- ✅ `GET /api/v1/talenta/my-courses` - Get enrolled courses
- ✅ `GET /api/v1/mitra/courses` - Get mitra courses
- ✅ `GET /api/v1/industri/jobs` - Get job postings

### Pages Router Routes (`/src/pages/api/`)
- ✅ `POST /api/v1/auth/login` - User login (CORS configured)
- ✅ `POST /api/v1/auth/register` - User registration (CORS configured)

## Expected Behavior After Fix

### Health Endpoint
```json
{
  "status": "healthy",
  "timestamp": "2024-01-XX...",
  "environment": "production"
}
```

### Login Endpoint
- Invalid credentials: `401 Unauthorized` or `400 Bad Request`
- Valid credentials: `200 OK` with JWT tokens

### Test Endpoint
```json
{
  "success": true,
  "message": "Test route works! API routes are functioning.",
  "timestamp": "2024-01-XX..."
}
```

## Dark Theme Improvements

### Before
- Text using `text-primary-foreground` (not visible in dark mode)
- Poor contrast
- Hardcoded colors

### After
- Text using `text-foreground` and `text-muted-foreground` (proper contrast)
- All colors use design system tokens
- Better readability in dark mode

## Troubleshooting

### If Still Getting 404/405:

1. **Check Root Directory**: Must be `Application` (not root)
2. **Check Build Logs**: Look for TypeScript/compilation errors
3. **Check Function Logs**: Look for runtime errors
4. **Verify File Structure**: Ensure `src/app/api` and `src/pages/api` exist
5. **Clear Vercel Cache**: Redeploy with "Clear Build Cache" option

### If Dark Theme Still Not Working:

1. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R)
2. **Check Theme Provider**: Ensure `ThemeProvider` wraps the app
3. **Check HTML Class**: Should have `class="dark"` when dark mode is active
4. **Inspect CSS Variables**: Check if `--background`, `--foreground` are set

## Next Steps

1. ✅ Set Root Directory to `Application` in Vercel
2. ✅ Redeploy
3. ✅ Test endpoints
4. ✅ Verify dark theme colors
5. ✅ Check all API routes are working

---

**Status**: 
- ✅ Dark theme colors fixed
- ⚠️ Method not allowed - requires Root Directory fix in Vercel
