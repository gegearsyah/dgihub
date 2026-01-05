# Supabase Setup for DGIHub Platform

This directory contains Supabase configuration and migration files for the DGIHub platform.

## Quick Start

### 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: DGIHub
   - **Database Password**: (choose a strong password)
   - **Region**: Southeast Asia (Singapore) or closest to your users
4. Wait for the project to be created (2-3 minutes)

### 2. Get Your Project Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: (starts with `eyJ...`)
   - **service_role key**: (keep this secret!)

### 3. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run Database Migrations

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

#### Option B: Using Supabase Dashboard

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `migrations/001_initial_schema.sql`
3. Paste and run in the SQL Editor

### 5. Set Up Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. Create the following buckets:
   - `certificates` (Public: No)
   - `profiles` (Public: Yes)
   - `materials` (Public: No)

3. Set up bucket policies:
   - **certificates**: Only authenticated users can upload, anyone can read
   - **profiles**: Anyone can read, only owner can upload
   - **materials**: Only authenticated users can read/upload

### 6. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Set up redirect URLs:
   - `http://localhost:3000/**` (for development)
   - `https://your-domain.vercel.app/**` (for production)

## Database Schema

The initial migration creates:

- **users**: Extended user profiles
- **courses**: Training courses
- **enrollments**: Course enrollments
- **certificates**: Verifiable credentials
- **job_postings**: Job listings
- **job_applications**: Job applications

All tables have Row Level Security (RLS) enabled with appropriate policies.

## API Integration

Update your `frontend/src/lib/api.ts` to use Supabase:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Next Steps

1. Install Supabase client: `npm install @supabase/supabase-js`
2. Update API client to use Supabase
3. Set up authentication flows
4. Configure storage for file uploads
5. Test the integration

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

