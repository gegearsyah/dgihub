# 🔧 Database Schema Fix

## Problem

The registration endpoint is failing with:
```
Could not find the 'password_hash' column of 'users' in the schema cache
```

This happens because the Supabase migration (`001_initial_schema.sql`) doesn't match what the application code expects.

## Solution

A new migration file has been created: `supabase/migrations/002_fix_users_schema.sql`

This migration will:
1. ✅ Add missing `password_hash` column to `users` table
2. ✅ Rename `id` to `user_id` in `users` table (if needed)
3. ✅ Add missing columns: `status`, `verification_code`, `verification_code_expires_at`, `email_verified`, `last_login_at`, etc.
4. ✅ Create profile tables: `talenta_profiles`, `mitra_profiles`, `industri_profiles`
5. ✅ Fix foreign key references to use `user_id` and profile tables
6. ✅ Add `status` column to `courses` table

## How to Apply the Fix

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project: [https://app.supabase.com](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/002_fix_users_schema.sql`
4. Copy the entire contents
5. Paste into SQL Editor
6. Click **Run** (or press `Ctrl+Enter`)

### Option 2: Via Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

### Option 3: Manual SQL Execution

If you have direct database access, run the SQL file directly.

## Verify the Fix

After running the migration, test registration:

```bash
# Test registration endpoint
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "userType": "TALENTA"
  }'
```

You should get a successful response instead of the `password_hash` error.

## What Changed

### Users Table
- ✅ Added `password_hash` column (required for authentication)
- ✅ Added `status` column (PENDING_VERIFICATION, VERIFIED, ACTIVE, etc.)
- ✅ Added `verification_code` and `verification_code_expires_at` columns
- ✅ Added `email_verified`, `email_verified_at` columns
- ✅ Added `last_login_at` column
- ✅ Renamed `id` → `user_id` (if it was `id`)

### Profile Tables
- ✅ Created `talenta_profiles` table
- ✅ Created `mitra_profiles` table
- ✅ Created `industri_profiles` table

### Foreign Keys
- ✅ Updated all foreign keys to reference `user_id` instead of `id`
- ✅ Updated foreign keys to reference profile tables where appropriate

## Important Notes

⚠️ **If you have existing data:**
- The migration is designed to be safe and won't delete existing data
- It only adds missing columns
- Existing users will need to have their `password_hash` set manually or re-register

⚠️ **For new installations:**
- Run both migrations in order:
  1. `001_initial_schema.sql` (creates base tables)
  2. `002_fix_users_schema.sql` (fixes schema to match code)

## Next Steps

After applying the migration:
1. ✅ Test user registration
2. ✅ Test user login
3. ✅ Verify profile creation works
4. ✅ Check that courses/jobs can be created

---

**Need help?** Check the migration file comments or open an issue!

