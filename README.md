# 🎓 DGIHub Platform

> Indonesia's Comprehensive Vocational Training Platform - Fullstack Next.js Application

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com/)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works!)

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Visit: `http://localhost:3000`

**Note**: This is a fullstack Next.js application. The frontend and backend API routes are in the same codebase. No separate backend server is needed!

## 📁 Project Structure

```
dgihub-platform/
├── src/                  # Next.js source code
│   ├── app/              # Next.js app router
│   │   ├── api/          # API routes (backend)
│   │   │   └── v1/       # API v1 endpoints
│   │   │       ├── auth/ # Authentication endpoints
│   │   │       ├── talenta/ # Learner API
│   │   │       ├── mitra/   # Training provider API
│   │   │       └── industri/ # Employer API
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── talenta/      # Learner portal pages
│   │   ├── mitra/        # Training provider portal pages
│   │   ├── industri/     # Employer portal pages
│   │   ├── login/        # Login page
│   │   ├── register/     # Registration page
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   ├── contexts/         # React contexts (Auth, Theme, Toast)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities & helpers
│   └── middleware.ts     # Next.js middleware
├── public/               # Static assets
├── supabase/             # Supabase config & migrations
├── database/             # Database schemas (Prisma, Drizzle, SQL)
├── scripts/              # Database scripts (migrations, seeding)
├── docs/                 # Documentation
├── legacy/               # Old Express backend (archived, not used)
├── package.json          # Dependencies
├── next.config.ts        # Next.js config
├── tsconfig.json         # TypeScript config
├── vercel.json           # Vercel deployment config
└── env.example           # Environment variables template
```

## 🎯 Features

- ✅ **Fullstack Next.js** - Frontend + Backend in one app
- ✅ **Supabase Database** - PostgreSQL with free tier
- ✅ **Authentication** - JWT-based auth system
- ✅ **Multi-tenant** - Talenta, Mitra, Industri portals
- ✅ **Verifiable Credentials** - Open Badges 3.0
- ✅ **Dark Mode** - Modern UI with theme support
- ✅ **i18n Ready** - Indonesian/English support

## 🔧 Environment Variables

Create `.env.local`:

```env
# Supabase (get from https://app.supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Secrets
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

## 🗄️ Database Setup

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run `supabase/migrations/001_initial_schema.sql`
4. Copy credentials to `.env.local`

## 🚀 Deploy to Vercel (FREE!)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables (from `env.example`)
4. Deploy!

**Cost: $0/month** (Vercel free tier + Supabase free tier)

**Single Server**: This is a fullstack Next.js app - both frontend and API routes deploy together on Vercel. No separate backend deployment needed!

## 📚 Documentation

- [Quick Deploy Guide](./frontend/QUICK_DEPLOY.md) - Step-by-step deployment guide
- [Fullstack Migration](./frontend/FULLSTACK_MIGRATION.md) - Migration details
- [API Documentation](./docs/)
- [Supabase Setup](./supabase/README.md)
- [Legacy Backend](./legacy/README.md) - Old Express backend (archived)

## 🛠️ Development

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint
```

## 📝 API Routes

All API routes are at `/api/v1/`:

- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/talenta/courses` - Get courses
- `GET /api/v1/mitra/courses` - Manage courses
- `GET /api/v1/industri/jobs` - Manage jobs

## 🏗️ Architecture

- **Frontend**: Next.js 16 (App Router)
- **Backend**: Next.js API Routes
- **Database**: Supabase PostgreSQL
- **Auth**: JWT tokens
- **Deployment**: Vercel

## 📄 License

Proprietary - All rights reserved

## 👥 Contributors

DGIHub Development Team

---

**Built with ❤️ for Indonesia's vocational training ecosystem**
