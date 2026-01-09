# 🔧 Environment Variables Setup Guide

This guide shows you exactly what environment variables you need for the fullstack Next.js application.

## 📋 Quick Setup

1. **Copy the template:**
   ```bash
   cp env.example .env.local
   ```

2. **Fill in your values** (see examples below)

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

---

## 📝 Required Environment Variables

### 1. Supabase Configuration (REQUIRED)

These are **required** for the app to work. Get them from your Supabase project.

```env
# Supabase Project URL
# Get from: https://app.supabase.com/project/YOUR_PROJECT_ID/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co

# Supabase Anonymous Key (Public - safe for client-side)
# Get from: Settings → API → Project API keys → anon public
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example-key-here

# Supabase Service Role Key (SECRET - server-side only!)
# Get from: Settings → API → Project API keys → service_role secret
# ⚠️ NEVER expose this in client-side code!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.example-service-key-here
```

**How to get Supabase credentials:**
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project or select existing project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

---

### 2. JWT Secrets (REQUIRED)

These are used for authentication tokens. Generate secure random strings.

```env
# JWT Secret for access tokens (24h expiry)
# Generate with: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# JWT Refresh Secret for refresh tokens (7d expiry)
# Generate with: openssl rand -base64 32
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32-chars
```

**Generate secure secrets:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use online generator:
# https://generate-secret.vercel.app/32
```

---

## 🔧 Optional Environment Variables

### 3. API Configuration

```env
# API Base URL (defaults to /api/v1)
# For fullstack Next.js, keep this as /api/v1 (same origin)
NEXT_PUBLIC_API_URL=/api/v1
```

**Note:** Since this is a fullstack Next.js app, the API routes are on the same origin. You typically don't need to change this.

---

### 4. CORS Configuration (Optional)

```env
# Allowed origins for CORS (comma-separated)
# Defaults to localhost:3000 and localhost:3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://yourdomain.com
```

**When to set this:**
- If you're deploying to a custom domain
- If you need to allow specific origins for API access

---

### 5. Analytics (Optional)

```env
# Google Analytics ID (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

### 6. Error Tracking (Optional)

```env
# Sentry DSN for error tracking (optional)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

---

## 📄 Complete Example `.env.local`

Here's a complete example with all variables:

```env
# ============================================
# DGIHub Platform - Environment Variables
# ============================================

# API Configuration
NEXT_PUBLIC_API_URL=/api/v1

# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.example-service-key

# JWT Secrets (REQUIRED)
JWT_SECRET=super-secret-jwt-key-minimum-32-characters-long-for-security
JWT_REFRESH_SECRET=super-secret-refresh-key-minimum-32-characters-long-for-security

# CORS (Optional)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Analytics (Optional)
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Error Tracking (Optional)
# NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

---

## 🚀 Environment Variables by Environment

### Development (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-key
JWT_SECRET=dev-secret-key-not-for-production
JWT_REFRESH_SECRET=dev-refresh-secret-not-for-production
NEXT_PUBLIC_API_URL=/api/v1
ALLOWED_ORIGINS=http://localhost:3000
```

### Production (Vercel Environment Variables)

Set these in Vercel Dashboard → Project Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-key
JWT_SECRET=production-secret-generated-with-openssl-rand-base64-32
JWT_REFRESH_SECRET=production-refresh-secret-generated-with-openssl-rand-base64-32
NEXT_PUBLIC_API_URL=/api/v1
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## ✅ Verification

After setting up your `.env.local`, verify it works:

1. **Check if variables are loaded:**
   ```bash
   npm run dev
   ```
   Look for any warnings about missing environment variables.

2. **Test the API:**
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

3. **Check Supabase connection:**
   - Try logging in or registering a user
   - Check browser console for any Supabase errors

---

## 🔒 Security Best Practices

1. **Never commit `.env.local` to Git**
   - It's already in `.gitignore`
   - Always use `.env.example` as template

2. **Use different secrets for production**
   - Never use development secrets in production
   - Generate new secrets for each environment

3. **Rotate secrets regularly**
   - Especially if compromised
   - Update JWT secrets periodically

4. **Keep `SUPABASE_SERVICE_ROLE_KEY` secret**
   - Never expose in client-side code
   - Only use in API routes (server-side)

5. **Use Vercel Environment Variables for production**
   - Don't hardcode in code
   - Use Vercel's secure environment variable storage

---

## 🆘 Troubleshooting

### "Supabase environment variables not set"
- Check `.env.local` exists in root directory
- Verify variable names are correct (case-sensitive!)
- Restart dev server after changing `.env.local`

### "Database not configured" error
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check Supabase project is active
- Verify database migration has run

### "JWT verification failed"
- Check `JWT_SECRET` matches between requests
- Verify secret is at least 32 characters
- Don't use default "change-this-secret" in production

---

## 📚 Related Documentation

- [Supabase Setup Guide](./supabase/README.md)
- [Quick Deploy Guide](./frontend/QUICK_DEPLOY.md)
- [Database Migration](./DATABASE_MIGRATION_STATUS.md)

---

**Need help?** Check the [README.md](./README.md) or open an issue!




