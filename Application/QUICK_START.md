# Quick Start Guide - DGIHub Application

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
cd Application
npm install
```

### 2. Setup Environment
```bash
cp env.example .env.local
```

Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

### 3. Run Development Server
```bash
npm run dev
```

Visit: **http://localhost:3000**

## 📦 What's Included

- ✅ Full Next.js application
- ✅ shadcn/ui components (40+)
- ✅ VokasiInd-inspired design
- ✅ All API routes
- ✅ Database migrations
- ✅ Authentication system
- ✅ Role-based portals (Talenta, Mitra, Industri)

## 🎨 Design System

Based on VokasiInd reference:
- Modern UI with shadcn/ui components
- Plus Jakarta Sans typography
- Navy and Gold color scheme
- Fully responsive
- Dark mode support

## 📚 Documentation

- `README.md` - Full documentation
- `SETUP_INSTRUCTIONS.md` - Detailed setup guide
- `COMPLETE_FEATURE_LIST.md` - All features
- `SEED_DATA_GUIDE.md` - Database seeding
- `ENV_SETUP_GUIDE.md` - Environment variables

## 🚢 Deploy

### Vercel (Recommended)
1. Connect GitHub repository
2. Set Root Directory: `Application`
3. Add environment variables
4. Deploy!

### Other Platforms
Works with any Node.js hosting that supports Next.js.

---

**Ready to go!** 🎉
