# 🚀 Quick Deploy Guide - DGIHub Platform

Deploy your fullstack Next.js app to Vercel in 10 minutes!

## Step 1: Move Files to Root (if needed)

If you still have a `frontend/` folder, move these to root:
- `frontend/src` → `src/`
- `frontend/public` → `public/`
- `frontend/supabase` → `supabase/`

See `MOVE_FILES_INSTRUCTIONS.md` for details.

## Step 2: Prepare Git Repository (2 min)

```bash
# Initialize if needed
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Fullstack Next.js app"
```

## Step 3: Push to GitHub (2 min)

1. Create a new repository on [GitHub](https://github.com/new)
2. Name it: `dgihub-platform` (or your preferred name)
3. **Don't** initialize with README (we already have one)

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/dgihub-platform.git

# Push
git branch -M main
git push -u origin main
```

## Step 4: Create Supabase Project (3 min)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `DGIHub`
   - **Database Password**: (save this securely!)
   - **Region**: **Southeast Asia (Singapore)**
4. Wait 2-3 minutes for setup

### Get Your Keys:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon key** (starts with `eyJ...`)
   - **service_role key** (keep secret!)

### Run Database Migration:

1. Go to **SQL Editor** in Supabase dashboard
2. Open `supabase/migrations/001_initial_schema.sql`
3. Copy all content
4. Paste in SQL Editor
5. Click **Run**

## Step 5: Deploy to Vercel (3 min)

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Vercel auto-detects Next.js ✅

### Add Environment Variables:

Click **"Environment Variables"** and add:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
JWT_SECRET = generate-random-string-here
JWT_REFRESH_SECRET = generate-random-string-here
```

**Generate JWT secrets:**
```bash
# On Mac/Linux
openssl rand -base64 32

# Or use online generator
# https://randomkeygen.com/
```

### Deploy:

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. 🎉 Your app is live!

## Step 6: Test Your App

Visit: `https://your-project.vercel.app`

Test:
- ✅ Landing page loads
- ✅ Language toggle (ID/EN)
- ✅ Theme toggle (Dark/Light)
- ✅ Login/Register
- ✅ Navigation works

## 💰 Cost: $0/month

- ✅ Vercel: **FREE** (hobby plan)
- ✅ Supabase: **FREE** (500MB database, 2GB bandwidth)
- ✅ Total: **FREE!**

## 🆘 Troubleshooting

### Build Fails?
- Check Node.js version: `node -v` (should be 18+)
- Run locally: `npm run build`
- Check for TypeScript errors

### API Not Working?
- Verify environment variables in Vercel
- Check Supabase project is active
- Verify database migration ran

### Database Issues?
- Check Supabase project is active
- Verify RLS policies allow access
- Check connection string format

## 📚 Next Steps

1. **Custom Domain** (optional)
   - Go to Vercel → Settings → Domains
   - Add your domain

2. **Environment Variables**
   - Add production values
   - Set up staging environment

3. **Monitoring**
   - Add Sentry for error tracking
   - Set up analytics

---

**That's it! Your app is live! 🎉**

Visit: `https://your-project.vercel.app`

