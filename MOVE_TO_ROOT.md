# Moving Frontend to Root

Since this is now a fullstack Next.js app, we should move everything from `frontend/` to root.

## Files to Move

From `frontend/` → Root:
- `src/` → `src/`
- `public/` → `public/`
- `supabase/` → `supabase/`
- `package.json` → `package.json` (replace root one)
- `next.config.ts` → `next.config.ts`
- `tsconfig.json` → `tsconfig.json`
- `vercel.json` → `vercel.json`
- `.eslintrc.json` → `.eslintrc.json`
- `postcss.config.mjs` → `postcss.config.mjs`
- `env.example` → `.env.example`
- All `.md` files → Root (or keep in `docs/`)

## After Move

```
DGIHub/
├── src/              # Next.js source
├── public/           # Static assets
├── supabase/         # Database config
├── package.json      # Main dependencies
├── next.config.ts
├── tsconfig.json
├── vercel.json
├── README.md
└── ...
```

This is the standard Next.js structure!





