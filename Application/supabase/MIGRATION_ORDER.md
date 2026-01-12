# Migration Order Guide

## Important: Run Migrations in This Exact Order

### Step 1: Initial Schema
Run: `001_initial_schema.sql`
- Creates basic tables: users, courses, enrollments, certificates, job_postings

### Step 2: Fix Users Schema (if exists)
Run: `002_fix_users_schema.sql`
- Updates users table if needed

### Step 3: Fix Certificates (if exists)
Run: `003_fix_certificates_schema.sql`
- Updates certificates table if needed

### Step 4: Add Mitra Organization (if exists)
Run: `004_add_mitra_organization_name.sql`
- Adds organization_name to mitra_profiles

### Step 5: Add Learning Tables
Run: `005_add_learning_tables.sql`
- Creates: kursus, materi, material_completions, quiz_submissions, workshops, etc.
- **Does NOT add foreign key constraints to enrollments** (to avoid errors)

### Step 6: Fix Enrollments Foreign Keys
Run: `006_fix_enrollments_foreign_keys.sql`
- Cleans up invalid data
- Adds foreign key constraints safely

### Step 7: Add Enrollments Unique Constraint
Run: `007_add_enrollments_unique_constraint.sql`
- Adds unique constraint on (talenta_id, kursus_id)
- Prevents duplicate enrollments

### Step 8: Seed Data
Run: `seed_learning_data.sql`
- Inserts sample courses, materials, enrollments, workshops

## Quick Setup Script

If you want to run everything at once, use this order:

```sql
-- 1. Initial schema
\i migrations/001_initial_schema.sql

-- 2. Learning tables (without foreign keys to enrollments)
\i migrations/005_add_learning_tables.sql

-- 3. Fix enrollments foreign keys
\i migrations/006_fix_enrollments_foreign_keys.sql

-- 4. Add enrollments unique constraint
\i migrations/007_add_enrollments_unique_constraint.sql

-- 5. Seed data
\i seed_learning_data.sql
```

## Troubleshooting

### Error: Foreign key constraint violation
**Solution**: Run `006_fix_enrollments_foreign_keys.sql` which will:
1. Clean up invalid data first
2. Then add constraints safely

### Error: Table already exists
**Solution**: The migrations use `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times.

### Error: Column already exists
**Solution**: The migrations check for existing columns before adding them.

## Notes

- Migration 005 creates tables but doesn't add foreign keys to enrollments
- Migration 006 safely adds foreign keys after cleaning data
- This two-step approach prevents foreign key constraint errors
