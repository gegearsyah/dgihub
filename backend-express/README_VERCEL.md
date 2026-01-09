# Deploy Express Backend to Vercel

## Quick Setup

### Option 1: Deploy as Separate Vercel Project (Recommended)

1. **Create a new Vercel project for the backend:**
   - Go to Vercel Dashboard → New Project
   - Import your repository
   - **IMPORTANT**: Set **Root Directory** to `backend-express`
   - Framework Preset: **Other** (not Next.js)
   - Build Command: Leave empty (or `npm install`)
   - Output Directory: Leave empty

2. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

3. **Deploy!**

### Option 2: Use Render.com (Easier for Express)

Render.com is better suited for Express backends:

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `backend-express`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variables (same as above)
6. Deploy!

### Option 3: Use Railway.app (Also Free)

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repo
4. Add Service → GitHub Repo
5. Settings:
   - **Root Directory**: `backend-express`
   - **Start Command**: `npm start`
6. Add environment variables
7. Deploy!

## After Deployment

Once your backend is deployed, update your frontend:

1. **In Vercel (for your Next.js frontend):**
   - Go to Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app`
   - Redeploy frontend

2. **Or update `src/lib/api.ts`:**
   ```typescript
   const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
   ```

## Testing

```bash
# Test health endpoint
curl https://your-backend-url.vercel.app/health

# Test login
curl -X POST https://your-backend-url.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Why Not Vercel for Express?

Vercel is optimized for Next.js and serverless functions. For Express backends:
- ✅ **Render.com**: Best for Express (free tier, always-on)
- ✅ **Railway.app**: Also great (free tier, easy setup)
- ⚠️ **Vercel**: Works but requires serverless configuration

## Current Setup

The backend is configured for Vercel with:
- `vercel.json` - Serverless function configuration
- `api/index.js` - Vercel entry point
- `server.js` - Exports Express app for serverless
