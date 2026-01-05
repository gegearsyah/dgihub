# 📁 Project Structure

## Current Structure (Recommended)

```
DGIHub/
├── frontend/                    # Main Next.js fullstack application
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── api/            # API routes (backend)
│   │   │   │   └── v1/
│   │   │   │       ├── auth/
│   │   │   │       ├── talenta/
│   │   │   │       ├── mitra/
│   │   │   │       └── industri/
│   │   │   ├── dashboard/      # Dashboard pages
│   │   │   ├── talenta/        # Learner portal
│   │   │   ├── mitra/          # Training provider portal
│   │   │   ├── industri/       # Employer portal
│   │   │   └── layout.tsx      # Root layout
│   │   ├── components/         # React components
│   │   ├── contexts/           # React contexts
│   │   ├── lib/                # Utilities
│   │   └── middleware.ts       # Next.js middleware
│   ├── public/                 # Static assets
│   ├── supabase/               # Supabase configuration
│   │   ├── migrations/
│   │   └── README.md
│   ├── package.json            # Dependencies
│   ├── next.config.ts          # Next.js config
│   ├── tsconfig.json           # TypeScript config
│   ├── vercel.json             # Vercel config
│   └── .env.example            # Environment template
│
├── legacy/                     # Old Express backend (archived)
│   ├── api/
│   ├── server.js
│   └── package.json
│
├── docs/                       # Documentation
│   ├── architecture/
│   ├── compliance/
│   └── ...
│
├── database/                   # Database schemas
│   └── schema/
│
├── README.md                   # Main README
├── QUICK_DEPLOY.md            # Deployment guide
├── package.json                # Root package.json (wrapper)
└── .gitignore                  # Git ignore rules
```

## Why This Structure?

### ✅ Pros

1. **Clear Separation**: Frontend code is in one place
2. **Vercel Compatible**: Vercel auto-detects Next.js in `frontend/`
3. **Easy Navigation**: All app code in one folder
4. **Legacy Preserved**: Old backend kept for reference

### 📝 Notes

- The `frontend/` folder contains the **entire fullstack app**
- API routes are in `frontend/src/app/api/`
- Pages are in `frontend/src/app/`
- Everything deploys together as one unit

## Development Workflow

```bash
# Work in frontend folder
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Build
npm run build
```

## Deployment

Vercel will:
1. Detect Next.js in `frontend/` folder
2. Run `npm install` in `frontend/`
3. Run `npm run build` in `frontend/`
4. Deploy everything

**No configuration needed!** ✅

## Alternative Structure (If You Prefer)

If you want a flatter structure:

```
DGIHub/
├── src/              # Moved from frontend/src
├── public/           # Moved from frontend/public
├── supabase/         # Moved from frontend/supabase
├── package.json      # Moved from frontend/package.json
├── next.config.ts    # Moved from frontend/next.config.ts
└── ...
```

**But this requires:**
- Moving all files
- Updating imports
- Updating Vercel config
- More work for same result

**Recommendation: Keep current structure!** ✅

---

**Current structure is production-ready! 🚀**


