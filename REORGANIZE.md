# 📁 Folder Reorganization Plan

Since we now have a fullstack Next.js app, we'll reorganize:

## New Structure

```
DGIHub/
├── src/                    # Next.js source (moved from frontend/src)
├── public/                 # Static assets (moved from frontend/public)
├── supabase/              # Supabase config (moved from frontend/supabase)
├── legacy/                 # Old Express backend (moved from root)
│   ├── api/
│   ├── server.js
│   └── package.json
├── docs/                   # Documentation (keep as is)
├── database/               # Database schemas (keep as is)
├── package.json           # Main Next.js app (moved from frontend/)
├── next.config.ts         # Next.js config
├── tsconfig.json          # TypeScript config
├── .env.example           # Environment template
├── README.md              # Main README
└── .gitignore             # Git ignore
```

## Steps

1. Move `frontend/src` → `src`
2. Move `frontend/public` → `public`
3. Move `frontend/supabase` → `supabase`
4. Move `frontend/*` config files to root
5. Move old backend to `legacy/`
6. Update all references
7. Create clean README





