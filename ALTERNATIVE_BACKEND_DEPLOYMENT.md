# Alternative Backend Deployment Guide

Since Vercel is having issues with Next.js API routes, here are alternative solutions:

## Option 1: Pages Router API Route (Quick Fix)

I've created a Pages Router version of the login route at `pages/api/v1/auth/login.ts`.

**Test it:**
```bash
curl -X POST https://dgihub-test.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}'
```

If this works, we can migrate all routes to Pages Router format.

---

## Option 2: Separate Express Backend (Recommended)

I've created a standalone Express backend in the `backend-express/` folder.

### Deploy to Render.com (Free Tier)

1. **Create Account:**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend-express` folder (or set Root Directory to `backend-express`)

3. **Configure:**
   - **Name:** `dgihub-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Root Directory:** `backend-express` (if deploying from root repo)

4. **Set Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` (from your Vercel env)
   - `SUPABASE_SERVICE_ROLE_KEY` (from your Vercel env)
   - `JWT_SECRET` (from your Vercel env)
   - `ALLOWED_ORIGINS` = `https://dgihub-test.vercel.app,http://localhost:3000`

5. **Deploy:**
   - Click "Create Web Service"
   - Render will auto-deploy

6. **Get Backend URL:**
   - After deployment, you'll get a URL like: `https://dgihub-backend.onrender.com`

7. **Update Frontend API Client:**
   - Edit `src/lib/api.ts`
   - Change `API_BASE_URL` to your Render backend URL

### Deploy to Railway.app (Alternative)

1. **Create Account:**
   - Go to https://railway.app
   - Sign up with GitHub

2. **New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure:**
   - Set Root Directory to `backend-express`
   - Railway auto-detects Node.js

4. **Set Environment Variables:**
   - Same as Render (see above)

5. **Deploy:**
   - Railway auto-deploys on push

### Deploy to Fly.io (Alternative)

1. **Install Fly CLI:**
   ```bash
   npm i -g flyctl
   ```

2. **Login:**
   ```bash
   flyctl auth login
   ```

3. **Create App:**
   ```bash
   cd backend-express
   flyctl launch
   ```

4. **Set Secrets:**
   ```bash
   flyctl secrets set NEXT_PUBLIC_SUPABASE_URL=your_url
   flyctl secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
   flyctl secrets set JWT_SECRET=your_secret
   ```

5. **Deploy:**
   ```bash
   flyctl deploy
   ```

---

## Option 3: Update Frontend to Use External Backend

After deploying the Express backend, update your frontend:

### Update `src/lib/api.ts`:

```typescript
// Change this:
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// To this (if using Render):
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dgihub-backend.onrender.com/api';
```

### Update Environment Variables in Vercel:

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-url.onrender.com/api`

---

## Option 4: Use Supabase Edge Functions

Supabase Edge Functions are serverless and free (500K invocations/month).

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Create Function:**
   ```bash
   supabase functions new auth-login
   ```

3. **Deploy:**
   ```bash
   supabase functions deploy auth-login
   ```

This requires rewriting your routes to Deno format, but integrates directly with Supabase.

---

## Comparison

| Option | Pros | Cons | Free Tier |
|--------|------|------|-----------|
| **Pages Router** | Quick fix, same Vercel deployment | Might have same issues | ✅ Yes |
| **Render** | Easy setup, reliable | 750 hours/month limit | ✅ Yes |
| **Railway** | Very easy, great DX | $5 credit/month | ✅ Yes |
| **Fly.io** | Global edge, fast | More complex setup | ✅ Yes |
| **Supabase Edge** | Integrated with DB | Requires Deno rewrite | ✅ Yes |

---

## Recommended: Render.com

**Why Render:**
- ✅ Free tier (750 hours/month = ~31 days)
- ✅ Auto-deploys from Git
- ✅ Easy environment variable management
- ✅ Reliable and stable
- ✅ No credit card required for free tier

**Steps:**
1. Deploy `backend-express/` to Render
2. Get backend URL
3. Update `NEXT_PUBLIC_API_URL` in Vercel
4. Done! ✅

---

## Quick Start: Deploy to Render Now

1. Push `backend-express/` folder to GitHub
2. Go to https://render.com → New Web Service
3. Connect repo → Select `backend-express` folder
4. Add environment variables
5. Deploy
6. Update frontend API URL
7. Test!

This should work immediately and solve your 405 errors! 🎉

