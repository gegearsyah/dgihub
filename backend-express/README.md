# DGIHub Express Backend

Standalone Express backend for DGIHub platform. Deploy this separately to avoid Vercel API route issues.

## Quick Deploy to Render.com

1. **Push this folder to GitHub** (or use the root repo with Root Directory set to `backend-express`)

2. **Go to Render.com:**
   - Sign up at https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure:**
   - **Name:** `dgihub-backend`
   - **Root Directory:** `backend-express` (if deploying from root repo)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

4. **Set Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `JWT_SECRET` - Your JWT secret (same as Vercel)
   - `ALLOWED_ORIGINS` - `https://dgihub-test.vercel.app,http://localhost:3000`

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)

6. **Get Backend URL:**
   - After deployment, you'll get: `https://dgihub-backend.onrender.com`

7. **Update Frontend:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = `https://dgihub-backend.onrender.com/api/v1`
   - Redeploy frontend

## Local Development

```bash
cd backend-express
npm install
cp .env.example .env
# Edit .env with your values
npm start
```

Server runs on http://localhost:3001

## API Endpoints

- `GET /health` - Health check
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

## Environment Variables

See `.env.example` for required variables.

