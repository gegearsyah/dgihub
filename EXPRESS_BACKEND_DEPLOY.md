# Express Backend Deployment Guide

## The Problem

You tried to deploy `backend-express/` to Vercel, but got:
```
Error: No Next.js version detected. Make sure your package.json has "next"...
```

This happens because Vercel auto-detects Next.js projects, but your Express backend doesn't have Next.js.

## Solution: 3 Options

### ✅ Option 1: Render.com (RECOMMENDED - Easiest)

**Why Render?**
- Free tier (750 hours/month)
- Perfect for Express backends
- Always-on (no cold starts)
- Simple setup

**Steps:**
1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `dgihub-backend`
   - **Root Directory**: `backend-express`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   ALLOWED_ORIGINS=https://dgihub-test.vercel.app
   ```
6. Click "Create Web Service"
7. Wait ~2 minutes for deployment
8. Copy the URL (e.g., `https://dgihub-backend.onrender.com`)

**Update Frontend:**
1. In Vercel (your Next.js project):
   - Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL=https://dgihub-backend.onrender.com`
   - Redeploy

### ✅ Option 2: Railway.app (Also Great)

**Why Railway?**
- Free tier ($5 credit/month)
- Very easy setup
- Fast deployments

**Steps:**
1. Go to [railway.app](https://railway.app) and sign up
2. "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Click "Add Service" → "GitHub Repo"
5. Settings:
   - **Root Directory**: `backend-express`
   - **Start Command**: `npm start`
6. Add environment variables (same as Render)
7. Deploy!

### ⚠️ Option 3: Vercel (More Complex)

If you really want to use Vercel:

1. **Create a NEW Vercel project** (separate from your Next.js app)
2. **Root Directory**: Set to `backend-express`
3. **Framework Preset**: Select **"Other"** (NOT Next.js)
4. **Build Command**: Leave empty
5. **Output Directory**: Leave empty
6. Add environment variables
7. Deploy

**Note**: Vercel converts Express to serverless functions, which can have cold starts. Render/Railway are better for Express.

## Quick Comparison

| Platform | Free Tier | Setup Time | Best For |
|----------|-----------|------------|----------|
| **Render.com** | ✅ 750 hrs/month | 5 min | Express backends |
| **Railway.app** | ✅ $5/month credit | 3 min | Express backends |
| **Vercel** | ✅ Unlimited | 10 min | Next.js apps |

## After Deployment

### 1. Test Your Backend
```bash
# Health check
curl https://your-backend-url.onrender.com/health

# Test login
curl -X POST https://your-backend-url.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Update Frontend API URL

**Option A: Environment Variable (Recommended)**
- Vercel Dashboard → Your Next.js Project → Settings → Environment Variables
- Add: `NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com`
- Redeploy

**Option B: Update Code**
Edit `src/lib/api.ts`:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
```

### 3. Test Frontend
- Try logging in from your frontend
- Check browser console for API calls
- Verify requests go to your backend URL

## Troubleshooting

### Backend returns 404
- Check Root Directory is set to `backend-express`
- Verify routes start with `/api/v1/auth/...`

### CORS errors
- Add your frontend URL to `ALLOWED_ORIGINS`
- Format: `https://dgihub-test.vercel.app,https://*.vercel.app`

### Environment variables not working
- Restart the service after adding env vars
- Check variable names match exactly (case-sensitive)

## Recommendation

**Use Render.com** - It's the easiest and most reliable for Express backends. Takes 5 minutes to set up!
