# 📁 Move Files from frontend/ to Root

Since this is now a fullstack Next.js app, move everything to root level.

## ✅ Already Moved to Root

I've already copied these files to root:
- ✅ `package.json`
- ✅ `next.config.ts`
- ✅ `tsconfig.json`
- ✅ `vercel.json`
- ✅ `.eslintrc.json`
- ✅ `postcss.config.mjs`
- ✅ `.env.example`

## 📋 Manual Steps (Copy these folders)

You need to manually move these folders from `frontend/` to root:

### 1. Move `src/` folder
```bash
# Windows PowerShell
Move-Item -Path "frontend\src" -Destination "src"

# Or manually:
# Copy frontend/src/* to root/src/
```

### 2. Move `public/` folder
```bash
# Windows PowerShell
Move-Item -Path "frontend\public" -Destination "public"

# Or manually:
# Copy frontend/public/* to root/public/
```

### 3. Move `supabase/` folder
```bash
# Windows PowerShell
Move-Item -Path "frontend\supabase" -Destination "supabase"

# Or manually:
# Copy frontend/supabase/* to root/supabase/
```

## 🗑️ After Moving

You can delete the `frontend/` folder (or keep it as backup):

```bash
# After verifying everything works
Remove-Item -Path "frontend" -Recurse -Force
```

## ✅ Final Structure

After moving, your root should look like:

```
DGIHub/
├── src/              # ✅ Moved from frontend/src
├── public/           # ✅ Moved from frontend/public
├── supabase/         # ✅ Moved from frontend/supabase
├── package.json      # ✅ Already in root
├── next.config.ts    # ✅ Already in root
├── tsconfig.json     # ✅ Already in root
├── vercel.json       # ✅ Already in root
├── README.md
└── ...
```

## 🚀 After Moving

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Test locally:**
   ```bash
   npm run dev
   ```

3. **Verify everything works**

4. **Delete frontend/ folder** (optional, after backup)

---

**This is the standard Next.js structure!** 🎉


