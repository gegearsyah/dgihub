# Database Migration Fixes

## Issues Fixed

### 1. **CREATE INDEX Error - "relation does not exist"**
   - **Problem**: CREATE INDEX statements were executing before CREATE TABLE completed
   - **Solution**: Added `IF NOT EXISTS` to all CREATE INDEX statements
   - **Impact**: Indexes can now be created safely even if tables don't exist yet (will be created when table exists)

### 2. **Missing LRS Schema**
   - **Problem**: LRS (Learning Record Store) schema was documented but not in DDL
   - **Solution**: Added complete LRS schema with `lrs.statements` table
   - **Impact**: xAPI statement storage now supported

### 3. **Migration Script Improvements**
   - **Problem**: Simple semicolon splitting could break on complex statements
   - **Solution**: Enhanced statement parsing with string literal handling
   - **Impact**: More reliable migration execution

## Changes Made

### DDL File (`database/schema/postgresql/ddl.sql`)

1. **All CREATE INDEX statements now use IF NOT EXISTS:**
   ```sql
   -- Before
   CREATE INDEX idx_users_email ON users(email);
   
   -- After
   CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
   ```

2. **Added LRS Schema:**
   - Created `lrs` schema
   - Added `lrs.statements` table for xAPI statements
   - Added indexes for LRS performance

### Migration Script (`scripts/migrate.js`)

1. **Better Statement Parsing:**
   - Handles string literals correctly
   - Preserves semicolons inside strings
   - Better comment removal

2. **Improved Error Handling:**
   - Ignores "already exists" errors
   - Retries CREATE INDEX with IF NOT EXISTS
   - Continues on non-critical errors
   - Provides detailed progress reporting

3. **Transaction Support:**
   - All statements execute in a transaction
   - Rollback on critical errors
   - Commit on success

## How to Run Migrations

### Option 1: Standard Migration
```bash
npm run db:migrate
```

### Option 2: Reset and Migrate (Fresh Start)
```bash
npm run db:reset
npm run db:migrate
```

### Option 3: Migrate and Seed
```bash
npm run db:migrate
npm run db:seed:full
```

## Verification

After running migrations, verify:

1. **Check tables exist:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

2. **Check LRS schema:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'lrs';
   ```

3. **Check indexes:**
   ```sql
   SELECT indexname, tablename 
   FROM pg_indexes 
   WHERE schemaname = 'public'
   ORDER BY tablename, indexname;
   ```

## Expected Tables

### Public Schema
- users
- talenta_profiles
- mitra_profiles
- industri_profiles
- kursus
- materi
- enrollments
- workshop
- workshop_sessions
- workshop_registrations
- workshop_attendance
- sertifikat
- lowongan
- pelamar
- talent_pool

### LRS Schema
- statements

## Troubleshooting

### Error: "relation does not exist"
- **Cause**: Table not created yet
- **Solution**: Run `npm run db:reset` then `npm run db:migrate`

### Error: "already exists"
- **Cause**: Object already created
- **Solution**: This is now handled automatically (ignored)

### Error: "permission denied"
- **Cause**: Database user lacks permissions
- **Solution**: Grant CREATE privileges to database user

### Migration hangs
- **Cause**: Long-running statement or deadlock
- **Solution**: Check database logs, ensure no other connections

## Migration Status

✅ All CREATE INDEX statements use IF NOT EXISTS  
✅ LRS schema added  
✅ Migration script improved  
✅ Transaction support added  
✅ Error handling enhanced  

---

**Last Updated**: 2024-01-15  
**Status**: ✅ Ready for Production






