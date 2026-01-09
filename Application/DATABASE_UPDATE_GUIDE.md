# Database Update Guide 🔄

## Overview
This guide helps you update your Supabase database to match the application requirements.

## Missing Columns Identified

### Certificates Table
The API expects these columns that may be missing:
- ✅ `expiration_date` (TIMESTAMPTZ) - When certificate expires
- ✅ `status` (TEXT) - Certificate status: 'ACTIVE', 'EXPIRED', 'REVOKED'
- ✅ `aqrf_level` should be INTEGER (currently may be TEXT)
- ✅ `updated_at` (TIMESTAMPTZ) - Last update timestamp

### Mitra Profiles Table
The API expects:
- ✅ `organization_name` (TEXT) - For certificate issuer information
- ✅ `organization_type` (TEXT) - Type of organization
- ✅ `address` (TEXT) - Organization address
- ✅ `phone` (VARCHAR) - Contact phone
- ✅ `email` (TEXT) - Contact email

## Migration Files Created

### 1. `003_fix_certificates_schema.sql`
Adds missing columns to certificates table:
- `expiration_date`
- `status` with CHECK constraint
- Converts `aqrf_level` from TEXT to INTEGER
- Adds `updated_at` column
- Creates indexes for better performance
- Adds trigger for automatic `updated_at` updates

### 2. `004_add_mitra_organization_name.sql`
Adds missing columns to mitra_profiles table:
- `organization_name` (required for certificate issuer)
- `organization_type`
- `address`
- `phone`
- `email`
- Creates index on `organization_name`

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to **SQL Editor**

2. **Run Migration 003**
   - Open `Application/supabase/migrations/003_fix_certificates_schema.sql`
   - Copy the entire content
   - Paste into SQL Editor
   - Click **Run**

3. **Run Migration 004**
   - Open `Application/supabase/migrations/004_add_mitra_organization_name.sql`
   - Copy the entire content
   - Paste into SQL Editor
   - Click **Run**

### Option 2: Using Supabase CLI

```bash
# Navigate to Application directory
cd Application

# If you have Supabase CLI installed
supabase db push

# Or run migrations manually
supabase migration up
```

### Option 3: Using psql (Direct Database Connection)

```bash
# Connect to your Supabase database
psql -h <your-db-host> -U postgres -d postgres

# Run migrations
\i supabase/migrations/003_fix_certificates_schema.sql
\i supabase/migrations/004_add_mitra_organization_name.sql
```

## Verification

After running migrations, verify the changes:

### Check Certificates Table
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'certificates'
ORDER BY ordinal_position;
```

Expected columns:
- `id` (uuid)
- `talenta_id` (uuid)
- `course_id` (uuid)
- `mitra_id` (uuid)
- `certificate_number` (text)
- `issued_date` (timestamp with time zone)
- `expiration_date` (timestamp with time zone) ✅ NEW
- `credential_url` (text)
- `aqrf_level` (integer) ✅ UPDATED
- `status` (text) ✅ NEW
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone) ✅ NEW

### Check Mitra Profiles Table
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'mitra_profiles'
ORDER BY ordinal_position;
```

Expected columns:
- `profile_id` (uuid)
- `user_id` (uuid)
- `organization_name` (text) ✅ NEW
- `organization_type` (text) ✅ NEW
- `address` (text) ✅ NEW
- `phone` (varchar) ✅ NEW
- `email` (text) ✅ NEW
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

## Testing After Migration

1. **Test Certificates API**
   ```bash
   # Should return certificates with all fields
   curl -X GET http://localhost:3000/api/v1/talenta/certificates \
     -H "Authorization: Bearer <your-token>"
   ```

2. **Check for Errors**
   - No more "column does not exist" errors
   - Certificates should load with all fields
   - Status should default to 'ACTIVE'

3. **Verify Data**
   - Check that existing certificates have status set
   - Verify aqrf_level values are integers
   - Check mitra_profiles have organization_name

## Rollback (If Needed)

If you need to rollback:

```sql
-- Remove new columns from certificates
ALTER TABLE public.certificates 
    DROP COLUMN IF EXISTS expiration_date,
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS updated_at;

-- Remove new columns from mitra_profiles
ALTER TABLE public.mitra_profiles 
    DROP COLUMN IF EXISTS organization_name,
    DROP COLUMN IF EXISTS organization_type,
    DROP COLUMN IF EXISTS address,
    DROP COLUMN IF EXISTS phone,
    DROP COLUMN IF EXISTS email;

-- Drop triggers
DROP TRIGGER IF EXISTS update_certificates_updated_at_trigger ON public.certificates;
DROP FUNCTION IF EXISTS update_certificates_updated_at();
```

## Notes

- ✅ Migrations are **idempotent** - safe to run multiple times
- ✅ Uses `IF NOT EXISTS` checks to prevent errors
- ✅ Preserves existing data
- ✅ Adds indexes for better performance
- ✅ Includes automatic timestamp updates

## Status

✅ **Migrations Ready**: Both migration files created
⏳ **Pending**: Run migrations in Supabase Dashboard
✅ **Safe**: Migrations are idempotent and non-destructive

---

**Next Steps**: 
1. Run migration 003 in Supabase Dashboard
2. Run migration 004 in Supabase Dashboard
3. Verify the changes
4. Test the certificates API
