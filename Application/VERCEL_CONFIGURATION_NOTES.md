# Vercel Configuration Notes - Important for Future Developers

## ✅ Working Configuration

### Root Directory Setup

**Issue**: When deploying from a monorepo or folder structure like:
```
DGIHub/
├── Application/          ← Next.js app is here
│   ├── src/
│   ├── package.json
│   └── ...
├── README.md
└── other files...
```

**Solution**: In Vercel Dashboard Settings → General:

1. **Root Directory**: Set to `Application`
2. **Include Files/Folders**: Configure to include files and folders beside the Application folder if needed

### Why This Matters

Vercel needs to know:
- Where your `package.json` is located
- Where your `next.config.ts` is located  
- Where your `src/` directory is located
- Where your API routes are located (`src/app/api/`)

Without the Root Directory set correctly:
- ❌ API routes return 404
- ❌ Frontend shows "Loading..." indefinitely
- ❌ Build may fail or use wrong configuration
- ❌ Environment variables may not load correctly

## 📋 Step-by-Step Configuration

### In Vercel Dashboard:

1. **Go to**: Project → Settings → General
2. **Root Directory**: 
   - Click "Edit"
   - Set to: `Application` (exactly, case-sensitive)
   - Click "Save"
3. **Include Files/Folders** (if needed):
   - Configure to include any files/folders beside Application that are needed
   - This ensures Vercel can access shared resources if any
4. **Redeploy**: After changing settings, always redeploy

## 🔍 Verification

After configuration, verify:

### Build Logs Should Show:
```
✓ Found root directory: Application
✓ Installing dependencies from Application/package.json
✓ Building from Application/
```

### API Routes Should Work:
- ✅ `GET /api/test` → Returns 200 with JSON
- ✅ `GET /api/v1/health` → Returns 200 with health status
- ✅ `POST /api/v1/auth/login` → Returns 400/401 for invalid credentials

### Frontend Should Load:
- ✅ Homepage loads (not stuck on "Loading...")
- ✅ No console errors
- ✅ All routes accessible

## ⚠️ Common Mistakes

1. **Wrong Root Directory**:
   - ❌ `./Application` (don't use `./`)
   - ❌ `Application/` (no trailing slash)
   - ❌ `application` (must be capital A)
   - ✅ `Application` (correct)

2. **Not Redeploying**:
   - ❌ Changing settings but not redeploying
   - ✅ Always redeploy after changing Root Directory

3. **Forgetting Include Files**:
   - ❌ Not configuring include files if needed
   - ✅ Configure if you have shared resources outside Application folder

## 📝 For Future Developers

### When Setting Up New Deployment:

1. **Check Repository Structure**:
   - Is Next.js app in a subfolder? → Set Root Directory
   - Is Next.js app in root? → Leave Root Directory empty

2. **Verify Settings**:
   - Root Directory matches folder name exactly
   - Include Files configured if needed
   - Environment variables are set

3. **Test After Deployment**:
   - Check homepage loads
   - Test API routes
   - Verify environment variables work

### When Troubleshooting 404 Errors:

1. **First Check**: Root Directory setting
2. **Second Check**: Build logs for errors
3. **Third Check**: File structure matches Root Directory

## 🎯 Key Takeaway

**If API routes return 404 or frontend shows "Loading..." indefinitely, the Root Directory is likely not set correctly.**

The fix is simple:
- Set Root Directory to `Application` in Vercel Settings
- Configure Include Files/Folders if needed
- Redeploy

---

**Last Updated**: After successful deployment fix
**Configuration**: Root Directory = `Application`, Include Files/Folders configured
