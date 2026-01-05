# 📦 GitHub Setup Guide

## Current Structure (Recommended to Keep)

Since Next.js works well with the `frontend/` folder structure, we'll keep it but update the documentation:

```
DGIHub/
├── frontend/              # Main Next.js application
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   ├── supabase/         # Database config
│   ├── package.json      # Dependencies
│   └── ...
├── legacy/               # Old Express backend (optional)
├── docs/                 # Documentation
└── README.md             # Main README
```

## GitHub Repository Setup

### 1. Initialize Git (if not done)

```bash
# In root directory
git init
git add .
git commit -m "Initial commit: Fullstack Next.js DGIHub Platform"
```

### 2. Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Repository name: `dgihub-platform`
3. Description: `Indonesia Vocational Training Platform - Fullstack Next.js`
4. Visibility: **Public** (or Private)
5. **Don't** initialize with README, .gitignore, or license (we have them)
6. Click **"Create repository"**

### 3. Connect and Push

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/dgihub-platform.git

# Rename branch to main
git branch -M main

# Push
git push -u origin main
```

## Repository Structure for GitHub

Your GitHub repo will show:

```
dgihub-platform/
├── .gitignore
├── README.md              ← Main project README
├── QUICK_DEPLOY.md        ← Deployment guide
├── package.json           ← Root package.json (wrapper)
├── frontend/              ← Main application
│   ├── src/
│   ├── public/
│   ├── supabase/
│   ├── package.json
│   ├── next.config.ts
│   └── ...
├── legacy/                ← Old backend (optional)
├── docs/                  ← Documentation
└── database/              ← Database schemas
```

## Working with the Repository

### Development

```bash
# Install dependencies
cd frontend
npm install

# Run dev server
npm run dev
```

### Committing Changes

```bash
# From root
git add .
git commit -m "Your commit message"
git push
```

### Vercel Deployment

Vercel will automatically detect Next.js in the `frontend/` folder and deploy correctly.

## Alternative: Flatten Structure (Optional)

If you prefer a flatter structure, you can:

1. Move `frontend/src` → `src`
2. Move `frontend/public` → `public`
3. Move `frontend/*.json`, `frontend/*.ts` to root
4. Update all imports
5. Update Vercel config

**But this is optional!** The current structure works perfectly with Vercel.

## Repository Settings

### Recommended Settings

1. **Description**: "Indonesia Vocational Training Platform - Fullstack Next.js"
2. **Topics**: `nextjs`, `typescript`, `supabase`, `vercel`, `vocational-training`, `indonesia`
3. **Website**: Your Vercel deployment URL
4. **Visibility**: Public (for portfolio) or Private (for private project)

### Branch Protection (Optional)

For production:
- Require pull request reviews
- Require status checks
- Require branches to be up to date

## README Badges

Add to your README.md:

```markdown
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com/)
```

## Next Steps

1. ✅ Push to GitHub
2. ✅ Connect to Vercel
3. ✅ Deploy
4. ✅ Share your live app!

---

**Your repository is ready! 🚀**


